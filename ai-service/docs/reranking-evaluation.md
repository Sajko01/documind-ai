# Reranking Evaluation

## Dataset

Number of questions: XX

The same evaluation dataset was used
for all retrieval methods.

## Methods

1. Vector Search
2. Hybrid Search
3. Hybrid Search + Cross-Encoder Reranker

## Results

| Method | Recall@5 |
|---|---:|
| Vector | XX.X% |
| Hybrid | XX.X% |
| Hybrid + Reranker | XX.X% |

## Configuration

Vector candidates: 20

Keyword candidates: 20

Hybrid candidates: 20

Final results: 5

Vector weight: 0.70

Keyword weight: 0.30

Reranker:

BAAI/bge-reranker-v2-m3