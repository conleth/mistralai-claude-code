# Using Claude Code with Mistral via LiteLLM

This repo points the Claude Code CLI at a local LiteLLM proxy that forwards to Mistral. Use this as a quick runbook.

## Environment
- Set once per shell:
  - `export ANTHROPIC_BASE_URL=http://127.0.0.1:4000`
  - `export ANTHROPIC_API_KEY=lcl-local`
  - `export ANTHROPIC_AUTH_TOKEN=lcl-local`
- Mistral key lives in `.env` as `MISTRAL_API_KEY=...` (loaded by the start script).

## Start the proxy
From repo root:
```bash
PYTHONPATH="$(pwd)/tools:$(pwd)" ./tools/start-litellm.sh --detailed_debug
```
Notes:
- Binds to `0.0.0.0:4000` (if 4000 is busy LiteLLM may pick another port; fix by stopping other litellm processes).
- Uses config `tools/litellm.yaml` and hook `tools/litellm_hooks.py` to strip Claude-only fields.
- Master key is hardcoded to `lcl-local` (`general_settings.master_key`).

## Point Claude Code at the proxy
- If the CLI warns about auth conflicts, run `/logout` then restart `claude` with the env vars above.
- `.claude/settings.local.json` already sets `ANTHROPIC_BASE_URL` and the master key if you keep those values.

## Verify it is Mistral (not Anthropic)
Curl through the proxy and inspect the response model:
```bash
curl -sS -X POST http://127.0.0.1:4000/v1/messages?beta=true \
  -H "Authorization: Bearer lcl-local" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-haiku-4-5-20251001","messages":[{"role":"user","content":[{"type":"text","text":"ping"}]}],"max_tokens":32}' | jq
```
- You should see `"model": "mistral-small-latest"` in the response.
- LiteLLM debug logs will show an outbound POST to `https://api.mistral.ai/v1/chat/completions`.

## Internals (for future edits)
- Proxy config: `tools/litellm.yaml` maps Claude model names to Mistral and sets `callbacks: litellm_hooks.proxy_handler_instance`.
- Hook: `tools/litellm_hooks.py` removes `context_management` and drops all `assistant` role stubs before forwarding (prevents Mistral 400 `invalid_request_message_order`).
- Startup helper: `tools/start-litellm.sh` loads `.env`, sets `PYTHONPATH`, enforces `LITELLM_MASTER_KEY`, then runs LiteLLM.

## Dev container + `--dangerously-skip-permissions`
- Devcontainer config: `.devcontainer/devcontainer.json` (Node 20, Python 3.10, installs `claude` CLI and `litellm`).
- Inside the container:
  ```bash
  source .env  # loads MISTRAL_API_KEY (not committed)
  PYTHONPATH="$(pwd)/tools:$(pwd)" ./tools/start-litellm.sh --detailed_debug
  ```
  New terminal in the container:
  ```bash
  export ANTHROPIC_BASE_URL=http://127.0.0.1:4000
  export ANTHROPIC_API_KEY=lcl-local
  export ANTHROPIC_AUTH_TOKEN=lcl-local
  claude --dangerously-skip-permissions
  ```
- The flag only affects the container; host remains isolated. Keep secrets in `.env`, not baked into the image.

## If you see Anthropic branding in the CLI
The CLI UI always says “Claude/Sonnet” because of its built-in prompt. The backend call is still Mistral if the verification steps above pass. Use the curl check or the LiteLLM logs to confirm.
