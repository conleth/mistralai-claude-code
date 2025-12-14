# Phase 2 - Collaboration Features - Plan

## Overview

Phase 2 focuses on adding collaboration features to Security RAT Modern, enabling teams to work together on security requirements checklists with persistence, status tracking, and audit trails.

## Goals

1. **Persistence**: Store questionnaire answers and shortlists in SQLite
2. **Status Tracking**: Track requirement completion status
3. **Comments**: Add notes and discussions per requirement
4. **Multi-user**: Support role-based views and access control
5. **Audit Trail**: Track changes and provide history

## Implementation Plan

### 1. Database Schema

```typescript
// User
{
  id: string (UUID)
  name: string
  email: string
  role: 'security-lead' | 'developer' | 'product-manager' | 'auditor'
  createdAt: Date
  updatedAt: Date
}

// Questionnaire
{
  id: string (UUID)
  name: string
  description: string
  createdBy: string (userId)
  createdAt: Date
  updatedAt: Date
  isTemplate: boolean
}

// QuestionnaireAnswers
{
  id: string (UUID)
  questionnaireId: string
  answers: QuestionnaireAnswers
  createdBy: string (userId)
  createdAt: Date
  updatedAt: Date
  version: number
}

// Shortlist
{
  id: string (UUID)
  questionnaireAnswersId: string
  requirements: ShortlistedRequirement[]
  generatedAt: Date
  version: string // e.g., "5.0.0"
}

// RequirementStatus
{
  id: string (UUID)
  shortlistId: string
  requirementId: string // canonical ID
  status: 'pending' | 'inProgress' | 'completed' | 'notApplicable'
  assignee: string (userId) | null
  notes: string
  updatedBy: string (userId)
  updatedAt: Date
  completedAt: Date | null
}

// Comment
{
  id: string (UUID)
  requirementStatusId: string
  text: string
  createdBy: string (userId)
  createdAt: Date
  updatedAt: Date
}

// AuditLog
{
  id: string (UUID)
  userId: string
  action: 'create' | 'update' | 'delete' | 'export'
  entityType: 'questionnaire' | 'answers' | 'shortlist' | 'status' | 'comment'
  entityId: string
  changes: Record<string, any> // oldValue/newValue
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}
```

### 2. Database Migration Strategy

- Use **SQLite** for local development
- Use **PostgreSQL** for production
- Implement **migration system** using `knex` or similar
- Version migrations with timestamps

### 3. API Endpoints

#### Questionnaire
- `GET /api/v1/questionnaires` - List all questionnaires
- `POST /api/v1/questionnaires` - Create new questionnaire
- `GET /api/v1/questionnaires/:id` - Get questionnaire details
- `PUT /api/v1/questionnaires/:id` - Update questionnaire
- `DELETE /api/v1/questionnaires/:id` - Delete questionnaire

#### Answers
- `POST /api/v1/questionnaires/:id/answers` - Save answers
- `GET /api/v1/questionnaires/:id/answers` - Get saved answers
- `GET /api/v1/questionnaires/:id/answers/:version` - Get specific version
- `PUT /api/v1/questionnaires/:id/answers/:version` - Update answers

#### Shortlist
- `POST /api/v1/shortlist` - Generate shortlist from answers
- `GET /api/v1/shortlist/:id` - Get shortlist by ID
- `GET /api/v1/shortlist/:id/export` - Export shortlist (JSON/CSV/Markdown)

#### Status
- `GET /api/v1/shortlist/:id/status` - Get all statuses
- `GET /api/v1/shortlist/:id/status/:requirementId` - Get status for specific requirement
- `PUT /api/v1/shortlist/:id/status/:requirementId` - Update status
- `PATCH /api/v1/shortlist/:id/status/:requirementId/assign` - Assign to user
- `PATCH /api/v1/shortlist/:id/status/:requirementId/complete` - Mark as completed

