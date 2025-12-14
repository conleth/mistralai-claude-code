/**
 * @security-rat/rules-engine
 * Proof-of-concept shortlist generation
 * 
 * This script demonstrates how to integrate the rules engine with standards data
 * to generate a shortlist of requirements based on questionnaire answers.
 */

import { loadStandard } from '@security-rat/standards';
import { applyRules, computeDerivedAttributes } from './index';
import type {
  QuestionnaireAnswers,
  RequirementRule,
  ShortlistedRequirement,
  StandardRequirement,
} from '@security-rat/types';

/**
 * Example rules for ASVS requirements
 */
const ASVS_RULES: RequirementRule[] = [
  // V1: Inventory Management
  {
    id: 'asvs-v1-software-inventory',
    standard: 'ASVS',
    requirementId: 'v5.0.0-1.1.1',
    conditions: [
      {
        field: 'internetExposed',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Software inventory is required for internet-exposed applications to track authorized and unauthorized software ({internetExposed}).',
  },
  {
    id: 'asvs-v1-software-testing',
    standard: 'ASVS',
    requirementId: 'v5.0.0-1.1.2',
    conditions: [
      {
        field: 'internetExposed',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Testing for unauthorized software is required for internet-exposed applications ({internetExposed}).',
  },
  {
    id: 'asvs-v1-software-verification',
    standard: 'ASVS',
    requirementId: 'v5.0.0-1.1.3',
    conditions: [
      {
        field: 'recommendedASVSLevel',
        operator: 'equals',
        value: 'L2',
      },
    ],
    rationale: 'Regular verification of software inventory is required at ASVS level {recommendedASVSLevel}.',
  },
  
  // V2: Architecture and Design
  {
    id: 'asvs-v2-architecture-verification',
    standard: 'ASVS',
    requirementId: 'v5.0.0-2.1.1',
    conditions: [
      {
        field: 'internetExposed',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Architecture diagrams must be verified for internet-exposed applications ({internetExposed}).',
  },
  {
    id: 'asvs-v2-architecture-review',
    standard: 'ASVS',
    requirementId: 'v5.0.0-2.1.2',
    conditions: [
      {
        field: 'recommendedASVSLevel',
        operator: 'equals',
        value: 'L2',
      },
    ],
    rationale: 'Security architecture review is required at ASVS level {recommendedASVSLevel}.',
  },
  {
    id: 'asvs-v2-architecture-security',
    standard: 'ASVS',
    requirementId: 'v5.0.0-2.1.3',
    conditions: [
      {
        field: 'recommendedASVSLevel',
        operator: 'equals',
        value: 'L3',
      },
    ],
    rationale: 'Comprehensive security architecture verification is required at ASVS level {recommendedASVSLevel}.',
  },
  
  // V3: Authentication
  {
    id: 'asvs-v3-auth-verification',
    standard: 'ASVS',
    requirementId: 'v5.0.0-3.1.1',
    conditions: [
      {
        field: 'requiresAuth',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Authentication mechanism verification is required for applications with authentication ({requiresAuth}).',
  },
  {
    id: 'asvs-v3-auth-testing',
    standard: 'ASVS',
    requirementId: 'v5.0.0-3.1.2',
    conditions: [
      {
        field: 'requiresAuth',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Authentication mechanism testing is required for applications with authentication ({requiresAuth}).',
  },
  {
    id: 'asvs-v3-mfa',
    standard: 'ASVS',
    requirementId: 'v5.0.0-3.1.3',
    conditions: [
      {
        field: 'recommendedASVSLevel',
        operator: 'equals',
        value: 'L3',
      },
      {
        field: 'requiresAuth',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Multi-factor authentication is required at ASVS level {recommendedASVSLevel} for applications with authentication ({requiresAuth}).',
  },
  
  // V4: Authorization
  {
    id: 'asvs-v4-authz-verification',
    standard: 'ASVS',
    requirementId: 'v5.0.0-4.1.1',
    conditions: [
      {
        field: 'requiresAuth',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Authorization mechanism verification is required for applications with authentication ({requiresAuth}).',
  },
  {
    id: 'asvs-v4-authz-testing',
    standard: 'ASVS',
    requirementId: 'v5.0.0-4.1.2',
    conditions: [
      {
        field: 'requiresAuth',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Authorization mechanism testing is required for applications with authentication ({requiresAuth}).',
  },
  {
    id: 'asvs-v4-rbac',
    standard: 'ASVS',
    requirementId: 'v5.0.0-4.1.3',
    conditions: [
      {
        field: 'recommendedASVSLevel',
        operator: 'equals',
        value: 'L3',
      },
      {
        field: 'requiresAuth',
        operator: 'equals',
        value: true,
      },
    ],
    rationale: 'Role-based access control is required at ASVS level {recommendedASVSLevel} for applications with authentication ({requiresAuth}).',
  },
];

/**
 * Example rules for SPVS requirements
 */
const SPVS_RULES: RequirementRule[] = [
  // V1: Plan
  {
    id: 'spvs-v1-security-requirements',
    standard: 'SPVS',
    requirementId: 'V1.1.1',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L1',
      },
    ],
    rationale: 'Security requirements for the pipeline must be defined at SPVS level {recommendedSPVSLevel}.',
  },
  {
    id: 'spvs-v1-pipeline-architecture',
    standard: 'SPVS',
    requirementId: 'V1.1.2',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L1',
      },
    ],
    rationale: 'Pipeline architecture must be defined at SPVS level {recommendedSPVSLevel}.',
  },
  {
    id: 'spvs-v1-security-controls',
    standard: 'SPVS',
    requirementId: 'V1.1.3',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L2',
      },
    ],
    rationale: 'Pipeline security controls must be defined at SPVS level {recommendedSPVSLevel}.',
  },
  
  // V2: Develop
  {
    id: 'spvs-v2-secure-coding',
    standard: 'SPVS',
    requirementId: 'V2.1.1',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L1',
      },
    ],
    rationale: 'Secure coding standards must be implemented at SPVS level {recommendedSPVSLevel}.',
  },
  {
    id: 'spvs-v2-static-analysis',
    standard: 'SPVS',
    requirementId: 'V2.1.2',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L1',
      },
    ],
    rationale: 'Static analysis must be implemented at SPVS level {recommendedSPVSLevel}.',
  },
  {
    id: 'spvs-v2-dynamic-analysis',
    standard: 'SPVS',
    requirementId: 'V2.1.3',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L2',
      },
    ],
    rationale: 'Dynamic analysis must be implemented at SPVS level {recommendedSPVSLevel}.',
  },
  
  // V3: Integrate
  {
    id: 'spvs-v3-build-verification',
    standard: 'SPVS',
    requirementId: 'V3.1.1',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L1',
      },
    ],
    rationale: 'Build verification must be implemented at SPVS level {recommendedSPVSLevel}.',
  },
  {
    id: 'spvs-v3-build-signing',
    standard: 'SPVS',
    requirementId: 'V3.1.2',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L2',
      },
    ],
    rationale: 'Build artifact signing must be implemented at SPVS level {recommendedSPVSLevel}.',
  },
  {
    id: 'spvs-v3-build-verification-advanced',
    standard: 'SPVS',
    requirementId: 'V3.1.3',
    conditions: [
      {
        field: 'recommendedSPVSLevel',
        operator: 'equals',
        value: 'L3',
      },
    ],
    rationale: 'Advanced build artifact verification must be implemented at SPVS level {recommendedSPVSLevel}.',
  },
];

