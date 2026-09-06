


import json
import os
import logging
import httpx
from typing import Any, Dict, List, Tuple
from sqlalchemy import text

from app.prompts.rag_prompt import SYSTEM_PROMPT, build_rag_prompt
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LlmService
from app.services.reranker_service import get_reranker_service
from app.config import (
    RAG_VECTOR_WEIGHT,
    RAG_KEYWORD_WEIGHT,
    RAG_TOP_K,
    RAG_VECTOR_TOP_K,
    RAG_KEYWORD_TOP_K,
    RAG_CONFIDENCE_THRESHOLD,
    RAG_CANDIDATE_TOP_K,
)

logger = logging.getLogger(__name__)

# Definicija alata koje LLM može da pozove
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Pretražuje katalog proizvoda po tekstu ili ključnoj reči.",
            "parameters": {
                "type": "object",
                "properties": {
                    "search": {
                        "type": "string",
                        "description": "Naziv ili ključna reč proizvoda (npr. CEM II ili Cement)"
                    }
                },
                "required": ["search"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_offer",
            "description": "Izračunava ukupnu cenu ponude na osnovu ID-a proizvoda i količine.",
            "parameters": {
                "type": "object",
                "properties": {
                    "productId": {
                        "type": "string",
                        "description": "ID ili SKU proizvoda"
                    },
                    "quantity": {
                        "type": "integer",
                        "description": "Količina naručenih jedinica"
                    }
                },
                "required": ["productId", "quantity"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_offer",
            "description": "Kreira novu zvaničnu ponudu u bazi podataka za kupca na osnovu ID-a proizvoda i količine.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customerName": {
                        "type": "string",
                        "description": "Naziv kompanije ili kupca (npr. ABC Company)"
                    },
                    "customerEmail": {
                        "type": "string",
                        "description": "Email adresa kupca (npr. contact@abc.com)"
                    },
                    "items": {
                        "type": "array",
                        "description": "Lista stavki u ponudi",
                        "items": {
                            "type": "object",
                            "properties": {
                                "productId": {
                                    "type": "string",
                                    "description": "UUID ID proizvoda dobijen iz pretrage"
                                },
                                "quantity": {
                                    "type": "integer",
                                    "description": "Količina proizvoda"
                                }
                            },
                            "required": ["productId", "quantity"]
                        }
                    }
                },
                "required": ["customerName", "customerEmail", "items"]
            }
        }
    }
]

embedding_service = EmbeddingService()
llm_service = LlmService()

NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3000/api").rstrip("/")


async def execute_backend_tool(tool_name: str, args: Dict[str, Any], organization_id: str) -> Dict[str, Any]:
    url = f"{NESTJS_BACKEND_URL}/chat/internal/tools/execute"
    payload = {
        "tool": tool_name,
        "args": args,
        "organizationId": organization_id
    }
    
    print(f"--> [PYTHON -> NESTJS TOOL] Pozivam: {url}")
    print(f"--> Payload: {json.dumps(payload)}")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=10.0)
            print(f"<-- [NESTJS RESPONSE STATUS]: {response.status_code}")
            
            if response.status_code != 200:
                print(f"<-- [NESTJS ERROR BODY]: {response.text}")
                return {"error": f"Tool execution failed with status {response.status_code}: {response.text}"}
                
            data = response.json()
            print(f"<-- [NESTJS TOOL SUCCESS]: {json.dumps(data)}")
            return data
            
        except Exception as e:
            print(f"<-- [PYTHON HTTP ERROR]: Greška pri pozivu NestJS alata: {e}")
            return {"error": f"Failed to connect to NestJS backend: {str(e)}"}


