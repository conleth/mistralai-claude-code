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

🚧 **Early Development** - See [docs/FINDINGS.md](./docs/FINDINGS.md) for research and architecture decisions.

### Roadmap

**Phase 1 - MVP (Current)**
- [ ] Ingest OWASP ASVS 5.0 & SPVS 1.0
- [ ] Build rules engine with tests
- [ ] Create minimum questionnaire (6-8 questions)
- [ ] Generate shortlist with rationale
- [ ] Basic checklist UI
- [ ] Export to JSON/CSV/Markdown

**Phase 2 - Collaboration**
- [ ] SQLite persistence
- [ ] Status tracking workflow
- [ ] Role-based views
- [ ] Comments & audit trail

**Phase 3 - Integrations**
- [ ] Rally adapter
- [ ] Jira adapter
- [ ] Bidirectional status sync

## Documentation

- [Research Findings](./docs/FINDINGS.md) - DeepWiki analysis and architecture decisions
- [Project Instructions](./.claude/CLAUDE.md) - Development guidelines and principles

## License

MIT
