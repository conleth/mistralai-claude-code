/**
 * Rally integration adapter
 */

import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { IntegrationError, AuthenticationError, ApiError, MappingError } from './errors';
import type { ShortlistedRequirement } from '@security-rat/types';

/**
 * Rally credentials
 */
export interface RallyCredentials {
  apiKey: string;
  serverUrl: string;
  workspace?: string;
  project?: string;
}

/**
 * Rally ticket representation
 */
export interface RallyTicket {
  ref: string;
  id: string;
  name: string;
  description: string;
  state: string;
  project: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  customFields?: Record<string, any>;
}

/**
 * Rally adapter configuration
 */
interface RallyAdapterConfig {
  credentials: RallyCredentials;
  fieldMappings?: Record<string, string>;
}

/**
 * Field mappings for Rally
 */
const DEFAULT_FIELD_MAPPINGS: Record<string, string> = {
  'security-requirement-id': 'c_RequirementID',
  'security-requirement-title': 'Name',
  'security-requirement-description': 'Description',
  'security-requirement-level': 'c_Level',
  'security-requirement-category': 'c_Category',
  'security-requirement-standard': 'c_Standard',
  'security-requirement-rationale': 'c_Rationale',
  'security-requirement-status': 'State',
};

/**
 * Rally adapter
 */
export class RallyAdapter {
  private client: AxiosInstance;
  private credentials: RallyCredentials;
  private fieldMappings: Record<string, string>;
  private workspace: string;
  private project: string;

