import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY").strip())

# Izlistaj sve modele dostupne za tvoj nalog
models = client.models.list()
print("Dostupni modeli na tvom nalogu:")
for model in models.data:
    print(f"- {model.id}")