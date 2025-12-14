/**
 * @security-rat/questionnaire
 * Unit tests for questionnaire
 */

import { describe, it, expect } from 'vitest';
import {
  MINIMUM_QUESTIONNAIRE,
  DEFAULT_ANSWERS,
  getQuestionnaire,
  validateAnswers,
  getMissingQuestions,
  getQuestion,
  getAllQuestionIds,
  isComplete,
  getProgress,
} from './index';
import type { QuestionnaireAnswers } from '@security-rat/types';

describe('Questionnaire', () => {
  describe('MINIMUM_QUESTIONNAIRE', () => {
    it('should have exactly 6 questions', () => {
      expect(MINIMUM_QUESTIONNAIRE.length).toBe(6);
    });

    it('should have all required question IDs', () => {
      const expectedIds = [
        'app-type',
        'auth-type',
        'data-sensitivity',
        'internet-exposed',
        'hosting-model',
        'pipeline-maturity',
      ];
      const actualIds = MINIMUM_QUESTIONNAIRE.map(q => q.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it('should have proper question structure', () => {
      MINIMUM_QUESTIONNAIRE.forEach(question => {
        expect(question.id).toBeDefined();
        expect(question.text).toBeDefined();
        expect(question.type).toBeDefined();
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options.length).toBeGreaterThan(0);
      });
    });
  });

  describe('DEFAULT_ANSWERS', () => {
    it('should have answers for all required questions', () => {
      const requiredIds = MINIMUM_QUESTIONNAIRE.map(q => q.id);
      requiredIds.forEach(id => {
        expect(id in DEFAULT_ANSWERS).toBe(true);
      });
    });

    it('should be a valid complete questionnaire', () => {
      expect(validateAnswers(DEFAULT_ANSWERS)).toBe(true);
      expect(isComplete(DEFAULT_ANSWERS)).toBe(true);
    });
  });

  describe('getQuestionnaire', () => {
    it('should return MINIMUM_QUESTIONNAIRE by default', () => {
      const questionnaire = getQuestionnaire();
      expect(questionnaire).toBe(MINIMUM_QUESTIONNAIRE);
    });

    it('should return MINIMUM_QUESTIONNAIRE for minimum ID', () => {
      const questionnaire = getQuestionnaire('minimum');
      expect(questionnaire).toBe(MINIMUM_QUESTIONNAIRE);
    });
  });

  describe('validateAnswers', () => {
    it('should return true for complete answers', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };
      expect(validateAnswers(answers)).toBe(true);
    });

    it('should return false for incomplete answers', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
      };
      expect(validateAnswers(answers)).toBe(false);
    });

    it('should return false for empty answers', () => {
      expect(validateAnswers({})).toBe(false);
    });
  });

  describe('getMissingQuestions', () => {
    it('should return empty array for complete answers', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };
      expect(getMissingQuestions(answers)).toEqual([]);
    });

    it('should return missing question IDs', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
      };
      const missing = getMissingQuestions(answers);
      expect(missing).toContain('data-sensitivity');
      expect(missing).toContain('internet-exposed');
      expect(missing).toContain('hosting-model');
      expect(missing).toContain('pipeline-maturity');
    });

    it('should return all question IDs for empty answers', () => {
      const missing = getMissingQuestions({});
      expect(missing.length).toBe(6);
    });
  });

  describe('getQuestion', () => {
    it('should return question by ID', () => {
      const question = getQuestion('app-type');
      expect(question).not.toBeUndefined();
      if (question) {
        expect(question.id).toBe('app-type');
      }
    });

    it('should return undefined for non-existent ID', () => {
      const question = getQuestion('non-existent');
      expect(question).toBeUndefined();
    });
  });

  describe('getAllQuestionIds', () => {
    it('should return all question IDs', () => {
      const ids = getAllQuestionIds();
      expect(ids.length).toBe(6);
      expect(ids).toContain('app-type');
      expect(ids).toContain('auth-type');
      expect(ids).toContain('data-sensitivity');
      expect(ids).toContain('internet-exposed');
      expect(ids).toContain('hosting-model');
      expect(ids).toContain('pipeline-maturity');
    });
  });

  describe('isComplete', () => {
    it('should return true for complete answers', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };
      expect(isComplete(answers)).toBe(true);
    });

    it('should return false for incomplete answers', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
      };
      expect(isComplete(answers)).toBe(false);
    });
  });

  describe('getProgress', () => {
    it('should return 100% for complete answers', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
        'internet-exposed': 'public',
        'hosting-model': 'cloud',
        'pipeline-maturity': 'intermediate',
      };
      expect(getProgress(answers)).toBe(100);
    });

    it('should return 0% for empty answers', () => {
      expect(getProgress({})).toBe(0);
    });

    it('should return correct percentage for partial answers', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
      };
      expect(getProgress(answers)).toBe(33); // 2 out of 6 = 33%
    });

    it('should return correct percentage for 50% completion', () => {
      const answers: QuestionnaireAnswers = {
        'app-type': 'web',
        'auth-type': 'oauth',
        'data-sensitivity': 'confidential',
      };
      expect(getProgress(answers)).toBe(50); // 3 out of 6 = 50%
    });
  });
});