  /**
   * Create a new Rally adapter
   */
  constructor(config: RallyAdapterConfig) {
    this.credentials = config.credentials;
    this.fieldMappings = { ...DEFAULT_FIELD_MAPPINGS, ...config.fieldMappings };
    this.workspace = config.credentials.workspace || 'Default Workspace';
    this.project = config.credentials.project || 'Default Project';

    this.client = axios.create({
      baseURL: this.credentials.serverUrl,
      headers: {
        'ZSESSIONID': this.credentials.apiKey,
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
            `Rally API error: ${error.response.status} ${error.response.statusText}`,
            error.response.status,
            error.response.data
          );
        }
        throw new IntegrationError(
          `Rally API request failed: ${error.message}`,
          'RALLY_REQUEST_FAILED',
          { error: error.message }
        );
      }
    );
  }

  /**
   * Authenticate with Rally API
   */
  async authenticate(): Promise<void> {
    try {
      // Test authentication by making a simple query
      await this.client.get('/slm/webservices/v2.0/defect');
    } catch (error) {
      throw new AuthenticationError(
        'Failed to authenticate with Rally',
        this.credentials
      );
    }
  }

  /**
   * Create Rally tickets from shortlisted requirements
   */
  async createTickets(
    shortlist: ShortlistedRequirement[],
    options: {
      prefix?: string;
      project?: string;
      workspace?: string;
    } = {}
  ): Promise<RallyTicket[]> {
    const { prefix = 'SEC-', project: projectOverride, workspace: workspaceOverride } = options;
    const project = projectOverride || this.project;
    const workspace = workspaceOverride || this.workspace;

    if (!project) {
      throw new IntegrationError(
        'Project is required for creating Rally tickets',
        'MISSING_PROJECT'
      );
    }

    const createdTickets: RallyTicket[] = [];

    for (const requirement of shortlist) {
      const ticket = await this.createTicketFromRequirement(
        requirement,
        { prefix, project, workspace }
      );
      createdTickets.push(ticket);
    }

    return createdTickets;
  }

  /**
   * Create a single Rally ticket from a requirement
   */
  private async createTicketFromRequirement(
    requirement: ShortlistedRequirement,
    options: {
      prefix: string;
      project: string;
      workspace: string;
    }
  ): Promise<RallyTicket> {
    const { prefix, project, workspace } = options;

    // Map requirement fields to Rally fields
    const ticketData = this.mapRequirementToRallyTicket(requirement, { prefix, project, workspace });

    try {
      // Create the defect in Rally
      const response = await this.client.post('/slm/webservices/v2.0/defect', ticketData);

      // Get the created ticket details
      const ticketRef = response.data._ref;
      const ticket = await this.getTicketByRef(ticketRef);

      return ticket;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new IntegrationError(
          `Failed to create Rally ticket for requirement ${requirement.id}: ${error.message}`,
          'TICKET_CREATION_FAILED',
          { requirementId: requirement.id, error: error.details }
        );
      }
      throw error;
    }
  }

  /**
   * Map a requirement to Rally ticket data
   */
  private mapRequirementToRallyTicket(
    requirement: ShortlistedRequirement,
    options: { prefix: string; project: string; workspace: string }
  ): Record<string, any> {
    const { prefix, project, workspace } = options;

    const ticketName = `${prefix}${requirement.requirementId}: ${requirement.title}`;

    return {
      'Name': ticketName,
      'Description': this.buildTicketDescription(requirement),
      'Project': { _ref: `/project/${project}` },
      'Workspace': { _ref: `/workspace/${workspace}` },
      'State': 'Defined', // Default state
      'ScheduleState': 'Defined',
      'c_RequirementID': requirement.requirementId,
      'c_Level': requirement.level,
      'c_Category': requirement.category,
      'c_Standard': requirement.standard,
      'c_Rationale': requirement.rationale,
      'c_SecurityRequirement': true,
    };
  }

  /**
   * Build detailed ticket description
   */
  private buildTicketDescription(requirement: ShortlistedRequirement): string {
    return `## Security Requirement

**ID**: ${requirement.requirementId}
**Standard**: ${requirement.standard.toUpperCase()} ${requirement.version}
**Level**: ${requirement.level}
**Category**: ${requirement.category}

## Description
${requirement.description}

## Rationale
${requirement.rationale}

---
*Generated by Security RAT Modern*
`;
  }

  /**
   * Get a Rally ticket by reference
   */
  async getTicketByRef(ref: string): Promise<RallyTicket> {
    try {
      const response = await this.client.get(ref);
      return this.mapRallyResponseToTicket(response.data);
    } catch (error) {
      throw new IntegrationError(
        `Failed to get Rally ticket by ref ${ref}`,
        'TICKET_FETCH_FAILED',
        { ref }
      );
    }
  }

  /**
   * Get a Rally ticket by ID
   */
  async getTicketById(id: string): Promise<RallyTicket> {
    try {
      const response = await this.client.get(`/slm/webservices/v2.0/defect/${id}`);
      return this.mapRallyResponseToTicket(response.data);
    } catch (error) {
      throw new IntegrationError(
        `Failed to get Rally ticket by ID ${id}`,
        'TICKET_FETCH_FAILED',
        { id }
      );
    }
  }

  /**
   * Update Rally ticket status
   */
  async updateStatus(
    ticketId: string,
    status: 'pending' | 'inProgress' | 'completed' | 'notApplicable'
  ): Promise<RallyTicket> {
    const stateMap: Record<string, string> = {
      'pending': 'Defined',
      'inProgress': 'In Progress',
      'completed': 'Completed',
      'notApplicable': 'Obsolete',
    };

    const rallyState = stateMap[status] || 'Defined';

    try {
      await this.client.put(`/slm/webservices/v2.0/defect/${ticketId}`, {
        'State': rallyState,
      });

      return this.getTicketById(ticketId);
    } catch (error) {
      throw new IntegrationError(
        `Failed to update Rally ticket ${ticketId} status to ${status}`,
        'TICKET_UPDATE_FAILED',
        { ticketId, status }
      );
    }
  }

  /**
   * Link Rally tickets to a shortlist
   */
  async linkTickets(
    shortlistId: string,
    ticketIds: string[],
    options: { 
      linkType?: string;
      description?: string;
    } = {}
  ): Promise<void> {
    const { linkType = 'Depends On', description = `Linked to shortlist ${shortlistId}` } = options;

    // In Rally, we create a parent task and link all tickets to it
    try {
      // Create a parent task
      const parentTask = await this.client.post('/slm/webservices/v2.0/task', {
        'Name': `Shortlist: ${shortlistId}`,
        'Description': description,
        'Project': { _ref: `/project/${this.project}` },
        'Workspace': { _ref: `/workspace/${this.workspace}` },
        'State': 'Defined',
      });

      // Link each ticket to the parent
      for (const ticketId of ticketIds) {
        await this.client.post(`/slm/webservices/v2.0/defect/${ticketId}/Updates`, {
          'Updates': {
            '_rallyAPIMajor': '2',
            '_rallyAPIMinor': '0',
            'Revision': {
              '_ref': `/defect/${ticketId}`,
            },
            'ChangeNotes': {
              'content': `Linked to shortlist ${shortlistId}`,
            },
          },
        });
      }

    } catch (error) {
      throw new IntegrationError(
        `Failed to link Rally tickets to shortlist ${shortlistId}`,
        'TICKET_LINK_FAILED',
        { shortlistId, ticketIds }
      );
    }
  }

  /**
   * Search for Rally tickets
   */
  async searchTickets(query: string, limit: number = 50): Promise<RallyTicket[]> {
    try {
      const response = await this.client.get('/slm/webservices/v2.0/defect', {
        params: {
          query,
          fetch: 'true',
          pagesize: limit,
        },
      });

      return response.data.Results.map((item: any) => this.mapRallyResponseToTicket(item));
    } catch (error) {
      throw new IntegrationError(
        `Failed to search Rally tickets: ${query}`,
        'TICKET_SEARCH_FAILED',
        { query }
      );
    }
  }

  /**
   * Map Rally API response to internal ticket format
   */
  private mapRallyResponseToTicket(data: any): RallyTicket {
    return {
      ref: data._ref,
      id: data.ObjectID,
      name: data.Name,
      description: data.Description || '',
      state: data.State || 'Defined',
      project: data.Project?._ref || '',
      createdAt: data.CreationDate || new Date().toISOString(),
      updatedAt: data.LastUpdateDate || new Date().toISOString(),
      url: `${this.credentials.serverUrl}/#/defect detail/${data.ObjectID}`,
      customFields: {
        requirementId: data.c_RequirementID,
        level: data.c_Level,
        category: data.c_Category,
        standard: data.c_Standard,
        rationale: data.c_Rationale,
      },
    };
  }

  /**
   * Get available projects
   */
  async getProjects(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await this.client.get('/slm/webservices/v2.0/project');
      return response.data.Results.map((item: any) => ({
        id: item.ObjectID,
        name: item.Name,
      }));
    } catch (error) {
      throw new IntegrationError(
        'Failed to fetch Rally projects',
        'PROJECT_FETCH_FAILED'
      );
    }
  }

  /**
   * Get available workspaces
   */
  async getWorkspaces(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await this.client.get('/slm/webservices/v2.0/workspace');
      return response.data.Results.map((item: any) => ({
        id: item.ObjectID,
        name: item.Name,
      }));
    } catch (error) {
      throw new IntegrationError(
        'Failed to fetch Rally workspaces',
        'WORKSPACE_FETCH_FAILED'
      );
    }
  }

  /**
   * Test connection to Rally
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch (error) {
      return false;
    }
  }
}
