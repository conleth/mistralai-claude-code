/**
 * Database tests
 */

import { describe, it, beforeAll, afterAll, expect, beforeEach } from 'vitest';
import { initializeDatabase, closeDatabase } from './database';
import { Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

describe('Database', () => {
  let db: Database;
  const testDbPath = path.join(process.cwd(), 'data', 'test-security-rat.db');

  // Clean up test database before tests
  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  // Initialize database before each test
  beforeEach(async () => {
    if (db) {
      await closeDatabase(db);
    }
    
    // Override the database path for testing
    const originalInit = initializeDatabase;
    
    // Create a test-specific initialization
    const testInit = async () => {
      const testDb = await Database.open({
        filename: testDbPath,
        driver: Database,
      });
      
      // Run migrations manually for testing
      await testDb.exec(
        fs.readFileSync(path.join(__dirname, 'migrations', '001_create_tables.sql'), 'utf-8')
      );
      
      return testDb;
    };
    
    db = await testInit();
  });

  // Clean up after each test
  afterEach(async () => {
    if (db) {
      await closeDatabase(db);
    }
  });

  describe('Database Initialization', () => {
    it('should create all tables', async () => {
      const tables = await db.all(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      );
      
      const tableNames = tables.map((t: { name: string }) => t.name);
      
      expect(tableNames).to.include('users');
      expect(tableNames).to.include('questionnaires');
      expect(tableNames).to.include('questionnaire_answers');
      expect(tableNames).to.include('shortlists');
      expect(tableNames).to.include('requirement_status');
      expect(tableNames).to.include('comments');
      expect(tableNames).to.include('audit_log');
      expect(tableNames).to.include('migrations');
    });

    it('should create indexes', async () => {
      const indexes = await db.all(
        "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
      );
      
      expect(indexes.length).to.be.greaterThan(0);
    });
  });

  describe('User Table', () => {
    it('should insert and retrieve a user', async () => {
      const userId = 'test-user-123';
      const email = 'test@example.com';
      
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        userId, 'Test User', email, 'hashedpassword123', 'developer'
      );
      
      const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
      
      expect(user).to.exist;
      expect(user.id).to.equal(userId);
      expect(user.name).to.equal('Test User');
      expect(user.email).to.equal(email);
      expect(user.role).to.equal('developer');
    });

    it('should enforce unique email constraint', async () => {
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        'user1', 'User 1', 'test@example.com', 'hash1', 'developer'
      );
      
      try {
        await db.run(
          'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
          'user2', 'User 2', 'test@example.com', 'hash2', 'developer'
        );
        expect.fail('Should have thrown an error for duplicate email');
      } catch (error) {
        expect(error.message).to.include('UNIQUE constraint failed');
      }
    });
  });

  describe('Questionnaire Table', () => {
    it('should insert and retrieve a questionnaire', async () => {
      const userId = 'test-user-456';
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        userId, 'Test User', 'test@example.com', 'hash', 'developer'
      );
      
      const questionnaireId = 'questionnaire-789';
      await db.run(
        'INSERT INTO questionnaires (id, name, description, created_by, is_template) VALUES (?, ?, ?, ?, ?)',
        questionnaireId, 'Test Questionnaire', 'A test questionnaire', userId, false
      );
      
      const questionnaire = await db.get('SELECT * FROM questionnaires WHERE id = ?', questionnaireId);
      
      expect(questionnaire).to.exist;
      expect(questionnaire.name).to.equal('Test Questionnaire');
      expect(questionnaire.created_by).to.equal(userId);
      expect(questionnaire.is_template).to.equal(0);
    });
  });

  describe('QuestionnaireAnswers Table', () => {
    it('should store and retrieve questionnaire answers', async () => {
      const userId = 'test-user-101';
      const questionnaireId = 'questionnaire-202';
      
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        userId, 'Test User', 'test@example.com', 'hash', 'developer'
      );
      
      await db.run(
        'INSERT INTO questionnaires (id, name, created_by) VALUES (?, ?, ?)',
        questionnaireId, 'Test Questionnaire', userId
      );
      
      const answers = { 'app-type': 'web', 'auth-type': 'oauth' };
      const answersId = 'answers-303';
      
      await db.run(
        'INSERT INTO questionnaire_answers (id, questionnaire_id, answers, version, created_by) VALUES (?, ?, ?, ?, ?)',
        answersId, questionnaireId, JSON.stringify(answers), '1.0', userId
      );
      
      const savedAnswers = await db.get('SELECT * FROM questionnaire_answers WHERE id = ?', answersId);
      
      expect(savedAnswers).to.exist;
      expect(JSON.parse(savedAnswers.answers)).to.deep.equal(answers);
      expect(savedAnswers.version).to.equal('1.0');
    });
  });

  describe('Shortlist Table', () => {
    it('should store and retrieve a shortlist', async () => {
      const userId = 'test-user-404';
      const questionnaireId = 'questionnaire-505';
      const answersId = 'answers-606';
      
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        userId, 'Test User', 'test@example.com', 'hash', 'developer'
      );
      
      await db.run(
        'INSERT INTO questionnaires (id, name, created_by) VALUES (?, ?, ?)',
        questionnaireId, 'Test Questionnaire', userId
      );
      
      await db.run(
        'INSERT INTO questionnaire_answers (id, questionnaire_id, answers, version, created_by) VALUES (?, ?, ?, ?, ?)',
        answersId, questionnaireId, JSON.stringify({}), '1.0', userId
      );
      
      const requirements = [
        { id: 'req-1', title: 'Test Requirement 1', level: 'L1' }
      ];
      const shortlistId = 'shortlist-707';
      
      await db.run(
        'INSERT INTO shortlists (id, questionnaire_answers_id, requirements, version) VALUES (?, ?, ?, ?)',
        shortlistId, answersId, JSON.stringify(requirements), '1.0'
      );
      
      const shortlist = await db.get('SELECT * FROM shortlists WHERE id = ?', shortlistId);
      
      expect(shortlist).to.exist;
      expect(JSON.parse(shortlist.requirements)).to.deep.equal(requirements);
      expect(shortlist.version).to.equal('1.0');
    });
  });

  describe('AuditLog Table', () => {
    it('should record audit log entries', async () => {
      const userId = 'test-user-808';
      
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        userId, 'Test User', 'test@example.com', 'hash', 'developer'
      );
      
      const changes = { name: 'Updated Name', email: 'new@example.com' };
      
      await db.run(
        'INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)',
        userId, 'update', 'user', userId, JSON.stringify(changes)
      );
      
      const logEntry = await db.get('SELECT * FROM audit_log WHERE user_id = ? ORDER BY id DESC LIMIT 1', userId);
      
      expect(logEntry).to.exist;
      expect(logEntry.action).to.equal('update');
      expect(logEntry.entity_type).to.equal('user');
      expect(JSON.parse(logEntry.changes)).to.deep.equal(changes);
    });
  });

  // Clean up test database after all tests
  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
});
