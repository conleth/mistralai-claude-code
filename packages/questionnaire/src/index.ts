/**
 * @security-rat/questionnaire
 * Questionnaire definition and management
 */

import type { Question, QuestionnaireAnswers } from '@security-rat/types';

/**
 * Minimum questionnaire with 6 questions
 * 
 * These questions determine the security characteristics of the application
 * and enable deterministic requirement filtering.
 */
export const MINIMUM_QUESTIONNAIRE: Question[] = [
  {
    id: 'app-type',
    text: 'What type of application are you building?',
    type: 'single-select',
    options: [
      { value: 'web', label: 'Web Application', description: 'A web-based application accessible via browser' },
      { value: 'api', label: 'API Service', description: 'A REST/gRPC API service' },
      { value: 'mobile', label: 'Mobile Application', description: 'An iOS or Android mobile application' },
      { value: 'internal', label: 'Internal Tool', description: 'An internal tool not directly exposed to the internet' },
    ],
    helpText: 'Select the primary type of application. This helps determine which security controls are most relevant.',
  },
  {
    id: 'auth-type',
    text: 'What authentication mechanism does your application use?',
    type: 'single-select',
    options: [
      { value: 'none', label: 'No Authentication', description: 'Public access, no authentication required' },
      { value: 'session', label: 'Session-Based', description: 'Traditional session cookies' },
      { value: 'oauth', label: 'OAuth/OIDC', description: 'OpenID Connect or OAuth 2.0' },
      { value: 'sso', label: 'SSO/SAML', description: 'Single Sign-On with SAML or similar' },
    ],
    helpText: 'Select the authentication mechanism. This affects authentication and session management requirements.',
  },
  {
    id: 'data-sensitivity',
    text: 'What is the sensitivity level of the data your application handles?',
    type: 'single-select',
    options: [
      { value: 'public', label: 'Public', description: 'Publicly available information with no sensitivity' },
      { value: 'internal', label: 'Internal', description: 'Internal company information' },
      { value: 'confidential', label: 'Confidential', description: 'Sensitive business information' },
      { value: 'regulated', label: 'Regulated', description: 'Personally identifiable information (PII) or regulated data' },
    ],
    helpText: 'Select the data sensitivity level. This determines encryption and data protection requirements.',
  },
  {
    id: 'internet-exposed',
    text: 'Is your application exposed to the internet?',
    type: 'single-select',
    options: [
      { value: 'public', label: 'Publicly Accessible', description: 'Directly accessible from the internet' },
      { value: 'private', label: 'Private Network', description: 'Only accessible within a private network' },
      { value: 'mixed', label: 'Mixed', description: 'Some components public, some private' },
    ],
    helpText: 'Select the exposure level. Internet-exposed applications require more stringent security controls.',
  },
  {
    id: 'hosting-model',
    text: 'Where is your application hosted?',
    type: 'single-select',
    options: [
      { value: 'on-prem', label: 'On-Premises', description: 'Hosted in company-owned data centers' },
      { value: 'cloud', label: 'Cloud Provider', description: 'Hosted on AWS, GCP, Azure, or similar' },
      { value: 'hybrid', label: 'Hybrid', description: 'Combination of on-premises and cloud' },
    ],
    helpText: 'Select the hosting model. This affects infrastructure security requirements.',
  },
  {
    id: 'pipeline-maturity',
    text: 'What is the maturity level of your CI/CD pipeline?',
    type: 'single-select',
    options: [
      { value: 'basic', label: 'Basic', description: 'Manual or simple automated builds' },
      { value: 'intermediate', label: 'Intermediate', description: 'Automated builds with some security checks' },
      { value: 'advanced', label: 'Advanced', description: 'Mature pipeline with security scanning, signing, and verification' },
    ],
    helpText: 'Select the pipeline maturity. This determines pipeline security requirements.',
  },
];

/**
 * Default questionnaire answers (recommended baseline)
 */
export const DEFAULT_ANSWERS: QuestionnaireAnswers = {
  'app-type': 'web',
  'auth-type': 'oauth',
  'data-sensitivity': 'confidential',
  'internet-exposed': 'public',
  'hosting-model': 'cloud',
  'pipeline-maturity': 'intermediate',
};

/**
 * Get questionnaire by ID
 * 
 * @param id - The questionnaire ID
 * @returns The questionnaire definition
 */
export function getQuestionnaire(id: string = 'minimum'): Question[] {
  switch (id) {
    case 'minimum':
      return MINIMUM_QUESTIONNAIRE;
    default:
      return MINIMUM_QUESTIONNAIRE;
  }
}

/**
 * Validate questionnaire answers
 * 
 * @param answers - The answers to validate
 * @returns True if all required questions are answered
 */
export function validateAnswers(answers: QuestionnaireAnswers): boolean {
  const requiredQuestions = MINIMUM_QUESTIONNAIRE.map(q => q.id);
  return requiredQuestions.every(id => id in answers);
}

/**
 * Get missing questions from answers
 * 
 * @param answers - The answers to check
 * @returns Array of question IDs that are missing
 */
export function getMissingQuestions(answers: QuestionnaireAnswers): string[] {
  const requiredQuestions = MINIMUM_QUESTIONNAIRE.map(q => q.id);
  return requiredQuestions.filter(id => !(id in answers));
}

/**
 * Get question by ID
 * 
 * @param id - The question ID
 * @returns The question or undefined if not found
 */
export function getQuestion(id: string): Question | undefined {
  return MINIMUM_QUESTIONNAIRE.find(q => q.id === id);
}

/**
 * Get all question IDs
 * 
 * @returns Array of all question IDs
 */
export function getAllQuestionIds(): string[] {
  return MINIMUM_QUESTIONNAIRE.map(q => q.id);
}

/**
 * Check if answers are complete
 * 
 * @param answers - The answers to check
 * @returns True if all required questions are answered
 */
export function isComplete(answers: QuestionnaireAnswers): boolean {
  return validateAnswers(answers);
}

/**
 * Get progress percentage
 * 
 * @param answers - The answers to check
 * @returns Progress percentage (0-100)
 */
export function getProgress(answers: QuestionnaireAnswers): number {
  const totalQuestions = MINIMUM_QUESTIONNAIRE.length;
  const answeredQuestions = Object.keys(answers).filter(
    id => MINIMUM_QUESTIONNAIRE.some(q => q.id === id)
  ).length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
}
