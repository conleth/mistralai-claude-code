/**
 * API client utility
 */

export class ApiClient {
  private static baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const headers = new Headers(options.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Questionnaire endpoints
  static async getQuestionnaires() {
    return this.get<Questionnaire[]>('/api/v1/questionnaires');
  }

  static async createQuestionnaire(name: string, description?: string, isTemplate: boolean = false) {
    return this.post<Questionnaire>('/api/v1/questionnaires', { name, description, isTemplate });
  }

  static async getQuestionnaire(id: string) {
    return this.get<Questionnaire>(`/api/v1/questionnaires/${id}`);
  }

  // Questionnaire Answers endpoints
  static async getQuestionnaireAnswers() {
    return this.get<QuestionnaireAnswers[]>('/api/v1/questionnaire-answers');
  }

  static async createQuestionnaireAnswers(questionnaireId: string, answers: Record<string, string>, version: string = '1.0') {
    return this.post<QuestionnaireAnswersResponse>('/api/v1/questionnaire-answers', { questionnaireId, answers, version });
  }

  static async getQuestionnaireAnswersById(id: string) {
    return this.get<QuestionnaireAnswersResponse>(`/api/v1/questionnaire-answers/${id}`);
  }

  // Shortlist endpoints
  static async generateShortlist(questionnaireAnswersId: string, version: string = '1.0') {
    return this.post<ShortlistResponse>('/api/v1/shortlist', { questionnaireAnswersId, version });
  }

  static async getShortlist(id: string) {
    return this.get<ShortlistResponse>(`/api/v1/shortlist/${id}`);
  }
}

// Type definitions
export type Questionnaire = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_template: boolean;
};

export type QuestionnaireAnswers = {
  id: string;
  questionnaire_id: string;
  answers: Record<string, string>;
  version: string;
  created_by: string;
  created_at: string;
  questionnaire_name: string;
};

export type QuestionnaireAnswersResponse = {
  id: string;
  questionnaire_id: string;
  answers: Record<string, string>;
  version: string;
  created_by: string;
  created_at: string;
};

export type ShortlistResponse = {
  id: string;
  questionnaire_answers_id: string;
  requirements: ShortlistedRequirement[];
  generated_at: string;
  version: string;
  questionnaire_id: string;
};

export type ShortlistedRequirement = {
  id: string;
  standard: 'asvs' | 'spvs';
  version: string;
  requirementId: string;
  title: string;
  description: string;
  level: 'L1' | 'L2' | 'L3';
  category: string;
  rationale: string;
  status?: 'pending' | 'inProgress' | 'completed' | 'notApplicable';
  assignee?: string;
  notes?: string;
};
