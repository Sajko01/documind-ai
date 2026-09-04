from sentence_transformers import SentenceTransformer


class EmbeddingService:

    MODEL_NAME = "all-MiniLM-L6-v2"

    def __init__(self):

        self.model = SentenceTransformer(
            self.MODEL_NAME
        )

    def embed(
        self,
        text: str,
    ) -> list[float]:

        if not text or not text.strip():
            raise ValueError(
                "Text cannot be empty"
            )

        embedding = self.model.encode(
            text,
            normalize_embeddings=True,
        )

        return embedding.tolist()

    def embed_many(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        if not texts:
            return []

        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
        )

        return embeddings.tolist()

    def dimensions(self) -> int:

        return self.model.get_sentence_embedding_dimension()