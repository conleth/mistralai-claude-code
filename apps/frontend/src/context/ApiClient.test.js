/**
 * ApiClient tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from './ApiClient';
describe('ApiClient', () => {
    const mockToken = 'test-token';
    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();
        // Set up mock token
        localStorage.setItem('token', mockToken);
        // Mock fetch
        global.fetch = vi.fn((url, options) => {
            const responseData = {
                'GET /api/v1/questionnaires': [],
                'POST /api/v1/questionnaires': { id: 'questionnaire-123', name: 'Test Questionnaire' },
                'GET /api/v1/questionnaires/questionnaire-123': { id: 'questionnaire-123', name: 'Test Questionnaire' },
                'GET /api/v1/questionnaire-answers': [],
                'POST /api/v1/questionnaire-answers': { id: 'answers-456', questionnaireId: 'questionnaire-123' },
                'GET /api/v1/questionnaire-answers/answers-456': { id: 'answers-456', answers: { 'app-type': 'web' } },
                'POST /api/v1/shortlist': { id: 'shortlist-789', requirements: [] },
                'GET /api/v1/shortlist/shortlist-789': { id: 'shortlist-789', requirements: [] },
            };
            const key = `${options.method} ${url}`;
            const data = responseData[key];
            if (data) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(data),
                });
            }
            return Promise.reject(new Error(`Not mocked: ${key}`));
        });
    });
    describe('Request Method', () => {
        it('should add Authorization header with token', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({}),
            });
            global.fetch = mockFetch;
            await ApiClient.get('/api/v1/test');
            expect(mockFetch).toHaveBeenCalled();
            const callArgs = mockFetch.mock.calls[0];
            const headers = callArgs[1].headers;
            expect(headers.get('Authorization')).to.equal(`Bearer ${mockToken}`);
        });
        it('should handle errors', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'Not found' }),
            });
            await expect(ApiClient.get('/api/v1/not-found')).rejects.toThrow('Not found');
        });
    });
    describe('Questionnaire Endpoints', () => {
        it('should get questionnaires', async () => {
            const result = await ApiClient.getQuestionnaires();
            expect(Array.isArray(result)).to.be.true;
        });
        it('should create a questionnaire', async () => {
            const result = await ApiClient.createQuestionnaire('Test Questionnaire', 'Description');
            expect(result.id).to.equal('questionnaire-123');
            expect(result.name).to.equal('Test Questionnaire');
        });
        it('should get a specific questionnaire', async () => {
            const result = await ApiClient.getQuestionnaire('questionnaire-123');
            expect(result.id).to.equal('questionnaire-123');
            expect(result.name).to.equal('Test Questionnaire');
        });
    });
    describe('Questionnaire Answers Endpoints', () => {
        it('should get questionnaire answers', async () => {
            const result = await ApiClient.getQuestionnaireAnswers();
            expect(Array.isArray(result)).to.be.true;
        });
        it('should create questionnaire answers', async () => {
            const result = await ApiClient.createQuestionnaireAnswers('questionnaire-123', { 'app-type': 'web' }, '1.0');
            expect(result.id).to.equal('answers-456');
            expect(result.questionnaireId).to.equal('questionnaire-123');
        });
        it('should get specific questionnaire answers', async () => {
            const result = await ApiClient.getQuestionnaireAnswersById('answers-456');
            expect(result.id).to.equal('answers-456');
            expect(result.answers).to.deep.equal({ 'app-type': 'web' });
        });
    });
    describe('Shortlist Endpoints', () => {
        it('should generate a shortlist', async () => {
            const result = await ApiClient.generateShortlist('answers-456', '1.0');
            expect(result.id).to.equal('shortlist-789');
            expect(Array.isArray(result.requirements)).to.be.true;
        });
        it('should get a specific shortlist', async () => {
            const result = await ApiClient.getShortlist('shortlist-789');
            expect(result.id).to.equal('shortlist-789');
            expect(Array.isArray(result.requirements)).to.be.true;
        });
    });
    describe('Error Handling', () => {
        it('should throw error for failed requests', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ message: 'Internal server error' }),
            });
            await expect(ApiClient.getQuestionnaires()).rejects.toThrow('Internal server error');
        });
        it('should throw error for network failures', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
            await expect(ApiClient.getQuestionnaires()).rejects.toThrow('Network error');
        });
    });
});
//# sourceMappingURL=ApiClient.test.js.map