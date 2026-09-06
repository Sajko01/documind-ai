import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Uzima URL baze iz tvog .env fajla u Python servisu
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://korisnik:lozinka@localhost:5432/ime_baze")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ova funkcija otvara i zatvara sesiju za FastAPI endpoint
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()