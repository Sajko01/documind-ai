from sentence_transformers import CrossEncoder

from app.config import RERANKER_MODEL


class RerankerService:

    def __init__(self):
        print(f"Loading reranker model: {RERANKER_MODEL}")
        self.model = CrossEncoder(RERANKER_MODEL)
        print("Reranker model loaded.")

    def rerank(
        self,
        query: str,
        documents: list[dict],
        top_k: int = 5,
    ) -> list[dict]:

        if not documents:
            return []

        pairs = [[query, document["content"]] for document in documents]

        scores = self.model.predict(pairs)

        reranked = []

        for document, score in zip(documents, scores):
            item = dict(document)
            item["reranker_score"] = float(score)
            reranked.append(item)

        reranked.sort(
            key=lambda item: item["reranker_score"],
            reverse=True,
        )

        return reranked[:top_k]


# Lazy Singleton – instancira se tek kada funkcija zapravo zatreba
_reranker_instance = None


def get_reranker_service() -> RerankerService:
    global _reranker_instance
    if _reranker_instance is None:
        _reranker_instance = RerankerService()
    return _reranker_instance