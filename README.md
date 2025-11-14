# Jaspers AI – Portfolio Chat MVP

A minimal full-stack application demonstrating:

* Email/password authentication (JWT)
* Portfolio ingestion via Alpaca
* AI-assisted chat (Claude/OpenAI or deterministic fallback)
* Fully containerized deployment with Docker Compose (frontend, backend, PostgreSQL)

---

## Project Structure

```
.
├── backend/          # NestJS (Auth, Portfolio, Chat) + Prisma ORM
├── frontend/         # Next.js 16 App Router UI
└── docker-compose.yaml
```

---

## Requirements

* Docker & Docker Compose
* Optional:

  * Alpaca API keys
  * Anthropic/OpenAI API keys
    (App automatically uses mock data when keys are absent.)

No local Node.js or PostgreSQL installation is required — everything runs inside containers.

---

## Quick Start (Fully Dockerized)

### 1. Launch all services

```bash
docker compose up -d
```

This brings up:

* **backend** (NestJS)
* **frontend** (Next.js)
* **postgres** (database with persistent volume)

---

### 2. Apply Prisma migrations

Run the migration inside the backend container:

```bash
docker compose exec backend pnpm prisma migrate deploy
```

If you need initial seed data:

```bash
docker compose exec backend pnpm prisma db seed
```

---

### 3. Access the applications

| Service              | URL                                                    |
| -------------------- | ------------------------------------------------------ |
| Frontend (Next.js)   | [http://localhost:3001](http://localhost:3001)         |
| Backend API (NestJS) | [http://localhost:3000/api](http://localhost:3000/api) |
| PostgreSQL           | localhost:5432                                         |

---

## Environment Variables

Each service has its own env file.

### Backend

`backend/.env`

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/jaspers_local
JWT_SECRET=your-secret
ALPACA_KEY_ID=
ALPACA_SECRET_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

### Frontend

`frontend/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Docker Compose Setup

A sample structure (your actual file may differ):

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: jaspers_local
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## Key Features

* **Secure JWT authentication** (email + password)
* **Prisma-powered data storage**
* **Alpaca portfolio ingestion** (with mock fallback)
* **AI chat endpoint** (Claude/OpenAI or fallback)
* **Next.js dashboard & chat UI**
* **Single command deployment** via Docker Compose

## Screenshots

Authentication screen:
![](screenshots/auth.png)

Dashboard:
![](screenshots/dashboard.png)

Chat screen:
![](screenshots/chat.png)