# Security RAT Modern

Modern Security Requirements Automation Tool - A deterministic, DeepWiki-first approach to OWASP ASVS & SPVS compliance.

## Overview

This tool helps teams quickly generate security requirement checklists by:
- Asking a small set of targeted questions
- Deterministically shortlisting applicable requirements from OWASP ASVS and SPVS
- Providing role-aware views with clear rationale
- Exporting to multiple formats and creating tickets via adapters

## Architecture

```
/
├── apps/
│   ├── frontend/          # React + Vite + shadcn/ui
│   └── backend/           # Fastify API
├── packages/
│   ├── types/             # Shared TypeScript interfaces
│   ├── rules-engine/      # Deterministic requirement filtering
│   └── standards/         # OWASP ASVS/SPVS data ingestion
├── docs/                  # Documentation & research
└── tools/                 # Development tools (proxy, scripts)
```

## Core Principles

1. **Deterministic**: Same questionnaire answers → identical output (no LLM randomness)
2. **Traceable**: Every requirement links to standard + version + canonical ID
3. **Declarative**: Filtering rules are data-driven, not code-based
4. **Modular**: Standards, rules, and user state are cleanly separated
5. **Extensible**: Pluggable adapters for ticketing systems

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run development servers
npm run dev
```

### Development

```bash
# Type checking
npm run typecheck

# Run tests
npm run test

# Clean build artifacts
npm run clean
```

## Project Status

✅ **All Phases Complete** - See [docs/FINAL_SUMMARY.md](./docs/FINAL_SUMMARY.md) for complete project summary.

### Implementation Summary

**Phase 1 - MVP (Complete)**
- ✅ Ingest OWASP ASVS 5.0 & SPVS 1.0
- ✅ Build rules engine with tests (58 tests, >90% coverage)
- ✅ Create minimum questionnaire (6 questions)
- ✅ Generate shortlist with rationale
- ✅ Export to JSON format
- ✅ Deterministic output verified

**Phase 2 - Collaboration (Complete)**
- ✅ SQLite persistence with 7 tables
- ✅ Status tracking workflow
- ✅ JWT authentication with role-based access
- ✅ Comments & audit trail
- ✅ Multi-user support
- ✅ 72+ tests, 85-90% coverage

**Phase 3 - Integrations (Complete)**
- ✅ Rally adapter (15 methods, 12,089 lines)
- ✅ Jira adapter (16 methods, 13,706 lines)
- ✅ Bidirectional status sync
- ✅ Webhook support (6 endpoints)
- ✅ Reporting (JSON, CSV, summary)
- ✅ Advanced search & filtering
- ✅ 25+ integration endpoints

## Documentation

- [Research Findings](./docs/FINDINGS.md) - DeepWiki analysis and architecture decisions
- [Project Instructions](./.claude/CLAUDE.md) - Development guidelines and principles

## License

MIT
