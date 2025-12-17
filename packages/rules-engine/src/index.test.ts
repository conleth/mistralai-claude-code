/**
 * @security-rat/rules-engine
 * Unit tests for the rules engine
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  computeDerivedAttributes,
  evaluateRules,
  generateRationale,
  applyRules,
} from './index';
import type {
  DerivedAttributes,
  QuestionnaireAnswers,
  RequirementRule,
  ShortlistedRequirement,
  StandardRequirement,
} from '@security-rat/types';

// Test fixtures
describe('Rules Engine', () => {
  describe('computeDerivedAttributes', () => {
    it('should compute derived attributes for a public web app with auth', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const result = computeDerivedAttributes(answers);

      expect(result.internetExposed).toBe(true);
      expect(result.requiresAuth).toBe(true);
      expect(result.handlesRegulatedData).toBe(true);
      expect(result.usesMobileClient).toBe(false);
      expect(result.recommendedASVSLevel).toBe('L3');
      expect(result.recommendedSPVSLevel).toBe('L2');
      expect(result.applicableASVSCategories).toContain('V2');
      expect(result.applicableASVSCategories).toContain('V14');
    });

    it('should compute derived attributes for an internal tool without auth', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'internal',
        'auth-type': 'none',
        'data-sensitivity': 'internal',
        'internet-exposed': 'private',
        'hosting-model': 'on-prem',
        'pipeline-maturity': 'basic',
      };

      const result = computeDerivedAttributes(answers);

      expect(result.internetExposed).toBe(false);
      expect(result.requiresAuth).toBe(false);
      expect(result.handlesRegulatedData).toBe(false);
      expect(result.usesMobileClient).toBe(false);
      expect(result.recommendedASVSLevel).toBe('L1');
      expect(result.recommendedSPVSLevel).toBe('L1');
    });

    it('should compute derived attributes for a mobile app', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'mobile',
        'auth-type': 'session',
        'data-sensitivity': 'public',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'advanced',
      };

      const result = computeDerivedAttributes(answers);

      expect(result.usesMobileClient).toBe(true);
      expect(result.recommendedSPVSLevel).toBe('L3');
    });

    it('should be deterministic - same inputs produce same outputs', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const result1 = computeDerivedAttributes(answers);
      const result2 = computeDerivedAttributes(answers);

      expect(result1).toEqual(result2);
    });
  });

  describe('generateRationale', () => {
    it('should generate rationale with field placeholders replaced', () => {
      const rule: RequirementRule = {
        id: 'rule-1',
        standard: 'ASVS',
        requirementId: 'v5.0.0-1.1.1',
        conditions: [
          {
            field: 'internetExposed',
            operator: 'equals',
            value: true,
          },
        ],
        rationale: 'This requirement applies because the application is internet-exposed ({internetExposed}).',
      };

      const derivedAttributes: DerivedAttributes = {
        internetExposed: true,
        requiresAuth: true,
        handlesRegulatedData: false,
        usesMobileClient: false,
        recommendedASVSLevel: 'L2',
        recommendedSPVSLevel: 'L1',
        applicableASVSCategories: ['V2', 'V3'],
        applicableSPVSStages: ['V1', 'V2'],
      };

      const rationale = generateRationale(rule, derivedAttributes);

      expect(rationale).toBe('This requirement applies because the application is internet-exposed (true).');
    });

    it('should handle multiple placeholders', () => {
      const rule: RequirementRule = {
        id: 'rule-2',
        standard: 'ASVS',
        requirementId: 'v5.0.0-1.1.2',
        conditions: [
          {
            field: 'requiresAuth',
            operator: 'equals',
            value: true,
          },
          {
            field: 'recommendedASVSLevel',
            operator: 'equals',
            value: 'L2',
          },
        ],
        rationale: 'Authentication is required ({requiresAuth}) and the recommended ASVS level is {recommendedASVSLevel}.',
      };

      const derivedAttributes: DerivedAttributes = {
        internetExposed: true,
        requiresAuth: true,
        handlesRegulatedData: false,
        usesMobileClient: false,
        recommendedASVSLevel: 'L2',
        recommendedSPVSLevel: 'L1',
        applicableASVSCategories: ['V2', 'V3'],
        applicableSPVSStages: ['V1', 'V2'],
      };

      const rationale = generateRationale(rule, derivedAttributes);

      expect(rationale).toBe('Authentication is required (true) and the recommended ASVS level is L2.');
    });
  });

  describe('evaluateRules', () => {
    it('should evaluate rules and return matching requirements', () => {
      const requirements: StandardRequirement[] = [
        {
          id: 'v5.0.0-1.1.1',
          standard: 'ASVS',
          version: '5.0.0',
          title: 'Inventory of authorized and unauthorized software',
          description: 'Test description',
          level: 'L1',
          category: 'V1',
          tags: ['inventory', 'software'],
          metadata: {},
        },
        {
          id: 'v5.0.0-1.1.2',
          standard: 'ASVS',
          version: '5.0.0',
          title: 'Test for unauthorized software',
          description: 'Test description',
          level: 'L1',
          category: 'V1',
          tags: ['inventory', 'software'],
          metadata: {},
        },
      ];

      const rules: RequirementRule[] = [
        {
          id: 'rule-1',
          standard: 'ASVS',
          requirementId: 'v5.0.0-1.1.1',
          conditions: [
            {
              field: 'internetExposed',
              operator: 'equals',
              value: true,
            },
          ],
          rationale: 'This requirement applies because the application is internet-exposed ({internetExposed}).',
        },
      ];

      const derivedAttributes: DerivedAttributes = {
        internetExposed: true,
        requiresAuth: true,
        handlesRegulatedData: false,
        usesMobileClient: false,
        recommendedASVSLevel: 'L2',
        recommendedSPVSLevel: 'L1',
        applicableASVSCategories: ['V2', 'V3'],
        applicableSPVSStages: ['V1', 'V2'],
      };

      const questionnaireAnswers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const result = evaluateRules(
        requirements,
        rules,
        derivedAttributes,
        questionnaireAnswers
      );

      expect(result.length).toBe(1);
      expect(result[0].requirementId).toBe('v5.0.0-1.1.1');
      expect(result[0].rationale).toContain('internet-exposed');
    });

    it('should return empty array when no rules match', () => {
      const requirements: StandardRequirement[] = [
        {
          id: 'v5.0.0-1.1.1',
          standard: 'ASVS',
          version: '5.0.0',
          title: 'Inventory of authorized and unauthorized software',
          description: 'Test description',
          level: 'L1',
          category: 'V1',
          tags: ['inventory', 'software'],
          metadata: {},
        },
      ];

      const rules: RequirementRule[] = [
        {
          id: 'rule-1',
          standard: 'ASVS',
          requirementId: 'v5.0.0-1.1.1',
          conditions: [
            {
              field: 'internetExposed',
              operator: 'equals',
              value: false,
            },
          ],
          rationale: 'This requirement applies because the application is not internet-exposed.',
        },
      ];

      const derivedAttributes: DerivedAttributes = {
        internetExposed: true,
        requiresAuth: true,
        handlesRegulatedData: false,
        usesMobileClient: false,
        recommendedASVSLevel: 'L2',
        recommendedSPVSLevel: 'L1',
        applicableASVSCategories: ['V2', 'V3'],
        applicableSPVSStages: ['V1', 'V2'],
      };

      const questionnaireAnswers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const result = evaluateRules(
        requirements,
        rules,
        derivedAttributes,
        questionnaireAnswers
      );

      expect(result.length).toBe(0);
    });

    it('should handle multiple conditions in a rule', () => {
      const requirements: StandardRequirement[] = [
        {
          id: 'v5.0.0-1.1.1',
          standard: 'ASVS',
          version: '5.0.0',
          title: 'Inventory of authorized and unauthorized software',
          description: 'Test description',
          level: 'L1',
          category: 'V1',
          tags: ['inventory', 'software'],
          metadata: {},
        },
      ];

      const rules: RequirementRule[] = [
        {
          id: 'rule-1',
          standard: 'ASVS',
          requirementId: 'v5.0.0-1.1.1',
          conditions: [
            {
              field: 'internetExposed',
              operator: 'equals',
              value: true,
            },
            {
              field: 'requiresAuth',
              operator: 'equals',
              value: true,
            },
          ],
          rationale: 'This requirement applies because the application is internet-exposed and requires authentication.',
        },
      ];

      const derivedAttributes: DerivedAttributes = {
        internetExposed: true,
        requiresAuth: true,
        handlesRegulatedData: false,
        usesMobileClient: false,
        recommendedASVSLevel: 'L2',
        recommendedSPVSLevel: 'L1',
        applicableASVSCategories: ['V2', 'V3'],
        applicableSPVSStages: ['V1', 'V2'],
      };

      const questionnaireAnswers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const result = evaluateRules(
        requirements,
        rules,
        derivedAttributes,
        questionnaireAnswers
      );

      expect(result.length).toBe(1);
    });
  });

  describe('applyRules', () => {
    it('should apply all rules and return a shortlist', () => {
      const requirements: StandardRequirement[] = [
        {
          id: 'v5.0.0-1.1.1',
          standard: 'ASVS',
          version: '5.0.0',
          title: 'Inventory of authorized and unauthorized software',
          description: 'Test description',
          level: 'L1',
          category: 'V1',
          tags: ['inventory', 'software'],
          metadata: {},
        },
        {
          id: 'v5.0.0-1.1.2',
          standard: 'ASVS',
          version: '5.0.0',
          title: 'Test for unauthorized software',
          description: 'Test description',
          level: 'L1',
          category: 'V1',
          tags: ['inventory', 'software'],
          metadata: {},
        },
      ];

      const rules: RequirementRule[] = [
        {
          id: 'rule-1',
          standard: 'ASVS',
          requirementId: 'v5.0.0-1.1.1',
          conditions: [
            {
              field: 'internetExposed',
              operator: 'equals',
              value: true,
            },
          ],
          rationale: 'This requirement applies because the application is internet-exposed ({internetExposed}).',
        },
        {
          id: 'rule-2',
          standard: 'ASVS',
          requirementId: 'v5.0.0-1.1.2',
          conditions: [
            {
              field: 'requiresAuth',
              operator: 'equals',
              value: true,
            },
          ],
          rationale: 'This requirement applies because authentication is required ({requiresAuth}).',
        },
      ];

      const questionnaireAnswers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const result = applyRules(requirements, rules, questionnaireAnswers);

      expect(result.length).toBe(2);
      expect(result[0].requirementId).toBe('v5.0.0-1.1.1');
      expect(result[1].requirementId).toBe('v5.0.0-1.1.2');
      expect(result.every(r => r.rationale)).toBe(true);
    });

    it('should be deterministic - same inputs produce same outputs', () => {
      const requirements: StandardRequirement[] = [
        {
          id: 'v5.0.0-1.1.1',
          standard: 'ASVS',
          version: '5.0.0',
          title: 'Inventory of authorized and unauthorized software',
          description: 'Test description',
          level: 'L1',
          category: 'V1',
          tags: ['inventory', 'software'],
          metadata: {},
        },
      ];

      const rules: RequirementRule[] = [
        {
          id: 'rule-1',
          standard: 'ASVS',
          requirementId: 'v5.0.0-1.1.1',
          conditions: [
            {
              field: 'internetExposed',
              operator: 'equals',
              value: true,
            },
          ],
          rationale: 'This requirement applies because the application is internet-exposed ({internetExposed}).',
        },
      ];

      const questionnaireAnswers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const result1 = applyRules(requirements, rules, questionnaireAnswers);
      const result2 = applyRules(requirements, rules, questionnaireAnswers);

      expect(result1).toEqual(result2);
    });
  });
});
