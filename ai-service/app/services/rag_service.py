# from .reranker_service import (
#     reranker_service,
# )
# from .reranker_service import get_reranker_service



# import json
# import os
# import httpx
# from typing import Any, Dict, List, Tuple
# from sqlalchemy import text

# from app.prompts.rag_prompt import SYSTEM_PROMPT, build_rag_prompt
# from app.services.embedding_service import EmbeddingService
# from app.services.llm_service import LlmService
# from app.config import (
#     RAG_VECTOR_WEIGHT,
#     RAG_KEYWORD_WEIGHT,
#     RAG_TOP_K,
#     RAG_VECTOR_TOP_K,
#     RAG_KEYWORD_TOP_K,
#     RAG_CONFIDENCE_THRESHOLD,
#     RAG_CANDIDATE_TOP_K,


# )





# # Definicija alata koje LLM može da pozove
# TOOLS = [
#     {
#         "type": "function",
#         "function": {
#             "name": "search_products",
#             "description": "Pretražuje katalog proizvoda po tekstu ili ključnoj reči.",
#             "parameters": {
#                 "type": "object",
#                 "properties": {
#                     "search": {
#                         "type": "string",
#                         "description": "Naziv ili ključna reč proizvoda (npr. CEM II ili Cement)"
#                     }
#                 },
#                 "required": ["search"]
#             }
#         }
#     },
#     {
#         "type": "function",
#         "function": {
#             "name": "calculate_offer",
#             "description": "Izračunava ukupnu cenu ponude na osnovu ID-a proizvoda i količine.",
#             "parameters": {
#                 "type": "object",
#                 "properties": {
#                     "productId": {
#                         "type": "string",
#                         "description": "ID ili SKU proizvoda"
#                     },
#                     "quantity": {
#                         "type": "integer",
#                         "description": "Količina naručenih jedinica"
#                     }
#                 },
#                 "required": ["productId", "quantity"]
#             }
#         }
#     },
#     {
#         "type": "function",
#         "function": {
#             "name": "create_offer",
#             "description": "Kreira novu zvaničnu ponudu u bazi podataka za kupca na osnovu ID-a proizvoda i količine.",
#             "parameters": {
#                 "type": "object",
#                 "properties": {
#                     "customerName": {
#                         "type": "string",
#                         "description": "Naziv kompanije ili kupca (npr. ABC Company)"
#                     },
#                     "customerEmail": {
#                         "type": "string",
#                         "description": "Email adresa kupca (npr. contact@abc.com)"
#                     },
#                     "items": {
#                         "type": "array",
#                         "description": "Lista stavki u ponudi",
#                         "items": {
#                             "type": "object",
#                             "properties": {
#                                 "productId": {
#                                     "type": "string",
#                                     "description": "UUID ID proizvoda dobijen iz pretrage"
#                                 },
#                                 "quantity": {
#                                     "type": "integer",
#                                     "description": "Količina proizvoda"
#                                 }
#                             },
#                             "required": ["productId", "quantity"]
#                         }
#                     }
#                 },
#                 "required": ["customerName", "customerEmail", "items"]
#             }
#         }
#     }
# ]

# embedding_service = EmbeddingService()
# llm_service = LlmService()

# # Vodimo računa da URL nema trailing slash na kraju
# # NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3000").rstrip("/")
# NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3000/api").rstrip("/")


# async def execute_backend_tool(tool_name: str, args: Dict[str, Any], organization_id: str) -> Dict[str, Any]:
#     """Slanje zahteva na NestJS backend za izvršavanje biznis alata."""
#     url = f"{NESTJS_BACKEND_URL}/chat/internal/tools/execute"
#     payload = {
#         "tool": tool_name,
#         "args": args,
#         "organizationId": organization_id
#     }
    
#     print(f"--> [PYTHON -> NESTJS TOOL] Pozivam: {url}")
#     print(f"--> Payload: {json.dumps(payload)}")

