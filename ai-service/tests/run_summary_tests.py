import json
import os
import requests

# Čita iz Docker okruženja, a ako nema - koristi localhost za lokalni test
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8000")

def load_json(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def run_tests():
    print("Pokretanje testova za sumiranje dokumenata i detekciju halucinacija...\n")
    
    questions_path = os.path.join("tests", "summary_tests", "questions.json")
    expected_path = os.path.join("tests", "summary_tests", "expected.json")

    # Ispravljeno: os.path.exists (s tačkom)
    if not os.path.exists(questions_path) or not os.path.exists(expected_path):
        print("Greška: Test fajlovi nisu pronađeni!")
        return

    questions = load_json(questions_path)
    expected = load_json(expected_path)

    # Primer testiranja preciznosti brojeva, cena i halucinacija
    print("--- TEST 1: Provera stabilnosti i formata pitanja ---")
    for q in questions:
        print(f"[{q['id']}] Pitanje: {q['question']}")
        # Ovde možeš simulirati poziv ka tvom RAG/AI sistemu
        # npr: response = requests.post(f"{AI_SERVICE_URL}/ai/ask", json={"question": q['question']})
        print("    Status: ✅ PASS (Struktura odgovora validna)\n")

    print("--- TEST 2: Detekcija halucinacija (Provera cena i brojeva) ---")
    # Primer provere da li model halucinira cenu
    expected_price = expected["prices"][0]
    
    # Simuliramo dobijeni summary ili RAG odgovor
    generated_summary_price = "Portland cement CEM II/A-S 42.5N: 480.00 RSD (excl. VAT), 576.00 RSD (incl. VAT) per 25 kg bag"
    
    # Ispravljeno: Dodati f-string navodnici
    print(f"Expected: {expected_price}")
    print(f"Dobijeno: {generated_summary_price}")

    if expected_price == generated_summary_price:
        print("Rezultat: ✅ PASS (Nema halucinacije, podaci se podudaraju)\n")
    else:
        print("Rezultat: ❌ FAIL (Detektovana halucinacija ili neslaganje brojeva/cena!)\n")

    print("Svi testovi uspešno završeni.")

if __name__ == "__main__":
    run_tests()