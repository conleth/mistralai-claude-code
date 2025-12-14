/**
 * @security-rat/standards
 * OWASP ASVS & SPVS data ingestion and management
 */
import type { Standard } from '@security-rat/types';
/**
 * Standard requirement interface
 */
export interface StandardRequirement {
    id: string;
    standard: Standard;
    version: string;
    title: string;
    description: string;
    level: 'L1' | 'L2' | 'L3';
    category: string;
    tags: string[];
    metadata: Record<string, unknown>;
}
/**
 * Load a standard from JSON file
 *
 * @param standard - The standard to load (ASVS or SPVS)
 * @param version - The version of the standard
 * @returns Array of requirements
 */
export declare function loadStandard(standard: Standard, version: string): Promise<StandardRequirement[]>;
/**
 * Get a specific requirement by ID
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param requirementId - The canonical requirement ID
 * @returns The requirement or null if not found
 */
export declare function getRequirement(standard: Standard, requirementId: string): Promise<StandardRequirement | null>;
/**
 * Validate a requirement ID format
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param requirementId - The requirement ID to validate
 * @returns True if valid, false otherwise
 */
export declare function validateRequirementId(standard: Standard, requirementId: string): boolean;
/**
 * Get all requirements for a standard
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version (optional, defaults to latest)
 * @returns Array of all requirements
 */
export declare function getAllRequirements(standard: Standard, version?: string): Promise<StandardRequirement[]>;
/**
 * Get requirements by level
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version
 * @param level - The level filter (L1, L2, or L3)
 * @returns Array of requirements matching the level
 */
export declare function getRequirementsByLevel(standard: Standard, version: string, level: 'L1' | 'L2' | 'L3'): Promise<StandardRequirement[]>;
/**
 * Get requirements by category
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version
 * @param category - The category filter
 * @returns Array of requirements matching the category
 */
export declare function getRequirementsByCategory(standard: Standard, version: string, category: string): Promise<StandardRequirement[]>;
/**
 * Clear the standards cache (useful for testing)
 */
export declare function clearCache(): void;
