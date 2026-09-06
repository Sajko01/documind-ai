

import os
from dotenv import load_dotenv
from fastapi import (
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    Depends,
)
from sqlalchemy.orm import Session
from pydantic import BaseModel

# --- IMPORTI SERVISA I ŠEMA ---
from app.schemas import (
    GenerateRequest,
    GenerateResponse,
    ProcessDocumentResponse,
)
from app.services.embedding_service import EmbeddingService
from app.services.pdf_processor import PdfProcessor
from app.services.text_chunker import TextChunker
from app.services.llm_service import LlmService
from app.services.database import get_db

# Važniimporti za pretragu, rerankovanje i rag pipeline
from app.services.rag_service import hybrid_search, rerank_results
from app.config import RAG_CONFIDENCE_THRESHOLD
from app.prompts.rag_prompt import SYSTEM_PROMPT, build_rag_prompt

from email_generation.schemas import (
    GenerateEmailRequest,
    GenerateEmailResponse,
)
from email_generation.email_service import EmailService

from summarization.schemas import (
    GenerateDocumentSummaryRequest,
    GenerateConversationSummaryRequest,
    DocumentSummaryResponse,
    ConversationSummaryResponse,
)
from summarization.summarization_service import SummarizationService

load_dotenv()

# Konfiguracija za RAG parametre
RAG_CONFIDENCE_THRESHOLD = float(
    os.getenv("RAG_CONFIDENCE_THRESHOLD", "0.40")
)
RAG_TOP_K = int(
    os.getenv("RAG_TOP_K", "5")
)

app = FastAPI(
    title="DocuMind AI Service",
    description="AI service for document processing and generation",
    version="1.0.0",
)

