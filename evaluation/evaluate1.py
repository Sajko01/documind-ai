import json
import requests

def evaluate_rag():
    try:
        with open("evaluation/rag_questions.json", "r", encoding="utf-8") as f:
            tests = json.load(f)
    except FileNotFoundError:
        print("Greška: Nije pronađen evaluation/rag_questions.json")
        return

    correct_answers = 0
    total_tests = len(tests)

    for test in tests:
        payload = {
            "question": test["question"],
            "context": test.get("context", "")
        }
        
        try:
            response = requests.post("http://localhost:8000/generate", json=payload)
            if response.status_code == 200:
                answer = response.json().get("answer", "").lower()
                contains_all = all(kw.lower() in answer for kw in test["expected_answer_contains"])
                if contains_all:
                    correct_answers += 1
                    print(f"[PASS] Test {test['id']} ({test['type']})")
                else:
                    print(f"[FAIL] Test {test['id']} ({test['type']}) - Odgovor: {answer}")
            else:
                print(f"[ERROR] Test {test['id']} - Status: {response.status_code}")
        except Exception as e:
            print(f"Greška pri slanju zahteva: {e}")
            return

    correctness_score = (correct_answers / total_tests) * 100
    print(f"\n--- EVALUACIJA ZAVRŠENA ---")
    print(f"Answer Correctness: {correctness_score:.1f}%")

if __name__ == "__main__":
    evaluate_rag()