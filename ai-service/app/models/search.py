from pydantic import BaseModel


class SearchResult(BaseModel):
    document_id: str
    filename: str
    page: int
    content: str
    score: float


class SearchResponse(BaseModel):
    results: list[SearchResult]