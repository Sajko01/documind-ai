import json

from .prompts import (
    DOCUMENT_SUMMARY_PROMPT,
    CONVERSATION_SUMMARY_PROMPT,
)


class SummarizationService:

    def __init__(self, llm_client):
        self.llm_client = llm_client

    async def generate_document_summary(
        self,
        content: str,
        language: str = "en",
    ):
        # System prompt definiše ulogu i pravila ponašanja modela
        system_prompt = (
            "You are an AI document summarization assistant. "
            "Your task is to summarize the provided document according to strict rules. "
            "Always return a valid JSON object matching the requested schema."
        )

        # User prompt sadrži specifičan dokument i jezik
        user_prompt = DOCUMENT_SUMMARY_PROMPT.format(
            content=content,
        )
        user_prompt += f"""

LANGUAGE:
{language}
"""

        # Prosleđujemo oba argumenta koja LlmService.generate zahteva
        result = self.llm_client.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )

        return self._parse_json(result)

    async def generate_conversation_summary(
        self,
        content: str,
        language: str = "en",
    ):
        system_prompt = (
            "You are an AI assistant that summarizes business conversations. "
            "Always return a valid JSON object matching the requested schema."
        )

        user_prompt = CONVERSATION_SUMMARY_PROMPT.format(
            content=content,
        )
        user_prompt += f"""

LANGUAGE:
{language}
"""

        result = self.llm_client.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )

        return self._parse_json(result)

    def _parse_json(self, result: str):
        try:
            cleaned_result = result.strip()
            
            # Ako LLM vrati odgovor u markdown blokovima koda (```json ... ```)
            if cleaned_result.startswith("```"):
                lines = cleaned_result.splitlines()
                # Ukloni prvu liniju (```json ili ```)
                if lines and lines[0].startswith("```"):
                    lines = lines[1:]
                # Ukloni poslednju liniju (```)
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned_result = "\n".join(lines).strip()

            return json.loads(cleaned_result)
            
        except json.JSONDecodeError:
            # Fallback za slučaj da model ponovo iseče JSON zbog max tokena:
            # Pokušavamo da na silu zatvorimo otvorene zagrade ili vratimo parcijalan objekat
            try:
                if cleaned_result.count("{") > cleaned_result.count("}"):
                    cleaned_result += "}" * (cleaned_result.count("{") - cleaned_result.count("}"))
                if cleaned_result.count("[") > cleaned_result.count("]"):
                    cleaned_result += "]" * (cleaned_result.count("[") - cleaned_result.count("]"))
                return json.loads(cleaned_result)
            except Exception:
                raise ValueError(
                    f"LLM returned invalid or truncated JSON. Raw response was: {result}"
                )