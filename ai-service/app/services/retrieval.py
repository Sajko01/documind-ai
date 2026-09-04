# # Nakon što izvršiš SQL upit nad bazom i dobiješ `rows`:
# results = []
# for row in rows:
#     results.append({
#         "document_id": str(row["document_id"]),
#         "filename": row["filename"],
#         "page": row["page_number"],
#         "content": row["content"],
#         "score": float(row["score"]),
#     })

# # Formiraš context string za LLM prompt
# context_str = "\n\n".join([f"[{r['filename']} - Page {r['page']}]: {r['content']}" for r in results])

# # Vraćaš odgovarajući objekat sa izvorima
#     return {
#         "context": context_str,
#         "sources": results
#     }