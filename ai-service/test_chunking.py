from app.services.text_chunker import TextChunker


def build_test_text():
    sentences = []

    for i in range(1, 301):

        sentences.append(
            f"Rečenica broj {i} govori o "
            f"uslovima poslovanja kompanije "
            f"i pravilima za korisnike."
        )

    return " ".join(sentences)


def run_test(
    chunk_size: int,
    overlap: int,
):

    text = build_test_text()

    chunker = TextChunker(
        chunk_size=chunk_size,
        overlap=overlap,
    )

    chunks = chunker.chunk_text(
        text
    )

    print("=" * 60)

    print(
        f"CHUNK SIZE: {chunk_size}"
    )

    print(
        f"OVERLAP: {overlap}"
    )

    print(
        f"NUMBER OF CHUNKS: {len(chunks)}"
    )

    print()

    for chunk in chunks[:5]:

        print(
            f"Chunk {chunk['chunk_index']}: "
            f"{chunk['token_count']} tokens"
        )

        print(
            chunk["content"][:150]
        )

        print()


if __name__ == "__main__":

    run_test(
        chunk_size=700,
        overlap=0,
    )

    run_test(
        chunk_size=700,
        overlap=100,
    )

    run_test(
        chunk_size=700,
        overlap=150,
    )