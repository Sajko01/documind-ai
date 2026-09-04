from tools import TOOLS


async def generate_answer(
    question: str,
    organization_id: str | None = None,
    conversation_id: str | None = None,
):

    # 1. LLM receives the question
    # 2. LLM can request tools
    # 3. Tool results are collected
    # 4. Final answer is generated

    return {
        "answer": "Temporary response",
        "sources": [],
        "tool_results": [],
    }