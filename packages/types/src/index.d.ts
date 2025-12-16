/**
 * @security-rat/types
 * Shared TypeScript interfaces for Security RAT Modern
 */
export type Standard = 'ASVS' | 'SPVS';
export type Level = 'L1' | 'L2' | 'L3';
export type RequirementStatus = 'pending' | 'inProgress' | 'completed' | 'notApplicable';
export interface ShortlistedRequirement {
    standard: Standard;
    standardVersion: string;
    requirementId: string;
    title: string;
    description: string;
    level: Level;
    category: string;
    tags: string[];
    rationale: string;
    derivedFrom: {
        questionnaireAnswers: Record<string, string>;
        ruleIds: string[];
    };
    status: RequirementStatus;
    assignee?: string;
    ticketLink?: string;
    notes?: string;
}
export interface ExcludedRequirement extends ShortlistedRequirement {
    exclusionReason: string;
    couldIncludeIf: string[];
}
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
    dependsOn?: {
        questionId: string;
        expectedValue: string;
    }[];
}
export interface QuestionnaireAnswers {
    [questionId: string]: string | string[];
}
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
export type RuleOperator = 'equals' | 'includes' | 'greaterThan' | 'lessThan';
export interface RuleCondition {
    field: string;
    operator: RuleOperator;
    value: string | number | boolean;
}
export interface RequirementRule {
    id: string;
    standard: Standard;
    requirementId: string;
    conditions: RuleCondition[];
    rationale: string;
}
export type Role = 'security-lead' | 'developer' | 'product-manager' | 'auditor';
export type Action = 'view' | 'edit' | 'comment' | 'assign' | 'export';
export interface RoleView {
    role: Role;
    visibleFields: (keyof ShortlistedRequirement)[];
    allowedActions: Action[];
    defaultSort: {
        field: string;
        direction: 'asc' | 'desc';
    };
    groupBy?: string;
}
export type ExportFormat = 'json' | 'csv' | 'markdown';
export interface ExportResult {
    format: ExportFormat;
    content: string;
    filename: string;
}
//# sourceMappingURL=index.d.ts.map