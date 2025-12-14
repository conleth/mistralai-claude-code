import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JiraAdapter } from './jira';
import { IntegrationError, AuthenticationError, ApiError, ValidationError } from './errors';
import type { JiraCredentials, JiraIssue, ShortlistedRequirement } from '@security-rat/types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JiraAdapter', () => {
  let adapter: JiraAdapter;
  let mockCredentials: JiraCredentials;

  beforeEach(() => {
    mockCredentials = {
      email: 'test@example.com',
      apiToken: 'test-api-token',
      serverUrl: 'https://jira.example.com',
      projectKey: 'SEC',
    };

    adapter = new JiraAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should successfully authenticate with valid credentials', async () => {
      mockedAxios.get.mockResolvedValue({ data: { name: 'Test User' } });

      await expect(adapter.authenticate(mockCredentials)).resolves.not.toThrow();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://jira.example.com/rest/api/2/myself',
        expect.objectContaining({
          auth: {
            username: 'test@example.com',
            password: 'test-api-token',
          },
        })
      );
    });

    it('should throw AuthenticationError when credentials are invalid', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { errorMessages: ['Login failed'] },
        },
      });

      await expect(adapter.authenticate(mockCredentials)).rejects.toThrow(AuthenticationError);
    });

    it('should throw IntegrationError when authentication endpoint fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(adapter.authenticate(mockCredentials)).rejects.toThrow(IntegrationError);
    });
  });

  describe('createIssues', () => {
    it('should create issues for shortlisted requirements', async () => {
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
        key: 'SEC-123',
        id: '12345',
        fields: {
          summary: 'Test Requirement 1',
          status: { name: 'To Do' },
        },
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const issues = await adapter.createIssues(mockRequirements, mockCredentials, {
        prefix: 'SEC-',
        linkToShortlist: true,
      });

      expect(issues).toHaveLength(2);
      expect(issues[0].externalId).toBe('SEC-123');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);

      // Verify the request payload
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://jira.example.com/rest/api/2/issue',
        expect.objectContaining({
          fields: expect.objectContaining({
            summary: 'Test Requirement 1',
            description: expect.stringContaining('ASVS-1.1'),
            issuetype: { name: 'Task' },
            priority: { name: 'Low' },
          }),
        }),
        expect.any(Object)
      );
    });

    it('should throw ValidationError when requirements array is empty', async () => {
      await expect(
        adapter.createIssues([], mockCredentials)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ApiError when issue creation fails', async () => {
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
          status: 400,
          data: { errorMessages: ['Field required'] },
        },
      });

      await expect(
        adapter.createIssues(mockRequirements, mockCredentials)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('updateStatus', () => {
    it('should update issue status successfully', async () => {
      const issueId = '12345';
      const newStatus = 'completed';

      mockedAxios.put.mockResolvedValue({ data: { id: '12345' } });

      await expect(
        adapter.updateStatus(issueId, newStatus, mockCredentials)
      ).resolves.not.toThrow();

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'https://jira.example.com/rest/api/2/issue/12345',
        expect.objectContaining({
          fields: {
            status: { name: 'Done' },
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
      mockedAxios.put.mockRejectedValue({
        response: {
          status: 404,
          data: { errorMessages: ['Issue does not exist'] },
        },
      });

      await expect(
        adapter.updateStatus('99999', 'completed', mockCredentials)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getIssueStatus', () => {
    it('should retrieve issue status successfully', async () => {
      const issueId = '12345';

      mockedAxios.get.mockResolvedValue({
        data: {
          id: '12345',
          fields: {
            status: { name: 'In Progress' },
          },
        },
      });

      const status = await adapter.getIssueStatus(issueId, mockCredentials);

      expect(status).toBe('inProgress');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://jira.example.com/rest/api/2/issue/12345',
        expect.any(Object)
      );
    });

    it('should throw ApiError when issue is not found', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { errorMessages: ['Issue does not exist'] },
        },
      });

      await expect(
        adapter.getIssueStatus('99999', mockCredentials)
      ).rejects.toThrow(ApiError);
    });

    it('should throw IntegrationError when API request fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(
        adapter.getIssueStatus('12345', mockCredentials)
      ).rejects.toThrow(IntegrationError);
    });
  });

  describe('linkIssues', () => {
    it('should link issues to shortlist successfully', async () => {
      const shortlistId = uuidv4();
      const issueIds = ['12345', '12346'];

      // Mock updating each issue to add the shortlist ID
      mockedAxios.put.mockResolvedValue({ data: { id: '12345' } });

      await expect(
        adapter.linkIssues(shortlistId, issueIds, mockCredentials)
      ).resolves.not.toThrow();

      expect(mockedAxios.put).toHaveBeenCalledTimes(2);
    });

    it('should throw ValidationError when issueIds array is empty', async () => {
      await expect(
        adapter.linkIssues(uuidv4(), [], mockCredentials)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getProjects', () => {
    it('should retrieve available projects', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [
          { key: 'SEC', name: 'Security Project' },
          { key: 'DEV', name: 'Development Project' },
        ],
      });

      const projects = await adapter.getProjects(mockCredentials);

      expect(projects).toHaveLength(2);
      expect(projects[0].key).toBe('SEC');
      expect(projects[0].name).toBe('Security Project');
    });

    it('should return empty array when no projects are found', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const projects = await adapter.getProjects(mockCredentials);

      expect(projects).toHaveLength(0);
    });
  });

  describe('getIssueTypes', () => {
    it('should retrieve available issue types', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [
          { name: 'Task', id: '10000' },
          { name: 'Bug', id: '10001' },
        ],
      });

      const issueTypes = await adapter.getIssueTypes(mockCredentials);

      expect(issueTypes).toHaveLength(2);
      expect(issueTypes[0].name).toBe('Task');
      expect(issueTypes[1].name).toBe('Bug');
    });

    it('should return empty array when no issue types are found', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const issueTypes = await adapter.getIssueTypes(mockCredentials);

      expect(issueTypes).toHaveLength(0);
    });
  });

  describe('getStatuses', () => {
    it('should retrieve available statuses', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [
          { name: 'To Do', id: '1' },
          { name: 'In Progress', id: '2' },
          { name: 'Done', id: '3' },
        ],
      });

      const statuses = await adapter.getStatuses(mockCredentials);

      expect(statuses).toHaveLength(3);
      expect(statuses[0].name).toBe('To Do');
      expect(statuses[2].name).toBe('Done');
    });
  });

  describe('searchIssues', () => {
    it('should search for issues by JQL query', async () => {
      const jql = 'project = SEC AND summary ~ "security"';

      mockedAxios.get.mockResolvedValue({
        data: {
          issues: [
            {
              key: 'SEC-123',
              fields: {
                summary: 'Security Requirement 123',
                status: { name: 'To Do' },
              },
            },
          ],
        },
      });

      const results = await adapter.searchIssues(jql, mockCredentials);

      expect(results).toHaveLength(1);
      expect(results[0].externalId).toBe('SEC-123');
      expect(results[0].title).toBe('Security Requirement 123');
    });

    it('should return empty array when no issues match', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { issues: [] },
      });

      const results = await adapter.searchIssues('project = NONE', mockCredentials);

      expect(results).toHaveLength(0);
    });

    it('should throw ApiError when JQL query is invalid', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 400,
          data: { errorMessages: ['Invalid JQL'] },
        },
      });

      await expect(
        adapter.searchIssues('invalid jql', mockCredentials)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('createBulkIssues', () => {
    it('should create issues in bulk with batch processing', async () => {
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
        key: 'SEC-123',
        id: '12345',
        fields: {
          summary: 'Test Requirement',
          status: { name: 'To Do' },
        },
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const issues = await adapter.createBulkIssues(mockRequirements, mockCredentials, {
        batchSize: 50,
      });

      // Should process in 2 batches (50 + 10)
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(issues).toHaveLength(60);
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
        adapter.createBulkIssues(mockRequirements, mockCredentials)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('syncStatuses', () => {
    it('should sync statuses from Jira to local system', async () => {
      const shortlistId = uuidv4();

      mockedAxios.get.mockResolvedValue({
        data: {
          issues: [
            {
              key: 'SEC-123',
              fields: {
                summary: 'Security Requirement 123',
                status: { name: 'Done' },
                customfield_10000: 'ASVS-1.1',
              },
            },
          ],
        },
      });

      const statuses = await adapter.syncStatuses(shortlistId, mockCredentials);

      expect(statuses).toHaveLength(1);
      expect(statuses[0].externalId).toBe('SEC-123');
      expect(statuses[0].status).toBe('completed');
    });

    it('should return empty array when no issues are linked', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { issues: [] },
      });

      const statuses = await adapter.syncStatuses(uuidv4(), mockCredentials);

      expect(statuses).toHaveLength(0);
    });

    it('should throw ApiError when JQL query fails', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 400,
          data: { errorMessages: ['Invalid JQL'] },
        },
      });

      await expect(
        adapter.syncStatuses(uuidv4(), mockCredentials)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getPriorities', () => {
    it('should retrieve available priorities', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [
          { name: 'Low', id: '1' },
          { name: 'Medium', id: '2' },
          { name: 'High', id: '3' },
        ],
      });

      const priorities = await adapter.getPriorities(mockCredentials);

      expect(priorities).toHaveLength(3);
      expect(priorities[0].name).toBe('Low');
      expect(priorities[2].name).toBe('High');
    });
  });

  describe('getCustomFields', () => {
    it('should retrieve custom fields', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [
          { name: 'Custom Field 1', id: 'customfield_10000' },
          { name: 'Custom Field 2', id: 'customfield_10001' },
        ],
      });

      const fields = await adapter.getCustomFields(mockCredentials);

      expect(fields).toHaveLength(2);
      expect(fields[0].id).toBe('customfield_10000');
    });
  });
});
