from app.services.reranker_service import (
    reranker_service,
)


query = (
    "Koliko košta CEM II?"
)


documents = [

    {
        "id": "1",
        "content":
            "CEM II cement costs "
            "12.50 EUR per unit.",
    },

    {
        "id": "2",
        "content":
            "Delivery is available "
            "throughout Serbia.",
    },

    {
        "id": "3",
        "content":
            "The company was founded "
            "in 1998.",
    },

]


results = reranker_service.rerank(
    query=query,
    documents=documents,
    top_k=3,
)


for result in results:

    print(
        "ID:",
        result["id"],
    )

    print(
        "Score:",
        result["reranker_score"],
    )

    print(
        "Content:",
        result["content"],
    )

    print("-" * 50)