async def generate_combined_answer(
    db,
    question: str,
    organization_id: str,
    conversation_id: str = None,
) -> Dict[str, Any]:
    try:
        query_embedding = embedding_service.embed(question)

        # 1. Hibridna pretraga (Top kandidati)
        hybrid_candidates = hybrid_search(
            db=db,
            organization_id=organization_id,
            query=question,
            query_embedding=query_embedding,
        )

        print(f"\nQuery: {question}")
        print(f"Hybrid candidates: {len(hybrid_candidates)}")

        if not hybrid_candidates:
            return {
                "success": True,
                "answer": "Ne mogu pouzdano da pronađem odgovor u dostupnoj dokumentaciji.",
                "sources": [],
                "tool_results": [],
                "model": getattr(llm_service, "model", "qwen/qwen3.8-27b"),
                "confidence": 0.0,
                "answered": False,
            }

        # 2. Reranking na Top rezultate
        reranker_service = get_reranker_service()
        results = reranker_service.rerank(
            query=question,
            documents=hybrid_candidates,
            top_k=RAG_TOP_K,
        )

        print(f"Final reranked results: {len(results)}")
        print("=" * 50)
        for doc in results:
            print(f"Document: {doc.get('filename')}")
            print(f"Page: {doc.get('page_number')}")
            print(f"Hybrid: {doc.get('hybrid_score', 0.0):.4f}")
            print(f"Reranker: {doc.get('reranker_score', 0.0):.4f}")
            print("-" * 50)

        best_score = results[0]["hybrid_score"] if results else 0.0

        if best_score < RAG_CONFIDENCE_THRESHOLD:
            return {
                "success": True,
                "answer": "Ne mogu pouzdano da pronađem odgovor u dostupnoj dokumentaciji.",
                "sources": [],
                "tool_results": [],
                "model": getattr(llm_service, "model", "qwen/qwen3.8-27b"),
                "confidence": float(best_score),
                "answered": False,
            }

        def build_context(search_results):
            context_parts = []
            for item in search_results:
                filename = item.get("filename", "Nepoznat dokument")
                page = item.get("page_number", "?")
                content = item.get("content", "")
                context_parts.append(f"[Izvor: {filename}, Strana: {page}]\n{content}")
            return "\n\n---\n\n".join(context_parts)

        rag_context = build_context(results)
        user_prompt = build_rag_prompt(question=question, context=rag_context)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        tool_results = []

        response = llm_service.chat_completion(
            messages=messages,
            tools=TOOLS
        )

        response_message = response.choices[0].message

        while getattr(response_message, "tool_calls", None):
            # Bezbedno dodavanje assistant poruke sa tool_calls u listu poruka
            messages.append({
                "role": "assistant",
                "content": response_message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": tc.type,
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    } for tc in response_message.tool_calls
                ]
            })

            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                print(f"🤖 LLM želi da pozove alat: {function_name} sa argumentima: {function_args}")

                tool_output = await execute_backend_tool(
                    tool_name=function_name,
                    args=function_args,
                    organization_id=organization_id
                )

                tool_results.append({
                    "tool": function_name,
                    "args": function_args,
                    "result": tool_output
                })

                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(tool_output)
                })

            response = llm_service.chat_completion(
                messages=messages,
                tools=TOOLS
            )
            response_message = response.choices[0].message

        # Deduplikacija izvora po imenu dokumenta i stranici
        unique_sources = {}
        for item in results:
            doc_name = item.get("filename", "Unknown")
            page = item.get("page_number")
            key = (doc_name, page)
            
            score = float(item.get("reranker_score", item.get("hybrid_score", 0.0)))
            
            if key not in unique_sources or score > unique_sources[key]["score"]:
                unique_sources[key] = {
                    "document_id": str(item.get("document_id")) if item.get("document_id") else "",
                    "document": doc_name,
                    "page": page,
                    "score": score
                }

        sources = sorted(list(unique_sources.values()), key=lambda x: x["score"], reverse=True)
        return {
            "success": True,
            "answer": response_message.content,
            "sources": sources,
            "tool_results": tool_results,
            "model": getattr(llm_service, "model", "qwen/qwen3.8-27b"),
            "confidence": float(best_score),
            "answered": True,
        }

    except Exception as e:
        print(f"Greška u generate_combined_answer: {e}")
        raise e


def vector_search(
    db,
    organization_id: str,
    query_embedding,
    top_k: int = 10,
):
    sql = text("""
        SELECT
            dc.id,
            dc.document_id,
            d.original_name AS filename,
            dc.content,
            dc.page_number,
            (dc.embedding <=> CAST(:query_embedding AS vector)) AS distance
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE d.organization_id = :organization_id
        ORDER BY dc.embedding <=> CAST(:query_embedding AS vector)
        LIMIT :top_k
    """)

    result = db.execute(
        sql,
        {
            "organization_id": organization_id,
            "query_embedding": query_embedding,
            "top_k": top_k,
        },
    )

    return [
        dict(row._mapping)
        for row in result
    ]


