/**
 * @security-rat/standards
 * OWASP ASVS & SPVS data ingestion and management
 */

import type { Standard, ShortlistedRequirement } from '@security-rat/types';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

// In-memory cache for loaded standards
const standardsCache = new Map<string, StandardRequirement[]>();

/**
 * Load a standard from JSON file
 * 
 * @param standard - The standard to load (ASVS or SPVS)
 * @param version - The version of the standard
 * @returns Array of requirements
 */
export async function loadStandard(
  standard: Standard,
  version: string
): Promise<StandardRequirement[]> {
  const cacheKey = `${standard}:${version}`;

  // Return from cache if available
  if (standardsCache.has(cacheKey)) {
    return standardsCache.get(cacheKey)!;
  }

  // Determine the file path based on standard and version
  let filePath: string;
  if (standard === 'ASVS') {
    filePath = resolve(__dirname, '../data', `asvs-${version}.json`);
  } else {
    filePath = resolve(__dirname, '../data', `spvs-${version}.json`);
  }

  try {
    // Read and parse the JSON file
    const fileContent = await readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Validate the data structure
    if (!data.requirements || !Array.isArray(data.requirements)) {
      throw new Error(`Invalid data structure in ${filePath}`);
    }

    // Transform to standard format
    const requirements: StandardRequirement[] = data.requirements.map(
      (req: any) => ({
        id: req.id,
        standard,
        version: data.version || version,
        title: req.title,
        description: req.description,
        level: req.level,
        category: req.category,
        tags: req.tags || [],
        metadata: req.metadata || {},
      })
    );

    // Validate all requirements
    requirements.forEach(req => {
      validateRequirementId(standard, req.id);
    });

    // Cache the loaded requirements
    standardsCache.set(cacheKey, requirements);

    return requirements;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Standard file not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Get a specific requirement by ID
 * 
 * @param standard - The standard (ASVS or SPVS)
 * @param requirementId - The canonical requirement ID
 * @returns The requirement or null if not found
 */
export async function getRequirement(
  standard: Standard,
  requirementId: string
): Promise<StandardRequirement | null> {
  const requirements = await loadStandard(standard, getVersionFromId(requirementId));
  return requirements.find(req => req.id === requirementId) || null;
}

/**
 * Validate a requirement ID format
 * 
 * @param standard - The standard (ASVS or SPVS)
 * @param requirementId - The requirement ID to validate
 * @returns True if valid, false otherwise
 */
export function validateRequirementId(
  standard: Standard,
  requirementId: string
): boolean {
  if (standard === 'ASVS') {
    // ASVS format: v5.0.0-<chapter>.<section>.<requirement>
    // Example: v5.0.0-1.1.1
    const pattern = /^v\d+\.\d+\.\d+-\d+\.\d+\.\d+$/;
    return pattern.test(requirementId);
  } else {
    // SPVS format: V#.#.# (category.subcategory.requirement)
    // Example: V1.1.1
    const pattern = /^V\d+\.\d+\.\d+$/;
    return pattern.test(requirementId);
  }
}

/**
 * Get version from a requirement ID
 * 
 * @param requirementId - The requirement ID
 * @returns The version extracted from the ID
 */
function getVersionFromId(requirementId: string): string {
  if (requirementId.startsWith('v')) {
    // ASVS format
    const match = requirementId.match(/^v(\d+\.\d+\.\d+)-/);
    return match ? match[1] : '5.0.0';
  } else if (requirementId.startsWith('V')) {
    // SPVS format - no version in ID, use default
    return '1.0';
  }
  return '5.0.0';
}

/**
 * Get all requirements for a standard
 * 
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version (optional, defaults to latest)
 * @returns Array of all requirements
 */
export async function getAllRequirements(
  standard: Standard,
  version: string = '5.0.0'
): Promise<StandardRequirement[]> {
  return await loadStandard(standard, version);
}

/**
 * Get requirements by level
 * 
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version
 * @param level - The level filter (L1, L2, or L3)
 * @returns Array of requirements matching the level
 */
export async function getRequirementsByLevel(
  standard: Standard,
  version: string,
  level: 'L1' | 'L2' | 'L3'
): Promise<StandardRequirement[]> {
  const requirements = await loadStandard(standard, version);
  return requirements.filter(req => req.level === level);
}

/**
 * Get requirements by category
 * 
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version
 * @param category - The category filter
 * @returns Array of requirements matching the category
 */
export async function getRequirementsByCategory(
  standard: Standard,
  version: string,
  category: string
): Promise<StandardRequirement[]> {
  const requirements = await loadStandard(standard, version);
  return requirements.filter(req => req.category === category);
}

/**
 * Clear the standards cache (useful for testing)
 */
export function clearCache(): void {
  standardsCache.clear();
}
