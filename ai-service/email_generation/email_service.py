from .templates import EMAIL_TEMPLATES


class EmailService:

    def __init__(self, llm_client):
        self.llm_client = llm_client

    async def generate_email(
        self,
        email_type: str,
        recipient_name: str | None,
        subject: str | None,
        context: str,
        language: str,
        tone: str,
    ):

        template = EMAIL_TEMPLATES.get(
            email_type
        )

        if not template:
            raise ValueError(
                f"Unknown email type: {email_type}"
            )

        recipient_instruction = ""

        if recipient_name:
            recipient_instruction = (
                f"Recipient name: {recipient_name}"
            )

        subject_instruction = ""

        if subject:
            subject_instruction = (
                f"Suggested subject: {subject}"
            )

        prompt = f"""
You are an AI business email assistant.

EMAIL TYPE:
{email_type}

PURPOSE:
{template["purpose"]}

INSTRUCTIONS:
{template["instructions"]}

RECIPIENT:
{recipient_instruction}

SUBJECT:
{subject_instruction}

LANGUAGE:
{language}

TONE:
{tone}

CONTEXT:
{context}

IMPORTANT RULES:

1. Use only the information provided in the context.
2. Never invent prices.
3. Never invent discounts.
4. Never invent delivery conditions.
5. Never invent company policies.
6. Never invent product specifications.
7. Never claim that an action was completed unless
   the context explicitly says it was completed.
8. Write a professional business email.
9. Return only the email content.
10. Do not include analysis.
"""

      # Razdvoji na system_prompt i user_prompt, i ukloni 'await' ako generate nije async
        result = self.llm_client.generate(
            system_prompt="You are an expert AI business email assistant. Always follow the instructions and rules strictly.",
            user_prompt=prompt
        )

        return result