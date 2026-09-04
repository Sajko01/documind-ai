import tiktoken


class TextChunker:

    def __init__(
        self,
        chunk_size: int = 700,
        overlap: int = 120,
    ):

        if chunk_size <= 0:
            raise ValueError(
                "Chunk size must be greater than 0"
            )

        if overlap < 0:
            raise ValueError(
                "Overlap cannot be negative"
            )

        if overlap >= chunk_size:
            raise ValueError(
                "Overlap must be smaller than chunk size"
            )

        self.chunk_size = chunk_size
        self.overlap = overlap

        self.encoding = (
            tiktoken.get_encoding(
                "cl100k_base"
            )
        )

    def count_tokens(
        self,
        text: str,
    ) -> int:

        if not text:
            return 0

        return len(
            self.encoding.encode(text)
        )

    def chunk_text(
        self,
        text: str,
    ) -> list[dict]:

        if not text:
            return []

        tokens = self.encoding.encode(
            text
        )

        chunks = []

        step = (
            self.chunk_size
            - self.overlap
        )

        start = 0
        chunk_index = 0

        while start < len(tokens):

            end = min(
                start + self.chunk_size,
                len(tokens),
            )

            chunk_tokens = tokens[
                start:end
            ]

            chunk_content = (
                self.encoding.decode(
                    chunk_tokens
                )
            ).strip()

            if chunk_content:

                chunks.append(
                    {
                        "chunk_index": chunk_index,
                        "content": chunk_content,
                        "token_count": len(
                            chunk_tokens
                        ),
                    }
                )

                chunk_index += 1

            start += step

        return chunks

    def chunk_pages(
        self,
        pages: list[dict],
        document_id: str,
    ) -> list[dict]:

        chunks = []

        global_chunk_index = 0

        for page in pages:

            page_number = page[
                "page_number"
            ]

            text = page["text"]

            if not text:
                continue

            page_chunks = self.chunk_text(
                text
            )

            for chunk in page_chunks:

                chunks.append(
                    {
                        "document_id": document_id,
                        "page_number": page_number,
                        "chunk_index": global_chunk_index,
                        "content": chunk[
                            "content"
                        ],
                        "token_count": chunk[
                            "token_count"
                        ],
                    }
                )

                global_chunk_index += 1

        return chunks