#     async with httpx.AsyncClient() as client:
#         try:
#             response = await client.post(url, json=payload, timeout=10.0)
#             print(f"<-- [NESTJS RESPONSE STATUS]: {response.status_code}")
            
#             if response.status_code != 200:
#                 print(f"<-- [NESTJS ERROR BODY]: {response.text}")
#                 return {"error": f"Tool execution failed with status {response.status_code}: {response.text}"}
                
#             data = response.json()
#             print(f"<-- [NESTJS TOOL SUCCESS]: {json.dumps(data)}")
#             return data
            
#         except Exception as e:
#             print(f"<-- [PYTHON HTTP ERROR]: Greška pri pozivu NestJS alata: {e}")
#             return {"error": f"Failed to connect to NestJS backend: {str(e)}"}


# async def search_vector_db(question: str, organization_id: str) -> Tuple[str, List[Dict[str, Any]]]:
#     """
#     RAG pretraga: Vraća formatiran tekstualni kontekst i striktne citations (sources).
#     """
#     url = f"{NESTJS_BACKEND_URL}/chat/internal/rag/search"
#     try:
#         query_embedding = embedding_service.embed(question)

#         print(f"--> [PYTHON -> NESTJS RAG] Pozivam: {url}")
#         async with httpx.AsyncClient() as client:
#             res = await client.post(
#                 url,
#                 json={
#                     "embedding": query_embedding,
#                     "organizationId": organization_id,
#                     "topK": 4
#                 },
#                 timeout=10.0
#             )
            
#             print(f"<-- [NESTJS RAG STATUS]: {res.status_code}")
#             if res.status_code == 200:
#                 data = res.json()
#                 chunks = data.get("chunks", [])
                
#                 context_parts = []
#                 sources = []

#                 for chunk in chunks:
#                     context_parts.append(chunk.get("content", ""))
                    
#                     source_entry = {
#                         "document": chunk.get("filename") or chunk.get("document_name", "Dokument"),
#                         "page": chunk.get("page", 1)
#                     }
#                     if chunk.get("document_id"):
#                         source_entry["document_id"] = chunk.get("document_id")

#                     if source_entry not in sources:
#                         sources.append(source_entry)

#                 formatted_context = "\n\n".join(context_parts)
#                 return formatted_context, sources
#             else:
#                 print(f"<-- [NESTJS RAG ERROR]: {res.text}")

#     except Exception as err:
#         print(f"RAG search error/bypass: {err}")

#     return "", []

# async def generate_combined_answer(
#     db,
#     question: str,
#     organization_id: str,
#     conversation_id: str = None,
# ) -> Dict[str, Any]:
#     """
#     Glavna funkcija: Kombinuje Tool Calling i RAG rezultate sa hibridnom pretragom.
#     """
#     try:
#         # 1. Kreiramo embedding za korisnikov upit
#         query_embedding = embedding_service.embed(question)

#         # 2. Izvršavamo hibridnu pretragu (vektori + ključne reči) sa tenant izolacijom
#         results = hybrid_search(
#             db=db,
#             organization_id=organization_id,
#             query=question,
#             query_embedding=query_embedding,
#         )

#         # 3. KORAK 35 — Provera praga poverenja (Confidence Check)
#         best_score = results[0]["hybrid_score"] if results else 0.0

#         if best_score < RAG_CONFIDENCE_THRESHOLD and not results:
#             return {
#                 "success": True,
#                 "answer": "Ne mogu pouzdano da pronađem odgovor u dostupnoj dokumentaciji.",
#                 "sources": [],
#                 "tool_results": [],
#                 "model": getattr(llm_service, "model", "qwen/qwen3.8-27b"),
#                 "confidence": float(best_score),
#                 "answered": False,
#             }

#         # 4. Pravljenje LLM konteksta iz pronađenih dokumenata
#         def build_context(search_results):
#             context_parts = []
#             for item in search_results:
#                 filename = item.get("filename", "Nepoznat dokument")
#                 page = item.get("page_number", "?")
#                 content = item.get("content", "")
#                 context_parts.append(f"[Izvor: {filename}, Strana: {page}]\n{content}")
#             return "\n\n---\n\n".join(context_parts)

