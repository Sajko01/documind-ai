from pydantic import BaseModel
from typing import List, Optional, Any, Dict


class ProcessedPage(BaseModel):
    page_number: int
    text: str


class ProcessedChunk(BaseModel):
    document_id: str
    page_number: int
    chunk_index: int
    content: str
    token_count: int
    embedding: List[float]


class ProcessDocumentResponse(BaseModel):
    success: bool
    document_id: str
    status: str
    page_count: int
    text: str
    pages: List[ProcessedPage]
    chunks: List[ProcessedChunk]


class SourceCitation(BaseModel):
    document_id: Optional[str] = None
    document: str  # Filename (npr. "delivery-policy.pdf")
    page: Optional[int] = None
    score: Optional[float] = None


class GenerateRequest(BaseModel):
    question: str
    organization_id: str  # 👈 Obavezno polje za multi-tenant bezbednost po organizaciji
    conversation_id: Optional[str] = None
    context: Optional[str] = ""


# class GenerateResponse(BaseModel):
#     success: bool = True
#     answer: str
#     model: str
#     sources: List[SourceCitation] = []
#     tool_results: List[Dict[str, Any]] = []
#     confidence: float = 0.95
#     answered: bool = True


class GenerateMetrics(BaseModel):
    total: float
    embedding: float
    retrieval: float
    llm: float


class GenerateResponse(BaseModel):

    success: bool = True

    answer: str

    model: str

    sources: List[SourceCitation] = []

    tool_results: List[Dict[str, Any]] = []

    confidence: float = 0.95

    answered: bool = True

    metrics: Optional[GenerateMetrics] = None