# DocuMind AI — RAG Architecture

## 1. Overview

DocuMind AI uses Retrieval-Augmented Generation (RAG)
to answer questions using company-specific documentation.

The system does not rely only on the LLM's internal knowledge.

Instead, relevant information is retrieved from the company's
documents and provided to the LLM as context.

---

# 2. Document Ingestion Pipeline

The document ingestion pipeline is:

```text
PDF
 |
 v
Text Extraction
 |
 v
Cleaning
 |
 v
Chunking
 |
 v
Embedding Generation
 |
 v
Vector Storage
 |
 v
pgvector
3. PDF Extraction

The system extracts text from PDF documents.

Each extracted piece of text should preserve metadata such as:

document_id
page_number
content

The page number is important for citations.

4. Text Cleaning

Before chunking, extracted text should be cleaned.

Possible operations:

remove unnecessary whitespace
normalize line breaks
remove empty lines
normalize repeated characters
preserve meaningful structure
5. Chunking

Documents are divided into smaller chunks.

Initial configuration:

Chunk size:
500–1000 tokens

Overlap:
100–150 tokens

These values are initial hypotheses and should later
be evaluated experimentally.

6. Embeddings

Each chunk is converted into a vector representation.

Conceptually:

Text chunk
 |
 v
Embedding model
 |
 v
Vector

The vector represents the semantic meaning of the text.

7. Vector Storage

Embeddings are stored using pgvector.

Conceptually:

document_chunks

id
document_id
content
page_number
embedding
metadata
8. Query Processing

When the user asks a question:

User question
 |
 v
Query embedding
 |
 v
Vector search
 |
 v
Relevant chunks
9. Retrieval

The initial retrieval strategy will use vector similarity search.

Example:

Question
 |
 v
Query vector
 |
 v
pgvector
 |
 v
Top K chunks

Initial target:

Top K = 5

This value should later be evaluated.

10. RAG Context

Retrieved chunks are combined into a context.

Conceptually:

Question

+

Retrieved document chunks

+

System instructions

are sent to the LLM.

11. LLM Prompt

The LLM should follow rules such as:

You are an AI assistant for a company.

Answer using only the provided context.

If the answer cannot be found in the provided context,
say that there is not enough information.

Do not invent prices, policies or product information.

Use the retrieved sources when generating the answer.
12. Answer Generation

The pipeline becomes:

Question
 |
 v
Embedding
 |
 v
Retrieval
 |
 v
Context
 |
 v
LLM
 |
 v
Answer
13. Citations

Every retrieved chunk should contain enough metadata
to trace the answer back to the original document.

Required metadata:

document_id
filename
page_number

The final response should contain:

{
  "answer": "...",
  "sources": [
    {
      "document": "cenovnik_2026.pdf",
      "page": 12
    }
  ]
}
14. Hybrid Search

The initial implementation will use vector search.

A later version will combine:

Semantic/vector search
+
Keyword/full-text search

This is especially useful for:

SKU numbers
exact product names
exact codes
numbers
technical terms
15. Reranking

The system may initially retrieve more candidates:

Top 20

Then a reranker can reorder them:

Top 20
 |
 v
Reranker
 |
 v
Top 5

The reranking stage will be evaluated experimentally.

16. Retrieval Evaluation

A retrieval evaluation dataset should be created.

Example:

{
  "question": "Koliko košta CEM II 42.5?",
  "expected_document": "cenovnik_2026.pdf",
  "expected_page": 12
}

The system should measure whether the expected
document/chunk appears in the retrieved results.

Possible metric:

Recall@5
17. Answer Evaluation

The system should also evaluate generated answers.

Possible evaluation dimensions:

answer correctness
citation correctness
retrieval quality
unsupported claims
answer relevance
18. Low Confidence

If retrieval confidence is below a configured threshold,
the system should not confidently generate an unsupported answer.

Example:

confidence < threshold

Then:

I could not reliably find an answer in the available
documentation.

The question can optionally be stored as an unanswered question.

19. Complete RAG Pipeline

Final target architecture:

                    USER QUESTION
                          |
                          v
                   Query Embedding
                          |
                          v
                Hybrid Retrieval
                  /           \
                 /             \
        Vector Search      Keyword Search
                 \             /
                  \           /
                   v           v
                    Candidate Chunks
                           |
                           v
                       Reranker
                           |
                           v
                       Top Chunks
                           |
                           v
                         Context
                           |
                           v
                          LLM
                           |
                           v
                  Answer + Citations