#         rag_context = build_context(results)

#         # 5. Sastavljanje prompta
#         user_prompt = build_rag_prompt(question=question, context=rag_context)

#         messages = [
#             {"role": "system", "content": SYSTEM_PROMPT},
#             {"role": "user", "content": user_prompt}
#         ]

#         tool_results = []

#         # 6. Prvi LLM poziv sa alatima
#         response = llm_service.chat_completion(
#             messages=messages,
#             tools=TOOLS
#         )

#         response_message = response.choices[0].message

#         # 7. Ako LLM zatraži pozivanje alata
#         while getattr(response_message, "tool_calls", None):
#             messages.append(response_message)

#             for tool_call in response_message.tool_calls:
#                 function_name = tool_call.function.name
#                 function_args = json.loads(tool_call.function.arguments)

#                 print(f"🤖 LLM želi da pozove alat: {function_name} sa argumentima: {function_args}")

#                 tool_output = await execute_backend_tool(
#                     tool_name=function_name,
#                     args=function_args,
#                     organization_id=organization_id
#                 )

#                 tool_results.append({
#                     "tool": function_name,
#                     "args": function_args,
#                     "result": tool_output
#                 })

#                 messages.append({
#                     "tool_call_id": tool_call.id,
#                     "role": "tool",
#                     "name": function_name,
#                     "content": json.dumps(tool_output)
#                 })

#             # Ponovni poziv LLM-a nakon izvršenih alata
#             response = llm_service.chat_completion(
#                 messages=messages,
#                 tools=TOOLS
#             )
#             response_message = response.choices[0].message

#        # 8. Pripremamo izvore (citate) za frontend sa obaveznom konverzijom UUID-a u str
#         sources = [
#             {
#                 "document_id": str(item.get("document_id")) if item.get("document_id") else "",
#                 "document": item.get("filename", "Unknown"),
#                 "page": item.get("page_number"),
#                 "score": float(item.get("hybrid_score", 0.0))
#             }
#             for item in results
#         ]

#         # 9. Vraćamo finalni struktuirani JSON odgovor
#         return {
#             "success": True,
#             "answer": response_message.content,
#             "sources": sources,
#             "tool_results": tool_results,
#             "model": getattr(llm_service, "model", "qwen/qwen3.8-27b"),
#             "confidence": float(best_score),
#             "answered": True,
#         }

#     except Exception as e:
#         print(f"Greška u generate_combined_answer: {e}")
#         raise e


# def has_sufficient_confidence(
#     results: list,
#     threshold: float
# ) -> bool:

#     if not results:
#         return False

#     best_score = results[0]["score"]

#     return best_score >= threshold
# def vector_search(
#     db,
#     organization_id: str,
#     query_embedding,
#     top_k: int = 10,
# ):
#     sql = text("""
#         SELECT
#             dc.id,
#             dc.document_id,
#             d.original_name AS filename,
#             dc.content,
#             dc.page_number,
#             (dc.embedding <=> CAST(:query_embedding AS vector)) AS distance
#         FROM document_chunks dc
#         JOIN documents d ON d.id = dc.document_id
#         WHERE d.organization_id = :organization_id
#         ORDER BY dc.embedding <=> CAST(:query_embedding AS vector)
#         LIMIT :top_k
#     """)

#     result = db.execute(
#         sql,
#         {
#             "organization_id": organization_id,
#             "query_embedding": query_embedding,
#             "top_k": top_k,
#         },
#     )

#     return [
#         dict(row._mapping)
#         for row in result
#     ]

