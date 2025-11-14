## Frontend – Next.js App Router

The UI provides authentication, a portfolio dashboard, and a chat workspace that talks to the NestJS backend.

### Tech Stack

- Next.js 16 (App Router)
- React 19 client components
- Tailwind CSS v4 styles (via the `@import "tailwindcss"` macro)
- Lightweight custom auth context (localStorage + JWT)

### Setup

```bash
pnpm install
cp env.example .env.local   # optional, defaults to http://localhost:3000/api
pnpm dev                    # http://localhost:3001
```

Environment variables:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base REST URL (default: `http://localhost:3000/api`) |

### Pages

| Route | Description |
| --- | --- |
| `/` | Simple marketing overview + CTA |
| `/auth` | Combined login/register flow |
| `/dashboard` | Portfolio summary, holdings table, and manual sync |
| `/chat` | Conversation view with AI assistant |

### Notes

- The auth context stores the bearer token in `localStorage` (`jaspers_token`) and automatically calls `/api/auth/me` to hydrate the session on refresh.
- Protected pages show a friendly gate message when the user is not authenticated instead of redirecting abruptly.
- API helpers live in `lib/api.ts` and mirror the backend routes.
