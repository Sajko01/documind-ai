# DocuMind AI — Database Design

## 1. Database

The application uses:

- PostgreSQL
- pgvector

PostgreSQL stores relational application data.

pgvector stores embeddings used for semantic search.

---

## 2. Organizations

```text
organizations

id
name
created_at
updated_at

An organization represents a company using the platform.

3. Users
users

id
organization_id
name
email
password_hash
role
created_at
updated_at

Relationship:

Organization
     |
     +---- Users
4. Documents
documents

id
organization_id
filename
original_name
mime_type
size
status
created_at
updated_at

Possible statuses:

UPLOADED
PROCESSING
READY
FAILED
5. Document Chunks
document_chunks

id
document_id
content
page_number
embedding
metadata
created_at

Each document can contain many chunks.

Document
   |
   +---- Chunk
   +---- Chunk
   +---- Chunk
   +---- ...

The embedding field contains the vector representation
of the chunk.

6. Conversations
conversations

id
organization_id
user_id
title
created_at
updated_at
7. Messages
messages

id
conversation_id
role
content
created_at

Possible roles:

USER
ASSISTANT
8. Products
products

id
organization_id
sku
name
description
category
price
stock
unit
active
created_at
updated_at
9. Offers
offers

id
organization_id
created_by
customer_name
status
subtotal
total
created_at
updated_at
10. Offer Items
offer_items

id
offer_id
product_id
quantity
unit_price
subtotal

Relationship:

Offer
 |
 +---- Offer Item
 +---- Offer Item
 +---- Offer Item
11. Analytics Events
analytics_events

id
organization_id
user_id
event_type
metadata
created_at

Example events:

question_asked
document_uploaded
document_deleted
offer_created
email_generated
feedback_given
12. Feedback
feedback

id
organization_id
user_id
message_id
rating
reason
created_at

Possible ratings:

POSITIVE
NEGATIVE
13. Unanswered Questions
unanswered_questions

id
organization_id
user_id
question
retrieval_score
status
created_at

Possible statuses:

OPEN
REVIEWED
RESOLVED
14. Main Relationships
Organization
 |
 +---- Users
 |
 +---- Documents
 |       |
 |       +---- Document Chunks
 |
 +---- Products
 |
 +---- Conversations
 |       |
 |       +---- Messages
 |
 +---- Offers
 |       |
 |       +---- Offer Items
 |
 +---- Analytics Events
 |
 +---- Feedback
 |
 +---- Unanswered Questions
15. Multi-Tenant Rule

Organization-owned entities must contain:

organization_id

Queries must always be filtered by the authenticated
user's organization.

Example concept:

WHERE organization_id = authenticated_user.organization_id

The backend must never trust an organization ID supplied
directly by an untrusted client.