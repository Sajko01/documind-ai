from typing import Optional

from pydantic import BaseModel, Field

from typing import List


class GenerateDocumentSummaryRequest(BaseModel):

    document_id: str

    content: str = Field(
        ...,
        min_length=1,
        max_length=50000,
    )

    language: str = "en"


class GenerateConversationSummaryRequest(BaseModel):

    conversation_id: str

    content: str = Field(
        ...,
        min_length=1,
        max_length=50000,
    )

    language: str = "en"

class DocumentSummaryResponse(BaseModel):

    summary: str

    key_points: list[str]

    products: list[str]

    prices: list[str]

    important_conditions: list[str]






class SourceInfo(BaseModel):
    document: str
    page: int

class KeyPointWithSource(BaseModel):
    text: str
    source: SourceInfo


class ConversationSummaryResponse(BaseModel):
    summary: str
    key_points: List[str]
    decisions: List[str]
    action_items: List[str]
    sources: List[SourceInfo]