# def keyword_search(
#     db,
#     organization_id: str,
#     query: str,
#     top_k: int = 10,
# ):
#     sql = text("""
#         SELECT
#             dc.id,
#             dc.document_id,
#             d.original_name AS filename,
#             dc.content,
#             dc.page_number,
#             ts_rank(
#                 dc.search_vector,
#                 websearch_to_tsquery(
#                     'simple',
#                     :query
#                 )
#             ) AS keyword_score
#         FROM document_chunks dc
#         JOIN documents d ON d.id = dc.document_id
#         WHERE d.organization_id = :organization_id
#           AND dc.search_vector @@
#               websearch_to_tsquery(
#                   'simple',
#                   :query
#               )
#         ORDER BY keyword_score DESC
#         LIMIT :top_k
#     """)

#     result = db.execute(
#         sql,
#         {
#             "organization_id": organization_id,
#             "query": query,
#             "top_k": top_k,
#         },
#     )

#     return [
#         dict(row._mapping)
#         for row in result
#     ]


# def normalize_scores(
#     results: list,
#     score_key: str,
# ) -> list:
#     if not results:
#         return results

#     scores = [
#         float(item[score_key])
#         for item in results
#     ]

#     min_score = min(scores)
#     max_score = max(scores)

#     if max_score == min_score:
#         for item in results:
#             item[f"{score_key}_normalized"] = 1.0
#         return results

#     for item in results:
#         score = float(item[score_key])
#         normalized = (score - min_score) / (max_score - min_score)
#         item[f"{score_key}_normalized"] = normalized

#     return results



# import logging

# logger = logging.getLogger(__name__)
# def hybrid_search(
#     db,
#     organization_id: str,
#     query: str,
#     query_embedding,
# ):

#     vector_results = vector_search(
#         db=db,
#         organization_id=organization_id,
#         query_embedding=query_embedding,
#         top_k=RAG_VECTOR_TOP_K,
#     )


#     keyword_results = keyword_search(
#         db=db,
#         organization_id=organization_id,
#         query=query,
#         top_k=RAG_KEYWORD_TOP_K,
#     )


#     vector_results = normalize_scores(
#         vector_results,
#         "score",
#     )


#     keyword_results = normalize_scores(
#         keyword_results,
#         "keyword_score",
#     )


#     candidates = {}


#     # -----------------------------
#     # VECTOR RESULTS
#     # -----------------------------

#     for item in vector_results:

#         candidates[item["id"]] = {

#             "id":
#                 item["id"],

#             "document_id":
#                 item["document_id"],

#             "filename":
#                 item.get("filename"),

#             "content":
#                 item["content"],

#             "page_number":
#                 item["page_number"],

#             "vector_score":
#                 item.get(
#                     "score_normalized",
#                     0.0,
#                 ),

#             "keyword_score":
#                 0.0,

#         }


#     # -----------------------------
#     # KEYWORD RESULTS
#     # -----------------------------

#     for item in keyword_results:

#         if item["id"] not in candidates:

#             candidates[item["id"]] = {

#                 "id":
#                     item["id"],

#                 "document_id":
#                     item["document_id"],

#                 "filename":
#                     item.get("filename"),

#                 "content":
#                     item["content"],

#                 "page_number":
#                     item["page_number"],

#                 "vector_score":
#                     0.0,

#                 "keyword_score":
#                     0.0,

#             }


#         candidates[
#             item["id"]
#         ]["keyword_score"] = item.get(
#             "keyword_score_normalized",
#             0.0,
#         )


#     # -----------------------------
#     # HYBRID SCORE
#     # -----------------------------

#     results = list(
#         candidates.values()
#     )


#     for item in results:

#         item["hybrid_score"] = (

#             RAG_VECTOR_WEIGHT
#             * item["vector_score"]

#             +

#             RAG_KEYWORD_WEIGHT
#             * item["keyword_score"]

#         )


#     # -----------------------------
#     # SORT
#     # -----------------------------

#     results.sort(
#         key=lambda item:
#             item["hybrid_score"],
#         reverse=True,
#     )


#     # -----------------------------
#     # RETURN TOP 20
#     # -----------------------------

#     return results[
#         :RAG_CANDIDATE_TOP_K
#     ]


