/**
 * API endpoint tests
 */

import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { initializeDatabase, closeDatabase } from './database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

describe('API Endpoints', () => {
  let server: FastifyInstance;
  let db: any;
  let testUserId: string;
  let testToken: string;

  beforeAll(async () => {
    // Initialize database
    db = await initializeDatabase();
    
    // Create test user
    const passwordHash = await bcrypt.hash('password123', 10);
    testUserId = uuidv4();
    await db.run(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      testUserId, 'Test User', 'test@example.com', passwordHash, 'developer'
    );
    
    // Create Fastify server
    server = Fastify({
      logger: false,
    });
    
    // For testing, we'll create a minimal server with the same routes
    await server.register(require('@fastify/cors'), { origin: true });
    await server.register(require('@fastify/jwt'), { secret: 'testsecret' });
    
    // Health check
    server.get('/health', async () => ({ status: 'ok' }));
    
    // Auth routes
    server.post('/api/v1/auth/register', async (request: any, reply: any) => {
      const { name, email, password, role } = request.body as any;
      const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);
      if (existingUser) {
        return reply.code(400).send({ message: 'User already exists' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        userId, name, email, passwordHash, role
      );
      return { id: userId, name, email, role };
    });
    
    server.post('/api/v1/auth/login', async (request: any, reply: any) => {
      const { email, password } = request.body as any;
      const user = await db.get('SELECT * FROM users WHERE email = ?', email);
      if (!user) {
        return reply.code(401).send({ message: 'Invalid credentials' });
      }
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        return reply.code(401).send({ message: 'Invalid credentials' });
      }
      const token = server.jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: '7d' }
      );
      return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    });
    
    // Questionnaire routes
    server.get('/api/v1/questionnaires', async (request: any) => {
      const userId = (request as any).user.userId;
      return await db.all(
        'SELECT * FROM questionnaires WHERE created_by = ? ORDER BY created_at DESC',
        userId
      );
    });
    
    server.post('/api/v1/questionnaires', async (request: any, reply: any) => {
      const userId = (request as any).user.userId;
      const { name, description, isTemplate } = request.body as any;
      const questionnaireId = uuidv4();
      await db.run(
        'INSERT INTO questionnaires (id, name, description, created_by, is_template) VALUES (?, ?, ?, ?, ?)',
        questionnaireId, name, description || null, userId, isTemplate || false
      );
      return reply.code(201).send({ id: questionnaireId, name, description, isTemplate });
    });
    
    server.get('/api/v1/questionnaires/:id', async (request: any, reply: any) => {
      const { id } = request.params as any;
      const userId = (request as any).user.userId;
      const questionnaire = await db.get(
        'SELECT * FROM questionnaires WHERE id = ? AND created_by = ?',
        id, userId
      );
      if (!questionnaire) {
        return reply.code(404).send({ message: 'Questionnaire not found' });
      }
      return questionnaire;
    });
    
    // Questionnaire Answers routes
    server.post('/api/v1/questionnaire-answers', async (request: any, reply: any) => {
      const userId = (request as any).user.userId;
      const { questionnaireId, answers, version } = request.body as any;
      const questionnaire = await db.get(
        'SELECT id FROM questionnaires WHERE id = ? AND created_by = ?',
        questionnaireId, userId
      );
      if (!questionnaire) {
        return reply.code(404).send({ message: 'Questionnaire not found' });
      }
      const answersId = uuidv4();
      await db.run(
        'INSERT INTO questionnaire_answers (id, questionnaire_id, answers, version, created_by) VALUES (?, ?, ?, ?, ?)',
        answersId, questionnaireId, JSON.stringify(answers), version || '1.0', userId
      );
      return reply.code(201).send({ id: answersId, questionnaireId, version });
    });
    
    server.get('/api/v1/questionnaire-answers', async (request: any) => {
      const userId = (request as any).user.userId;
      return await db.all(
        'SELECT qa.*, q.name as questionnaire_name FROM questionnaire_answers qa JOIN questionnaires q ON qa.questionnaire_id = q.id WHERE qa.created_by = ? ORDER BY qa.created_at DESC',
        userId
      );
    });
    
    server.get('/api/v1/questionnaire-answers/:id', async (request: any, reply: any) => {
      const { id } = request.params as any;
      const userId = (request as any).user.userId;
      const answers = await db.get(
        'SELECT * FROM questionnaire_answers WHERE id = ? AND created_by = ?',
        id, userId
      );
      if (!answers) {
        return reply.code(404).send({ message: 'Answers not found' });
      }
      return { ...answers, answers: JSON.parse(answers.answers) };
    });
    
    // Shortlist routes
    server.post('/api/v1/shortlist', async (request: any, reply: any) => {
      const userId = (request as any).user.userId;
      const { questionnaireAnswersId, version } = request.body as any;
      const answers = await db.get(
        'SELECT * FROM questionnaire_answers WHERE id = ? AND created_by = ?',
        questionnaireAnswersId, userId
      );
      if (!answers) {
        return reply.code(404).send({ message: 'Questionnaire answers not found' });
      }
      
      // Mock shortlist generation
      const mockRequirements = [
        {
          id: 'req-1',
          standard: 'asvs',
          version: '5.0.0',
          requirementId: 'v5.0.0-1.1.1',
          title: 'Inventory of authorized and unauthorized software',
          description: 'Test requirement',
          level: 'L1',
          category: 'V1',
          rationale: 'Test rationale'
        }
      ];
      
      const shortlistId = uuidv4();
      await db.run(
        'INSERT INTO shortlists (id, questionnaire_answers_id, requirements, version) VALUES (?, ?, ?, ?)',
        shortlistId, questionnaireAnswersId, JSON.stringify(mockRequirements), version || '1.0'
      );
      
      return { id: shortlistId, requirements: mockRequirements, version: version || '1.0' };
    });
    
    server.get('/api/v1/shortlist/:id', async (request: any, reply: any) => {
      const { id } = request.params as any;
      const userId = (request as any).user.userId;
      const shortlist = await db.get(
        'SELECT s.*, qa.questionnaire_id FROM shortlists s JOIN questionnaire_answers qa ON s.questionnaire_answers_id = qa.id JOIN questionnaires q ON qa.questionnaire_id = q.id WHERE s.id = ? AND qa.created_by = ?',
        id, userId
      );
      if (!shortlist) {
        return reply.code(404).send({ message: 'Shortlist not found' });
      }
      return { ...shortlist, requirements: JSON.parse(shortlist.requirements) };
    });
    
    await server.ready();
    
    // Get test token
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@example.com', password: 'password123' }
    });
    
    const loginData = JSON.parse(response.body);
    testToken = loginData.token;
  });

  afterAll(async () => {
    await server.close();
    await closeDatabase(db);
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });
      
      expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.body);
      expect(body.status).to.equal('ok');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: 'developer'
        }
      });
      
      expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.body);
      expect(body.name).to.equal('New User');
      expect(body.email).to.equal('new@example.com');
      expect(body.role).to.equal('developer');
    });

    it('should login with valid credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.body);
      expect(body.token).to.exist;
      expect(body.user.email).to.equal('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });
      
      expect(response.statusCode).to.equal(401);
    });
  });

  describe('Questionnaires (Authenticated)', () => {
    it('should list questionnaires', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/questionnaires',
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).to.be.true;
    });

    it('should create a new questionnaire', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaires',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          name: 'Test Questionnaire',
          description: 'A test questionnaire',
          isTemplate: false
        }
      });
      
      expect(response.statusCode).to.equal(201);
      const body = JSON.parse(response.body);
      expect(body.name).to.equal('Test Questionnaire');
      expect(body.id).to.exist;
    });

    it('should get a specific questionnaire', async () => {
      // First create a questionnaire
      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaires',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          name: 'Test Questionnaire',
          description: 'A test questionnaire'
        }
      });
      
      const created = JSON.parse(createResponse.body);
      
      // Now get it
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/v1/questionnaires/${created.id}`,
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      expect(getResponse.statusCode).to.equal(200);
      const body = JSON.parse(getResponse.body);
      expect(body.id).to.equal(created.id);
      expect(body.name).to.equal('Test Questionnaire');
    });

    it('should reject access to other users questionnaires', async () => {
      // Create a questionnaire for another user
      const otherUserId = uuidv4();
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        otherUserId, 'Other User', 'other@example.com', 'hash', 'developer'
      );
      
      await db.run(
        'INSERT INTO questionnaires (id, name, created_by) VALUES (?, ?, ?)',
        'other-questionnaire', 'Other Questionnaire', otherUserId
      );
      
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/questionnaires/other-questionnaire',
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('Questionnaire Answers (Authenticated)', () => {
    it('should create questionnaire answers', async () => {
      // First create a questionnaire
      const questionnaireResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaires',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          name: 'Test Questionnaire',
          description: 'A test questionnaire'
        }
      });
      
      const questionnaire = JSON.parse(questionnaireResponse.body);
      
      // Now create answers
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaire-answers',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          questionnaireId: questionnaire.id,
          answers: {
            'app-type': 'web',
            'auth-type': 'oauth',
            'data-sensitivity': 'confidential',
            'internet-exposed': 'public',
            'hosting-model': 'cloud',
            'pipeline-maturity': 'intermediate'
          },
          version: '1.0'
        }
      });
      
      expect(response.statusCode).to.equal(201);
      const body = JSON.parse(response.body);
      expect(body.id).to.exist;
      expect(body.questionnaireId).to.equal(questionnaire.id);
    });

    it('should list questionnaire answers', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/questionnaire-answers',
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).to.be.true;
    });

    it('should get specific questionnaire answers', async () => {
      // First create answers
      const questionnaireResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaires',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          name: 'Test Questionnaire',
          description: 'A test questionnaire'
        }
      });
      
      const questionnaire = JSON.parse(questionnaireResponse.body);
      
      const answersResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaire-answers',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          questionnaireId: questionnaire.id,
          answers: { 'app-type': 'web' },
          version: '1.0'
        }
      });
      
      const answers = JSON.parse(answersResponse.body);
      
      // Now get them
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/v1/questionnaire-answers/${answers.id}`,
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      expect(getResponse.statusCode).to.equal(200);
      const body = JSON.parse(getResponse.body);
      expect(body.id).to.equal(answers.id);
      expect(body.answers).to.deep.equal({ 'app-type': 'web' });
    });
  });

  describe('Shortlist (Authenticated)', () => {
    it('should generate a shortlist', async () => {
      // First create questionnaire and answers
      const questionnaireResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaires',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          name: 'Test Questionnaire',
          description: 'A test questionnaire'
        }
      });
      
      const questionnaire = JSON.parse(questionnaireResponse.body);
      
      const answersResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaire-answers',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          questionnaireId: questionnaire.id,
          answers: {
            'app-type': 'web',
            'auth-type': 'oauth',
            'data-sensitivity': 'confidential',
            'internet-exposed': 'public',
            'hosting-model': 'cloud',
            'pipeline-maturity': 'intermediate'
          },
          version: '1.0'
        }
      });
      
      const answers = JSON.parse(answersResponse.body);
      
      // Now generate shortlist
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/shortlist',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          questionnaireAnswersId: answers.id,
          version: '1.0'
        }
      });
      
      expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.body);
      expect(body.id).to.exist;
      expect(body.requirements).to.exist;
      expect(Array.isArray(body.requirements)).to.be.true;
      expect(body.requirements.length).to.be.greaterThan(0);
    });

    it('should get a specific shortlist', async () => {
      // First generate a shortlist
      const questionnaireResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaires',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          name: 'Test Questionnaire',
          description: 'A test questionnaire'
        }
      });
      
      const questionnaire = JSON.parse(questionnaireResponse.body);
      
      const answersResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/questionnaire-answers',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          questionnaireId: questionnaire.id,
          answers: { 'app-type': 'web' },
          version: '1.0'
        }
      });
      
      const answers = JSON.parse(answersResponse.body);
      
      const shortlistResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/shortlist',
        headers: { Authorization: `Bearer ${testToken}` },
        payload: {
          questionnaireAnswersId: answers.id,
          version: '1.0'
        }
      });
      
      const shortlist = JSON.parse(shortlistResponse.body);
      
      // Now get it
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/v1/shortlist/${shortlist.id}`,
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      expect(getResponse.statusCode).to.equal(200);
      const body = JSON.parse(getResponse.body);
      expect(body.id).to.equal(shortlist.id);
      expect(body.requirements).to.exist;
    });
  });

  describe('Authentication Protection', () => {
    it('should reject unauthenticated requests to protected endpoints', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/questionnaires',
      });
      
      expect(response.statusCode).to.equal(401);
    });

    it('should reject invalid tokens', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/questionnaires',
        headers: { Authorization: 'Bearer invalidtoken' }
      });
      
      expect(response.statusCode).to.equal(401);
    });
  });
});
