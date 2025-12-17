/**
 * @security-rat/rules-engine
 * Integration tests for shortlist generation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateShortlist } from './shortlist.example';
import type { QuestionnaireAnswers } from '@security-rat/types';

describe('Shortlist Generation', () => {
  describe('generateShortlist', () => {
    it('should generate requirements for a public web app with authentication', async () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const shortlist = await generateShortlist(answers);

      expect(Array.isArray(shortlist)).toBe(true);
      expect(shortlist.length).toBeGreaterThan(0);

      // Verify structure
      shortlist.forEach(req => {
        expect(req.requirementId).toBeDefined();
        expect(req.title).toBeDefined();
        expect(req.description).toBeDefined();
        expect(req.level).toBeOneOf(['L1', 'L2', 'L3']);
        expect(req.category).toBeDefined();
        expect(req.rationale).toBeDefined();
        expect(req.derivedFrom).toBeDefined();
        expect(req.derivedFrom.questionnaireAnswers).toBeDefined();
        expect(req.derivedFrom.ruleIds).toBeDefined();
        expect(req.status).toBe('pending');
      });

      // Verify traceability
      const asvsRequirements = shortlist.filter(req => req.standard === 'ASVS');
      const spvsRequirements = shortlist.filter(req => req.standard === 'SPVS');

      expect(asvsRequirements.length).toBeGreaterThan(0);
      expect(spvsRequirements.length).toBeGreaterThan(0);

      // Verify ASVS IDs are valid
      asvsRequirements.forEach(req => {
        expect(req.requirementId).toMatch(/^v5\.0\.0-\d+\.\d+\.\d+$/);
      });

      // Verify SPVS IDs are valid
      spvsRequirements.forEach(req => {
        expect(req.requirementId).toMatch(/^V\d+\.\d+\.\d+$/);
      });
    });

    it('should generate fewer requirements for an internal tool without authentication', async () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'internal',
        'auth-type': 'none',
        'data-sensitivity': 'internal',
        'internet-exposed': 'private',
        'hosting-model': 'on-prem',
        'pipeline-maturity': 'basic',
      };

      const shortlist = await generateShortlist(answers);

      expect(Array.isArray(shortlist)).toBe(true);
      expect(shortlist.length).toBeGreaterThan(0);

      // Internal tools should have fewer requirements
      expect(shortlist.length).toBeLessThan(10);
    });

    it('should generate more requirements for a mobile app with high security', async () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'mobile',
        'auth-type': 'oauth',
        'data-sensitivity': 'regulated',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'advanced',
      };

      const shortlist = await generateShortlist(answers);

      expect(Array.isArray(shortlist)).toBe(true);
      expect(shortlist.length).toBeGreaterThan(0);

      // Mobile apps with regulated data should have more requirements
      expect(shortlist.length).toBeGreaterThan(10);
    });

    it('should be deterministic - same inputs produce same outputs', async () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const result1 = await generateShortlist(answers);
      const result2 = await generateShortlist(answers);

      expect(result1).toEqual(result2);
      expect(JSON.stringify(result1)).toEqual(JSON.stringify(result2));
    });

    it('should include rationale for each requirement', async () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const shortlist = await generateShortlist(answers);

      shortlist.forEach(req => {
        expect(req.rationale).toBeDefined();
        expect(req.rationale.length).toBeGreaterThan(0);
        expect(req.rationale).toContain('required');
      });
    });

    it('should include derived information for each requirement', async () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };

      const shortlist = await generateShortlist(answers);

      shortlist.forEach(req => {
        expect(req.derivedFrom).toBeDefined();
        expect(req.derivedFrom.questionnaireAnswers).toEqual(answers);
        expect(Array.isArray(req.derivedFrom.ruleIds)).toBe(true);
        expect(req.derivedFrom.ruleIds.length).toBeGreaterThan(0);
      });
    });

    it('should handle different questionnaire scenarios', async () => {
      const scenarios = [
        {
          name: 'Public API with auth',
          answers: {
            'app-type': 'api',
            'auth-type': 'oauth',
            'data-sensitivity': 'confidential',
            'internet-exposed': 'public',
            'hosting-model': 'cloud',
            'pipeline-maturity': 'intermediate',
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
      ];

      for (const scenario of scenarios) {
        const shortlist = await generateShortlist(scenario.answers);
        expect(Array.isArray(shortlist)).toBe(true);
        expect(shortlist.length).toBeGreaterThan(0);
        
        // Verify all requirements have proper structure
        shortlist.forEach(req => {
          expect(req.requirementId).toBeDefined();
          expect(req.title).toBeDefined();
          expect(req.rationale).toBeDefined();
        });
      }
    });
  });
});

// Extend expect for convenience
declare global {
  namespace ViTest {
    interface Assertion {
      toBeOneOf<T>(values: T[]): T;
    }
  }
}

expect.extend({
  toBeOneOf(received: any, values: any[]) {
    const pass = values.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${values}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${values}`,
        pass: false,
      };
    }
  },
});
