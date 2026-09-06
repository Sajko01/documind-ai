import os

# Konfiguracija za RAG
RAG_CONFIDENCE_THRESHOLD = float(
    os.getenv(
        "RAG_CONFIDENCE_THRESHOLD",
        "0.40"
    )
)

RAG_VECTOR_TOP_K = int(
    os.getenv(
        "RAG_VECTOR_TOP_K",
        "20",
    )
)

RAG_KEYWORD_TOP_K = int(
    os.getenv(
        "RAG_KEYWORD_TOP_K",
        "20",
    )
)

RAG_CANDIDATE_TOP_K = int(
    os.getenv(
        "RAG_CANDIDATE_TOP_K",
        "20",
    )
)

RAG_TOP_K = int(
    os.getenv(
        "RAG_TOP_K",
        "5",
    )
)

RAG_VECTOR_WEIGHT = float(
    os.getenv(
        "RAG_VECTOR_WEIGHT",
        "0.70",
    )
)

RAG_KEYWORD_WEIGHT = float(
    os.getenv(
        "RAG_KEYWORD_WEIGHT",
        "0.30",
    )
)

RERANKER_MODEL = os.getenv(
    "RERANKER_MODEL",
    "BAAI/bge-reranker-v2-m3",
)

if abs(
    RAG_VECTOR_WEIGHT
    + RAG_KEYWORD_WEIGHT
    - 1.0
) > 0.001:

    raise ValueError(
        "RAG_VECTOR_WEIGHT + "
        "RAG_KEYWORD_WEIGHT must equal 1.0"
    )


import os
from dotenv import load_dotenv

# Učitava promenljive iz .env fajla
load_dotenv()

# Provera da li je debug uključen
DEBUG_RAG = os.getenv("DEBUG_RAG", "false").lower() == "true"


def process_rag_query(query: str):
    # 1. Hibridna pretraga...
    chunks = hybrid_search(query)

    if DEBUG_RAG:
        print("\n=== [DEBUG] PRE RERANKINGA ===")
        for i, chunk in enumerate(chunks, 1):
            print(f"Rank {i} | Chunk: {chunk.name} | Score: {chunk.score}")

    # 2. Reranking korak...
    reranked_chunks = rerank(query, chunks)

    if DEBUG_RAG:
        print("\n=== [DEBUG] POSLE RERANKINGA ===")
        for i, chunk in enumerate(reranked_chunks, 1):
            print(f"Rank {i} | Chunk: {chunk.name} | Reranker Score: {chunk.score}")

    return reranked_chunks