# DeepWiki Research Findings - Security RAT Modernization

**Date:** 2025-12-13
**Sources:** SecurityRAT, RatModern, OWASP ASVS 5.0, OWASP SPVS 1.0

---

## Executive Summary

After analyzing the legacy SecurityRAT, the modern RatModern attempt, and the two primary requirement sources (ASVS and SPVS), this document outlines what to copy, what to avoid, what's missing, and what our implementation will do differently.

---

## 1. What to Copy (Proven Patterns)

### From SecurityRAT (Legacy)
✅ **Parametric Requirement Generation**
- Context-based filtering using artifact parameters (project type, tech stack, deployment model)
- Separates immutable requirement definitions from mutable project state
- Multi-dimensional tagging for requirement classification
- **Why:** Reduces manual effort and ensures consistency

✅ **Questionnaire-Driven Workflow**
- Small set of questions determines applicable requirements
- Progressive disclosure rather than overwhelming flat lists
- **Why:** Aligns with our "minimum question set" goal

✅ **Clean Separation of Concerns**
- Requirements catalog (backend/static) vs. user selections (frontend state)
- Alternative implementations modeled separately from requirements
- **Why:** Enables deterministic results and easier testing

✅ **Ticketing Integration Pattern**
- Export complete state as YAML for traceability
- Individual requirements become tickets linked to parent
- **Why:** Supports our adapter-based ticketing goal

### From RatModern (Modern Attempt)
✅ **Tech Stack Choices**
- React 18 + Vite (fast HMR)
- shadcn/ui components (Radix UI + Tailwind)
- TypeScript strict mode + Zod validation
- Fastify backend
- **Why:** Modern, performant, type-safe, aligns with our requirements

✅ **Custom Hooks Pattern**
- Encapsulates filter management, API orchestration, selection tracking
- Pages focus on rendering, hooks handle business logic
- **Why:** Clean separation, testable, reusable

✅ **Processing Pipeline Architecture**
```
Static OWASP Data → Flatten Hierarchy → Apply Mappings → Filter by Dimensions → UI
```
- **Why:** Keeps filtering logic independent of data structure changes

✅ **Adapter Pattern for Ticketing**
- Interface defines: authenticate, createTickets, linkTickets, updateStatus
- Vendor-specific logic isolated in adapter modules
- **Why:** Extensible without modifying core code

✅ **Multi-Dimensional Filtering**
- Supports 6+ simultaneous filters (level, app type, role, discipline, tech, categories)
- Independent mapping logic per dimension
- **Why:** Matches our derived-attributes approach

### From OWASP ASVS
✅ **Canonical Requirement Format**
- ID: `v5.0.0-<chapter>.<section>.<requirement>` (e.g., `v5.0.0-1.2.5`)
- Three verification levels (L1: 20%, L2: ~70%, L3: 100% of 345 requirements)
- Rich metadata: description, level, CWE mappings, NIST references
- **Why:** Provides traceability and standardization

✅ **Version Mapping Strategy**
- YAML files track requirement evolution with tags (MOVED, SPLIT, MERGED, DELETED, ADDED, MODIFIED)
- **Why:** Supports migration between standard versions

### From OWASP SPVS
✅ **Pipeline-Specific Structure**
- Five lifecycle stages: V1 Plan, V2 Develop, V3 Integrate, V4 Release, V5 Operate
- 115 requirements with three maturity levels (37 L1, 48 L2, 30 L3)
- ID format: `V#.#.#` (category.subcategory.requirement)
- **Why:** Addresses pipeline security distinctly from application security

✅ **Triple Mapping Strategy**
- Every requirement maps to: NIST 800-53, OWASP CI/CD Top 10, CWE
- **Why:** Enables compliance reporting and threat correlation

---

## 2. What to Avoid (Anti-Patterns)

### From SecurityRAT
❌ **AngularJS 1.7.8 Legacy Stack**
- Outdated framework, Bower/Grunt build tools
- **Why:** No ecosystem support, security risks, poor DX

