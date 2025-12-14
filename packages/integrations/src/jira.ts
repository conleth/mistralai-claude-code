/**
 * Jira integration adapter
 */

import axios, { AxiosInstance } from 'axios';
import { IntegrationError, AuthenticationError, ApiError, MappingError } from './errors';
import type { ShortlistedRequirement } from '@security-rat/types';

/**
 * Jira credentials
 */
export interface JiraCredentials {
  email: string;
  apiToken: string;
  serverUrl: string;
  projectKey?: string;
  issueType?: string;
}

/**
 * Jira issue representation
 */
export interface JiraIssue {
  key: string;
  id: string;
  fields: {
    summary: string;
    description: string;
    status: {
      name: string;
    };
    project: {
      key: string;
    };
    issuetype: {
      name: string;
    };
    customFields?: Record<string, any>;
  };
  self: string;
  created: string;
  updated: string;
  customFields?: Record<string, any>;
}

/**
 * Jira adapter configuration
 */
interface JiraAdapterConfig {
  credentials: JiraCredentials;
  fieldMappings?: Record<string, string>;
}

/**
 * Field mappings for Jira
 */
const DEFAULT_FIELD_MAPPINGS: Record<string, string> = {
  'security-requirement-id': 'customfield_10000',
  'security-requirement-title': 'summary',
  'security-requirement-description': 'description',
  'security-requirement-level': 'customfield_10001',
  'security-requirement-category': 'customfield_10002',
  'security-requirement-standard': 'customfield_10003',
  'security-requirement-rationale': 'customfield_10004',
  'security-requirement-status': 'status',
};

/**
 * Jira adapter
 */
export class JiraAdapter {
  private client: AxiosInstance;
  private credentials: JiraCredentials;
  private fieldMappings: Record<string, string>;
  private projectKey: string;
  private issueType: string;

