# DocuMind AI

AI Knowledge & Sales Platform for Businesses

## Overview

DocuMind AI is a multi-tenant AI platform that helps companies
organize their business documentation and use artificial intelligence
to search, understand and interact with their internal knowledge.

The platform allows companies to upload documents such as:

- PDF price lists
- product catalogs
- FAQ documents
- delivery policies
- warranty documents
- complaint procedures
- technical documentation
- internal procedures

Users can then ask questions in natural language and receive answers
based on the company's available documentation.

The system provides citations to the original documents and pages
used to generate each answer.

---

## Problem

Companies often store important business information across many
different documents.

Examples include:

- price lists
- product catalogs
- FAQ documents
- delivery conditions
- warranty policies
- complaint procedures
- technical documentation
- internal procedures

Employees often need to manually search through these documents
to find the required information.

This can be slow, inefficient and error-prone.

For example, an employee may need to answer:

- How much does a specific product cost?
- What are the delivery conditions?
- Is a specific product currently available?
- What is the warranty period?
- What are the conditions for returning a product?
- Does the company deliver to a specific location?

Finding these answers manually can require opening multiple
documents and searching through many pages.

---

## Solution

DocuMind AI provides a centralized AI-powered knowledge system
for company documentation.

The basic workflow is:

Upload documents
↓
Document processing
↓
Text extraction
↓
Chunking
↓
Embeddings
↓
Vector storage
↓
Semantic search
↓
Relevant context retrieval
↓
LLM
↓
Answer with citations

The system allows employees to ask natural-language questions
and receive answers based on the company's documentation.

---

## Main Features

### Authentication

- User registration
- User login
- JWT authentication
- Protected API endpoints
- Role-based access control

### Multi-tenancy

Each company has its own organization.

Organizations have their own:

- users
- documents
- products
- conversations
- offers
- analytics

Data belonging to one organization must never be accessible
to another organization.

### Document Management

Users can:

- upload PDF documents
- view uploaded documents
- see processing status
- delete documents
- inspect document metadata

### AI Document Processing

Uploaded documents go through a processing pipeline:

PDF
↓
Text extraction
↓
Cleaning
↓
Chunking
↓
Embeddings
↓
Vector database

### RAG

The platform uses Retrieval-Augmented Generation.

When a user asks a question:

Question
↓
Query embedding
↓
Vector search
↓
Relevant chunks
↓
Context
↓
LLM
↓
Answer

### Citations

AI responses include references to the documents
and pages used to generate the answer.

Example:

Answer:

CEM II 42.5 costs 850 RSD per 25 kg package.

Sources:

- cenovnik_2026.pdf — page 12

### Product Management

Companies can manage their products.

Products contain information such as:

- SKU
- name
- description
- category
- price
- stock
- unit
- active status

### AI Tool Calling

The AI system can use structured tools when necessary.

Examples:

- search_products
- get_product
- calculate_offer

This allows the AI to combine information from documents
with structured data stored in the application database.

### Offers

Users can create offers based on products and quantities.

The system calculates:

- quantity
- unit price
- subtotal
- total

### Email Generation

The AI can generate business emails.

Examples:

- sales email
- support response
- complaint response
- offer email
- follow-up email

### Summarization

The system can summarize:

- documents
- conversations
- important conditions
- product information

### Analytics

The platform tracks application activity.

Examples:

- questions asked
- documents uploaded
- documents deleted
- offers created
- emails generated
- user feedback

### Feedback

Users can provide feedback on AI answers.

Example:

👍 Helpful

👎 Not helpful

### Unanswered Questions

When the system cannot confidently answer a question
from the available documentation, the question can be stored
for administrators to review.

This can help companies identify missing information
in their knowledge base.

---

## Target Users

The main users are businesses that have a large amount
of internal documentation.

Example industries:

- construction
- retail
- manufacturing
- logistics
- technical services
- wholesale
- customer support
- sales organizations

---

## Example Company

For demonstration purposes, the project will use a fictional
company:

BuildPro d.o.o.