#### Comments
- `GET /api/v1/shortlist/:id/comments` - Get all comments
- `POST /api/v1/shortlist/:id/comments` - Add new comment
- `PUT /api/v1/shortlist/:id/comments/:commentId` - Update comment
- `DELETE /api/v1/shortlist/:id/comments/:commentId` - Delete comment

#### Audit
- `GET /api/v1/audit` - Get audit log (filtered by user/date)
- `GET /api/v1/audit/:entityType/:entityId` - Get audit log for specific entity

### 4. Frontend Changes

#### New Pages
- **Dashboard**: Overview of all questionnaires and shortlists
- **Questionnaire List**: List all saved questionnaires
- **Shortlist View**: Detailed view with status tracking
- **History View**: Version history and changes
- **Export View**: Export options (JSON, CSV, Markdown)

#### New Components
- **Status Badge**: Visual indicator of requirement status
- **Comment Thread**: Collapsible comment section
- **Assignment Dropdown**: User assignment selector
- **Version Selector**: Switch between answer versions
- **Audit Trail**: Timeline of changes

### 5. Authentication Strategy

**For Phase 2 (Development):**
- Simple JWT-based authentication
- Local user management (SQLite)
- Role-based access control

**For Phase 3 (Production):**
- OAuth integration (Google, GitHub, etc.)
- LDAP/Active Directory support
- SSO integration

### 6. Data Migration from Phase 1

**Strategy**: Import existing data structure

```typescript
// Migration script
function migratePhase1Data() {
  // Import questionnaire answers from localStorage/sessionStorage
  // Create initial Questionnaire and QuestionnaireAnswers records
  // Generate initial Shortlist
  // Set default statuses (all 'pending')
  // Create audit log entries for migration
}
```

### 7. Testing Strategy

#### Unit Tests
- Database operations (CRUD)
- Business logic (status transitions, assignments)
- Validation (input sanitization, role checks)

#### Integration Tests
- API endpoints
- Database transactions
- Authentication flows

#### E2E Tests
- User workflows (create questionnaire → generate shortlist → update status)
- Export functionality
- Audit trail verification

### 8. Deployment Strategy

#### Local Development
- SQLite database file in project root
- Environment variables for configuration
- Hot reloading for frontend

#### Production
- PostgreSQL database
- Connection pooling
- Backup strategy
- Migration management

### 9. Timeline

| Task | Estimated Time | Status |
|------|----------------|--------|
| Database schema design | 2 days | Not started |
| API endpoints | 3 days | Not started |
| Frontend components | 4 days | Not started |
| Authentication | 2 days | Not started |
| Testing | 3 days | Not started |
| Documentation | 2 days | Not started |
| **Total** | **18 days** | Not started |

### 10. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Database migration issues | Comprehensive backup before migration, rollback plan |
| Performance with large datasets | Implement pagination, indexing, caching |
| Authentication complexity | Start with simple JWT, upgrade later |
| Frontend state management | Use existing patterns, keep components simple |
| Data consistency | Use transactions, validate all inputs |

### 11. Dependencies

**New Dependencies:**
- `better-sqlite3` or `knex` for SQLite
- `pg` for PostgreSQL (future)
- `jsonwebtoken` for JWT authentication
- `bcrypt` for password hashing
- `zod` for schema validation (already present)

**Existing Dependencies:**
- Fastify (backend)
- React (frontend)
- TypeScript
- Vitest (testing)

## Next Steps

1. **Start with database schema** - Design and implement SQLite schema
2. **Implement API endpoints** - Build backend CRUD operations
3. **Create frontend components** - Build UI for new features
4. **Add authentication** - Implement JWT-based auth
5. **Write tests** - Ensure all functionality is tested
6. **Document** - Update guides and add new documentation

## Related Documentation

- **[SETUP_GUIDE.md](../../SETUP_GUIDE.md)** - Development workflow
- **[IMPLEMENTATION_SUMMARY.md](../../IMPLEMENTATION_SUMMARY.md)** - Phase 1 details
- **[.vibe/MISTRAL.md](../../.vibe/MISTRAL.md)** - Development guidelines
