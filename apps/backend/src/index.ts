/**
 * @security-rat/backend
 * Fastify API server
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { initializeDatabase, closeDatabase } from './database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Import types from packages
import type { QuestionnaireAnswers } from '@security-rat/types';

const server = Fastify({
  logger: true,
});

// Initialize database
let db;
try {
  db = await initializeDatabase();
  server.decorate('db', db);
} catch (error) {
  server.log.error('Failed to initialize database:', error);
  process.exit(1);
}

// Register plugins
await server.register(cors, {
  origin: true,
});

await server.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret',
});

// Authentication hooks
server.addHook('onRequest', async (request, reply) => {
  try {
    // Skip authentication for public routes
    if (request.url.startsWith('/health') || request.url.startsWith('/api/v1/auth')) {
      return;
    }
    
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      reply.code(401).send({ message: 'Unauthorized' });
    }
    
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ message: 'Invalid token' });
  }
});

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Authentication routes
server.post('/api/v1/auth/register', async (request, reply) => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['security-lead', 'developer', 'product-manager', 'auditor']).optional().default('developer'),
  });
  
  const { name, email, password, role } = schema.parse(request.body);
  
  // Check if user already exists
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);
  if (existingUser) {
    return reply.code(400).send({ message: 'User already exists' });
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const userId = uuidv4();
  await db.run(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    userId, name, email, passwordHash, role
  );
  
  // Log audit
  await db.run(
    'INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)',
    userId, 'create', 'user', userId, JSON.stringify({ email, role })
  );
  
  return { id: userId, name, email, role };
});

server.post('/api/v1/auth/login', async (request, reply) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  
  const { email, password } = schema.parse(request.body);
  
  // Find user
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) {
    return reply.code(401).send({ message: 'Invalid credentials' });
  }
  
  // Verify password
  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    return reply.code(401).send({ message: 'Invalid credentials' });
  }
  
  // Generate token
  const token = server.jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    { expiresIn: '7d' }
  );
  
  // Log audit
  await db.run(
    'INSERT INTO audit_log (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
    user.id, 'login', 'user', user.id
  );
  
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
});

// Questionnaire endpoints
server.get('/api/v1/questionnaires', async (request) => {
  const userId = request.user.userId;
  
  const questionnaires = await db.all(
    'SELECT * FROM questionnaires WHERE created_by = ? ORDER BY created_at DESC',
    userId
  );
  
  return questionnaires;
});

server.post('/api/v1/questionnaires', async (request, reply) => {
  const userId = request.user.userId;
  
  const schema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    isTemplate: z.boolean().optional().default(false),
  });
  
  const { name, description, isTemplate } = schema.parse(request.body);
  
  const questionnaireId = uuidv4();
  await db.run(
    'INSERT INTO questionnaires (id, name, description, created_by, is_template) VALUES (?, ?, ?, ?, ?)',
    questionnaireId, name, description || null, userId, isTemplate
  );
  
  // Log audit
  await db.run(
    'INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)',
    userId, 'create', 'questionnaire', questionnaireId, JSON.stringify({ name, description, isTemplate })
  );
  
  return reply.code(201).send({ id: questionnaireId, name, description, isTemplate });
});

server.get('/api/v1/questionnaires/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const userId = request.user.userId;
  
  const questionnaire = await db.get(
    'SELECT * FROM questionnaires WHERE id = ? AND created_by = ?',
    id, userId
  );
  
  if (!questionnaire) {
    return reply.code(404).send({ message: 'Questionnaire not found' });
  }
  
  return questionnaire;
});

// Questionnaire Answers endpoints
server.post('/api/v1/questionnaire-answers', async (request, reply) => {
  const userId = request.user.userId;
  
  const schema = z.object({
    questionnaireId: z.string().uuid(),
    answers: z.record(z.string(), z.string()),
    version: z.string().optional().default('1.0'),
  });
  
  const { questionnaireId, answers, version } = schema.parse(request.body);
  
  // Verify questionnaire belongs to user
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
    answersId, questionnaireId, JSON.stringify(answers), version, userId
  );
  
  // Log audit
  await db.run(
    'INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)',
    userId, 'create', 'questionnaire_answers', answersId, JSON.stringify({ questionnaireId, version })
  );
  
  return reply.code(201).send({ id: answersId, questionnaireId, version });
});

server.get('/api/v1/questionnaire-answers', async (request) => {
  const userId = request.user.userId;
  
  const answers = await db.all(
    'SELECT qa.*, q.name as questionnaire_name FROM questionnaire_answers qa JOIN questionnaires q ON qa.questionnaire_id = q.id WHERE qa.created_by = ? ORDER BY qa.created_at DESC',
    userId
  );
  
  return answers;
});

server.get('/api/v1/questionnaire-answers/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const userId = request.user.userId;
  
  const answers = await db.get(
    'SELECT * FROM questionnaire_answers WHERE id = ? AND created_by = ?',
    id, userId
  );
  
  if (!answers) {
    return reply.code(404).send({ message: 'Answers not found' });
  }
  
  return { ...answers, answers: JSON.parse(answers.answers) };
});

// Shortlist endpoints
server.post('/api/v1/shortlist', async (request, reply) => {
  const userId = request.user.userId;
  
  const schema = z.object({
    questionnaireAnswersId: z.string().uuid(),
    version: z.string().optional().default('1.0'),
  });
  
  const { questionnaireAnswersId, version } = schema.parse(request.body);
  
  // Verify answers belong to user
  const answers = await db.get(
    'SELECT * FROM questionnaire_answers WHERE id = ? AND created_by = ?',
    questionnaireAnswersId, userId
  );
  if (!answers) {
    return reply.code(404).send({ message: 'Questionnaire answers not found' });
  }
  
  // Generate shortlist using rules engine
  try {
    const { generateShortlist } = await import('@security-rat/rules-engine');
    const parsedAnswers = JSON.parse(answers.answers);
    const shortlist = await generateShortlist(parsedAnswers);
    
    const shortlistId = uuidv4();
    await db.run(
      'INSERT INTO shortlists (id, questionnaire_answers_id, requirements, version) VALUES (?, ?, ?, ?)',
      shortlistId, questionnaireAnswersId, JSON.stringify(shortlist), version
    );
    
    // Log audit
    await db.run(
      'INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)',
      userId, 'create', 'shortlist', shortlistId, JSON.stringify({ questionnaireAnswersId, count: shortlist.length })
    );
    
    return { id: shortlistId, requirements: shortlist, version };
  } catch (error) {
    server.log.error('Error generating shortlist:', error);
    return reply.code(500).send({ message: 'Failed to generate shortlist' });
  }
});

server.get('/api/v1/shortlist/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const userId = request.user.userId;
  
  const shortlist = await db.get(
    'SELECT s.*, qa.questionnaire_id FROM shortlists s JOIN questionnaire_answers qa ON s.questionnaire_answers_id = qa.id JOIN questionnaires q ON qa.questionnaire_id = q.id WHERE s.id = ? AND qa.created_by = ?',
    id, userId
  );
  
  if (!shortlist) {
    return reply.code(404).send({ message: 'Shortlist not found' });
  }
  
  return { ...shortlist, requirements: JSON.parse(shortlist.requirements) };
});

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await server.close();
  await closeDatabase(db);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await server.close();
  await closeDatabase(db);
  process.exit(0);
});

start();