  /**
   * Create a new Jira adapter
   */
  constructor(config: JiraAdapterConfig) {
    this.credentials = config.credentials;
    this.fieldMappings = { ...DEFAULT_FIELD_MAPPINGS, ...config.fieldMappings };
    this.projectKey = config.credentials.projectKey || 'SEC';
    this.issueType = config.credentials.issueType || 'Task';

    const auth = Buffer.from(`${this.credentials.email}:${this.credentials.apiToken}`).toString('base64');

    this.client = axios.create({
      baseURL: this.credentials.serverUrl,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new ApiError(
            `Jira API error: ${error.response.status} ${error.response.statusText}`,
            error.response.status,
            error.response.data
          );
        }
        throw new IntegrationError(
          `Jira API request failed: ${error.message}`,
          'JIRA_REQUEST_FAILED',
          { error: error.message }
        );
      }
    );
  }

  /**
   * Authenticate with Jira API
   */
  async authenticate(): Promise<void> {
    try {
      // Test authentication by making a simple query
      await this.client.get('/rest/api/2/myself');
    } catch (error) {
      throw new AuthenticationError(
        'Failed to authenticate with Jira',
        this.credentials
      );
    }
  }

  /**
   * Create Jira issues from shortlisted requirements
   */
  async createIssues(
    shortlist: ShortlistedRequirement[],
    options: {
      prefix?: string;
      projectKey?: string;
      issueType?: string;
    } = {}
  ): Promise<JiraIssue[]> {
    const { prefix = '', projectKey: projectOverride, issueType: issueTypeOverride } = options;
    const projectKey = projectOverride || this.projectKey;
    const issueType = issueTypeOverride || this.issueType;

    if (!projectKey) {
      throw new IntegrationError(
        'Project key is required for creating Jira issues',
        'MISSING_PROJECT_KEY'
      );
    }

    const createdIssues: JiraIssue[] = [];

    for (const requirement of shortlist) {
      const issue = await this.createIssueFromRequirement(
        requirement,
        { prefix, projectKey, issueType }
      );
      createdIssues.push(issue);
    }

    return createdIssues;
  }

  /**
   * Create a single Jira issue from a requirement
   */
  private async createIssueFromRequirement(
    requirement: ShortlistedRequirement,
    options: {
      prefix: string;
      projectKey: string;
      issueType: string;
    }
  ): Promise<JiraIssue> {
    const { prefix, projectKey, issueType } = options;

    // Map requirement fields to Jira fields
    const issueData = this.mapRequirementToJiraIssue(requirement, { prefix, projectKey, issueType });

    try {
      // Create the issue in Jira
      const response = await this.client.post('/rest/api/2/issue', issueData);

      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new IntegrationError(
          `Failed to create Jira issue for requirement ${requirement.requirementId}: ${error.message}`,
          'ISSUE_CREATION_FAILED',
          { requirementId: requirement.requirementId, error: error.details }
        );
      }
      throw error;
    }
  }

  /**
   * Map a requirement to Jira issue data
   */
  private mapRequirementToJiraIssue(
    requirement: ShortlistedRequirement,
    options: { prefix: string; projectKey: string; issueType: string }
  ): Record<string, any> {
    const { prefix, projectKey, issueType } = options;

    const issueSummary = `${prefix}${requirement.requirementId}: ${requirement.title}`;

    return {
      'fields': {
        'project': {
          'key': projectKey,
        },
        'summary': issueSummary,
        'description': this.buildIssueDescription(requirement),
        'issuetype': {
          'name': issueType,
        },
        'priority': {
          'name': this.mapLevelToPriority(requirement.level),
        },
        'customfield_10000': requirement.requirementId, // Security Requirement ID
        'customfield_10001': requirement.level, // Level
        'customfield_10002': requirement.category, // Category
        'customfield_10003': requirement.standard, // Standard
        'customfield_10004': requirement.rationale, // Rationale
        'customfield_10005': true, // Is Security Requirement
      },
    };
  }

  /**
   * Map requirement level to Jira priority
   */
  private mapLevelToPriority(level: string): string {
    switch (level) {
      case 'L1':
        return 'Low';
      case 'L2':
        return 'Medium';
      case 'L3':
        return 'High';
      default:
        return 'Low';
    }
  }

  /**
   * Build detailed issue description
   */
  private buildIssueDescription(requirement: ShortlistedRequirement): string {
    return `h2. Security Requirement

*ID*: ${requirement.requirementId}
*Standard*: ${requirement.standard.toUpperCase()} ${requirement.standardVersion}
*Level*: ${requirement.level}
*Category*: ${requirement.category}

h2. Description
${requirement.description}

h2. Rationale
${requirement.rationale}

hr
*Generated by Security RAT Modern*
`;
  }

  /**
   * Get a Jira issue by key
   */
  async getIssueByKey(key: string): Promise<JiraIssue> {
    try {
      const response = await this.client.get(`/rest/api/2/issue/${key}`);
      return response.data;
    } catch (error) {
      throw new IntegrationError(
        `Failed to get Jira issue by key ${key}`,
        'ISSUE_FETCH_FAILED',
        { key }
      );
    }
  }

  /**
   * Get a Jira issue by ID
   */
  async getIssueById(id: string): Promise<JiraIssue> {
    try {
      const response = await this.client.get(`/rest/api/2/issue/${id}`);
      return response.data;
    } catch (error) {
      throw new IntegrationError(
        `Failed to get Jira issue by ID ${id}`,
        'ISSUE_FETCH_FAILED',
        { id }
      );
    }
  }

  /**
   * Update Jira issue status
   */
  async updateStatus(
    issueId: string,
    status: 'pending' | 'inProgress' | 'completed' | 'notApplicable'
  ): Promise<JiraIssue> {
    const statusMap: Record<string, string> = {
      'pending': 'To Do',
      'inProgress': 'In Progress',
      'completed': 'Done',
      'notApplicable': 'Won\'t Do',
    };

    const jiraStatus = statusMap[status] || 'To Do';

    try {
      const response = await this.client.put(`/rest/api/2/issue/${issueId}/transitions`, {
        'transition': {
          'name': jiraStatus,
        },
      });

      return this.getIssueById(issueId);
    } catch (error) {
      throw new IntegrationError(
        `Failed to update Jira issue ${issueId} status to ${status}`,
        'ISSUE_UPDATE_FAILED',
        { issueId, status }
      );
    }
  }

  /**
   * Link Jira issues to a shortlist
   */
  async linkIssues(
    shortlistId: string,
    issueKeys: string[],
    options: {
      linkType?: string;
      description?: string;
    } = {}
  ): Promise<void> {
    const { linkType = 'Depends on', description = `Linked to shortlist ${shortlistId}` } = options;

    // Create a parent issue to link all issues to
    try {
      const parentIssue = await this.client.post('/rest/api/2/issue', {
        'fields': {
          'project': {
            'key': this.projectKey,
          },
          'summary': `Shortlist: ${shortlistId}`,
          'description': description,
          'issuetype': {
            'name': 'Task',
          },
        },
      });

      const parentKey = parentIssue.data.key;

      // Link each issue to the parent
      for (const issueKey of issueKeys) {
        await this.client.post('/rest/api/2/issueLink', {
          'type': {
            'name': linkType,
          },
          'inwardIssue': {
            'key': parentKey,
          },
          'outwardIssue': {
            'key': issueKey,
          },
        });
      }

    } catch (error) {
      throw new IntegrationError(
        `Failed to link Jira issues to shortlist ${shortlistId}`,
        'ISSUE_LINK_FAILED',
        { shortlistId, issueKeys }
      );
    }
  }

  /**
   * Search for Jira issues using JQL
   */
  async queryIssues(jql: string, options: { limit?: number; fields?: string[] } = {}): Promise<JiraIssue[]> {
    const { limit = 50, fields = ['*all'] } = options;

    try {
      const response = await this.client.get('/rest/api/2/search', {
        params: {
          jql,
          maxResults: limit,
          fields: fields.join(','),
        },
      });

      return response.data.issues;
    } catch (error) {
      throw new IntegrationError(
        `Failed to query Jira issues with JQL: ${jql}`,
        'ISSUE_QUERY_FAILED',
        { jql }
      );
    }
  }

  /**
   * Get available projects
   */
  async getProjects(): Promise<Array<{ key: string; name: string }>> {
    try {
      const response = await this.client.get('/rest/api/2/project');
      return response.data.map((item: any) => ({
        key: item.key,
        name: item.name,
      }));
    } catch (error) {
      throw new IntegrationError(
        'Failed to fetch Jira projects',
        'PROJECT_FETCH_FAILED'
      );
    }
  }

  /**
   * Get available issue types
   */
  async getIssueTypes(projectKey: string = this.projectKey): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await this.client.get(`/rest/api/2/issue/createmeta?projectKeys=${projectKey}`);
      
      const issueTypes: Array<{ id: string; name: string }> = [];
      
      for (const [key, value] of Object.entries(response.data.issuetypes || {})) {
        issueTypes.push({
          id: key,
          name: (value as any).name,
        });
      }
      
      return issueTypes;
    } catch (error) {
      throw new IntegrationError(
        `Failed to fetch Jira issue types for project ${projectKey}`,
        'ISSUE_TYPE_FETCH_FAILED'
      );
    }
  }

  /**
   * Get available statuses
   */
  async getStatuses(): Promise<Array<{ name: string }>> {
    try {
      const response = await this.client.get('/rest/api/2/status');
      return response.data.map((item: any) => ({
        name: item.name,
      }));
    } catch (error) {
      throw new IntegrationError(
        'Failed to fetch Jira statuses',
        'STATUS_FETCH_FAILED'
      );
    }
  }

  /**
   * Test connection to Jira
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Bulk create issues
   */
  async bulkCreateIssues(
    shortlist: ShortlistedRequirement[],
    options: {
      prefix?: string;
      projectKey?: string;
      issueType?: string;
      batchSize?: number;
    } = {}
  ): Promise<JiraIssue[]> {
    const {
      prefix = '',
      projectKey: projectOverride,
      issueType: issueTypeOverride,
      batchSize = 50
    } = options;
    
    const projectKey = projectOverride || this.projectKey;
    const issueType = issueTypeOverride || this.issueType;

    if (!projectKey) {
      throw new IntegrationError(
        'Project key is required for bulk creating Jira issues',
        'MISSING_PROJECT_KEY'
      );
    }

    const createdIssues: JiraIssue[] = [];
    const batches = [];

    // Split into batches
    for (let i = 0; i < shortlist.length; i += batchSize) {
      batches.push(shortlist.slice(i, i + batchSize));
    }

    // Process each batch
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(requirement => 
          this.createIssueFromRequirement(requirement, { prefix, projectKey, issueType })
        )
      );
      createdIssues.push(...batchResults);
    }

    return createdIssues;
  }
}
