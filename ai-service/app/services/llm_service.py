import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

class LlmService:
    def __init__(self):
        raw_key = os.getenv("GROQ_API_KEY", "")
        api_key = raw_key.strip().strip('"').strip("'")

        if not api_key:
            raise ValueError("GROQ_API_KEY nije pronađen u okruženju!")

        self.model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile").strip().strip('"')
        self.client = Groq(api_key=api_key)

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=2000,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            raise RuntimeError(f"Greška pri pozivanju Groq API-ja: {str(e)}")

    def chat_completion(self, messages: list, tools: list = None):
        """Sinhroni poziv Groq Chat Completion API-ja."""
        try:
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.2,
                "max_tokens": 1000,
            }
            if tools:
                kwargs["tools"] = tools
                kwargs["tool_choice"] = "auto"

            return self.client.chat.completions.create(**kwargs)
        except Exception as e:
            raise RuntimeError(f"Greška pri pozivanju Groq Chat Completion-a: {str(e)}")

    def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str,
    ):
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=1000,
                stream=True,
            )

            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            raise RuntimeError(f"Greška pri streamovanju sa Groq API-ja: {str(e)}")