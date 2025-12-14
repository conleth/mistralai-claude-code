import json
from typing import Literal, Optional

from litellm.integrations.custom_logger import CustomLogger
from litellm.proxy.proxy_server import DualCache, UserAPIKeyAuth


class ProxyHookStripClaudeExtras(CustomLogger):
    """LiteLLM callback to translate Anthropic-style tool messages to Mistral.

    Claude Code speaks Anthropic's Messages schema (tool_use / tool_result blocks
    embedded in message content). Mistral expects OpenAI-style chat messages with
    assistant tool_calls and separate tool role responses. This hook rewrites
    the payload so Mistral accepts it instead of 400'ing with
    "Unexpected role 'tool' after role 'user'".
    """

    @staticmethod
    def _collapse_text_blocks(blocks) -> str:
        """Join text blocks (or plain strings) into a single string."""

        if isinstance(blocks, str):
            return blocks
        if not isinstance(blocks, list):
            return ""
        texts = []
        for b in blocks:
            if isinstance(b, str):
                texts.append(b)
            elif isinstance(b, dict) and b.get("type") == "text":
                txt = b.get("text")
                if txt:
                    texts.append(txt)
        return "\n".join(texts)

    @staticmethod
    def _stringify_tool_content(content) -> str:
        """Best-effort stringify Anthropic tool_result content for Mistral."""

        if content is None:
            return ""
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            return ProxyHookStripClaudeExtras._collapse_text_blocks(content)
        try:
            return json.dumps(content)
        except Exception:
            return str(content)

    @staticmethod
    def _convert_tools(tools):
        if not isinstance(tools, list):
            return None
        converted = []
        for tool in tools:
            if not isinstance(tool, dict):
                continue
            name = tool.get("name")
            if not name:
                continue
            input_schema = tool.get("input_schema") or {}
            converted.append(
                {
                    "type": "function",
                    "function": {
                        "name": name,
                        "description": tool.get("description"),
                        "parameters": input_schema,
                    },
                }
            )
        return converted or None

    @staticmethod
    def _ensure_last_role_ok(messages: list) -> list:
        """Ensure last role is acceptable to Mistral: user/tool or assistant with prefix."""
        if not isinstance(messages, list):
            return messages
        while messages and messages[-1].get("role") == "assistant":
            last = messages[-1]
            if last.get("tool_calls"):
                last["prefix"] = True
                break
            messages.pop()
        return messages

    @classmethod
    def _convert_messages(cls, data: dict) -> dict:
        msgs = data.get("messages")
        if not isinstance(msgs, list):
            return data

        # If messages already contain tool_calls or tool role entries, assume
        # they are already in OpenAI/Mistral shape and skip conversion.
        if any(m.get("role") == "tool" for m in msgs) or any(
            isinstance(m, dict) and "tool_calls" in m for m in msgs
        ):
            return data

        converted = []

        # Promote top-level Anthropic system into a message if present.
        system_prompt = data.pop("system", None)
        if system_prompt:
            converted.append({"role": "system", "content": system_prompt})

        for m in msgs:
            role = m.get("role")
            content = m.get("content")

            # Normalize to list of blocks for easier handling
            blocks = content if isinstance(content, list) else [content]

            if role == "assistant":
                texts = []
                tool_calls = []
                for b in blocks:
                    if isinstance(b, dict) and b.get("type") == "tool_use":
                        tool_calls.append(
                            {
                                "id": b.get("id") or b.get("tool_use_id") or "",
                                "type": "function",
                                "function": {
                                    "name": b.get("name") or "tool",
                                    "arguments": json.dumps(b.get("input") or {}),
                                },
                            }
                        )
                    elif isinstance(b, dict) and b.get("type") == "text":
                        txt = b.get("text")
                        if txt:
                            texts.append(txt)
                    elif isinstance(b, str):
                        texts.append(b)

                assistant_msg = {"role": "assistant"}
                if texts:
                    assistant_msg["content"] = "\n".join(texts)
                else:
                    assistant_msg["content"] = ""
                if tool_calls:
                    assistant_msg["tool_calls"] = tool_calls
                converted.append(assistant_msg)

            elif role == "user":
                texts = []
                tool_results = []
                for b in blocks:
                    if isinstance(b, dict) and b.get("type") == "tool_result":
                        tool_results.append(b)
                    elif isinstance(b, dict) and b.get("type") == "text":
                        txt = b.get("text")
                        if txt:
                            texts.append(txt)
                    elif isinstance(b, str):
                        texts.append(b)

                # Emit tool results first so the flow is: assistant(tool_calls) -> tool -> user
                for tr in tool_results:
                    converted.append(
                        {
                            "role": "tool",
                            "tool_call_id": tr.get("tool_use_id") or tr.get("id"),
                            "name": tr.get("name"),
                            "content": cls._stringify_tool_content(tr.get("content")),
                        }
                    )

                if texts:
                    converted.append({"role": "user", "content": "\n".join(texts)})

            elif role == "system":
                converted.append({"role": "system", "content": cls._collapse_text_blocks(blocks)})
            else:
                # Preserve unknown roles as-is to avoid data loss.
                converted.append(m)

        if converted:
            converted = cls._ensure_last_role_ok(converted)
            if converted:
                data["messages"] = converted
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

        print(f"[ProxyHookStripClaudeExtras] call_type={call_type} messages={len(data.get('messages', []))}")

        # If we are in Anthropic /v1/messages pipeline, let LiteLLM do its own translation.
        if call_type == "anthropic_messages":
            if isinstance(data.get("messages"), list):
                data["messages"] = self._ensure_last_role_ok(data["messages"])
            return data

        # Otherwise translate for OpenAI/Mistral-style chat payloads.
        if isinstance(data.get("messages"), list):
            converted_tools = self._convert_tools(data.get("tools"))
            if converted_tools is None:
                data.pop("tools", None)
            else:
                data["tools"] = converted_tools
            data = self._convert_messages(data)

        return data


# Module-level instance LiteLLM will import per docs
proxy_handler_instance = ProxyHookStripClaudeExtras()

# ---------------------------------------------------------------------------
# Stub telemetry endpoint to silence /api/event_logging/batch 404 noise.
# This file is already imported by LiteLLM via callbacks, so we register the
# route here exactly once without touching LiteLLM upstream code.
# ---------------------------------------------------------------------------
try:
    from litellm.proxy.proxy_server import app as _litellm_app
except Exception:
    _litellm_app = None

if _litellm_app and not getattr(_litellm_app.state, "has_event_logging_stub", False):
    @_litellm_app.post("/api/event_logging/batch")
    async def _event_logging_stub():
        return {"status": "ok"}

    _litellm_app.state.has_event_logging_stub = True
