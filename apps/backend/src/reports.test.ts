import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fastify } from './index.js';
import type { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

describe('Reporting API Endpoints', () => {
  let server: FastifyInstance;
  let mockShortlistId: string;

  beforeEach(async () => {
    mockShortlistId = uuidv4();
    server = await fastify();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('GET /api/v1/reports/shortlist/:id/json', () => {
    it('should export shortlist as JSON', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/reports/shortlist/${mockShortlistId}/json`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('shortlistId');
      expect(body).toHaveProperty('requirements');
      expect(Array.isArray(body.requirements)).toBe(true);
    });

    it('should return 404 for non-existent shortlist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/reports/shortlist/${nonExistentId}/json`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/reports/shortlist/:id/csv', () => {
    it('should export shortlist as CSV', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/reports/shortlist/${mockShortlistId}/csv`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      
      // CSV should contain headers
      expect(response.body).toContain('Requirement ID');
      expect(response.body).toContain('Title');
      expect(response.body).toContain('Level');
      expect(response.body).toContain('Status');
    });

    it('should return 404 for non-existent shortlist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/reports/shortlist/${nonExistentId}/csv`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/reports/summary', () => {
    it('should return summary statistics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/reports/summary',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalRequirements');
      expect(body).toHaveProperty('byStatus');
      expect(body).toHaveProperty('byLevel');
      expect(body).toHaveProperty('byStandard');
      
      // Verify structure
      expect(typeof body.totalRequirements).toBe('number');
      expect(typeof body.byStatus).toBe('object');
      expect(typeof body.byLevel).toBe('object');
      expect(typeof body.byStandard).toBe('object');
    });

    it('should include external reference statistics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/reports/summary',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('externalReferences');
      expect(body.externalReferences).toHaveProperty('rally');
      expect(body.externalReferences).toHaveProperty('jira');
    });
  });

  describe('GET /api/v1/reports/shortlist/:id/summary', () => {
    it('should return shortlist summary', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/reports/shortlist/${mockShortlistId}/summary`,
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('shortlistId');
      expect(body.shortlistId).toBe(mockShortlistId);
      expect(body).toHaveProperty('totalRequirements');
      expect(body).toHaveProperty('byStatus');
      expect(body).toHaveProperty('byLevel');
      expect(body).toHaveProperty('byCategory');
    });

    it('should return 404 for non-existent shortlist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/reports/shortlist/${nonExistentId}/summary`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/search/requirements', () => {
    it('should search requirements by query', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/search/requirements',
        query: {
          query: 'authentication',
          limit: '50',
          offset: '0',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('results');
      expect(Array.isArray(body.results)).toBe(true);
      expect(body).toHaveProperty('total');
      expect(typeof body.total).toBe('number');
    });

    it('should filter by status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/search/requirements',
        query: {
          query: 'authentication',
          status: 'pending',
          limit: '50',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should filter by level', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/search/requirements',
        query: {
          query: 'authentication',
          level: 'L1',
          limit: '50',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should filter by standard', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/search/requirements',
        query: {
          query: 'authentication',
          standard: 'ASVS',
          limit: '50',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return empty results for no matches', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/search/requirements',
        query: {
          query: 'nonexistentrequirementxyz',
          limit: '50',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.results).toHaveLength(0);
      expect(body.total).toBe(0);
    });
  });

  describe('GET /api/v1/search/shortlists', () => {
    it('should search shortlists by query', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/search/shortlists',
        query: {
          query: 'web application',
          limit: '50',
          offset: '0',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('results');
      expect(Array.isArray(body.results)).toBe(true);
      expect(body).toHaveProperty('total');
    });

    it('should filter by status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/search/shortlists',
        query: {
          query: 'web application',
          status: 'pending',
          limit: '50',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return empty results for no matches', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/search/shortlists',
        query: {
          query: 'nonexistentqueryxyz',
          limit: '50',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.results).toHaveLength(0);
      expect(body.total).toBe(0);
    });
  });

  describe('GET /api/v1/shortlists', () => {
    it('should filter shortlists by parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/shortlists',
        query: {
          status: 'pending',
          level: 'L1',
          standard: 'ASVS',
          limit: '50',
          offset: '0',
        },
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('shortlists');
      expect(Array.isArray(body.shortlists)).toBe(true);
      expect(body).toHaveProperty('total');
    });

    it('should return all shortlists when no filters applied', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/shortlists',
        query: {
          limit: '50',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should support pagination', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/shortlists',
        query: {
          limit: '20',
          offset: '40',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
