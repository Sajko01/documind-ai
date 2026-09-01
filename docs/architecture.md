# DocuMind AI — System Architecture

## 1. Overview

DocuMind AI follows a modular architecture consisting of:

- Angular frontend
- NestJS backend
- PostgreSQL database
- pgvector
- Python AI service
- FastAPI
- Embedding model
- LLM

The frontend communicates with the NestJS backend.

The NestJS backend handles:

- authentication
- authorization
- organizations
- users
- documents
- products
- offers
- conversations
- analytics

The Python AI service handles AI-specific operations such as:

- document processing
- text extraction
- chunking
- embeddings
- vector retrieval
- reranking
- LLM orchestration

---

## 2. High-Level Architecture

```text
                         USER
                           |
                           v
                  +----------------+
                  |    Angular     |
                  |    Frontend    |
                  +-------+--------+
                          |
                       HTTP/JWT
                          |
                          v
                  +----------------+
                  |     NestJS     |
                  |      API       |
                  +---+--------+---+
                      |        |
                      |        |
                      v        v
              +-----------+  +-------------+
              | PostgreSQL|  | Python AI   |
              | + pgvector|  | FastAPI     |
              +-----------+  +------+------+
                                    |
                             +------+------+
                             |             |
                             v             v
                       Embeddings         LLM
                             |
                             v
                          RAG

                          3. Frontend

The frontend is implemented using Angular.

Main responsibilities:

authentication UI
dashboard
document management
chat
product management
offers
analytics
user management

Planned structure:

frontend/src/app/

core/
shared/

features/
├── auth/
├── dashboard/
├── documents/
├── chat/
├── products/
├── offers/
├── analytics/
└── users/
4. Backend

The backend is implemented using NestJS.

Main responsibilities:

REST API
authentication
authorization
JWT
organization management
user management
document management
product management
offers
conversations
analytics

Planned modules:

auth
users
organizations
documents
chat
products
offers
analytics
5. AI Service

The AI service is implemented using Python and FastAPI.

Its responsibilities include:

PDF text extraction
text cleaning
chunking
embedding generation
semantic retrieval
reranking
LLM interaction
AI-specific processing

The AI service is separated from NestJS so that AI workloads
can evolve independently from the main application backend.

6. Database

PostgreSQL is the primary relational database.

pgvector is used to store and search vector embeddings.

The database stores:

organizations
users
documents
document chunks
conversations
messages
products
offers
offer items
analytics events
feedback
unanswered questions
7. Authentication Flow
User
 |
 v
Angular Login
 |
 v
POST /auth/login
 |
 v
NestJS
 |
 v
Validate credentials
 |
 v
Generate JWT
 |
 v
Angular stores authentication state
 |
 v
JWT sent with protected requests
8. Document Processing Flow
User
 |
 v
Angular
 |
 v
NestJS
 |
 v
Document upload
 |
 v
Python AI Service
 |
 v
PDF extraction
 |
 v
Text cleaning
 |
 v
Chunking
 |
 v
Embedding generation
 |
 v
pgvector
 |
 v
Document READY
9. Question Answering Flow
User question
 |
 v
Angular
 |
 v
NestJS
 |
 v
Python AI Service
 |
 v
Query embedding
 |
 v
Vector search
 |
 v
Relevant chunks
 |
 v
Optional reranking
 |
 v
Context
 |
 v
LLM
 |
 v
Answer + citations
 |
 v
NestJS
 |
 v
Angular
10. Product Tool Flow
User question
 |
 v
LLM orchestration
 |
 +-----> RAG
 |
 +-----> Product database
 |
 +-----> Tool calling
 |
 v
Final answer

The AI can use structured application data when a question
cannot be answered reliably from documents alone.

11. Multi-Tenant Architecture

Each user belongs to an organization.

Example:

Organization A
├── Users
├── Documents
├── Products
├── Conversations
└── Offers

Organization B
├── Users
├── Documents
├── Products
├── Conversations
└── Offers

All organization-owned resources contain an organization identifier.

Every protected query must enforce organization ownership.

12. Security Boundary

The organization boundary is one of the most important
security requirements.

Example:

User A
 |
 v
Organization A
 |
 +---- Documents A
 +---- Products A
 +---- Conversations A

User B
 |
 v
Organization B
 |
 +---- Documents B
 +---- Products B
 +---- Conversations B

User A must never receive data belonging to Organization B.

13. Docker Architecture

The final application will run as multiple services:

docker-compose.yml

services:

frontend
backend
ai-service
postgres

Conceptually:

+-------------+
|  Frontend   |
|   Angular   |
+------+------+
       |
       v
+-------------+
|   Backend   |
|   NestJS    |
+------+------+
       |
       +--------------+
       |              |
       v              v
+-------------+  +-------------+
| PostgreSQL  |  | AI Service  |
| + pgvector  |  |  FastAPI    |
+-------------+  +------+------+
                         |
                    +----+----+
                    |         |
                    v         v
               Embeddings    LLM
14. Design Principles

The architecture should follow these principles:

Separation of concerns

Frontend, backend, database and AI processing
should have clearly defined responsibilities.

Security

Authentication, authorization and organization isolation
must be enforced by the backend.

Modularity

Each major business domain should have its own module.

Testability

AI retrieval and backend functionality should be testable
independently.

Scalability

The AI service should be independently scalable from the
main backend.

Observability

Important requests, AI operations, latency and errors
should be measurable.