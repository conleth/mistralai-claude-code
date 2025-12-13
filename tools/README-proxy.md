# Mistral AI with Claude Code via LiteLLM Proxy

This setup uses LiteLLM proxy to front Mistral AI models with OpenAI-compatible endpoints, allowing you to use Claude Code CLI with Mistral models.

## Authentication Setup

The proxy now requires authentication using a master key.

### 1. Configure Environment Variables

Edit `.env` and set:

```bash
# Generate a secure master key (or use your own)
openssl rand -hex 32

# Set the keys in .env:
LITELLM_MASTER_KEY=your_secure_key_here
MISTRAL_API_KEY=your_mistral_api_key_here

# Claude CLI will use the master key to authenticate
ANTHROPIC_API_KEY=your_secure_key_here  # Same as LITELLM_MASTER_KEY
ANTHROPIC_BASE_URL=http://0.0.0.0:8787
```

### 2. Start the Proxy

```bash
# Load environment variables
source .env  # or: export $(cat .env | xargs)

# Start LiteLLM proxy
litellm --config litellm.yaml
```

### 3. Use with Claude Code

The proxy will now require the master key for all requests:

```bash
# Claude CLI will automatically use ANTHROPIC_API_KEY from .env
# to authenticate with the proxy
claude-code
```

## Available Models

- `mistral-small` -> mistral/mistral-small-latest
- `mistral-tiny` -> mistral/mistral-tiny

## Endpoints

- OpenAI-compatible: `http://127.0.0.1:8787/v1/chat/completions`

## Testing Authentication

Test the proxy with curl:

```bash
# This should fail (no auth)
curl http://localhost:8787/v1/models

# This should succeed (with auth)
curl http://localhost:8787/v1/models \
  -H "Authorization: Bearer sk-1234567890abcdef1234567890abcdef"
```

## Security Notes

- Keep your `LITELLM_MASTER_KEY` secure and never commit it to git
- The `.env` file is gitignored
- Use a strong random key generated with `openssl rand -hex 32`
- Both `ANTHROPIC_API_KEY` and `LITELLM_MASTER_KEY` should match for Claude CLI to authenticate with the proxy