# # def rerank_results(
# #     query: str,
# #     results: list[dict],
# #     top_k: int = 5,
# # ) -> list[dict]:

# #     return reranker_service.rerank(
# #         query=query,
# #         documents=results,
# #         top_k=top_k,
# #     )


# def rerank_results(
#     query: str,
#     results: list[dict],
#     top_k: int = 5,
# ) -> list[dict]:

#     service = get_reranker_service()
#     return service.rerank(
#         query=query,
#         documents=results,
#         top_k=top_k,
#     )

# def retrieve_vector_only(
#     db,
#     organization_id: str,
#     query_embedding,
#     top_k: int = 5,
# ):
#     """
#     Služi za evaluaciju i poređenje performansi.
#     Vraća rezultate isključivo na osnovu vektorske (semantičke) sličnosti.
#     """
#     return vector_search(
#         db=db,
#         organization_id=organization_id,
#         query_embedding=query_embedding,
#         top_k=top_k,
#     )



# def hybrid_rerank(
#     db,
#     organization_id: str,
#     query: str,
#     query_embedding,
#     top_k: int = 5,
# ):
#     """
#     Kombinuje hibridnu pretragu (koja vraća širi skup, npr. top 20) 
#     i reranker servis koji izdvaja top_k najpreciznijih rezultata.
#     """
#     # 1. Povlačimo širi skup iz hibridne pretrage
#     hybrid_results = hybrid_search(
#         db=db,
#         organization_id=organization_id,
#         query=query,
#         query_embedding=query_embedding,
#         top_k=20,  # Ovde osiguravamo da uzimamo širi dijapazon za rerankovanje
#     )

#     # 2. Ako nema rezultata, odmah vraćamo praznu listu
#     if not hybrid_results:
#         return []

#     # 3. Propuštamo rezultate kroz reranker
#     return reranker_service.rerank(
#         query=query,
#         documents=hybrid_results,
#         top_k=top_k,
#     )

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


async def search_vector_db(question: str, organization_id: str) -> Tuple[str, List[Dict[str, Any]]]:
    url = f"{NESTJS_BACKEND_URL}/chat/internal/rag/search"
    try:
        query_embedding = embedding_service.embed(question)

        print(f"--> [PYTHON -> NESTJS RAG] Pozivam: {url}")
        async with httpx.AsyncClient() as client:
            res = await client.post(
                url,
                json={
                    "embedding": query_embedding,
                    "organizationId": organization_id,
                    "topK": 4
                },
                timeout=10.0
            )
            
            print(f"<-- [NESTJS RAG STATUS]: {res.status_code}")
            if res.status_code == 200:
                data = res.json()
                chunks = data.get("chunks", [])
                
                context_parts = []
                sources = []

                for chunk in chunks:
                    context_parts.append(chunk.get("content", ""))
                    
                    source_entry = {
                        "document": chunk.get("filename") or chunk.get("document_name", "Dokument"),
                        "page": chunk.get("page", 1)
                    }
                    if chunk.get("document_id"):
                        source_entry["document_id"] = chunk.get("document_id")

                    if source_entry not in sources:
                        sources.append(source_entry)

                formatted_context = "\n\n".join(context_parts)
                return formatted_context, sources
            else:
                print(f"<-- [NESTJS RAG ERROR]: {res.text}")

    except Exception as err:
        print(f"RAG search error/bypass: {err}")

    return "", []


# async def generate_combined_answer(
#     db,
#     question: str,
#     organization_id: str,
#     conversation_id: str = None,
# ) -> Dict[str, Any]:
#     try:
#         query_embedding = embedding_service.embed(question)

#         results = hybrid_search(
#             db=db,
#             organization_id=organization_id,
#             query=question,
#             query_embedding=query_embedding,
#         )

#         best_score = results[0]["hybrid_score"] if results else 0.0

