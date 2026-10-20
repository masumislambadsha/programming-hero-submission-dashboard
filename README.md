# Programming Hero — Project Submission & Review Dashboard

A full-stack **project submission and review dashboard** built for the
*Associate Web Instructor* hiring assessment.

Students submit their projects (repo + live link + description); mentors
review, approve or reject them with feedback, and track aggregated stats —
wrapped in a **Programming Hero** themed UI (Electric Violet `#BB09F9` on
Haiti `#0C0518` ✨).

---

## ✨ Features

### Submission Portal (Student)

- 📝 Form to submit project name, repo URL, live link and description
- 🛡️ **Triple-layer duplicate prevention**
  1. shared Zod schema validation on client *and* server
  2. service-level lookup with a friendly 409 message
  3. database unique constraint `@@unique([studentId, repoUrl])` — the guarantee
  - repo URLs are normalized (casing, trailing slash, `.git`) before comparison
- 🚦 Rate limiting: **5 submissions / 15 min** per user (`express-rate-limit`)
- 👀 Personal submission list with status + mentor feedback

### Review Dashboard (Mentor)

- 📊 Aggregated stats: total / pending / approved / rejected (server-side
  `count()` queries with a 30s in-memory cache, invalidated on every write)
- 📋 Paginated data table (`skip`/`take` in PostgreSQL — never array slicing)
- 🎛️ Status filters implemented **server-side** via URL searchParams
  (`/mentor?status=APPROVED&page=2` — shareable, refresh-safe)
- ✅❌ Approve / reject actions with an optional feedback note
  (status change + feedback written in one nested Prisma mutation)

### Authentication & RBAC

- 🔐 JWT (12h) stored in an **httpOnly cookie** — never accessible to JS
- 👨‍🎓 Students self-signup; 🧑‍ mentors/admins are **seeded directly in the
  database** (no API endpoint can ever create a privileged account)
- 🚧 Route guards on three layers:
  1. `client/src/proxy.ts` (Next.js 16 proxy) — session cookie + JWT role claim
     for redirect UX (unverified by design; Edge can't hold the secret)
  2. client `useMe()` guards — role-aware redirects inside the pages
  3. Express `checkAuth` + `requireRole("MENTOR")` middleware — the API
     itself never trusts the frontend

---

## ✅ Requirement Coverage

| Assessment requirement | Implementation |
| ---------------------- | -------------- |
| TypeScript end-to-end | strict TS across `shared/`, `server/`, `client/` |
| Next.js + Tailwind + shadcn | App Router, Tailwind v4 tokens, shadcn/base-ui components |
| Express + PostgreSQL + Prisma | `server/src/app.ts`, `server/prisma/schema.prisma` |
| JWT role-based auth | httpOnly JWT cookie + `checkAuth` / `requireRole` |
| Student submission form | `components/modules/student/submission-form.tsx` |
| Robust validation | shared Zod schemas + `validate` middleware (client reuses them) |
| Duplicate prevention | URL normalization → friendly 409 → DB `@@unique([studentId, repoUrl])` |
| Rate limiting | 5 submissions / 15 min per user, keyed by user id |
| Paginated mentor table | Prisma `skip`/`take` + `meta` pagination envelope |
| Approve / reject | `PATCH /submissions/:id/review` + `ReviewFeedback` model |
| Server-side status filters | `?status=` → Prisma `where`, never client-side slicing |
| Aggregated stats | four `count()` queries + 30s TTL cache, invalidated on writes |
| Login + student signup | `/login`, `/signup` (role never accepted from the client) |
| Seeded admin/mentor | `server/prisma/seed.ts` |
| One-click demo login | Student / Mentor buttons on `/login` |

---

## 🧱 Tech Stack

| Layer      | Tech                                                        |
| ---------- | ----------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router) · TanStack Query · TailwindCSS v4 · shadcn/ui |
| Backend    | Express 5 · Zod · helmet · cors · express-rate-limit         |
| Database   | PostgreSQL 16 · Prisma ORM 6                                |
| Auth       | JWT (`jsonwebtoken`) · bcryptjs · httpOnly cookies          |
| Monorepo   | pnpm workspaces — `client/`, `server/`, `shared/`           |

The `shared/` package is the single source of truth for validation schemas,
types and constants — the form and the API can never disagree.

---

## 📂 Structure

