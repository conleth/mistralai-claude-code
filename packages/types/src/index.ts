/**
 * @security-rat/types
 * Shared TypeScript interfaces for Security RAT Modern
 */

// Core requirement types (from FINDINGS.md)
export type Standard = 'ASVS' | 'SPVS';
export type Level = 'L1' | 'L2' | 'L3';
export type RequirementStatus = 'pending' | 'inProgress' | 'completed' | 'notApplicable';

export interface ShortlistedRequirement {
  // Traceability (immutable)
  standard: Standard;
  standardVersion: string; // e.g., "5.0.0"
  requirementId: string; // canonical ID from standard
  title: string;
  description: string;

  // Classification (from standard)
  level: Level;
  category: string; // ASVS chapter or SPVS stage
  tags: string[]; // role, platform, etc.

  // Derivation (our logic)
  rationale: string; // why this requirement applies
  derivedFrom: {
    questionnaireAnswers: Record<string, string>;
    ruleIds: string[];
  };

  // User state (mutable)
  status: RequirementStatus;
  assignee?: string;
  ticketLink?: string;
  notes?: string;
}

export interface ExcludedRequirement extends ShortlistedRequirement {
  exclusionReason: string; // template explaining why filtered out
  couldIncludeIf: string[]; // what questionnaire changes would include it
}

// Questionnaire types
export type QuestionType = 'single-select' | 'multi-select' | 'boolean';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  helpText?: string;
  dependsOn?: { questionId: string; expectedValue: string }[];
}

export interface QuestionnaireAnswers {
  [questionId: string]: string | string[];
}

// Derived attributes (computed from questionnaire answers)
export interface DerivedAttributes {
  internetExposed: boolean;
  requiresAuth: boolean;
  handlesRegulatedData: boolean;
  usesMobileClient: boolean;
  recommendedASVSLevel: Level;
  recommendedSPVSLevel: Level;
  applicableASVSCategories: string[];
  applicableSPVSStages: string[];
}

// Rules engine types
export type RuleOperator = 'equals' | 'includes' | 'greaterThan' | 'lessThan';

export interface RuleCondition {
  field: string; // derived attribute or requirement metadata
  operator: RuleOperator;
  value: string | number | boolean;
}

export interface RequirementRule {
  id: string;
  standard: Standard;
  requirementId: string;
  conditions: RuleCondition[];
  rationale: string; // template with {field} placeholders
}

// Role-based views
export type Role = 'security-lead' | 'developer' | 'product-manager' | 'auditor';
export type Action = 'view' | 'edit' | 'comment' | 'assign' | 'export';

export interface RoleView {
  role: Role;
  visibleFields: (keyof ShortlistedRequirement)[];
  allowedActions: Action[];
  defaultSort: { field: string; direction: 'asc' | 'desc' };
  groupBy?: string;
}

// Export formats
export type ExportFormat = 'json' | 'csv' | 'markdown';

export interface ExportResult {
  format: ExportFormat;
  content: string;
  filename: string;
}
