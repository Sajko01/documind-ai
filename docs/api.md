# DocuMind AI — API Design

## 1. API Base

The API will use:

```text
/api
2. Authentication
Register
POST /api/auth/register

Request:

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password"
}
Login
POST /api/auth/login

Request:

{
  "email": "john@example.com",
  "password": "password"
}

Response:

{
  "access_token": "JWT_TOKEN"
}
3. Users
Get current user
GET /api/users/me
4. Organizations
Get current organization
GET /api/organizations/current
5. Documents
Upload document
POST /api/documents/upload

Content type:

multipart/form-data
Get documents
GET /api/documents
Get document
GET /api/documents/:id
Delete document
DELETE /api/documents/:id
6. Chat
Create conversation
POST /api/conversations
Get conversations
GET /api/conversations
Get conversation
GET /api/conversations/:id
Ask question
POST /api/chat

Request:

{
  "conversation_id": "conversation-id",
  "message": "Koliko košta CEM II 42.5?"
}

Response concept:

{
  "answer": "CEM II 42.5 košta 850 RSD...",
  "sources": [
    {
      "document": "cenovnik_2026.pdf",
      "page": 12
    }
  ]
}
7. Products
Get products
GET /api/products
Create product
POST /api/products
Update product
PUT /api/products/:id
Delete product
DELETE /api/products/:id
8. Offers
Create offer
POST /api/offers
Get offers
GET /api/offers
Get offer
GET /api/offers/:id
9. Analytics
Get analytics
GET /api/analytics
10. Feedback
Create feedback
POST /api/feedback
11. Unanswered Questions
Get unanswered questions
GET /api/unanswered-questions
Update unanswered question
PATCH /api/unanswered-questions/:id
12. Authentication

Protected endpoints require:

Authorization: Bearer <JWT>
13. Error Format

Errors should follow a consistent structure:

{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document does not exist"
  }
}