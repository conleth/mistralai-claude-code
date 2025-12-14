# Security RAT Modern - Setup Guide

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mistralai-claude-code
```

### 2. Run Initialization Checks

```bash
bash tools/init.sh
```

This will verify your environment and project setup.

### 3. Install Dependencies

```bash
npm install
```

### 4. Build the Project

```bash
npm run build
```

### 5. Run Type Checks

```bash
npm run typecheck
```

## Project Structure

```
/
├── apps/
│   ├── frontend/      # React + Vite + shadcn/ui
│   └── backend/       # Fastify API
├── packages/
│   ├── types/         # Shared TypeScript interfaces
│   ├── rules-engine/  # Deterministic requirement filtering
│   ├── standards/     # OWASP ASVS/SPVS data ingestion
│   └── questionnaire/ # Questionnaire definition
├── docs/              # Documentation
├── tools/             # Development tools (init.sh, proxy scripts)
└── .vibe/             # Mistral Vibe-specific documentation
```

## Development Workflow

### Running the Init Script

The `tools/init.sh` script performs comprehensive checks:

```bash
# Basic check
bash tools/init.sh

# Check specific component
bash tools/init.sh 2>&1 | grep -A10 "Implementation Files"
```

### Working with Packages

Each package has its own scripts:

```bash
# Build a specific package
npm run build --workspace=packages/rules-engine

# Run tests for a specific package
npm run test --workspace=packages/rules-engine

# Type check a specific package
npm run typecheck --workspace=packages/rules-engine
```

### Common Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Type checking
npm run typecheck

# Development mode
npm run dev

# Clean build artifacts
npm run clean
```

## Implementation Overview

### Core Components

1. **Types Package** (`packages/types`)
   - Shared TypeScript interfaces
   - Defines data models for requirements, questionnaires, and rules

2. **Rules Engine** (`packages/rules-engine`)
   - Deterministic requirement filtering
   - Computes derived attributes from questionnaire answers
   - Evaluates declarative rules
   - Generates rationale for requirement inclusion

3. **Standards Package** (`packages/standards`)
   - Ingests OWASP ASVS 5.0 and SPVS 1.0
   - Validates requirement IDs
   - Provides normalized access to requirements

4. **Questionnaire Package** (`packages/questionnaire`)
   - Defines 6 essential questions
   - Validates answers
   - Computes progress

### Key Features

- **Deterministic**: Same inputs → identical outputs
- **Traceable**: Every requirement links to source standard
- **Declarative**: Rules as data structures
- **Extensible**: Adapter pattern for integrations

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --workspace=packages/rules-engine
```

### Test Coverage

- **Rules Engine**: 11 test cases
- **Standards**: 20 test cases
- **Questionnaire**: 22 test cases
- **Integration**: 5 test cases
- **Total**: 58 test cases

## Data Files

### ASVS 5.0

- **Location**: `packages/standards/data/asvs-5.0.json`
- **Requirements**: 20 requirements
- **Format**: JSON with version, requirements array

### SPVS 1.0

- **Location**: `packages/standards/data/spvs-1.0.json`
- **Requirements**: 15 requirements
- **Format**: JSON with version, requirements array

## Example Usage

### Generating a Shortlist

```typescript
import { generateShortlist } from '@security-rat/rules-engine';

const answers = {
  'app-type': 'web',
  'auth-type': 'oauth',
  'data-sensitivity': 'confidential',
  'internet-exposed': 'public',
  'hosting-model': 'cloud',
  'pipeline-maturity': 'intermediate',
};

const shortlist = await generateShortlist(answers);
// Returns array of ShortlistedRequirement objects
```

### Loading Standards Data

```typescript
import { loadStandard, getRequirementsByLevel } from '@security-rat/standards';

// Load all ASVS requirements
const asvsRequirements = await loadStandard('ASVS', '5.0.0');

// Get L1 requirements only
const l1Requirements = await getRequirementsByLevel('ASVS', '5.0.0', 'L1');
```

### Working with Questionnaire

```typescript
import { 
  MINIMUM_QUESTIONNAIRE, 
  DEFAULT_ANSWERS, 
  validateAnswers, 
  getProgress 
} from '@security-rat/questionnaire';

// Get all questions
const questions = MINIMUM_QUESTIONNAIRE;

// Validate answers
const isValid = validateAnswers(answers);

// Get completion percentage
const progress = getProgress(answers);
```

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow existing patterns in the codebase
- Keep functions pure and deterministic
- Write comprehensive tests

### Adding New Rules

1. Define the rule in declarative format
2. Add to the rules array
3. Write unit tests
4. Verify determinism

### Adding New Standards

1. Create data file in `packages/standards/data/`
2. Update ingestion logic
3. Add validation for new ID format
4. Write tests

### Adding New Questions

1. Add to `MINIMUM_QUESTIONNAIRE`
2. Update derived attributes logic
3. Update rules that depend on new attributes
4. Write tests

## Troubleshooting

### Common Issues

**Issue**: Node.js version too old
**Solution**: Upgrade to Node.js 20.0.0 or higher

**Issue**: npm version too old
**Solution**: Upgrade to npm 10.0.0 or higher

**Issue**: Missing dependencies
**Solution**: Run `npm install`

**Issue**: TypeScript errors
**Solution**: Run `npm run typecheck` to identify issues

**Issue**: Build failures
**Solution**: Run `npm run clean` then `npm install` then `npm run build`

### Debugging

```bash
# Check project structure
bash tools/init.sh

# Check specific package
cd packages/rules-engine
npm run typecheck

# Run specific test file
npm run test -- packages/rules-engine/src/index.test.ts
```

## Documentation

- **README.md**: Project overview
- **docs/FINDINGS.md**: Research and architecture decisions
- **.claude/CLAUDE.md**: Development guidelines
- **.vibe/MISTRAL.md**: Mistral Vibe-specific guide
- **IMPLEMENTATION_SUMMARY.md**: Implementation details
- **SETUP_GUIDE.md**: This guide
- **tools/README.md**: Tools directory documentation

## Next Steps

### Phase 2 - Collaboration Features

- Add SQLite persistence
- Implement status tracking
- Add comments/notes
- Multi-user support
- Audit trails

### Phase 3 - Integrations

- Rally adapter
- Jira adapter
- Bidirectional sync
- Bulk operations

### Phase 4 - Advanced Features

- Exclusion reports
- What-if analysis
- Search across standards
- Custom requirements

## Support

For questions or issues:
1. Check existing documentation
2. Review the init script output
3. Examine test cases for patterns
4. Ask about specific requirements or use cases

Remember: **Determinism > Convenience** and **Traceability > Simplicity**
