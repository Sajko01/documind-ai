from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"


model = SentenceTransformer(
    MODEL_NAME
)


text = (
    "Rok za reklamaciju proizvoda "
    "je 30 dana."
)


embedding = model.encode(
    text,
    normalize_embeddings=True,
)


print(
    "Model:",
    MODEL_NAME,
)

print(
    "Embedding dimensions:",
    len(embedding),
)

print(
    "First 10 values:",
    embedding[:10],
)