#         if best_score < RAG_CONFIDENCE_THRESHOLD and not results:
#             return {
#                 "success": True,
#                 "answer": "Ne mogu pouzdano da pronađem odgovor u dostupnoj dokumentaciji.",
#                 "sources": [],
#                 "tool_results": [],
#                 "model": getattr(llm_service, "model", "qwen/qwen3.8-27b"),
#                 "confidence": float(best_score),
#                 "answered": False,
#             }

#         def build_context(search_results):
#             context_parts = []
#             for item in search_results:
#                 filename = item.get("filename", "Nepoznat dokument")
#                 page = item.get("page_number", "?")
#                 content = item.get("content", "")
#                 context_parts.append(f"[Izvor: {filename}, Strana: {page}]\n{content}")
#             return "\n\n---\n\n".join(context_parts)

#         rag_context = build_context(results)
#         user_prompt = build_rag_prompt(question=question, context=rag_context)

#         messages = [
#             {"role": "system", "content": SYSTEM_PROMPT},
#             {"role": "user", "content": user_prompt}
#         ]

#         tool_results = []

#         response = llm_service.chat_completion(
#             messages=messages,
#             tools=TOOLS
#         )

#         response_message = response.choices[0].message

#         while getattr(response_message, "tool_calls", None):
#             messages.append(response_message)

#             for tool_call in response_message.tool_calls:
#                 function_name = tool_call.function.name
#                 function_args = json.loads(tool_call.function.arguments)

#                 print(f"🤖 LLM želi da pozove alat: {function_name} sa argumentima: {function_args}")

#                 tool_output = await execute_backend_tool(
#                     tool_name=function_name,
#                     args=function_args,
#                     organization_id=organization_id
#                 )

#                 tool_results.append({
#                     "tool": function_name,
#                     "args": function_args,
#                     "result": tool_output
#                 })

#                 messages.append({
#                     "tool_call_id": tool_call.id,
#                     "role": "tool",
#                     "name": function_name,
#                     "content": json.dumps(tool_output)
#                 })

#             response = llm_service.chat_completion(
#                 messages=messages,
#                 tools=TOOLS
#             )
#             response_message = response.choices[0].message

#         sources = [
#             {
#                 "document_id": str(item.get("document_id")) if item.get("document_id") else "",
#                 "document": item.get("filename", "Unknown"),
#                 "page": item.get("page_number"),
#                 "score": float(item.get("hybrid_score", 0.0))
#             }
#             for item in results
#         ]

#         return {
#             "success": True,
#             "answer": response_message.content,
#             "sources": sources,
#             "tool_results": tool_results,
#             "model": getattr(llm_service, "model", "qwen/qwen3.8-27b"),
#             "confidence": float(best_score),
#             "answered": True,
#         }

#     except Exception as e:
#         print(f"Greška u generate_combined_answer: {e}")
#         raise e


async def generate_combined_answer(
    db,
    question: str,
    organization_id: str,
    conversation_id: str = None,
) -> Dict[str, Any]:
    try:
        query_embedding = embedding_service.embed(question)

        # 1. Hibridna pretraga (Top 20 kandidata)
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

        # 2. Reranking na Top 5 rezultata
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

        # Uzimamo najbolji skor (Reranker skor ili Hybrid ako je merilo)
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
            messages.append(response_message)

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
            
            # Uzimamo bolji skor (reranker ili hybrid)
            score = float(item.get("reranker_score", item.get("hybrid_score", 0.0)))
            
            if key not in unique_sources or score > unique_sources[key]["score"]:
                unique_sources[key] = {
                    "document_id": str(item.get("document_id")) if item.get("document_id") else "",
                    "document": doc_name,
                    "page": page,
                    "score": score
                }

        # Sortiramo izvore po skoru od najvećeg ka najmanjem
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

def has_sufficient_confidence(
    results: list,
    threshold: float
) -> bool:
    if not results:
        return False
    best_score = results[0]["score"]
    return best_score >= threshold


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

    vector_results = normalize_scores(
        vector_results,
        "distance",
    )

    keyword_results = normalize_scores(
        keyword_results,
        "keyword_score",
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