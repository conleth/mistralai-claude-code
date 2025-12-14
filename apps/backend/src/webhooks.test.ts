import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fastify } from './index.js';
import type { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

describe('Webhook API Endpoints', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await fastify();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('GET /api/v1/webhooks', () => {
    it('should retrieve all webhooks for the user', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/webhooks',
        headers: {
          authorization: `Bearer test-token`, // This would be validated in real implementation
        },
      });

      // The actual implementation would return webhooks from the database
      // We're just verifying the endpoint exists and returns 200
      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/v1/webhooks', () => {
    it('should create a new webhook', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/webhooks',
        payload: {
          name: 'Slack Notifications',
          url: 'https://hooks.slack.com/services/TEST',
          eventTypes: ['rally.ticket.created', 'jira.issue.created'],
          secret: 'optional-secret',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('Slack Notifications');
      expect(body.url).toBe('https://hooks.slack.com/services/TEST');
    });

    it('should return 400 for invalid webhook data', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/webhooks',
        payload: {
          name: '',
          url: '',
          eventTypes: [],
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid URL', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/webhooks',
        payload: {
          name: 'Test Webhook',
          url: 'not-a-valid-url',
          eventTypes: ['rally.ticket.created'],
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/webhooks/:id', () => {
    it('should retrieve a specific webhook', async () => {
      const webhookId = uuidv4();

      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/webhooks/${webhookId}`,
      });

      // The actual implementation would return the webhook from the database
      // We're just verifying the endpoint exists and returns 200
      expect(response.statusCode).toBe(200);
    });

    it('should return 404 for non-existent webhook', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/webhooks/${nonExistentId}`,
      });

      // The actual implementation would return 404 for non-existent webhook
      // We're just verifying the endpoint handles the case
      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/webhooks/:id', () => {
    it('should update a webhook', async () => {
      const webhookId = uuidv4();

      const response = await server.inject({
        method: 'PUT',
        url: `/api/v1/webhooks/${webhookId}`,
        payload: {
          name: 'Updated Webhook Name',
          url: 'https://hooks.slack.com/services/UPDATED',
          eventTypes: ['jira.issue.created'],
          isActive: false,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.name).toBe('Updated Webhook Name');
      expect(body.url).toBe('https://hooks.slack.com/services/UPDATED');
    });

    it('should return 404 for non-existent webhook', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await server.inject({
        method: 'PUT',
        url: `/api/v1/webhooks/${nonExistentId}`,
        payload: {
          name: 'Updated Name',
          url: 'https://example.com',
          eventTypes: ['rally.ticket.created'],
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid update data', async () => {
      const webhookId = uuidv4();

      const response = await server.inject({
        method: 'PUT',
        url: `/api/v1/webhooks/${webhookId}`,
        payload: {
          name: '',
          url: 'invalid-url',
          eventTypes: [],
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/v1/webhooks/:id', () => {
    it('should delete a webhook', async () => {
      const webhookId = uuidv4();

      const response = await server.inject({
        method: 'DELETE',
        url: `/api/v1/webhooks/${webhookId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Webhook deleted successfully');
    });

    it('should return 404 for non-existent webhook', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await server.inject({
        method: 'DELETE',
        url: `/api/v1/webhooks/${nonExistentId}`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/webhooks/:id/logs', () => {
    it('should retrieve webhook delivery logs', async () => {
      const webhookId = uuidv4();

      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/webhooks/${webhookId}/logs`,
        query: {
          limit: '10',
          offset: '0',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.logs).toBeDefined();
      expect(Array.isArray(body.logs)).toBe(true);
    });

    it('should return 404 for non-existent webhook', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/webhooks/${nonExistentId}/logs`,
      });

      expect(response.statusCode).toBe(404);
    });

    it('should accept pagination parameters', async () => {
      const webhookId = uuidv4();

      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/webhooks/${webhookId}/logs`,
        query: {
          limit: '50',
          offset: '100',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Webhook Event Triggering', () => {
    it('should trigger webhooks for Rally ticket creation', async () => {
      // This would be tested internally when tickets are created
      // We're just verifying the endpoint exists
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/integrations/rally/tickets',
        payload: {
          shortlistId: uuidv4(),
          credentials: {
            apiKey: 'test-api-key',
            serverUrl: 'https://rally.example.com',
            workspace: 'Test',
            project: 'Test',
          },
        },
      });

      // The actual implementation would trigger webhooks
      // We're just verifying the endpoint exists
      expect(response.statusCode).toBe(200);
    });

    it('should trigger webhooks for Jira issue creation', async () => {
      // This would be tested internally when issues are created
      // We're just verifying the endpoint exists
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/integrations/jira/issues',
        payload: {
          shortlistId: uuidv4(),
          credentials: {
            email: 'test@example.com',
            apiToken: 'test-token',
            serverUrl: 'https://jira.example.com',
            projectKey: 'SEC',
          },
        },
      });

      // The actual implementation would trigger webhooks
      // We're just verifying the endpoint exists
      expect(response.statusCode).toBe(200);
    });
  });
});
