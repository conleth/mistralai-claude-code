-- Create User table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'developer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Questionnaire table
CREATE TABLE IF NOT EXISTS questionnaires (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_template BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create QuestionnaireAnswers table
CREATE TABLE IF NOT EXISTS questionnaire_answers (
  id TEXT PRIMARY KEY,
  questionnaire_id TEXT NOT NULL,
  answers JSON NOT NULL,
  version TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Shortlist table
CREATE TABLE IF NOT EXISTS shortlists (
  id TEXT PRIMARY KEY,
  questionnaire_answers_id TEXT NOT NULL,
  requirements JSON NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version TEXT NOT NULL,
  FOREIGN KEY (questionnaire_answers_id) REFERENCES questionnaire_answers(id)
);

-- Create RequirementStatus table
CREATE TABLE IF NOT EXISTS requirement_status (
  id TEXT PRIMARY KEY,
  shortlist_id TEXT NOT NULL,
  requirement_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assignee TEXT,
  notes TEXT,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (shortlist_id) REFERENCES shortlists(id),
  FOREIGN KEY (assignee) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  UNIQUE(shortlist_id, requirement_id)
);

-- Create Comment table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  shortlist_id TEXT NOT NULL,
  requirement_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shortlist_id) REFERENCES shortlists(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create AuditLog table
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  changes JSON,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questionnaire_answers_questionnaire ON questionnaire_answers(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_requirement_status_shortlist ON requirement_status(shortlist_id);
CREATE INDEX IF NOT EXISTS idx_comments_shortlist ON comments(shortlist_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
