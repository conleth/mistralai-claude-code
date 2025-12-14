# Tools Directory

## Init Script

The `init.sh` script performs comprehensive checks on the Security RAT Modern project setup.

### Usage

```bash
# Run initialization checks
bash tools/init.sh

# Or use npm script
npm run init
```

### What It Checks

1. **Prerequisites**
   - Node.js version (>= 20.0.0)
   - npm version (>= 10.0.0)

2. **Repository Status**
   - Git repository initialized
   - Current branch
   - Uncommitted changes detection

3. **Project Structure**
   - Verifies all expected directories exist

4. **Required Files**
   - package.json, tsconfig.json, .gitignore, README.md, etc.
   - .env configuration

5. **Workspace Packages**
   - apps/frontend, apps/backend
   - packages/types, packages/rules-engine, packages/standards, packages/questionnaire

6. **Implementation Files**
   - TypeScript source files
   - Test files
   - Data files (ASVS 5.0, SPVS 1.0)

7. **Dependencies**
   - Root node_modules
   - Workspace module linking

8. **TypeScript Configuration**
   - Root tsconfig.json
   - TypeScript compiler version

9. **Available Scripts**
   - Lists all npm scripts from package.json

### Output

The script provides color-coded output:
- ✓ **Green**: Success
- ⚠ **Yellow**: Warning
- ✗ **Red**: Error
- ℹ **Blue**: Information

### Exit Codes

- **0**: All checks passed or only warnings
- **1**: Errors detected

### State Snapshot

The script creates a `.init-state` file with:
- Node.js and npm versions
- Current branch
- Error and warning counts
- Timestamp of last check

## Other Tools

### start-litellm.sh

Proxy script for using Claude Code with Mistral via LiteLLM.

### litellm_hooks.py

Hooks for the LiteLLM proxy to strip Claude-only fields.

### litellm.yaml

Configuration for the LiteLLM proxy.
