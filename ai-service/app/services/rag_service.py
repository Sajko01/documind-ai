import json
import os
import httpx
from typing import Any, Dict, List, Tuple

from app.prompts.rag_prompt import SYSTEM_PROMPT, build_rag_prompt
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LlmService

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

# Vodimo računa da URL nema trailing slash na kraju
# NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3000").rstrip("/")
NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3000/api").rstrip("/")


async def execute_backend_tool(tool_name: str, args: Dict[str, Any], organization_id: str) -> Dict[str, Any]:
    """Slanje zahteva na NestJS backend za izvršavanje biznis alata."""
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
    """
    RAG pretraga: Vraća formatiran tekstualni kontekst i striktne citations (sources).
    """
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


async def generate_combined_answer(
    question: str,
    organization_id: str,
    conversation_id: str = None
) -> Dict[str, Any]:
    """
    Glavna funkcija: Kombinuje Tool Calling i RAG rezultate.
    """
    # 1. Dobijanje RAG konteksta
    rag_context, sources = await search_vector_db(question, organization_id)

    # 2. Sastavljanje prompta
    user_prompt = build_rag_prompt(question=question, context=rag_context)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ]

    tool_results = []

    # 3. Prvi LLM poziv sa alatima
    response = llm_service.chat_completion(
        messages=messages,
        tools=TOOLS
    )

    response_message = response.choices[0].message

    # 4. Ako LLM zatraži pozivanje alata
    while response_message.tool_calls:
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

        # Ponovni poziv LLM-a nakon izvršenih alata
        response = llm_service.chat_completion(
            messages=messages,
            tools=TOOLS
        )
        response_message = response.choices[0].message

    # 5. Vraćamo finalni struktuirani JSON odgovor
    return {
        "success": True,
        "answer": response_message.content,
        "sources": sources,
        "tool_results": tool_results,
        "model": llm_service.model
    }