BuildPro is a fictional company selling construction materials.

Example documents:

- 01_cenovnik_2026.pdf
- 02_katalog_proizvoda.pdf
- 03_uslovi_prodaje.pdf
- 04_uslovi_dostave.pdf
- 05_faq.pdf
- 06_garancija.pdf
- 07_reklamacije.pdf

Example products:

- CEM II 42.5
- CEM I 42.5
- Fasadni lepak
- Mrežica 145g
- Stiropor EPS 80
- Kamena vuna

---

## Example Questions

Users should be able to ask questions such as:

> Koliko košta CEM II 42.5?

> Koji su uslovi dostave?

> Koliko košta 50 komada CEM II 42.5?

> Koji je rok garancije?

> Da li nudimo dostavu u Crnu Goru?

> Napiši email kupcu za ovu ponudu.

> Sažmi uslove reklamacije.

---

## Architecture

The system consists of several major components:

- Angular frontend
- NestJS backend
- PostgreSQL database
- pgvector
- Python AI service
- FastAPI
- Embedding model
- LLM

Detailed architecture is documented in:

`docs/architecture.md`

---

## RAG Pipeline

The document processing pipeline is:

PDF
↓
Text extraction
↓
Cleaning
↓
Chunking
↓
Embeddings
↓
pgvector
↓
Retrieval
↓
Reranking
↓
LLM
↓
Citation

Detailed RAG architecture is documented in:

`docs/rag.md`

---

## Technology Stack

### Frontend

- Angular
- Angular Material
- RxJS
- NgRx

### Backend

- NestJS
- TypeScript
- JWT
- Passport
- TypeORM

### Database

- PostgreSQL
- pgvector

### AI Service

- Python
- FastAPI
- Embeddings
- LLM
- RAG

### Infrastructure

- Docker
- Docker Compose

---

## Project Goals

---

## Functional Requirements

### Authentication

FR-01: Users must be able to register.

FR-02: Users must be able to log in.

FR-03: The system must authenticate users using JWT.

FR-04: Protected endpoints must require authentication.

FR-05: The system must support user roles.

### Organizations

FR-06: Users must belong to an organization.

FR-07: Organizations must have isolated data.

FR-08: Administrators must be able to manage organization resources.

### Documents

FR-09: Users must be able to upload PDF documents.

FR-10: The system must validate uploaded files.

FR-11: The system must process uploaded documents.

FR-12: The system must extract text from PDFs.

FR-13: The system must split extracted text into chunks.

FR-14: The system must generate embeddings for document chunks.

FR-15: The system must store embeddings for retrieval.

FR-16: Users must be able to list their documents.

FR-17: Users must be able to delete documents.

### AI Questions

FR-18: Users must be able to ask questions in natural language.

FR-19: The system must retrieve relevant document chunks.

FR-20: The system must generate answers using retrieved context.

FR-21: The system must provide document citations.

FR-22: The system must avoid generating unsupported factual answers.

### Products

FR-23: Organizations must be able to manage products.

FR-24: Users must be able to search products.

FR-25: The AI must be able to retrieve product information.

### Offers

FR-26: Users must be able to create offers.

FR-27: The system must calculate offer totals.

FR-28: The AI must be able to use offer calculation tools.

### Analytics

FR-29: The system must record important application events.

FR-30: Administrators must be able to view basic analytics.

### Feedback

FR-31: Users must be able to rate AI responses.

FR-32: The system must store feedback.

### Unanswered Questions

FR-33: The system must detect low-confidence retrieval.

FR-34: The system must be able to store unanswered questions.

FR-35: Administrators must be able to review unanswered questions.

---

## Non-Functional Requirements

### Security

NFR-01: Passwords must never be stored in plain text.

NFR-02: Authentication must use secure JWT handling.

NFR-03: Organization data must be isolated.

NFR-04: Users must only access resources belonging to
their organization.

NFR-05: API keys and secrets must never be committed to Git.

### Performance

NFR-06: API endpoints should provide reasonable response times.

