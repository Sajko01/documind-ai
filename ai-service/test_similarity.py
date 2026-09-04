from sentence_transformers import SentenceTransformer


model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


texts = [
    "Rok za reklamaciju je 30 dana.",
    "Kupac može podneti reklamaciju u roku od mesec dana.",
    "Danas je lepo vreme.",
]


embeddings = model.encode(
    texts,
    normalize_embeddings=True,
)


similarity_01 = (
    embeddings[0] @ embeddings[1]
)

similarity_02 = (
    embeddings[0] @ embeddings[2]
)


print(
    "Similarity 1-2:",
    similarity_01,
)

print(
    "Similarity 1-3:",
    similarity_02,
)