/**
 * Generate a shortlist based on questionnaire answers
 * 
 * @param answers - Questionnaire answers
 * @returns Shortlisted requirements
 */
export async function generateShortlist(
  answers: QuestionnaireAnswers
): Promise<ShortlistedRequirement[]> {
  // Load all requirements from both standards
  const [asvsRequirements, spvsRequirements] = await Promise.all([
    loadStandard('ASVS', '5.0.0'),
    loadStandard('SPVS', '1.0'),
  ]);

  const allRequirements: StandardRequirement[] = [
    ...asvsRequirements,
    ...spvsRequirements,
  ];

  // Combine all rules
  const allRules: RequirementRule[] = [...ASVS_RULES, ...SPVS_RULES];

  // Apply rules to generate shortlist
  const shortlist = applyRules(allRequirements, allRules, answers);

  return shortlist;
}

/**
 * Example usage
 */
async function main() {
  console.log('=== Security RAT - Shortlist Generation Demo ===\n');

  // Example 1: Public web app with authentication
  console.log('Example 1: Public Web App with Authentication');
  console.log('-----------------------------------------------');
  const webAppAnswers: QuestionnaireAnswers = {
    'app-type': 'web',
    'auth-type': 'oauth',
    'data-sensitivity': 'confidential',
    'internet-exposed': 'public',
    'hosting-model': 'cloud',
    'pipeline-maturity': 'intermediate',
  };

  const webAppShortlist = await generateShortlist(webAppAnswers);
  console.log(`Generated ${webAppShortlist.length} requirements`);
  console.log('\nTop 5 requirements:');
  webAppShortlist.slice(0, 5).forEach(req => {
    console.log(`  - ${req.requirementId}: ${req.title}`);
    console.log(`    Level: ${req.level}, Category: ${req.category}`);
    console.log(`    Rationale: ${req.rationale}`);
    console.log('');
  });

  // Example 2: Internal tool without authentication
  console.log('\nExample 2: Internal Tool without Authentication');
  console.log('------------------------------------------------');
  const internalToolAnswers: QuestionnaireAnswers = {
    'app-type': 'internal',
    'auth-type': 'none',
    'data-sensitivity': 'internal',
    'internet-exposed': 'private',
    'hosting-model': 'on-prem',
    'pipeline-maturity': 'basic',
  };

  const internalToolShortlist = await generateShortlist(internalToolAnswers);
  console.log(`Generated ${internalToolShortlist.length} requirements`);
  console.log('\nTop 5 requirements:');
  internalToolShortlist.slice(0, 5).forEach(req => {
    console.log(`  - ${req.requirementId}: ${req.title}`);
    console.log(`    Level: ${req.level}, Category: ${req.category}`);
    console.log(`    Rationale: ${req.rationale}`);
    console.log('');
  });

  // Example 3: Mobile app with high security
  console.log('\nExample 3: Mobile App with High Security');
  console.log('----------------------------------------');
  const mobileAppAnswers: QuestionnaireAnswers = {
    'app-type': 'mobile',
    'auth-type': 'oauth',
    'data-sensitivity': 'regulated',
    'internet-exposed': 'public',
    'hosting-model': 'cloud',
    'pipeline-maturity': 'advanced',
  };

  const mobileAppShortlist = await generateShortlist(mobileAppAnswers);
  console.log(`Generated ${mobileAppShortlist.length} requirements`);
  console.log('\nTop 5 requirements:');
  mobileAppShortlist.slice(0, 5).forEach(req => {
    console.log(`  - ${req.requirementId}: ${req.title}`);
    console.log(`    Level: ${req.level}, Category: ${req.category}`);
    console.log(`    Rationale: ${req.rationale}`);
    console.log('');
  });

  // Verify determinism
  console.log('\nVerifying Determinism...');
  console.log('----------------------------');
  const result1 = await generateShortlist(webAppAnswers);
  const result2 = await generateShortlist(webAppAnswers);
  const isDeterministic = JSON.stringify(result1) === JSON.stringify(result2);
  console.log(`Deterministic: ${isDeterministic ? '✓ PASS' : '✗ FAIL'}`);

  console.log('\n=== Demo Complete ===');
}

// Run the demo if this file is executed directly
if (import.meta.vitest) {
  // This is being run by Vitest
  export { generateShortlist };
} else {
  main().catch(console.error);
}

export { ASVS_RULES, SPVS_RULES };
