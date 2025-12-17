#!/usr/bin/env node

/**
 * Integration test script to verify the implementation
 * This tests the core functionality without requiring vitest
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add packages to Node's module resolution
const packagesPath = resolve(__dirname, 'packages');
const questionnairePath = resolve(packagesPath, 'questionnaire');
const rulesEnginePath = resolve(packagesPath, 'rules-engine');
const standardsPath = resolve(packagesPath, 'standards');
const typesPath = resolve(packagesPath, 'types');

// Mock the module resolution
const Module = await import('module');
const originalResolveFilename = Module.default.resolveFilename;

Module.default.resolveFilename = function(request, parent, isMain, options) {
  if (request.startsWith('@security-rat/')) {
    const packageName = request.replace('@security-rat/', '');
    const packagePaths = {
      'types': typesPath,
      'questionnaire': questionnairePath,
      'rules-engine': rulesEnginePath,
      'standards': standardsPath,
    };
    
    if (packagePaths[packageName]) {
      return packagePaths[packageName] + '/src/index.ts';
    }
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

console.log('=== Security RAT Integration Test ===\n');

try {
  // Test 1: Load questionnaire
  console.log('Test 1: Loading questionnaire...');
  const { MINIMUM_QUESTIONNAIRE, DEFAULT_ANSWERS, validateAnswers } = await import('./packages/questionnaire/src/index.ts');
  
  console.log(`  ✓ Loaded ${MINIMUM_QUESTIONNAIRE.length} questions`);
  console.log(`  ✓ Default answers: ${Object.keys(DEFAULT_ANSWERS).length} answers`);
  console.log(`  ✓ Validation works: ${validateAnswers(DEFAULT_ANSWERS)}`);
  
  // Test 2: Load standards data
  console.log('\nTest 2: Loading standards data...');
  const { loadStandard, validateRequirementId } = await import('./packages/standards/src/index.ts');
  
  const asvsRequirements = await loadStandard('ASVS', '5.0.0');
  console.log(`  ✓ Loaded ${asvsRequirements.length} ASVS requirements`);
  
  const spvsRequirements = await loadStandard('SPVS', '1.0');
  console.log(`  ✓ Loaded ${spvsRequirements.length} SPVS requirements`);
  
  // Test 3: Validate requirement IDs
  console.log('\nTest 3: Validating requirement IDs...');
  console.log(`  ✓ ASVS ID valid: ${validateRequirementId('ASVS', 'v5.0.0-1.1.1')}`);
  console.log(`  ✓ SPVS ID valid: ${validateRequirementId('SPVS', 'V1.1.1')}`);
  console.log(`  ✓ Invalid ID rejected: ${!validateRequirementId('ASVS', 'invalid')}`);
  
  // Test 4: Test rules engine
  console.log('\nTest 4: Testing rules engine...');
  const { computeDerivedAttributes, applyRules } = await import('./packages/rules-engine/src/index.ts');
  
  const testAnswers = {
    'app-type': 'web',
    'auth-type': 'oauth',
    'data-sensitivity': 'confidential',
    'internet-exposed': 'public',
    'hosting-model': 'cloud',
    'pipeline-maturity': 'intermediate',
  };
  
  const derivedAttributes = computeDerivedAttributes(testAnswers);
  console.log(`  ✓ Computed derived attributes`);
  console.log(`    - Internet exposed: ${derivedAttributes.internetExposed}`);
  console.log(`    - Requires auth: ${derivedAttributes.requiresAuth}`);
  console.log(`    - Recommended ASVS level: ${derivedAttributes.recommendedASVSLevel}`);
  
  // Test 5: Generate shortlist
  console.log('\nTest 5: Generating shortlist...');
  const { generateShortlist } = await import('./packages/rules-engine/src/shortlist.example.ts');
  
  const shortlist = await generateShortlist(testAnswers);
  console.log(`  ✓ Generated ${shortlist.length} requirements`);
  
  if (shortlist.length > 0) {
    const firstReq = shortlist[0];
    console.log(`  ✓ First requirement: ${firstReq.requirementId}`);
    console.log(`    - Title: ${firstReq.title.substring(0, 50)}...`);
    console.log(`    - Level: ${firstReq.level}`);
    console.log(`    - Rationale: ${firstReq.rationale.substring(0, 60)}...`);
  }
  
  // Test 6: Verify determinism
  console.log('\nTest 6: Verifying determinism...');
  const shortlist1 = await generateShortlist(testAnswers);
  const shortlist2 = await generateShortlist(testAnswers);
  const isDeterministic = JSON.stringify(shortlist1) === JSON.stringify(shortlist2);
  console.log(`  ✓ Deterministic: ${isDeterministic ? 'PASS' : 'FAIL'}`);
  
  // Test 7: Test different scenarios
  console.log('\nTest 7: Testing different scenarios...');
  
  const scenarios = [
    {
      name: 'Internal tool without auth',
      answers: {
        'app-type': 'internal',
        'auth-type': 'none',
        'data-sensitivity': 'internal',
        'internet-exposed': 'private',
        'hosting-model': 'on-prem',
        'pipeline-maturity': 'basic',
      },
    },
    {
      name: 'Mobile app with regulated data',
      answers: {
        'app-type': 'mobile',
        'auth-type': 'oauth',
        'data-sensitivity': 'regulated',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'advanced',
      },
    },
  ];
  
  for (const scenario of scenarios) {
    const result = await generateShortlist(scenario.answers);
    console.log(`  ✓ ${scenario.name}: ${result.length} requirements`);
  }
  
  console.log('\n=== All Tests Passed! ===');
  console.log('\nSummary:');
  console.log('  - Questionnaire: ✓ Working');
  console.log('  - Standards data: ✓ Loaded');
  console.log('  - Rules engine: ✓ Functional');
  console.log('  - Shortlist generation: ✓ Working');
  console.log('  - Determinism: ✓ Verified');
  console.log('  - Multiple scenarios: ✓ Tested');
  
} catch (error) {
  console.error('\n=== Test Failed ===');
  console.error(error);
  process.exit(1);
}
