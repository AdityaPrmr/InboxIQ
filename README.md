
# Onebox — Email Onebox (Backend + Frontend)

> A feature-rich email aggregator and AI assistant inspired by ReachInbox. This repository contains two main parts:
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

> **Important:** use absolute or trusted relative paths when mounting host folders into containers to ensure correct permissions. If you hit permission issues, check file ownership and use `:delegated` or fix with `chown` on the host.

---

## What this project implements
This README is written to align with the **Assignment - Associate Backend Engineer** brief you provided. The end goal is a real-time email onebox with AI features. Target features:

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

## Project structure (suggested)
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

## Submission checklist (follow assignment instructions)
- Create a **private GitHub** repository and push your code.
- Grant access to user: **Mitrajit** (add as collaborator).
- Include this README with setup instructions, architecture details, and feature list.
- Upload a demo video (≤ 5 mins) showing core features.
- Fill the submission form: `https://forms.gle/DqF27M4Sw1dJsf4j6` with repo link and video link.

---

## Evaluation tips & common pitfalls
- Demonstrate **real-time IDLE** IMAP: show logs when an email arrives (no polling).
- Ensure Elasticsearch mappings include analyzed fields for full-text search and keyword fields for filtering.
- For AI categorization, include test samples and accuracy notes in the repo (how many examples you used, confusion cases).
- For RAG: show at least one example where context from the vector DB influences the suggested reply.
- Keep the demo short and focused: signup -> add IMAP -> show incoming mail -> label -> suggested reply.

---

## Troubleshooting
- **Elasticsearch not reachable**: Check container logs `docker compose logs elasticsearch` and ensure `9200` is exposed.
- **IMAP permission / OAuth**: For Gmail, either enable App Passwords or use OAuth (recommended). Plain password may not work for production Gmail accounts.
- **Volume permission errors**: Run `sudo chown -R $(id -u):$(id -g) ./es-data` on the host or adjust volume options.
- **OpenAI rate limits**: Cache responses and batch calls where possible; use backoff on 429 responses.

---

---

## Assignment brief (copied)
Assignment - Associate Backend Engineer
About Us:
ReachInbox is transforming cold outreach with our revolutionary AI-driven platform. Our all-in-one solution empowers businesses to effortlessly find, enrich, and engage high-intent leads through multi-channel outreach on Twitter, LinkedIn, email, and phone. With just a single prompt, ReachInbox springs into action, prospecting and verifying leads, crafting personalized sequences, and notifying businesses of responsive prospects. Imagine being part of an AI-powered growth team that consistently generates top-tier leads. ReachInbox is more than a tool; it's your growth partner.
We are looking for passionate and innovative individuals to join our team and help us continue to redefine the future of lead generation and business growth.
Assignment - Build a Feature-Rich Onebox for Emails
Problem Statement
We are looking for the best candidates who can build a highly functional onebox email aggregator with advanced features, similar to Reachinbox. Your task is to create a backend and frontend system that synchronizes multiple IMAP email accounts in real-time and provides a seamless, searchable, and AI-powered experience.
Your submission will be judged based on the number of features you successfully implement. We will maintain a leaderboard on GitHub to track progress, ranking submissions based on feature completion and quality.
Requirements & Features
For the Backend Engineering assignment, you will begin by building and showcasing the listed features using Postman. If you're able to successfully complete point 5, you will then integrate and display all the features on the frontend. Achieving this will demonstrate your ability to work end-to-end. Lastly, completing point 6 will secure you a direct invitation to the final interview. 
Use Language: Typescript, Node.js runtime.
1. Real-Time Email Synchronization
Sync multiple IMAP accounts in real-time - minimum 2
Fetch at least the last 30 days of emails 
Use persistent IMAP connections (IDLE mode) for real-time updates (No cron jobs!).
2. Searchable Storage using Elasticsearch
Store emails in a locally hosted Elasticsearch instance (use Docker).
Implement indexing to make emails searchable.
Support filtering by folder & account.
3. AI-Based Email Categorization
Implement an AI model to categorize emails into the following labels:
Interested
Meeting Booked
Not Interested
Spam
Out of Office
4. Slack & Webhook Integration
Send Slack notifications for every new Interested email.
Trigger webhooks (use webhook.site as the webhook URL) for external automation when an email is marked as Interested.
5. Frontend Interface
Build a simple UI to display emails, filter by folder/account, and show AI categorization.
Basic email search functionality powered by Elasticsearch.
6. AI-Powered Suggested Replies (Direct invitation to final interview)
Store the product and outreach agenda in a vector database.
Use RAG (Retrieval-Augmented Generation) with any LLM to suggest replies.
Example:
Training data: "I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example"
Email received:"Hi, Your resume has been shortlisted. When will be a good time for you to attend the technical interview?"
AI Reply Suggestion:"Thank you for shortlisting my profile! I'm available for a technical interview. You can book a slot here: https://cal.com/example"
How and Where to submit the assignment:
Create a private GitHub repository with your implementation.
Grant access to the user: Mitrajit
Push your code and update the README with setup instructions, architecture details, and feature implementation.
Provide a demo video showcasing the functionalities. (Do not exceed 5 mins)
Fill this form with relevant links and details - Assignment Submission - https://forms.gle/DqF27M4Sw1dJsf4j6
Evaluation Criteria
Feature Completion – The number of features implemented.
Code Quality & Scalability – Clean, modular, and well-documented code.
Real-Time Performance – Efficient IMAP sync (no polling!).
AI Accuracy – Performance of email categorization and suggested replies.
UX & UI – Frontend usability and smooth user experience.
Bonus Points for additional features or optimizations.
Deadline for Task Completion:
You have a maximum of 48 hours to complete the task. Receiving this assignment means you're already ahead of many candidates. Good luck!
Note: Do not submit a plagiarized assignment. All GitHub code will be thoroughly reviewed, and any evidence of plagiarism will result in the assignment being rejected.

Thank you!


---

Good luck — build fast, document clearly, and show the real-time magic!

