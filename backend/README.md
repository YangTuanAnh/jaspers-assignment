## Backend – NestJS + Prisma API

This service powers authentication, portfolio ingestion, and the AI chat endpoints. It exposes a REST API under the `/api` prefix and persists data to PostgreSQL via Prisma.

### Tech Stack

- NestJS 11
- Prisma ORM + PostgreSQL 15
- JWT authentication (`@nestjs/jwt`)
- Axios for Alpaca integration
- Undici `fetch` for Anthropic/OpenAI calls

### Getting Started

```bash
pnpm install
cp env.example .env            # fill in secrets
pnpm prisma migrate dev        # create tables & sync schema
pnpm start:dev                 # http://localhost:3000/api
```

> Need demo data quickly? Run `pnpm db:seed` to create a `demo@jaspers.ai / DemoPass123!` user.

### Environment Variables

`env.example` documents every variable. Required values:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used for signing access tokens |
| `ALPACA_API_KEY` / `ALPACA_SECRET_KEY` | Paper trading keys (optional – mock data used when missing) |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | AI provider key (optional – fallback text used when missing) |

### Database Schema

Prisma models map directly to the required tables:

- `users` – auth credentials
- `portfolio_holdings` – per-symbol holdings
- `portfolio_accounts` – cash balance + last sync timestamp
- `chat_messages` – conversation history

All migrations live under `prisma/migrations`. Use `pnpm prisma migrate dev` to evolve the schema locally or `pnpm prisma migrate deploy` in production.

### API Surface

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a user and return a JWT |
| `POST` | `/api/auth/login` | Login with email/password |
| `GET` | `/api/auth/me` | Fetch the authenticated profile |
| `GET` | `/api/portfolio` | Read holdings + summary |
| `POST` | `/api/portfolio/sync` | Pull latest data from Alpaca |
| `GET` | `/api/chat/messages` | List chat history |
| `POST` | `/api/chat/messages` | Send a prompt and receive the AI reply |

All non-auth routes require an `Authorization: Bearer <token>` header.

### Testing & Tooling

- `pnpm test` – unit tests (currently covers the health endpoint)
- `pnpm lint` – ESLint
- `pnpm format` – Prettier

### Notes

- When Alpaca/LLM keys are missing the API logs a warning and returns deterministic mock data so the UI stays usable.
- CORS is enabled for `http://localhost:3001` by default. Override via `FRONTEND_URL`.
