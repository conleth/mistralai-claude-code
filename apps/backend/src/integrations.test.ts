import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fastify } from './index.js';
import type { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

// Mock the integrations
const mockRallyAdapter = {
  authenticate: vi.fn(),
  createTickets: vi.fn(),
  updateStatus: vi.fn(),
  getTicketStatus: vi.fn(),
  linkTickets: vi.fn(),
  getProjects: vi.fn(),
  getWorkspaces: vi.fn(),
  searchTickets: vi.fn(),
  createBulkTickets: vi.fn(),
  syncStatuses: vi.fn(),
};

const mockJiraAdapter = {
  authenticate: vi.fn(),
  createIssues: vi.fn(),
  updateStatus: vi.fn(),
  getIssueStatus: vi.fn(),
  linkIssues: vi.fn(),
  getProjects: vi.fn(),
  getIssueTypes: vi.fn(),
  getStatuses: vi.fn(),
  searchIssues: vi.fn(),
  createBulkIssues: vi.fn(),
  syncStatuses: vi.fn(),
  getPriorities: vi.fn(),
  getCustomFields: vi.fn(),
};

vi.mock('@security-rat/integrations', () => ({
  RallyAdapter: vi.fn(() => mockRallyAdapter),
  JiraAdapter: vi.fn(() => mockJiraAdapter),
}));

describe('Integration API Endpoints', () => {
  let server: FastifyInstance;
  let mockShortlistId: string;

  beforeEach(async () => {
    mockShortlistId = uuidv4();
    server = await fastify();
  });

  afterEach(async () => {
    await server.close();
    vi.clearAllMocks();
  });

  describe('Rally Integration Endpoints', () => {
    describe('POST /api/v1/integrations/rally/authenticate', () => {
      it('should authenticate with Rally successfully', async () => {
        mockRallyAdapter.authenticate.mockResolvedValue(undefined);

        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/rally/authenticate',
          payload: {
            credentials: {
              apiKey: 'test-api-key',
              serverUrl: 'https://rally.example.com',
              workspace: 'Test Workspace',
              project: 'Test Project',
            },
          },
        });

        expect(response.statusCode).toBe(200);
        expect(mockRallyAdapter.authenticate).toHaveBeenCalledWith({
          apiKey: 'test-api-key',
          serverUrl: 'https://rally.example.com',
          workspace: 'Test Workspace',
          project: 'Test Project',
        });
      });

      it('should return 400 for invalid credentials', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/rally/authenticate',
          payload: {
            credentials: {
              apiKey: '',
              serverUrl: '',
            },
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('POST /api/v1/integrations/rally/tickets', () => {
      it('should create Rally tickets from shortlist', async () => {
        mockRallyAdapter.createTickets.mockResolvedValue([
          { externalId: 'DEF-123', externalSystem: 'Rally' },
        ]);

        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/rally/tickets',
          payload: {
            shortlistId: mockShortlistId,
            credentials: {
              apiKey: 'test-api-key',
              serverUrl: 'https://rally.example.com',
              workspace: 'Test Workspace',
              project: 'Test Project',
            },
            options: {
              prefix: 'SEC-',
              linkToShortlist: true,
            },
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.tickets).toHaveLength(1);
        expect(body.tickets[0].externalId).toBe('DEF-123');
      });

      it('should return 400 for invalid payload', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/rally/tickets',
          payload: {
            shortlistId: '',
            credentials: {},
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('PUT /api/v1/integrations/rally/status/:ticketId', () => {
      it('should update Rally ticket status', async () => {
        mockRallyAdapter.updateStatus.mockResolvedValue(undefined);

        const response = await server.inject({
          method: 'PUT',
          url: '/api/v1/integrations/rally/status/12345',
          payload: {
            status: 'completed',
            credentials: {
              apiKey: 'test-api-key',
              serverUrl: 'https://rally.example.com',
            },
          },
        });

        expect(response.statusCode).toBe(200);
        expect(mockRallyAdapter.updateStatus).toHaveBeenCalledWith(
          '12345',
          'completed',
          {
            apiKey: 'test-api-key',
            serverUrl: 'https://rally.example.com',
          }
        );
      });

      it('should return 400 for invalid status', async () => {
        const response = await server.inject({
          method: 'PUT',
          url: '/api/v1/integrations/rally/status/12345',
          payload: {
            status: 'invalid-status',
            credentials: {
              apiKey: 'test-api-key',
              serverUrl: 'https://rally.example.com',
            },
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('GET /api/v1/integrations/rally/projects', () => {
      it('should retrieve Rally projects', async () => {
        mockRallyAdapter.getProjects.mockResolvedValue([
          { name: 'Project 1', ref: 'https://rally.example.com/project/1' },
          { name: 'Project 2', ref: 'https://rally.example.com/project/2' },
        ]);

        const response = await server.inject({
          method: 'GET',
          url: '/api/v1/integrations/rally/projects',
          query: {
            serverUrl: 'https://rally.example.com',
            apiKey: 'test-api-key',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.projects).toHaveLength(2);
      });

      it('should return 400 for missing credentials', async () => {
        const response = await server.inject({
          method: 'GET',
          url: '/api/v1/integrations/rally/projects',
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('POST /api/v1/integrations/sync/rally', () => {
      it('should sync Rally statuses', async () => {
        mockRallyAdapter.syncStatuses.mockResolvedValue([
          { externalId: 'DEF-123', status: 'completed' },
        ]);

        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/sync/rally',
          payload: {
            shortlistId: mockShortlistId,
            credentials: {
              apiKey: 'test-api-key',
              serverUrl: 'https://rally.example.com',
            },
            options: {
              updateLocalStatus: true,
            },
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.statuses).toHaveLength(1);
        expect(mockRallyAdapter.syncStatuses).toHaveBeenCalledWith(
          mockShortlistId,
          {
            apiKey: 'test-api-key',
            serverUrl: 'https://rally.example.com',
          }
        );
      });

      it('should return 400 for invalid payload', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/sync/rally',
          payload: {
            shortlistId: '',
            credentials: {},
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe('Jira Integration Endpoints', () => {
    describe('POST /api/v1/integrations/jira/authenticate', () => {
      it('should authenticate with Jira successfully', async () => {
        mockJiraAdapter.authenticate.mockResolvedValue(undefined);

        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/jira/authenticate',
          payload: {
            credentials: {
              email: 'test@example.com',
              apiToken: 'test-api-token',
              serverUrl: 'https://jira.example.com',
              projectKey: 'SEC',
            },
          },
        });

        expect(response.statusCode).toBe(200);
        expect(mockJiraAdapter.authenticate).toHaveBeenCalledWith({
          email: 'test@example.com',
          apiToken: 'test-api-token',
          serverUrl: 'https://jira.example.com',
          projectKey: 'SEC',
        });
      });

      it('should return 400 for invalid credentials', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/jira/authenticate',
          payload: {
            credentials: {
              email: '',
              apiToken: '',
            },
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('POST /api/v1/integrations/jira/issues', () => {
      it('should create Jira issues from shortlist', async () => {
        mockJiraAdapter.createIssues.mockResolvedValue([
          { externalId: 'SEC-123', externalSystem: 'Jira' },
        ]);

        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/jira/issues',
          payload: {
            shortlistId: mockShortlistId,
            credentials: {
              email: 'test@example.com',
              apiToken: 'test-api-token',
              serverUrl: 'https://jira.example.com',
              projectKey: 'SEC',
            },
            options: {
              prefix: 'SEC-',
              linkToShortlist: true,
            },
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.issues).toHaveLength(1);
        expect(body.issues[0].externalId).toBe('SEC-123');
      });

      it('should return 400 for invalid payload', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/jira/issues',
          payload: {
            shortlistId: '',
            credentials: {},
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('PUT /api/v1/integrations/jira/status/:issueId', () => {
      it('should update Jira issue status', async () => {
        mockJiraAdapter.updateStatus.mockResolvedValue(undefined);

        const response = await server.inject({
          method: 'PUT',
          url: '/api/v1/integrations/jira/status/12345',
          payload: {
            status: 'completed',
            credentials: {
              email: 'test@example.com',
              apiToken: 'test-api-token',
              serverUrl: 'https://jira.example.com',
            },
          },
        });

        expect(response.statusCode).toBe(200);
        expect(mockJiraAdapter.updateStatus).toHaveBeenCalledWith(
          '12345',
          'completed',
          {
            email: 'test@example.com',
            apiToken: 'test-api-token',
            serverUrl: 'https://jira.example.com',
          }
        );
      });

      it('should return 400 for invalid status', async () => {
        const response = await server.inject({
          method: 'PUT',
          url: '/api/v1/integrations/jira/status/12345',
          payload: {
            status: 'invalid-status',
            credentials: {
              email: 'test@example.com',
              apiToken: 'test-api-token',
              serverUrl: 'https://jira.example.com',
            },
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('GET /api/v1/integrations/jira/projects', () => {
      it('should retrieve Jira projects', async () => {
        mockJiraAdapter.getProjects.mockResolvedValue([
          { key: 'SEC', name: 'Security Project' },
          { key: 'DEV', name: 'Development Project' },
        ]);

        const response = await server.inject({
          method: 'GET',
          url: '/api/v1/integrations/jira/projects',
          query: {
            serverUrl: 'https://jira.example.com',
            email: 'test@example.com',
            apiToken: 'test-api-token',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.projects).toHaveLength(2);
      });

      it('should return 400 for missing credentials', async () => {
        const response = await server.inject({
          method: 'GET',
          url: '/api/v1/integrations/jira/projects',
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('POST /api/v1/integrations/sync/jira', () => {
      it('should sync Jira statuses', async () => {
        mockJiraAdapter.syncStatuses.mockResolvedValue([
          { externalId: 'SEC-123', status: 'completed' },
        ]);

        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/sync/jira',
          payload: {
            shortlistId: mockShortlistId,
            credentials: {
              email: 'test@example.com',
              apiToken: 'test-api-token',
              serverUrl: 'https://jira.example.com',
            },
            options: {
              updateLocalStatus: true,
            },
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.statuses).toHaveLength(1);
        expect(mockJiraAdapter.syncStatuses).toHaveBeenCalledWith(
          mockShortlistId,
          {
            email: 'test@example.com',
            apiToken: 'test-api-token',
            serverUrl: 'https://jira.example.com',
          }
        );
      });

      it('should return 400 for invalid payload', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/integrations/sync/jira',
          payload: {
            shortlistId: '',
            credentials: {},
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe('Shared Integration Endpoints', () => {
    describe('GET /api/v1/shortlist/:shortlistId/references', () => {
      it('should retrieve external references for a shortlist', async () => {
        // This would be tested with actual database operations
        // For now, we just verify the endpoint exists and returns 200
        const response = await server.inject({
          method: 'GET',
          url: `/api/v1/shortlist/${mockShortlistId}/references`,
        });

        // The actual implementation would return external references
        // We're just verifying the endpoint exists
        expect(response.statusCode).toBe(200);
      });
    });
  });
});
