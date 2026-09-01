# Architecture Decisions

## ADR-001: Angular for Frontend

Decision:

Use Angular as the frontend framework.

Reason:

Angular provides a structured framework suitable for
large business applications and supports modular architecture,
routing, forms, HTTP communication and enterprise-style development.

---

## ADR-002: NestJS for Backend

Decision:

Use NestJS as the main backend framework.

Reason:

NestJS provides modular architecture, dependency injection,
guards, DTO validation and strong TypeScript support.

---

## ADR-003: PostgreSQL

Decision:

Use PostgreSQL as the primary database.

Reason:

The application contains relational entities such as
organizations, users, documents, products, conversations
and offers.

---

## ADR-004: pgvector

Decision:

Use pgvector for vector storage and similarity search.

Reason:

Document chunks require vector embeddings for semantic retrieval.

Using pgvector keeps relational data and vector data
within the same PostgreSQL ecosystem.

---

## ADR-005: Python AI Service

Decision:

Separate AI functionality into a Python/FastAPI service.

Reason:

Python provides a strong ecosystem for:

- NLP
- embeddings
- document processing
- machine learning
- LLM integration

Separating the service also allows the AI component
to evolve independently from the main backend.

---

## ADR-006: RAG instead of Fine-Tuning

Decision:

Use Retrieval-Augmented Generation as the primary
knowledge retrieval approach.

Reason:

Company information such as prices, policies and product
information changes over time.

Retrieving current information from company documents
is more appropriate than embedding frequently changing
business information directly into model parameters.

---

## ADR-007: Multi-Tenant Architecture

Decision:

Use organization-based multi-tenancy.

Reason:

The platform is intended to support multiple companies.

Each organization must have isolated:

- users
- documents
- products
- conversations
- offers
- analytics