NFR-07: Document processing should run independently
from normal API request handling where possible.

NFR-08: AI response latency should be measured.

NFR-09: Retrieval latency should be measured.

### Reliability

NFR-10: Failed document processing must be detected.

NFR-11: The system must expose document processing status.

NFR-12: Errors must be logged.

### Maintainability

NFR-13: Backend code should follow modular architecture.

NFR-14: AI functionality should be separated from the main backend.

NFR-15: API endpoints should be documented.

NFR-16: The system should have automated tests.

### Scalability

NFR-17: The architecture should support multiple organizations.

NFR-18: The AI service should be independently deployable.

NFR-19: The database design should support increasing numbers
of documents and users.

### Observability

NFR-20: Important API requests should be logged.

NFR-21: AI latency should be measurable.

NFR-22: Retrieval performance should be measurable.

NFR-23: AI errors should be traceable.

The goal of the project is to build a production-style
AI SaaS application that demonstrates both software engineering
and AI engineering skills.

The project should demonstrate:

- REST API development
- authentication
- authorization
- multi-tenancy
- relational database design
- document processing
- vector search
- RAG
- embeddings
- LLM integration
- tool calling
- AI evaluation
- testing
- Docker
- deployment
- observability

---

## User Roles

The system will initially support three roles.

### ADMIN

The administrator can:

- manage organization users
- upload documents
- delete documents
- manage products
- create offers
- view analytics
- review unanswered questions

### EMPLOYEE

Employees can:

- search documents
- ask AI questions
- view citations
- search products
- create offers
- generate emails
- view conversations

### VIEWER

Viewers have limited read-only access.

They can:

- view documents
- ask questions
- view AI answers
- view citations
- search products

They cannot modify organization data.

---

## Main User Flow

### Document ingestion

Admin logs in
↓
Dashboard
↓
Documents
↓
Upload PDF
↓
Backend receives file
↓
AI service processes document
↓
Text extraction
↓
Chunking
↓
Embeddings
↓
pgvector
↓
Document becomes READY

### Question answering

User opens Chat
↓
User asks a question
↓
NestJS receives request
↓
AI service creates query embedding
↓
Vector search
↓
Relevant chunks retrieved
↓
Optional reranking
↓
Context sent to LLM
↓
LLM generates answer
↓
Sources are attached
↓
Answer returned to user

### Product question

User asks:

"Koliko košta 50 komada CEM II 42.5?"

↓
AI identifies product-related request
↓
Product database/tool is used
↓
Price is retrieved
↓
Quantity is calculated
↓
Answer is generated

---

## Success Criteria

The project will be considered successful when:

1. A company can register an organization.

2. An administrator can upload a PDF.

3. The system can process the PDF.

4. Text can be extracted from the document.

5. Text can be split into chunks.

6. Embeddings can be generated.

7. Embeddings can be stored in pgvector.

8. A user can ask a natural-language question.

9. Relevant document chunks can be retrieved.

10. The LLM can generate an answer using retrieved context.

11. The answer contains citations to the source document
and page.

12. Users from different organizations cannot access
each other's data.

13. The system can search structured product data.

14. The AI can use defined tools.

15. The system can calculate offers.

16. The system can generate business emails.

17. Administrators can see analytics.

18. AI retrieval and answer quality can be evaluated.

19. The complete system can run using Docker.

20. The application can be deployed to a production environment.

---

## MVP

The first working version of DocuMind AI will include:

- Authentication
- Organizations
- Basic RBAC
- PDF upload
- PDF processing
- Text extraction
- Chunking
- Embeddings
- pgvector
- Semantic search
- RAG
- LLM answers
- Citations
- Chat
- Conversation history

Advanced features will be implemented after the MVP:

- Products
- Tool calling
- Offers
- Email generation
- Summarization
- Analytics
- Feedback
- Unanswered questions
- Hybrid search
- Reranking
- Advanced evaluation
- Observability

---

## Project Status

Currently in the planning and architecture phase.

---

## Documentation

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [RAG](docs/rag.md)