from typing import Literal, Optional
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel

EmailType = Literal[
    "sales",
    "support",
    "complaint",
    "offer",
    "follow-up",
    "invoice",
    "delivery",
    "welcome",
    "renewal",
    "payment",
    "quotation",
]


class GenerateEmailRequest(BaseModel):
    # Ova konfiguracija omogućava da model automatski prepoznaje 
    # i camelCase (emailType) i snake_case (email_type)
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    email_type: EmailType = Field(
        ...,
        description="Type of email to generate",
    )
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None
    subject: Optional[str] = None
    context: str = Field(
        ...,
        min_length=1,
        max_length=10000,
    )
    language: str = "en"
    tone: str = "professional"


class GenerateEmailResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    subject: str
    body: str
    email_type: EmailType