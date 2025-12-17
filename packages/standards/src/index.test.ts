/**
 * @security-rat/standards
 * Unit tests for standards data ingestion
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  loadStandard,
  getRequirement,
  validateRequirementId,
  getAllRequirements,
  getRequirementsByLevel,
  getRequirementsByCategory,
  clearCache,
} from './index';
import type { StandardRequirement } from './index';

describe('Standards Data Ingestion', () => {
  beforeAll(async () => {
    // Clear cache before tests
    clearCache();
  });

  afterAll(() => {
    // Clear cache after tests
    clearCache();
  });

  describe('loadStandard', () => {
    it('should load ASVS 5.0 requirements', async () => {
      const requirements = await loadStandard('ASVS', '5.0.0');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.length).toBeGreaterThan(0);

      // Check first requirement structure
      const firstReq = requirements[0];
      expect(firstReq.id).toBeDefined();
      expect(firstReq.standard).toBe('ASVS');
      expect(firstReq.version).toBe('5.0.0');
      expect(firstReq.title).toBeDefined();
      expect(firstReq.description).toBeDefined();
      expect(firstReq.level).toBeOneOf(['L1', 'L2', 'L3']);
      expect(firstReq.category).toBeDefined();
      expect(Array.isArray(firstReq.tags)).toBe(true);
      expect(typeof firstReq.metadata).toBe('object');
    });

    it('should cache loaded standards', async () => {
      const requirements1 = await loadStandard('ASVS', '5.0.0');
      const requirements2 = await loadStandard('ASVS', '5.0.0');

      // Should return the same array (from cache)
      expect(requirements1).toBe(requirements2);
    });

    it('should throw error for non-existent standard', async () => {
      await expect(loadStandard('ASVS', '99.0.0')).rejects.toThrow();
    });
  });

  describe('validateRequirementId', () => {
    it('should validate ASVS requirement IDs', () => {
      expect(validateRequirementId('ASVS', 'v5.0.0-1.1.1')).toBe(true);
      expect(validateRequirementId('ASVS', 'v5.0.0-1.2.3')).toBe(true);
      expect(validateRequirementId('ASVS', 'v5.0.0-14.5.7')).toBe(true);
    });

    it('should reject invalid ASVS requirement IDs', () => {
      expect(validateRequirementId('ASVS', 'invalid')).toBe(false);
      expect(validateRequirementId('ASVS', 'v5.0.0-1.1')).toBe(false);
      expect(validateRequirementId('ASVS', '5.0.0-1.1.1')).toBe(false);
      expect(validateRequirementId('ASVS', 'v5.0.0-1.1.1.1')).toBe(false);
    });

    it('should validate SPVS requirement IDs', () => {
      expect(validateRequirementId('SPVS', 'V1.1.1')).toBe(true);
      expect(validateRequirementId('SPVS', 'V2.3.5')).toBe(true);
      expect(validateRequirementId('SPVS', 'V5.10.15')).toBe(true);
    });

    it('should reject invalid SPVS requirement IDs', () => {
      expect(validateRequirementId('SPVS', 'invalid')).toBe(false);
      expect(validateRequirementId('SPVS', 'V1.1')).toBe(false);
      expect(validateRequirementId('SPVS', '1.1.1')).toBe(false);
      expect(validateRequirementId('SPVS', 'V1.1.1.1')).toBe(false);
    });
  });

  describe('getRequirement', () => {
    it('should get a specific ASVS requirement', async () => {
      const requirement = await getRequirement('ASVS', 'v5.0.0-1.1.1');

      expect(requirement).not.toBeNull();
      if (requirement) {
        expect(requirement.id).toBe('v5.0.0-1.1.1');
        expect(requirement.standard).toBe('ASVS');
        expect(requirement.title).toBeDefined();
      }
    });

    it('should return null for non-existent requirement', async () => {
      const requirement = await getRequirement('ASVS', 'v5.0.0-99.99.99');
      expect(requirement).toBeNull();
    });
  });

  describe('getAllRequirements', () => {
    it('should get all ASVS requirements', async () => {
      const requirements = await getAllRequirements('ASVS', '5.0.0');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.length).toBeGreaterThan(0);
      expect(requirements.every(req => req.standard === 'ASVS')).toBe(true);
    });

    it('should default to version 5.0.0 when no version specified', async () => {
      const requirements = await getAllRequirements('ASVS');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.length).toBeGreaterThan(0);
    });
  });

  describe('getRequirementsByLevel', () => {
    it('should filter requirements by level L1', async () => {
      const requirements = await getRequirementsByLevel('ASVS', '5.0.0', 'L1');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.every(req => req.level === 'L1')).toBe(true);
      expect(requirements.length).toBeGreaterThan(0);
    });

    it('should filter requirements by level L2', async () => {
      const requirements = await getRequirementsByLevel('ASVS', '5.0.0', 'L2');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.every(req => req.level === 'L2')).toBe(true);
    });

    it('should filter requirements by level L3', async () => {
      const requirements = await getRequirementsByLevel('ASVS', '5.0.0', 'L3');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.every(req => req.level === 'L3')).toBe(true);
    });
  });

  describe('getRequirementsByCategory', () => {
    it('should filter requirements by category V1', async () => {
      const requirements = await getRequirementsByCategory('ASVS', '5.0.0', 'V1');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.every(req => req.category === 'V1')).toBe(true);
      expect(requirements.length).toBeGreaterThan(0);
    });

    it('should filter requirements by category V2', async () => {
      const requirements = await getRequirementsByCategory('ASVS', '5.0.0', 'V2');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.every(req => req.category === 'V2')).toBe(true);
      expect(requirements.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent category', async () => {
      const requirements = await getRequirementsByCategory('ASVS', '5.0.0', 'V99');

      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.length).toBe(0);
    });
  });

  describe('data integrity', () => {
    it('should ensure all requirement IDs are unique', async () => {
      const requirements = await loadStandard('ASVS', '5.0.0');
      const ids = requirements.map(req => req.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should ensure all requirement IDs are valid', async () => {
      const requirements = await loadStandard('ASVS', '5.0.0');

      requirements.forEach(req => {
        expect(validateRequirementId('ASVS', req.id)).toBe(true);
      });
    });

    it('should ensure all requirements have required fields', async () => {
      const requirements = await loadStandard('ASVS', '5.0.0');

      requirements.forEach(req => {
        expect(req.id).toBeDefined();
        expect(req.title).toBeDefined();
        expect(req.description).toBeDefined();
        expect(req.level).toBeOneOf(['L1', 'L2', 'L3']);
        expect(req.category).toBeDefined();
      });
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