❌ **Scattered Business Logic**
- Filtering rules embedded across frontend controllers
- **Why:** Non-deterministic, hard to test, violates our "declarative rules" requirement

❌ **Tight Coupling to Jira**
- Vendor-specific logic throughout codebase
- **Why:** Makes adding other ticketing systems difficult

❌ **Heavy Spring Boot Configuration**
- Hibernate 5.4, complex XML configs
- **Why:** Overkill for our use case, slow startup

### From RatModern
❌ **Static File Dependency**
- Manually copying ASVS JSON/CSV into repo
- **Why:** Error-prone, version drift risk, no automation

❌ **In-Memory Only State**
- No persistence layer (by design, but limiting)
- **Why:** Loses collaboration features, audit trails, multi-user workflows

❌ **Limited Testing Coverage**
- Infrastructure exists but not extensively used
- **Why:** Risks regression as we add features

❌ **Single Standard Focus Initially**
- ASVS well-integrated, SPVS less developed
- **Why:** We need both from day one

---

## 3. What's Missing (Gaps)

### Cross-Standard Integration
- Neither system provides unified filtering across ASVS + SPVS
- **Impact:** Teams managing both web apps and pipelines need separate tools

### Exclusion Transparency
- No "why was requirement X excluded?" explanations
- **Impact:** Security teams can't audit/validate filtering logic

### Rationale Generation
- No deterministic explanation of why each requirement applies
- **Impact:** Developers don't understand context for requirements

### Role-Based Views
- RatModern has "discipline" filtering but not full role-based UX
- **Impact:** Product managers see developer implementation details

### Collaborative Editing
- No multi-user workflows, comments, review states
- **Impact:** Checklist becomes single-author document

### Audit Trails
- No history of who changed what selections when
- **Impact:** Compliance evidence gaps

### Advanced Ticketing Features
- Basic create/link only, no status sync, no bulk updates
- **Impact:** Manual reconciliation between tools

---

## 4. What We'll Do Differently

### Architecture Decisions

**1. Hybrid Persistence Strategy**
```
OWASP Data (read-only): Static JSON/CSV checked into repo + automated sync script
User Data (read-write): SQLite (dev) / PostgreSQL (prod) for questionnaires, checklists, tickets
```
- **Why:** Balances simplicity (standards rarely change) with collaboration needs (user data changes frequently)

**2. Rules Engine as First-Class Module**
```typescript
// Declarative rule format
interface RequirementRule {
  standard: 'ASVS' | 'SPVS'
  requirementId: string
  conditions: {
    field: string // derived attribute or requirement metadata
    operator: 'equals' | 'includes' | 'greaterThan' | 'lessThan'
    value: string | number | boolean
  }[]
  rationale: string // template with {field} placeholders
}
```
- **Why:** Makes rules testable, auditable, and editable without code changes

**3. Unified Data Model**
```typescript
interface ShortlistedRequirement {
  // Traceability (immutable)
  standard: 'ASVS' | 'SPVS'
  standardVersion: string // e.g., "5.0.0"
  requirementId: string // canonical ID from standard
  title: string
  description: string

  // Classification (from standard)
  level: 'L1' | 'L2' | 'L3'
  category: string // ASVS chapter or SPVS stage
  tags: string[] // role, platform, etc.

  // Derivation (our logic)
  rationale: string // why this requirement applies
  derivedFrom: {
    questionnaireAnswers: Record<string, string>
    ruleIds: string[]
  }

  // User state (mutable)
  status: 'pending' | 'inProgress' | 'completed' | 'notApplicable'
  assignee?: string
  ticketLink?: string
  notes?: string
}
```
- **Why:** Preserves traceability while supporting workflow

**4. Exclusion Reporting**
```typescript
interface ExcludedRequirement extends ShortlistedRequirement {
  exclusionReason: string // template explaining why filtered out
  couldIncludeIf: string[] // what questionnaire changes would include it
}
```
- **Why:** Enables audit and validation of filtering logic