# Inicijalizacija servisa
pdf_processor = PdfProcessor()
text_chunker = TextChunker(
    chunk_size=700,
    overlap=120,
)
embedding_service = EmbeddingService()
llm_service = LlmService()
email_service = EmailService(llm_service)
summarization_service = SummarizationService(llm_service)


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
async def embed_text(request: EmbeddingRequest):
    try:
        embedding = embedding_service.embed(request.text)
        return {
            "success": True,
            "embedding": embedding,
            "dimensions": len(embedding),
            "model": embedding_service.MODEL_NAME,
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception as error:
        print(f"Embedding failed: {error}")
        raise HTTPException(status_code=500, detail="Embedding generation failed")


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


# ==========================================
# GLAVNI RAG ENDPOINT (Prati tvoj strogi flow)
# ==========================================
@app.post(
    "/generate",
    response_model=GenerateResponse,
)
async def generate(
    request: GenerateRequest,
    db: Session = Depends(get_db),
):
    try:
        query_text = getattr(request, "question", None) or getattr(request, "query", "")
        if not query_text.strip():
            raise HTTPException(status_code=400, detail="Query/Question cannot be empty")

        organization_id = getattr(request, "organization_id", None) or "default-org"

        # --------------------------------
        # 1. EMBEDDING
        # --------------------------------
        query_embedding = embedding_service.embed(query_text)

        # --------------------------------
        # 2. HYBRID RETRIEVAL
        # --------------------------------
        hybrid_results = hybrid_search(
            db=db,
            organization_id=organization_id,
            query=query_text,
            query_embedding=query_embedding,
        )
# --------------------------------
        # 3. RERANKING (Služi samo za redosled)
        # --------------------------------
        reranked_results = rerank_results(
            query=query_text,
            results=hybrid_results,
            top_k=RAG_TOP_K,
        )

        # ==========================================
        # 👉 OVDJE DODAJES KORAK 25 (LOGGING)
        # ==========================================
        print(f"Query: {query_text}")
        print(f"Hybrid candidates: {len(hybrid_results)}")
        print(f"Final reranked results: {len(reranked_results)}")
        print("=" * 50)

        for item in reranked_results:
            print("Document:", item.get("filename"))
            print("Page:", item.get("page_number"))
            print("Hybrid:", item.get("hybrid_score"))
            print("Reranker:", item.get("reranker_score"))
            print("-" * 50)
        # ==========================================

        # --------------------------------
        # 4. NO RESULTS
        # --------------------------------
        if not reranked_results:
            return {
                "success": True,
                "answer": "Ne mogu pouzdano da pronađem odgovor u dostupnoj dokumentaciji.",
                "sources": [],
                "tool_results": [],
                "model": "qwen/qwen3.8-27b",
                "confidence": 0.0,
                "answered": False,
            }

        # --------------------------------
        # 5. BEST HYBRID SCORE ZA CONFIDENCE
        # --------------------------------
        # Uzimamo hibridni skor najboljeg rezultata za merilo pouzdanosti!
        best_hybrid_score = max(
            item.get("hybrid_score", 0.0)
            for item in reranked_results
        )

        if best_hybrid_score < RAG_CONFIDENCE_THRESHOLD:
            return {
                "success": True,
                "answer": "Ne mogu pouzdano da pronađem odgovor u dostupnoj dokumentaciji.",
                "sources": [],
                "tool_results": [],
                "model": "qwen/qwen3.8-27b",
                "confidence": float(best_hybrid_score),
                "answered": False,
            }
       # --------------------------------
        # 6. CONTEXT
        # --------------------------------
        def build_context(search_results):
            context_parts = []
            for item in search_results:
                filename = item.get("filename", "Nepoznat dokument")
                page = item.get("page_number", "?")
                content = item.get("content", "")
                
                # Tačno po Koraku 26 formatu (bez hybrid/reranker skorova)
                context_parts.append(
                    f"Document: {filename}\nPage: {page}\n{content}"
                )
            return "\n\n---\n\n".join(context_parts)

        context = build_context(reranked_results)
        # --------------------------------
        # 7. LLM
        # --------------------------------
        user_prompt = build_rag_prompt(question=query_text, context=context)
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        response = llm_service.chat_completion(messages=messages)
        answer = response.choices[0].message.content

        # --------------------------------
        # 8. SOURCES
        # --------------------------------
        sources = [
            {
                "document_id": str(item.get("document_id")) if item.get("document_id") else "",
                "document": item.get("filename", "Unknown"),
                "page": item.get("page_number"),
                "score": float(item.get("relevance_score", item.get("hybrid_score", 0.0)))
            }
            for item in reranked_results
        ]

       # --------------------------------
        # 9. RESPONSE (Popravljen "answered" flag)
        # --------------------------------
        unknown_phrases = [
            "nemam informacije",
            "nemam podatak",
            "ne mogu pronaći",
            "nažalost",
        ]
        is_fallback = any(
            phrase in answer.lower() for phrase in unknown_phrases
        )

        return {
            "success": True,
            "answer": answer,
            "sources": [] if is_fallback else sources,
            "tool_results": [],
            "model": "qwen/qwen3.8-27b",
            "confidence": 0.0 if is_fallback else float(best_hybrid_score),
            "answered": not is_fallback,  # Biće False ako je dao fallback!
        }

    except Exception as error:
        print(f"Generation error: {error}")
        raise HTTPException(status_code=500, detail=str(error))

@app.post(
    "/ai/generate-email",
    response_model=GenerateEmailResponse,
)
async def generate_email(
    request: GenerateEmailRequest,
):
    try:
        result = await email_service.generate_email(
            email_type=request.email_type,
            recipient_name=request.recipient_name,
            subject=request.subject,
            context=request.context,
            language=request.language,
            tone=request.tone,
        )

        return GenerateEmailResponse(
            subject=request.subject or "Business communication",
            body=result,
            email_type=request.email_type,
        )
    except Exception as error:
        print(f"Email generation error: {error}")
        raise HTTPException(status_code=500, detail=str(error))


@app.post(
    "/ai/generate-document-summary",
    response_model=DocumentSummaryResponse,
)
async def generate_document_summary(
    request: GenerateDocumentSummaryRequest,
):
    result = await summarization_service.generate_document_summary(
        content=request.content,
        language=request.language,
    )

    return DocumentSummaryResponse(
        summary=result.get("summary", ""),
        key_points=result.get("key_points", []),
        products=result.get("products", []),
        prices=result.get("prices", []),
        important_conditions=result.get("important_conditions", []),
    )


@app.post(
    "/ai/generate-conversation-summary",
    response_model=ConversationSummaryResponse,
)
async def generate_conversation_summary(
    request: GenerateConversationSummaryRequest,
):
    result = await summarization_service.generate_conversation_summary(
        content=request.content,
        language=request.language,
    )

    return ConversationSummaryResponse(
        summary=result.get("summary", ""),
        key_points=result.get("key_points", []),
        decisions=result.get("decisions", []),
        action_items=result.get("action_items", []),
        sources=result.get("sources", []),
    )