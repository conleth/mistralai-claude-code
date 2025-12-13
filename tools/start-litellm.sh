#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load project .env if present (for MISTRAL_API_KEY, etc.)
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

# Required for callback import and Mistral auth
export PYTHONPATH="$ROOT_DIR/tools${PYTHONPATH:+:$PYTHONPATH}"
export LITELLM_MASTER_KEY="${LITELLM_MASTER_KEY:-lcl-local}"

echo "Starting LiteLLM on port 4000 with config tools/litellm.yaml"
echo "PYTHONPATH=$PYTHONPATH"
echo "LITELLM_MASTER_KEY=$LITELLM_MASTER_KEY"

exec litellm --config "$ROOT_DIR/tools/litellm.yaml" "$@"
