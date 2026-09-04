import json
import requests

SEARCH_URL = "http://localhost:3000/api/documents/search"
# Unesi važeći JWT token (dobijen iz login rute)
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MmM5M2Y4Ni1hNzk4LTQ2YzItODE1NC1lN2MzNjU2MDQwMTgiLCJlbWFpbCI6ImFkbWluQkB0ZXN0LmNvbSIsIm9yZ2FuaXphdGlvbklkIjoiMDNjOTUxODctNTcwNy00OTQyLWJkZTUtY2FhZmY3OGI1ZWQ4Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzg4NDU4Mzc4LCJleHAiOjE3ODg0NTkyNzh9.1btLczRdLOlV0FO_1VTHdOi25JweFWG1Pl0ojrtgtrk"

def load_questions():
    with open("questions.json", "r", encoding="utf-8") as file:
        return json.load(file)

def evaluate_question(question):
    try:
        response = requests.post(
            SEARCH_URL,
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json",
            },
            json={
                "query": question["question"],
                "topK": 10,
            },
            timeout=30,
        )
        # NestJS za @Post vraća 201 Created
        if response.status_code not in (200, 201):
            print(f"  ❌ Greška [{response.status_code}]: {response.text}")
            return None
            
        return response.json()
    except Exception as e:
        print(f"  ❌ Mrežna greška: {e}")
        return None

def check_hit_at_k(question, results, k):
    expected_doc = question.get("expected_document")
    expected_page = question.get("expected_page")
    expected_chunk = question.get("expected_chunk_index")

    # Proveravamo prvih K rezultata
    for res in results[:k]:
        # Prilagodi polja u zavisnosti od odgovora tvog API-ja:
        # res.get("document") ili res.get("filename") ili res.get("metadata", {}).get("page")
        doc_name = res.get("document") or res.get("filename") or res.get("metadata", {}).get("filename")
        page_num = res.get("page") or res.get("metadata", {}).get("page")
        chunk_idx = res.get("chunk_index") or res.get("chunkIndex") or res.get("metadata", {}).get("chunkIndex")

        # Provera poklapanja sa ground truth-om
        doc_matches = doc_name == expected_doc if expected_doc else True
        page_matches = int(page_num) == int(expected_page) if (page_num is not None and expected_page is not None) else True
        chunk_matches = int(chunk_idx) == int(expected_chunk) if (chunk_idx is not None and expected_chunk is not None) else True

        if doc_matches and page_matches and chunk_matches:
            return True

    return False

def main():
    questions = load_questions()
    
    # Filtriramo samo pitanja koja imaju naveden ground truth
    valid_questions = [q for q in questions if q.get("expected_document") is not None]
    total = len(valid_questions)

    if total == 0:
        print("Nema pitanja sa definisanim ground truth podacima u questions.json!")
        return

    hits = {1: 0, 3: 0, 5: 0, 10: 0}

    print(f"Započinjem evaluaciju nad {total} pitanja...\n")

    for q in valid_questions:
        print(f'[{q["id"]}] {q["question"]}')
        
        res_data = evaluate_question(q)
        
        if not res_data:
            print("  -> SKIPPED (Greška sa API-jem)")
            continue

        # Pretpostavljamo da API vraća niz u "results" ili je odgovor sam niz
        results = res_data.get("results", res_data) if isinstance(res_data, dict) else res_data

        # Izračunavanje Hit@K
        hit_1 = check_hit_at_k(q, results, 1)
        hit_3 = check_hit_at_k(q, results, 3)
        hit_5 = check_hit_at_k(q, results, 5)
        hit_10 = check_hit_at_k(q, results, 10)

        if hit_1: hits[1] += 1
        if hit_3: hits[3] += 1
        if hit_5: hits[5] += 1
        if hit_10: hits[10] += 1

        print(f'  HIT@1: {hit_1} | HIT@3: {hit_3} | HIT@5: {hit_5} | HIT@10: {hit_10}')

    print("\n==========================================")
    print("        RETRIEVAL EVALUATION REPORT       ")
    print("==========================================")
    print(f"Ukupno validnih pitanja: {total}\n")
    print(f"Recall@1  (Hit@1)  : {hits[1] / total:.2%} ({hits[1]}/{total})")
    print(f"Recall@3  (Hit@3)  : {hits[3] / total:.2%} ({hits[3]}/{total})")
    print(f"Recall@5  (Hit@5)  : {hits[5] / total:.2%} ({hits[5]}/{total})")
    print(f"Recall@10 (Hit@10) : {hits[10] / total:.2%} ({hits[10]}/{total})")
    print("==========================================")

if __name__ == "__main__":
    main()