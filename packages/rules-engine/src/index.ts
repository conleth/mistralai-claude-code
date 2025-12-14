/**
 * @security-rat/rules-engine
 * Deterministic requirement filtering engine
 */

import type {
  DerivedAttributes,
  QuestionnaireAnswers,
  RequirementRule,
  ShortlistedRequirement,
  StandardRequirement,
} from '@security-rat/types';

/**
 * Compute derived attributes from questionnaire answers
 * 
 * This function determines security characteristics based on user answers
 * to enable deterministic requirement filtering.
 */
export function computeDerivedAttributes(
  answers: QuestionnaireAnswers
): DerivedAttributes {
  // Extract answers with type safety
  const appType = answers['app-type'] as string;
  const authType = answers['auth-type'] as string;
  const dataSensitivity = answers['data-sensitivity'] as string;
  const internetExposed = answers['internet-exposed'] as string;
  const hostingModel = answers['hosting-model'] as string;
  const pipelineMaturity = answers['pipeline-maturity'] as string;

  // Determine if internet exposed
  const isInternetExposed = internetExposed === 'public';

  // Determine if authentication is required
  const hasAuth = authType !== 'none';

  // Determine if regulated data is handled
  const isRegulatedData = 
    dataSensitivity === 'regulated' || dataSensitivity === 'confidential';

  // Determine if mobile client is used
  const hasMobileClient = appType === 'mobile';

  // Determine recommended ASVS level
  let recommendedASVSLevel: 'L1' | 'L2' | 'L3' = 'L1';
  if (isInternetExposed && hasAuth && isRegulatedData) {
    recommendedASVSLevel = 'L3';
  } else if (isInternetExposed && hasAuth) {
    recommendedASVSLevel = 'L2';
  } else if (isInternetExposed) {
    recommendedASVSLevel = 'L2';
  }

  // Determine recommended SPVS level
  let recommendedSPVSLevel: 'L1' | 'L2' | 'L3' = 'L1';
  if (pipelineMaturity === 'advanced') {
    recommendedSPVSLevel = 'L3';
  } else if (pipelineMaturity === 'intermediate') {
    recommendedSPVSLevel = 'L2';
  }

  // Determine applicable ASVS categories based on app type
  const applicableASVSCategories: string[] = [];
  if (appType === 'web' || appType === 'api') {
    applicableASVSCategories.push('V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14');
  }
  if (appType === 'mobile') {
    applicableASVSCategories.push('V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14');
  }
  if (appType === 'internal') {
    applicableASVSCategories.push('V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13');
  }

  // Determine applicable SPVS stages
  const applicableSPVSStages: string[] = ['V1', 'V2', 'V3', 'V4', 'V5'];

  return {
    internetExposed: isInternetExposed,
    requiresAuth: hasAuth,
    handlesRegulatedData: isRegulatedData,
    usesMobileClient: hasMobileClient,
    recommendedASVSLevel,
    recommendedSPVSLevel,
    applicableASVSCategories,
    applicableSPVSStages,
  };
}

/**
 * Evaluate rules against requirements
 * 
 * Returns requirements that match the rules based on derived attributes
 */
export function evaluateRules(
  requirements: StandardRequirement[],
  rules: RequirementRule[],
  derivedAttributes: DerivedAttributes,
  questionnaireAnswers: QuestionnaireAnswers
): ShortlistedRequirement[] {
  const shortlisted: ShortlistedRequirement[] = [];

  // Create a map of rules by requirement ID for quick lookup
  const rulesMap = new Map<string, RequirementRule[]>();
  rules.forEach(rule => {
    const key = `${rule.standard}:${rule.requirementId}`;
    if (!rulesMap.has(key)) {
      rulesMap.set(key, []);
    }
    rulesMap.get(key)!.push(rule);
  });

  // Evaluate each requirement against its rules
  for (const requirement of requirements) {
    const key = `${requirement.standard}:${requirement.id}`;
    const matchingRules = rulesMap.get(key);

    if (matchingRules && matchingRules.length > 0) {
      // Check if any rule matches
      const matchedRules = matchingRules.filter(rule => {
        return evaluateRule(rule, derivedAttributes);
      });

      if (matchedRules.length > 0) {
        // Generate rationale from the first matching rule
        const rationale = generateRationale(matchedRules[0], derivedAttributes);

        shortlisted.push({
          standard: requirement.standard,
          standardVersion: requirement.version,
          requirementId: requirement.id,
          title: requirement.title,
          description: requirement.description,
          level: requirement.level,
          category: requirement.category,
          tags: requirement.tags,
          rationale,
          derivedFrom: {
            questionnaireAnswers,
            ruleIds: matchedRules.map(r => r.id),
          },
          status: 'pending',
        });
      }
    }
  }

  return shortlisted;
}

/**
 * Evaluate a single rule against derived attributes
 */
function evaluateRule(
  rule: RequirementRule,
  derivedAttributes: DerivedAttributes
): boolean {
  return rule.conditions.every(condition => {
    const fieldValue = getFieldValue(condition.field, derivedAttributes);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'includes':
        if (Array.isArray(fieldValue)) {
          return (fieldValue as string[]).includes(condition.value as string);
        }
        return String(fieldValue).includes(String(condition.value));
      case 'greaterThan':
        return fieldValue > condition.value;
      case 'lessThan':
        return fieldValue < condition.value;
      default:
        return false;
    }
  });
}

/**
 * Get value from derived attributes by field name
 */
function getFieldValue(
  field: string,
  derivedAttributes: DerivedAttributes
): string | number | boolean | string[] {
  // Handle nested properties if needed
  if (field in derivedAttributes) {
    return (derivedAttributes as any)[field];
  }
  
  // Handle special cases
  if (field === 'level') {
    return derivedAttributes.recommendedASVSLevel;
  }
  
  throw new Error(`Field ${field} not found in derived attributes`);
}

/**
 * Generate rationale string from rule template
 * 
 * Replaces placeholders like {field} with actual values from derived attributes
 */
export function generateRationale(
  rule: RequirementRule,
  derivedAttributes: DerivedAttributes
): string {
  let rationale = rule.rationale;

  // Replace field placeholders
  rule.conditions.forEach(condition => {
    const fieldValue = getFieldValue(condition.field, derivedAttributes);
    const placeholder = `{${condition.field}}`;
    rationale = rationale.replace(placeholder, String(fieldValue));
  });

  return rationale;
}

/**
 * Apply all rules to generate a shortlist
 * 
 * This is the main entry point for the rules engine
 */
export function applyRules(
  requirements: StandardRequirement[],
  rules: RequirementRule[],
  questionnaireAnswers: QuestionnaireAnswers
): ShortlistedRequirement[] {
  // Step 1: Compute derived attributes
  const derivedAttributes = computeDerivedAttributes(questionnaireAnswers);

  // Step 2: Evaluate rules
  const shortlisted = evaluateRules(
    requirements,
    rules,
    derivedAttributes,
    questionnaireAnswers
  );

  return shortlisted;
}
