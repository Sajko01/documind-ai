import os
from dotenv import load_dotenv
from fastapi import (
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from pydantic import BaseModel

from app.schemas import (
    GenerateRequest,
    GenerateResponse,
    ProcessDocumentResponse,
)
from app.services.embedding_service import (
    EmbeddingService,
)
from app.services.pdf_processor import (
    PdfProcessor,
)
from app.services.rag_service import generate_combined_answer
from app.services.text_chunker import (
    TextChunker,
)

load_dotenv()

app = FastAPI(
    title="DocuMind AI Service",
    description="AI service for document processing and generation",
    version="1.0.0",
)

pdf_processor = PdfProcessor()
text_chunker = TextChunker(
    chunk_size=700,
    overlap=120,
)
embedding_service = EmbeddingService()


class EmbeddingRequest(BaseModel):
    text: str


@app.get("/health")
async def health():
    return {
        "success": True,
        "service": "documind-ai-service",
        "status": "healthy",
    }


@app.get("/embedding-info")
async def embedding_info():
    return {
        "model": embedding_service.MODEL_NAME,
        "dimensions": embedding_service.dimensions(),
    }


@app.post("/embed")
async def embed_text(
    request: EmbeddingRequest,
):
    try:
        embedding = embedding_service.embed(request.text)

        return {
            "success": True,
            "embedding": embedding,
            "dimensions": len(embedding),
            "model": embedding_service.MODEL_NAME,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(f"Embedding failed: {error}")

        raise HTTPException(
            status_code=500,
            detail="Embedding generation failed",
        )


@app.post(
    "/process-document",
    response_model=ProcessDocumentResponse,
)
async def process_document(
    document_id: str = Form(...),
    file: UploadFile = File(...),
):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed",
            )

        file_bytes = await file.read()

        max_size = 10 * 1024 * 1024

        if len(file_bytes) > max_size:
            raise HTTPException(
                status_code=413,
                detail="Maximum file size is 10 MB",
            )

        text, pages = pdf_processor.extract_text(file_bytes)

        chunks = text_chunker.chunk_pages(
            pages=pages,
            document_id=document_id,
        )

        if chunks:
            texts = [chunk["content"] for chunk in chunks]

            embeddings = embedding_service.embed_many(texts)

            for chunk, embedding in zip(chunks, embeddings):
                chunk["embedding"] = embedding

        return {
            "success": True,
            "document_id": document_id,
            "status": "READY",
            "page_count": len(pages),
            "text": text,
            "pages": pages,
            "chunks": chunks,
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Document processing failed: {error}")

        raise HTTPException(
            status_code=500,
            detail="Document processing failed",
        )


@app.post(
    "/generate",
    response_model=GenerateResponse,
)
async def generate_answer(request: GenerateRequest):
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        organization_id = getattr(request, "organization_id", None) or "default-org"
        conversation_id = getattr(request, "conversation_id", None)

        result = await generate_combined_answer(
            question=request.question,
            organization_id=organization_id,
            conversation_id=conversation_id,
        )

        return result

    except Exception as error:
        print(f"Generation error: {error}")
        raise HTTPException(status_code=500, detail=str(error))