```
├── client/                       # Next.js app
│   └── src/
│       ├── app/
│       │   ├── (public)/(authentication)/   # /login /signup
│       │   ├── (public)/(marketing)/        # /
│       │   └── (dashboard)/                 # /dashboard /mentor
│       ├── api/                  # typed API functions (auth.api.ts, submission.api.ts)
│       ├── hooks/                # TanStack Query hooks (auth.hook.ts, submission.hook.ts)
│       ├── components/
│       │   ├── layout/           # navbar, auth shell
│       │   ├── modules/          # auth / student / mentor feature components
│       │   └── ui/               # shadcn primitives
│       ├── providers/            # QueryClientProvider + Toaster
│       ├── types/                # shared type re-exports
│       ├── lib/                  # apiClient, roles, utils
│       └── proxy.ts              # route guard (Next 16 "middleware")
├── server/                       # Express API
│   ├── prisma/                   # schema.prisma + seed.ts
│   └── src/
│       ├── app/
│       │   ├── config/           # env validation + typed config
│       │   ├── lib/              # prisma, jwt, cookies
│       │   ├── middleware/       # checkAuth, validate, rateLimiter, errors
│       │   ├── module/
│       │   │   ├── auth/         # route · controller · service · validation · interface
│       │   │   └── submission/   # route · controller · service · validation · interface
│       │   └── utils/            # AppError, catchAsync, pagination, sendResponse
│       ├── app.ts                # express app + route mounting
│       └── server.ts             # listen + graceful shutdown
└── shared/                       # zod schemas + types used by BOTH apps
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ · pnpm 9+
- PostgreSQL 14+ running locally

### Setup

```bash
# 1. Install everything (pnpm workspaces)
pnpm install

# 2. Configure the server env
cp server/.env.example server/.env
#    → set DATABASE_URL + a JWT_SECRET (min 16 chars)

# 3. Create the database, run migrations, seed demo data
createdb ph_submissions          # or use any Postgres you like
pnpm db:migrate
pnpm db:seed

# 4. Run both apps (server :4000 + client :3000)
pnpm dev
```

Open **http://localhost:3000** 🚀

### Demo accounts (seeded)

| Role    | Email                            | Password     |
| ------- | -------------------------------- | ------------ |
| Student | `rafi@student.com`               | `Student123!`|
| Student | `nusrat@student.com` (+3 more)   | `Student123!`|
| Mentor  | `admin@programming-hero.com`     | `Mentor123!` |
| Mentor  | `mentor@programming-hero.com`    | `Mentor123!` |

---

## 🔌 API Overview

| Method | Endpoint                          | Access  | Notes                                |
| ------ | --------------------------------- | ------- | ------------------------------------ |
| POST   | `/api/v1/auth/signup`             | public  | students only, role forced server-side |
| POST   | `/api/v1/auth/login`              | public  | sets httpOnly JWT cookie             |
| POST   | `/api/v1/auth/logout`             | public  | clears cookie                        |
| GET    | `/api/v1/auth/me`                 | any     | current user (fresh from DB)         |
| POST   | `/api/v1/submissions`             | student | rate-limited 5/15min, dup-checked    |
| GET    | `/api/v1/submissions/mine`        | student | own submissions + feedback           |
| GET    | `/api/v1/submissions`             | mentor  | `?status=&page=&limit=` server-side  |
| GET    | `/api/v1/submissions/stats`       | mentor  | aggregated counts (cached ~30s)      |
| PATCH  | `/api/v1/submissions/:id/review`  | mentor  | approve/reject + optional note       |

Every response uses one envelope: `{ success, message, data, meta }` on
success and `{ success, message, errors }` on failure (field-keyed errors feed
the forms directly).

In development the Next.js server proxies `/api/*` → `http://localhost:4000`,
so the browser only ever talks to one origin and cookies flow without CORS.

---

## 🧪 Design Decisions (the "intentional ambiguities")

- **One student, many submissions** — allowed, but never the *same repo twice*
  (`(studentId, repoUrl)` unique). Mentors can re-review (flip a decision).
- **Feedback is a separate model** (1—N per submission) instead of a column,
  so notes accumulate with author + timestamp — and it gives the schema
  real relations to teach with.
- **`liveUrl` is optional** — not every course project is deployed.
- **Stats cache**: a tiny in-memory TTL cache (30s) + explicit invalidation
  on writes — the same shape a Redis layer would have, at dashboard scale.
- **Security**: helmet, credentialed CORS, 100kb body limit, no stack traces
  in production responses, bcrypt cost 10, no account-enumeration on login.

---

## 🎥 Teaching Material

This project doubles as the demo project for the video lessons — the JWT/RBAC
middleware, the Prisma relations, the defensive form validation and the
mentor dashboard data flow map directly onto the lesson topics.

---

## ☁️ Cloud Database (Neon) & Deployment

A free Neon branch is provisioned for the demo: **`ph-submissions`**
(project `polished-silence-98779098`, region `aws-ap-southeast-1`,
PostgreSQL 17, database `ph_submissions`), migrated and seeded.

To point the API at it, replace `DATABASE_URL` in `server/.env` with the
connection string from the [Neon console](https://console.neon.tech)
(project → Connect → pooled), then:

```bash
pnpm --filter server db:deploy   # apply migrations
pnpm db:seed                     # optional demo data
```

Deployment sketch (Render / Railway / Vercel + Neon):

1. **server** — build `pnpm --filter server build`, run `node dist/server.js`,
   set `JWT_SECRET`, `COOKIE_SECURE=true`, `CLIENT_ORIGIN=https://<your-domain>`
2. **client** — deploy `client/` to Vercel/Node, set `API_PROXY_URL` to the
   deployed API origin
3. Prisma migrations run with `prisma migrate deploy` (never `migrate dev`)
   in the deploy step

## 📄 License

MIT — built as an assessment submission for Programming Hero.
