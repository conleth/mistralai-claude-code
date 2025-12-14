import copy

from tools.litellm_hooks import ProxyHookStripClaudeExtras


def test_convert_messages_orders_tool_before_user():
    hook = ProxyHookStripClaudeExtras()
    data = {
        "messages": [
            {
                "role": "assistant",
                "content": [],
                "tool_calls": [
                    {
                        "id": "call-1",
                        "type": "function",
                        "function": {"name": "demo", "arguments": "{}"},
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {"type": "tool_result", "tool_use_id": "call-1", "content": "ok"},
                    {"type": "text", "text": "done"},
                ],
            },
        ]
    }

    result = hook._convert_messages(copy.deepcopy(data))
    msgs = result["messages"]

    assert [m["role"] for m in msgs] == ["assistant", "tool", "user"]
    assert msgs[1]["tool_call_id"] == "call-1"
    assert msgs[2]["content"] == "done"