**5. Questionnaire Structure**
```typescript
interface Question {
  id: string
  text: string
  type: 'single-select' | 'multi-select' | 'boolean'
  options: { value: string; label: string; description?: string }[]
  helpText?: string
  dependsOn?: { questionId: string; expectedValue: string }[] // conditional questions
}

// Derived attributes computed from answers
interface DerivedAttributes {
  internetExposed: boolean
  requiresAuth: boolean
  handlesRegulatedData: boolean
  usesMobileClient: boolean
  recommendedASVSLevel: 'L1' | 'L2' | 'L3'
  recommendedSPVSLevel: 'L1' | 'L2' | 'L3'
  applicableASVSCategories: string[]
  applicableSPVSStages: string[]
}
```
- **Why:** Keeps rules simple by computing intermediate values

**6. Role-Based Filtering**
```typescript
type Role = 'security-lead' | 'developer' | 'product-manager' | 'auditor'

interface RoleView {
  role: Role
  visibleFields: (keyof ShortlistedRequirement)[]
  allowedActions: ('view' | 'edit' | 'comment' | 'assign' | 'export')[]
  defaultSort: { field: string; direction: 'asc' | 'desc' }
  groupBy?: string // e.g., 'category' for security-lead, 'assignee' for developers
}
```
- **Why:** Tailors UX to different user needs

### Implementation Priorities (MVP → Full)

**Phase 1 - MVP (Deterministic Core)**
- [x] DeepWiki research complete
- [ ] Ingest ASVS 5.0 + SPVS 1.0 as JSON
- [ ] Build rules engine module with tests
- [ ] Create minimum questionnaire (6-8 questions)
- [ ] Implement derived attributes calculator
- [ ] Generate shortlist with rationale
- [ ] Export to JSON/CSV/Markdown
- [ ] Basic shadcn/ui checklist view

**Phase 2 - Collaboration**
- [ ] Add SQLite persistence for user data
- [ ] Implement status tracking workflow
- [ ] Add comments/notes per requirement
- [ ] Multi-user support with role-based views
- [ ] Audit trail for state changes

**Phase 3 - Integrations**
- [ ] Rally adapter (from RatModern)
- [ ] Jira adapter
- [ ] Bidirectional status sync
- [ ] Bulk ticket operations

**Phase 4 - Advanced Features**
- [ ] Exclusion report generation
- [ ] "What-if" analysis (change answers, preview impact)
- [ ] Requirement search across standards
- [ ] Custom requirement additions
- [ ] Version migration support (ASVS 4→5)

---

## Key Architectural Principles

1. **Determinism First**: Same questionnaire answers → identical shortlist (no LLM randomness)
2. **Traceability Always**: Every shortlisted item links to standard + version + canonical ID
3. **Rules as Data**: Filtering logic lives in declarative structures, not code branches
4. **Separation of Concerns**: Standards (static) | Rules (versioned data) | User State (database)
5. **Progressive Disclosure**: Start with minimum questions, expand only if needed
6. **Extensibility by Default**: Adapters for ticketing, plugins for standards, hooks for customization

---

## Success Metrics

A successful implementation will:
- Generate identical output for identical inputs (unit tested)
- Trace every requirement to source standard with version
- Support both ASVS and SPVS from launch
- Export checklists in 3+ formats
- Integrate with 2+ ticketing systems via adapters
- Handle questionnaire changes with <100ms UI update
- Maintain rules engine test coverage >90%

---

## Next Steps

1. Set up project structure (frontend + backend monorepo)
2. Define TypeScript interfaces for all data models
3. Write rules engine with test fixtures
4. Ingest ASVS 5.0 JSON (validate structure)
5. Ingest SPVS 1.0 CSV (validate structure)
6. Build questionnaire with first 6 questions
7. Implement derived attributes logic
8. Create proof-of-concept shortlist generation

---

**End of Findings**
