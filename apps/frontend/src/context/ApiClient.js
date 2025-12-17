/**
 * API client utility
 */
export class ApiClient {
    static async request(endpoint, options = {}) {
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
    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    static async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    static async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }
    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    // Questionnaire endpoints
    static async getQuestionnaires() {
        return this.get('/api/v1/questionnaires');
    }
    static async createQuestionnaire(name, description, isTemplate = false) {
        return this.post('/api/v1/questionnaires', { name, description, isTemplate });
    }
    static async getQuestionnaire(id) {
        return this.get(`/api/v1/questionnaires/${id}`);
    }
    // Questionnaire Answers endpoints
    static async getQuestionnaireAnswers() {
        return this.get('/api/v1/questionnaire-answers');
    }
    static async createQuestionnaireAnswers(questionnaireId, answers, version = '1.0') {
        return this.post('/api/v1/questionnaire-answers', { questionnaireId, answers, version });
    }
    static async getQuestionnaireAnswersById(id) {
        return this.get(`/api/v1/questionnaire-answers/${id}`);
    }
    // Shortlist endpoints
    static async generateShortlist(questionnaireAnswersId, version = '1.0') {
        return this.post('/api/v1/shortlist', { questionnaireAnswersId, version });
    }
    static async getShortlist(id) {
        return this.get(`/api/v1/shortlist/${id}`);
    }
}
ApiClient.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
//# sourceMappingURL=ApiClient.js.map