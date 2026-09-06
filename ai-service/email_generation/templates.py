EMAIL_TEMPLATES = {

    "sales": {
        "purpose": """
Write a professional sales email.
The goal is to present products or services
and encourage the customer to continue the conversation.
""",

        "instructions": """
Be professional and concise.
Clearly explain the value for the customer.
Do not invent prices, discounts or product specifications.
"""
    },

    "support": {
        "purpose": """
Write a professional customer support email.
The goal is to answer or acknowledge a customer request.
""",

        "instructions": """
Be helpful, clear and polite.
Explain the next step when possible.
Do not invent company policies.
"""
    },

    "complaint": {
        "purpose": """
Write a professional response to a customer complaint.
""",

        "instructions": """
Be empathetic and professional.
Acknowledge the customer's concern.
Do not admit liability unless explicitly stated
in the provided context.
Do not invent compensation or company policies.
"""
    },

    "offer": {
        "purpose": """
Write a professional email presenting a business offer
or quotation to a customer.
""",

        "instructions": """
Clearly present the offer information provided
in the context.
Do not invent prices, quantities or terms.
Keep the email professional and easy to read.
"""
    },

    "follow-up": {
        "purpose": """
Write a professional follow-up email after
a previous customer interaction.
""",

        "instructions": """
Be polite and concise.
Reference the previous interaction when provided.
Do not be overly aggressive or repetitive.
"""
    },
}