def keyword_search(
    db,
    organization_id: str,
    query: str,
    top_k: int = 10,
):
    sql = text("""
        SELECT
            dc.id,
            dc.document_id,
            d.original_name AS filename,
            dc.content,
            dc.page_number,
            ts_rank(
                dc.search_vector,
                websearch_to_tsquery(
                    'simple',
                    :query
                )
            ) AS keyword_score
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE d.organization_id = :organization_id
          AND dc.search_vector @@
              websearch_to_tsquery(
                  'simple',
                  :query
              )
        ORDER BY keyword_score DESC
        LIMIT :top_k
    """)

    result = db.execute(
        sql,
        {
            "organization_id": organization_id,
            "query": query,
            "top_k": top_k,
        },
    )

    return [
        dict(row._mapping)
        for row in result
    ]


def normalize_scores(
    results: list,
    score_key: str,
    is_distance: bool = False,
) -> list:
    if not results:
        return results

    scores = [
        float(item[score_key])
        for item in results
    ]

    min_score = min(scores)
    max_score = max(scores)

    if max_score == min_score:
        for item in results:
            item[f"{score_key}_normalized"] = 1.0
        return results

    for item in results:
        score = float(item[score_key])
        if is_distance:
            # Kosinusna distanca: manja distanca znači veću sličnost
            normalized = (max_score - score) / (max_score - min_score)
        else:
            normalized = (score - min_score) / (max_score - min_score)
        item[f"{score_key}_normalized"] = normalized

    return results


def hybrid_search(
    db,
    organization_id: str,
    query: str,
    query_embedding,
):
    vector_results = vector_search(
        db=db,
        organization_id=organization_id,
        query_embedding=query_embedding,
        top_k=RAG_VECTOR_TOP_K,
    )

    keyword_results = keyword_search(
        db=db,
        organization_id=organization_id,
        query=query,
        top_k=RAG_KEYWORD_TOP_K,
    )

    # Označavamo da je "distance" zapravo distanca, pa se normalizacija invertuje
    vector_results = normalize_scores(
        vector_results,
        "distance",
        is_distance=True,
    )

    keyword_results = normalize_scores(
        keyword_results,
        "keyword_score",
        is_distance=False,
    )

    candidates = {}

    for item in vector_results:
        candidates[item["id"]] = {
            "id": item["id"],
            "document_id": item["document_id"],
            "filename": item.get("filename"),
            "content": item["content"],
            "page_number": item["page_number"],
            "vector_score": item.get("distance_normalized", 0.0),
            "keyword_score": 0.0,
        }

    for item in keyword_results:
        if item["id"] not in candidates:
            candidates[item["id"]] = {
                "id": item["id"],
                "document_id": item["document_id"],
                "filename": item.get("filename"),
                "content": item["content"],
                "page_number": item["page_number"],
                "vector_score": 0.0,
                "keyword_score": 0.0,
            }

        candidates[item["id"]]["keyword_score"] = item.get("keyword_score_normalized", 0.0)

    results = list(candidates.values())

    for item in results:
        item["hybrid_score"] = (
            RAG_VECTOR_WEIGHT * item["vector_score"]
            + RAG_KEYWORD_WEIGHT * item["keyword_score"]
        )

    results.sort(
        key=lambda item: item["hybrid_score"],
        reverse=True,
    )

    return results[:RAG_CANDIDATE_TOP_K]


def rerank_results(
    query: str,
    results: list[dict],
    top_k: int = 5,
) -> list[dict]:
    service = get_reranker_service()
    return service.rerank(
        query=query,
        documents=results,
        top_k=top_k,
    )


def retrieve_vector_only(
    db,
    organization_id: str,
    query_embedding,
    top_k: int = 5,
):
    return vector_search(
        db=db,
        organization_id=organization_id,
        query_embedding=query_embedding,
        top_k=top_k,
    )


def hybrid_rerank(
    db,
    organization_id: str,
    query: str,
    query_embedding,
    top_k: int = 5,
):
    hybrid_results = hybrid_search(
        db=db,
        organization_id=organization_id,
        query=query,
        query_embedding=query_embedding,
    )

    if not hybrid_results:
        return []

    return rerank_results(
        query=query,
        results=hybrid_results,
        top_k=top_k,
    )