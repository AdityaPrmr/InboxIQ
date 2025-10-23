
# Email Onebox (Backend + Frontend)

> A feature-rich email aggregator and AI assistant. This repository contains two main parts:
- `onebox-backend/` — Typescript + Node.js backend that syncs IMAP accounts, indexes emails to Elasticsearch, runs AI categorization, triggers notifications, and provides APIs.
- `onebox-frontend/` — Simple frontend to view emails, filter/search, and display AI suggestions / categorizations.

---

## Quickstart (recommended)

**Build & start all services (Docker Compose):**
```bash
# correct command (recommended)
docker compose up -d --build

# note: some users use the older hyphenated command:
# docker-compose up -d --build
```

The compose file mounts local project folders into containers so you can edit code locally and immediately see changes inside containers (path access). Example `volumes` (see `docker-compose.yml`):
```yaml
services:
  backend:
    build: ./onebox-backend
    volumes:
      - ./onebox-backend:/app
    ports:
      - "4000:4000"

  frontend:
    build: ./onebox-frontend
    volumes:
      - ./onebox-frontend:/app
    ports:
      - "3000:3000"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.1
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - ./es-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
```
---

### Backend
1. **Real-time IMAP synchronization**
   - Sync multiple IMAP accounts concurrently (minimum 2).
   - Fetch last 30 days of emails on first sync.
   - Use persistent IMAP connections (IDLE) for push updates — **no polling** required.
2. **Searchable storage (Elasticsearch)**
   - Locally hosted Elasticsearch (Docker) indexes emails for fast search & filtering by account/folder/date/labels.
3. **AI-based categorization (Hugging Face)**
   - Use Hugging Face models (fine-tuning or hosted inference) to classify emails into:
     - Interested, Meeting Booked, Not Interested, Spam, Out of Office
4. **Notifications & Webhooks**
   - Send Slack notifications for every email labeled **Interested**.
   - Trigger configurable webhooks (e.g. `webhook.site`) when an email is marked Interested.
5. **RAG & Suggested Replies (OpenAI + Vector DB)**
   - Use OpenAI to generate suggested replies using Retrieval-Augmented Generation (RAG).
   - Store product/outreach context and training prompts in a vector DB (FAISS / Milvus / Weaviate — pick one) for retrieval during suggestion generation.
6. **APIs & Postman collection**
   - A Postman collection (or OpenAPI spec) demonstrates all endpoints for evaluation.

### Frontend
- Simple UI to list emails, filter by folder/account, run searches (Elasticsearch-powered), display Hugging Face categorization labels, and show OpenAI suggested replies.
- Minimal UI for triggering Slack/webhook tests and marking emails manually.

---

## Tech stack & Integrations
- **Language & runtime:** Typescript, Node.js
- **Email sync:** IMAP (node-imap / mailparser / custom persistent connections)
- **Search & storage:** Elasticsearch (Docker)
- **AI categorization:** Hugging Face inference (transformers model or hosted inference API)
- **LLM / Suggested replies:** OpenAI (GPT family via API) for reply generation and RAG
- **Vector DB:** FAISS / Milvus / Weaviate (choose one for vector storage)
- **Messaging & webhooks:** Slack API + configurable webhook endpoints
- **Containerization:** Docker + Docker Compose
- **Optional:** Redis for caching, BullMQ for background tasks, and nginx as reverse-proxy

---

## Environment variables (example `.env`)
```
# Server
PORT=4000
NODE_ENV=development

# Elasticsearch
ELASTIC_URL=http://elasticsearch:9200
ELASTIC_USER=
ELASTIC_PASS=

# IMAP (example for 2 accounts)
IMAP_1_HOST=imap.gmail.com
IMAP_1_PORT=993
IMAP_1_USER=you1@example.com
IMAP_1_PASS=supersecret

IMAP_2_HOST=imap.mail.com
IMAP_2_PORT=993
IMAP_2_USER=you2@example.com
IMAP_2_PASS=anothersecret

# OpenAI
OPENAI_API_KEY=sk-...

# Hugging Face (if using Hugging Face API)
HF_API_KEY=hf_...

# Slack & Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
WEBHOOK_URL=https://webhook.site/....
```

> **Security note:** Never commit secrets to Git. Use GitHub secrets / environment management in CI or `.env.local` with `.gitignore`.

---

## Project structure
```
├── docker-compose.yml
├── README.md
├── onebox-backend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── onebox-frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
└── es-data/
```

---

## How to run locally (development)
1. Set environment variables in `.env` at project root or use `docker-compose.override.yml` for local credentials.
2. Start services:
```bash
docker compose up -d --build
```
3. Backend API should be reachable at `http://localhost:4000` and frontend at `http://localhost:3000`.
4. Use Postman to run the provided collection to validate endpoints:
   - IMAP account register endpoints
   - Trigger initial sync
   - Search emails (filters & queries)
   - Mark email label (e.g., Interested)
   - Request suggested replies for an email

---





## Troubleshooting
- **Elasticsearch not reachable**: Check container logs `docker compose logs elasticsearch` and ensure `9200` is exposed.
- **IMAP permission / OAuth**: For Gmail, either enable App Passwords or use OAuth (recommended). Plain password may not work for production Gmail accounts.
- **Volume permission errors**: Run `sudo chown -R $(id -u):$(id -g) ./es-data` on the host or adjust volume options.
- **OpenAI rate limits**: Cache responses and batch calls where possible; use backoff on 429 responses.

---

