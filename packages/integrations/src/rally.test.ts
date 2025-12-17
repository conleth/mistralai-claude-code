import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RallyAdapter } from './rally';
import { IntegrationError, AuthenticationError, ApiError, ValidationError } from './errors';
import type { RallyCredentials, RallyTicket, ShortlistedRequirement } from '@security-rat/types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RallyAdapter', () => {
  let adapter: RallyAdapter;
  let mockCredentials: RallyCredentials;

  beforeEach(() => {
    mockCredentials = {
      apiKey: 'test-api-key',
      serverUrl: 'https://rally.example.com',
      workspace: 'Test Workspace',
      project: 'Test Project',
    };

    adapter = new RallyAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should successfully authenticate with valid credentials', async () => {
      mockedAxios.post.mockResolvedValue({ data: { OperationResult: { Errors: [] } } });

      await expect(adapter.authenticate(mockCredentials)).resolves.not.toThrow();
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://rally.example.com/slm/webservice/v2.0/security/authorize',
        expect.objectContaining({
          Authentication: {
            Login: 'test-api-key',
            Password: '',
          },
        }),
        expect.any(Object)
      );
    });

    it('should throw AuthenticationError when credentials are invalid', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { OperationResult: { Errors: ['Invalid credentials'] } },
      });

      await expect(adapter.authenticate(mockCredentials)).rejects.toThrow(AuthenticationError);
    });

    it('should throw IntegrationError when authentication endpoint fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(adapter.authenticate(mockCredentials)).rejects.toThrow(IntegrationError);
    });
  });

  describe('createTickets', () => {
    it('should create tickets for shortlisted requirements', async () => {
      const mockRequirements: ShortlistedRequirement[] = [
        {
          id: 'ASVS-1.1',
          title: 'Test Requirement 1',
          description: 'Test description 1',
          level: 'L1',
          category: 'V1',
          standard: 'ASVS',
          version: '5.0.0',
          rationale: 'Test rationale',
          status: 'pending',
          shortlistId: uuidv4(),
        },
        {
          id: 'ASVS-1.2',
          title: 'Test Requirement 2',
          description: 'Test description 2',
          level: 'L2',
          category: 'V1',
          standard: 'ASVS',
          version: '5.0.0',
          rationale: 'Test rationale',
          status: 'pending',
          shortlistId: uuidv4(),
        },
      ];

      const mockResponse = {
        QueryResult: {
          Results: [
            { _ref: 'https://rally.example.com/defect/123', FormattedID: 'DEF-123' },
            { _ref: 'https://rally.example.com/defect/124', FormattedID: 'DEF-124' },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const tickets = await adapter.createTickets(mockRequirements, mockCredentials, {
        prefix: 'SEC-',
        linkToShortlist: true,
      });

      expect(tickets).toHaveLength(2);
      expect(tickets[0].externalId).toBe('DEF-123');
      expect(tickets[1].externalId).toBe('DEF-124');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should throw ValidationError when requirements array is empty', async () => {
      await expect(
        adapter.createTickets([], mockCredentials)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ApiError when ticket creation fails', async () => {
      const mockRequirements: ShortlistedRequirement[] = [
        {
          id: 'ASVS-1.1',
          title: 'Test Requirement',
          description: 'Test description',
          level: 'L1',
          category: 'V1',
          standard: 'ASVS',
          version: '5.0.0',
          rationale: 'Test rationale',
          status: 'pending',
          shortlistId: uuidv4(),
        },
      ];

      mockedAxios.post.mockRejectedValue({
        response: {
          data: { OperationResult: { Errors: ['Invalid field'] } },
        },
      });

      await expect(
        adapter.createTickets(mockRequirements, mockCredentials)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('updateStatus', () => {
    it('should update ticket status successfully', async () => {
      const ticketId = '12345';
      const newStatus = 'completed';

      mockedAxios.post.mockResolvedValue({ data: { OperationResult: { Errors: [] } } });

      await expect(
        adapter.updateStatus(ticketId, newStatus, mockCredentials)
      ).resolves.not.toThrow();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://rally.example.com/slm/webservice/v2.0/defect/12345',
        expect.objectContaining({
          Defect: {
            State: 'Completed',
          },
        }),
        expect.any(Object)
      );
    });

    it('should throw ValidationError for invalid status', async () => {
      await expect(
        adapter.updateStatus('12345', 'invalid-status' as any, mockCredentials)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ApiError when status update fails', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          data: { OperationResult: { Errors: ['Ticket not found'] } },
        },
      });

      await expect(
        adapter.updateStatus('99999', 'completed', mockCredentials)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getTicketStatus', () => {
    it('should retrieve ticket status successfully', async () => {
      const ticketId = '12345';

      mockedAxios.get.mockResolvedValue({
        data: {
          QueryResult: {
            Results: [
              {
                _ref: 'https://rally.example.com/defect/12345',
                State: 'In Progress',
              },
            ],
          },
        },
      });

      const status = await adapter.getTicketStatus(ticketId, mockCredentials);

      expect(status).toBe('inProgress');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://rally.example.com/slm/webservice/v2.0/defect/12345',
        expect.any(Object)
      );
    });

    it('should throw ApiError when ticket is not found', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { QueryResult: { Results: [] } },
      });

      await expect(
        adapter.getTicketStatus('99999', mockCredentials)
      ).rejects.toThrow(ApiError);
    });

    it('should throw IntegrationError when API request fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(
        adapter.getTicketStatus('12345', mockCredentials)
      ).rejects.toThrow(IntegrationError);
    });
  });

  describe('linkTickets', () => {
    it('should link tickets to shortlist successfully', async () => {
      const shortlistId = uuidv4();
      const ticketIds = ['12345', '12346'];

      mockedAxios.post.mockResolvedValue({ data: { OperationResult: { Errors: [] } } });

      await expect(
        adapter.linkTickets(shortlistId, ticketIds, mockCredentials)
      ).resolves.not.toThrow();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://rally.example.com/slm/webservice/v2.0/defect/create',
        expect.objectContaining({
          Defect: expect.objectContaining({
            c_ShortlistID: shortlistId,
          }),
        }),
        expect.any(Object)
      );
    });

    it('should throw ValidationError when ticketIds array is empty', async () => {
      await expect(
        adapter.linkTickets(uuidv4(), [], mockCredentials)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getProjects', () => {
    it('should retrieve available projects', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          QueryResult: {
            Results: [
              { Name: 'Project 1', _ref: 'https://rally.example.com/project/1' },
              { Name: 'Project 2', _ref: 'https://rally.example.com/project/2' },
            ],
          },
        },
      });

      const projects = await adapter.getProjects(mockCredentials);

      expect(projects).toHaveLength(2);
      expect(projects[0].name).toBe('Project 1');
      expect(projects[1].name).toBe('Project 2');
    });

    it('should return empty array when no projects are found', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { QueryResult: { Results: [] } },
      });

      const projects = await adapter.getProjects(mockCredentials);

      expect(projects).toHaveLength(0);
    });
  });

  describe('getWorkspaces', () => {
    it('should retrieve available workspaces', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          QueryResult: {
            Results: [
              { Name: 'Workspace 1', _ref: 'https://rally.example.com/workspace/1' },
              { Name: 'Workspace 2', _ref: 'https://rally.example.com/workspace/2' },
            ],
          },
        },
      });

      const workspaces = await adapter.getWorkspaces(mockCredentials);

      expect(workspaces).toHaveLength(2);
      expect(workspaces[0].name).toBe('Workspace 1');
      expect(workspaces[1].name).toBe('Workspace 2');
    });
  });

  describe('searchTickets', () => {
    it('should search for tickets by query', async () => {
      const query = 'SEC-123';

      mockedAxios.get.mockResolvedValue({
        data: {
          QueryResult: {
            Results: [
              {
                _ref: 'https://rally.example.com/defect/123',
                FormattedID: 'DEF-123',
                Name: 'Security Requirement 123',
                State: 'Defined',
              },
            ],
          },
        },
      });

      const results = await adapter.searchTickets(query, mockCredentials);

      expect(results).toHaveLength(1);
      expect(results[0].externalId).toBe('DEF-123');
      expect(results[0].title).toBe('Security Requirement 123');
    });

    it('should return empty array when no tickets match', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { QueryResult: { Results: [] } },
      });

      const results = await adapter.searchTickets('NONEXISTENT', mockCredentials);

      expect(results).toHaveLength(0);
    });
  });

  describe('createBulkTickets', () => {
    it('should create tickets in bulk with batch processing', async () => {
      const mockRequirements: ShortlistedRequirement[] = Array(60).fill({
        id: 'ASVS-1.1',
        title: 'Test Requirement',
        description: 'Test description',
        level: 'L1',
        category: 'V1',
        standard: 'ASVS',
        version: '5.0.0',
        rationale: 'Test rationale',
        status: 'pending',
        shortlistId: uuidv4(),
      });

      const mockResponse = {
        QueryResult: {
          Results: Array(60).fill({
            _ref: 'https://rally.example.com/defect/123',
            FormattedID: 'DEF-123',
          }),
        },
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const tickets = await adapter.createBulkTickets(mockRequirements, mockCredentials, {
        batchSize: 50,
      });

      // Should process in 2 batches (50 + 10)
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(tickets).toHaveLength(60);
    });

    it('should throw ValidationError when requirements exceed maximum limit', async () => {
      const mockRequirements: ShortlistedRequirement[] = Array(1001).fill({
        id: 'ASVS-1.1',
        title: 'Test Requirement',
        description: 'Test description',
        level: 'L1',
        category: 'V1',
        standard: 'ASVS',
        version: '5.0.0',
        rationale: 'Test rationale',
        status: 'pending',
        shortlistId: uuidv4(),
      });

      await expect(
        adapter.createBulkTickets(mockRequirements, mockCredentials)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('syncStatuses', () => {
    it('should sync statuses from Rally to local system', async () => {
      const shortlistId = uuidv4();

      mockedAxios.get.mockResolvedValue({
        data: {
          QueryResult: {
            Results: [
              {
                _ref: 'https://rally.example.com/defect/123',
                FormattedID: 'DEF-123',
                State: 'Completed',
                c_RequirementID: 'ASVS-1.1',
              },
            ],
          },
        },
      });

      const statuses = await adapter.syncStatuses(shortlistId, mockCredentials);

      expect(statuses).toHaveLength(1);
      expect(statuses[0].externalId).toBe('DEF-123');
      expect(statuses[0].status).toBe('completed');
    });

    it('should return empty array when no tickets are linked', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { QueryResult: { Results: [] } },
      });

      const statuses = await adapter.syncStatuses(uuidv4(), mockCredentials);

      expect(statuses).toHaveLength(0);
    });
  });
});
