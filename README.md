# DocuMind AI

**AI-powered document intelligence and business knowledge platform built with RAG, semantic search, LLMs, and a modern full-stack architecture.**

DocuMind AI enables organizations to upload business documents, search their internal knowledge using natural language, receive AI-generated answers with source citations, and combine unstructured documents with structured business data.

## Key Features

- 📄 PDF document upload and processing
- 🔍 Semantic search with pgvector
- 🤖 Retrieval-Augmented Generation (RAG)
- 📚 Source citations for AI-generated answers
- 💬 AI chat with conversation history
- 🏢 Multi-tenant organization architecture
- 🔐 JWT authentication and role-based access control
- 📦 Product management and structured product search
- 🛠️ AI tool calling
- 🧾 Offer generation and price calculation
- ✉️ AI-assisted business email generation
- 📝 Document and conversation summarization
- 📊 Analytics and AI performance metrics
- 👍 User feedback collection
- ❓ Unanswered-question tracking
- 🐳 Dockerized multi-service architecture

## Architecture

```text
                     ┌─────────────────┐
                     │ Angular Frontend│
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  NestJS Backend │
                     │   REST API      │
                     └───────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
      ┌────────────┐  ┌──────────────┐  ┌─────────────┐
      │ PostgreSQL │  │ Python AI    │  │  Business   │
      │ + pgvector │  │ Service      │  │    Tools    │
      └────────────┘  └──────┬───────┘  └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Embeddings  │
                      │ RAG + LLM   │
                      └─────────────┘
```

## RAG Pipeline

```text
PDF Upload
    ↓
Text Extraction
    ↓
Text Cleaning
    ↓
Chunking
    ↓
Embeddings
    ↓
pgvector
    ↓
Semantic Retrieval
    ↓
Relevant Context
    ↓
LLM
    ↓
Answer + Citations
```

When a user asks a question, DocuMind retrieves relevant document chunks and provides them as context to the language model. The generated answer includes references to the source documents and pages.

## Structured AI Tools

DocuMind can combine RAG-based document knowledge with structured application data.

The AI can use tools such as:

```text
search_products
get_product
calculate_offer
```

For example:

```text
User:
"Koliko košta 50 komada CEM II 42.5?"

        ↓

Intent / Tool Selection
        ↓
Product Search
        ↓
Price & Quantity Calculation
        ↓
Generated Answer
```

This allows the system to answer questions that cannot be reliably handled using document retrieval alone.

## Multi-Tenancy

DocuMind is designed as a multi-tenant platform.

Each organization has isolated:

- users
- documents
- document embeddings
- products
- conversations
- offers
- analytics

Role-based access control supports different levels of application access.

## Technology Stack

### Frontend

- Angular
- Angular Material
- RxJS

### Backend

- NestJS
- TypeScript
- TypeORM
- JWT
- Passport

### AI

- Python
- FastAPI
- LLM integration
- Embeddings
- Retrieval-Augmented Generation
- Semantic search
- Tool calling

### Database

- PostgreSQL
- pgvector

### Infrastructure

- Docker
- Docker Compose

## Project Structure

```text
documind-ai/
│
├── frontend/          # Angular web application
├── backend/           # NestJS REST API
├── ai-service/        # Python AI / RAG service
├── evaluation/        # AI and retrieval evaluation
├── docs/              # Technical documentation
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Document Processing

Uploaded documents are processed automatically:

```text
Upload
  ↓
Processing
  ↓
Text Extraction
  ↓
Chunking
  ↓
Embedding Generation
  ↓
Vector Storage
  ↓
READY
```

Once processing is complete, the document becomes available to the RAG system.

## AI Chat

Users can ask natural-language questions about uploaded business documents.

Example:

```text
User:
"What are the delivery conditions?"

AI:
"Orders above the defined threshold qualify for free delivery..."

Sources:
delivery_policy.pdf — page 3
```

The system maintains conversation history and attaches source information to generated responses.

## Products & Offers

Organizations can maintain structured product information including:

- SKU
- product name
- category
- description
- price
- stock
- unit
- availability

The AI can search this structured data and use it to calculate offers based on requested quantities.

## Analytics & Evaluation

The platform tracks important operational and AI metrics, including:

- AI response latency
- retrieval latency
- LLM latency
- application activity
- user feedback
- unanswered questions

The separate `evaluation/` module is used to evaluate retrieval and AI behavior.

This makes it possible to analyze both system performance and answer quality instead of treating the LLM as a black box.

## Example Use Cases

DocuMind can be adapted to businesses that work with large amounts of documentation, including:

- retail and wholesale
- construction
- manufacturing
- logistics
- technical services
- customer support
- sales organizations

Typical questions include:

```text
"What is the price of this product?"

"What are the delivery conditions?"

"What is the warranty period?"

"Do we deliver to this location?"

"Create an offer for 50 units."

"Summarize the complaint procedure."

"Write an email to the customer based on this offer."
```

## Running the Project

Clone the repository:

```bash
git clone https://github.com/Sajko01/documind-ai.git
cd documind-ai
```

Create the required environment configuration:

```bash
cp .env.example .env
```

Start the application:

```bash
docker compose up --build
```

The Docker environment starts the services required by the application, including the frontend, backend, AI service, and database.

> Environment variables, API keys, access tokens, and secrets must never be committed to the repository.

## Documentation

Additional technical documentation is available in:

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [RAG](docs/rag.md)

## Future Improvements

Potential extensions include:

- hybrid lexical + vector search
- advanced reranking
- improved RAG evaluation
- additional external communication channels
- background document-processing queues
- caching
- advanced observability
- production cloud deployment

## Author

**Aleksandar Jovanović**

MSc Student in Artificial Intelligence and Machine Learning  
Faculty of Electronic Engineering  
University of Niš
