from typing import Literal, Optional

from litellm.integrations.custom_logger import CustomLogger
from litellm.proxy.proxy_server import DualCache, UserAPIKeyAuth


class ProxyHookStripClaudeExtras(CustomLogger):
    """
    LiteLLM callback to strip Anthropic-only fields Claude Code sends that
    Mistral rejects. Follows LiteLLM's documented hook shape.
    """
    @staticmethod
    def _normalize_messages(data: dict) -> dict:
        msgs = data.get("messages")
        if not isinstance(msgs, list):
            return data
        # Claude Code sometimes sends assistant "stub" turns (e.g., "{")
        # which Mistral rejects if they appear anywhere. Drop all assistant
        # role entries so the last role is user/tool.
        cleaned = [m for m in msgs if m.get("role") != "assistant"]
        if cleaned:
            data["messages"] = cleaned
        else:
            data.pop("messages", None)
        return data

    async def async_pre_call_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        cache: DualCache,
        data: dict,
        call_type: Literal[
            "completion",
            "text_completion",
            "embeddings",
            "image_generation",
            "moderation",
            "audio_transcription",
        ],
    ) -> Optional[dict]:
        # Claude-only control blocks; Mistral 422s without stripping.
        data.pop("context_management", None)
        # Uncomment if future errors show these:
        # data.pop("thinking", None)
        # data.pop("reasoning", None)
        data = self._normalize_messages(data)
        return data


# Module-level instance LiteLLM will import per docs
proxy_handler_instance = ProxyHookStripClaudeExtras()
