import json
from app.services.rag_service import (
    retrieve_vector_only,
    hybrid_search,
    hybrid_rerank,
)
from app.services.embedding_service import EmbeddingService
from app.services.database import SessionLocal

embedding_service = EmbeddingService()


def load_dataset(path: str) -> list[dict]:
    """Učitava dataset sa testnim upitima i očekivanim izvorima iz JSON fajla."""
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def extract_filename_and_page(result: dict) -> tuple[str | None, int | None]:
    """Extrahira ime dokumenta i broj stranice bez obzira na strukturu rečnika."""
    filename = None
    page = None

    # Moguće lokacije za filename
    if "filename" in result:
        filename = result["filename"]
    elif "document" in result:
        filename = result["document"]
    elif "source" in result:
        filename = result["source"]
    elif isinstance(result.get("metadata"), dict):
        filename = result["metadata"].get("filename") or result["metadata"].get("source")

    # Moguće lokacije za page_number
    if "page_number" in result:
        page = result["page_number"]
    elif "page" in result:
        page = result["page"]
    elif isinstance(result.get("metadata"), dict):
        page = result["metadata"].get("page_number") or result["metadata"].get("page")

    return filename, page


def is_relevant(
    result: dict,
    expected_document: str,
    expected_page: int | None = None,
) -> bool:
    """Proverava da li dati rezultat pretrage odgovara očekivanom dokumentu i strani."""
    filename, page = extract_filename_and_page(result)

    if not filename:
        return False

    # Poređenje imena fajla (zanemaruje mala/velika slova)
    if filename.strip().lower() != expected_document.strip().lower():
        return False

    # Provera stranice samo ako je prosleđena u očekivanim vrednostima
    if expected_page is not None and page is not None:
        try:
            if int(page) != int(expected_page):
                return False
        except (ValueError, TypeError):
            pass

    return True


def recall_at_k(
    results: list[dict],
    expected_document: str,
    expected_page: int | None,
    k: int = 5,
) -> float:
    """Proverava da li se u prvih k rezultata nalazi relevantan dokument/strana (1.0 ili 0.0)."""
    top_results = results[:k]

    for result in top_results:
        if is_relevant(
            result,
            expected_document,
            expected_page,
        ):
            return 1.0

    return 0.0


def evaluate(db, organization_id: str, dataset: list[dict]):
    """Glavna funkcija koja iterira kroz dataset i meri Recall@5 za sve strategije."""
    print(f"🚀 Pokrećem evaluaciju za {len(dataset)} upita...\n")

    vector_hits = 0
    hybrid_hits = 0
    rerank_hits = 0
    total_queries = len(dataset)

    for index, item in enumerate(dataset, 1):
        query = item.get("query") or item.get("question")
        expected_doc = item.get("expected_document")
        expected_page = item.get("expected_page")

        if not query or not query.strip():
            print(f"⚠️ Preskačem upit #{index}: Nedostaje tekst upita u datasetu.")
            continue

        # Generisanje embedding-a za upit
        query_embedding = embedding_service.embed(query)

        # 1. Vector Only pretraga
        vector_results = retrieve_vector_only(
            db=db,
            organization_id=organization_id,
            query_embedding=query_embedding,
            top_k=5,
        )

        # Ispis strukture prvog rezultata za dijagnostiku na prvom upitu
        if index == 1 and vector_results:
            print("--- DIJAGNOSTIKA REZULTATA IZ BAZE ---")
            print("Primer prvog vratiće iz baze:", vector_results[0])
            ext_fn, ext_pg = extract_filename_and_page(vector_results[0])
            print(f"Izdvojeno -> filename: '{ext_fn}', page: {ext_pg}")
            print("--------------------------------------\n")

        v_hit = recall_at_k(vector_results, expected_doc, expected_page, k=5)
        vector_hits += v_hit

        # 2. Hybrid pretraga
        hybrid_results = hybrid_search(
            db=db,
            organization_id=organization_id,
            query=query,
            query_embedding=query_embedding,
        )
        h_hit = recall_at_k(hybrid_results, expected_doc, expected_page, k=5)
        hybrid_hits += h_hit

        # 3. Hybrid + Reranker (Top 5)
        reranked_results = hybrid_rerank(
            db=db,
            organization_id=organization_id,
            query=query,
            query_embedding=query_embedding,
            top_k=5,
        )
        r_hit = recall_at_k(reranked_results, expected_doc, expected_page, k=5)
        rerank_hits += r_hit

        print(f"Upit #{index}: \"{query}\"")
        print(f"  ├─ Vector Recall@5:           {v_hit * 100:.0f}%")
        print(f"  ├─ Hybrid Recall@5:           {h_hit * 100:.0f}%")
        print(f"  └─ Hybrid + Reranker Recall@5: {r_hit * 100:.0f}%\n")

    # Prosečni Recall@5
    avg_vector_recall = (vector_hits / total_queries) * 100 if total_queries > 0 else 0
    avg_hybrid_recall = (hybrid_hits / total_queries) * 100 if total_queries > 0 else 0
    avg_rerank_recall = (rerank_hits / total_queries) * 100 if total_queries > 0 else 0

    print("=" * 60)
    print("📊 KONAČNI REZULTATI EVALUACIJE (Mean Recall@5):")
    print("=" * 60)
    print(f"1. Vector Recall@5:           {avg_vector_recall:.2f}%")
    print(f"2. Hybrid Recall@5:           {avg_hybrid_recall:.2f}%")
    print(f"3. Hybrid + Reranker Recall@5: {avg_rerank_recall:.2f}%")
    print("=" * 60)


if __name__ == "__main__":
    dataset = load_dataset("evaluation_dataset.json")
    db = SessionLocal()

    try:
        YOUR_TEST_ORGANIZATION_ID = "03c95187-5707-4942-bde5-caaff78b5ed8"

        evaluate(
            db=db,
            organization_id=YOUR_TEST_ORGANIZATION_ID,
            dataset=dataset,
        )

    finally:
        db.close()