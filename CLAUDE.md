# CLAUDE.md

## Project Overview
FitCore is a SaaS platform for small fitness studios (PT, yoga, pilates, crossfit).
Studio owners manage members, schedules, and payments via a web dashboard.
Members book classes and track progress via a mobile app.

---

## Tech Stack
- **Web (Admin)**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Mobile (Member)**: React Native, TypeScript, Expo — Phase 2
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic
- **Database**: PostgreSQL
- **Cache**: Redis
- **Payment**: Toss Payments API
- **Notifications**: Kakao AlimTalk
- **File Storage**: AWS S3

---

## Repository Structure
```
fitcore/
├── backend/
│   └── app/
│       ├── api/v1/        # Route handlers — HTTP layer only
│       ├── services/      # Business logic
│       ├── repositories/  # DB queries
│       ├── models/        # SQLAlchemy ORM models
│       ├── schemas/       # Pydantic request/response
│       ├── core/          # Config, JWT, dependencies
│       └── main.py
│
├── web/                   # React admin dashboard
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/         # Custom hooks (data fetching)
│       ├── services/      # Axios API client
│       ├── store/         # Zustand (auth, UI state)
│       └── types/
│
├── mobile/                # React Native — Phase 2
│   └── src/
│       ├── screens/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── navigation/
│
└── shared/                # Shared types (web + mobile reuse)
    └── types/
        ├── member.ts
        ├── payment.ts
        └── schedule.ts
```

---

## Backend Rules

**Layer responsibilities**
- `api/v1/` — validate input, call service, return response. No logic here.
- `services/` — all business logic. Never query DB directly.
- `repositories/` — all SQLAlchemy queries. No business logic.
- `schemas/` — always create separate `XxxCreate`, `XxxUpdate`, `XxxResponse`
- `models/` — every model must include `id (UUID)`, `created_at`, `updated_at`, `is_deleted`

**Rules**
- Never hard delete — always set `is_deleted = True`
- Always check `studio_id` ownership before any DB operation
- Never store raw card numbers or CVV — store PG transaction ID and card last 4 digits only
- Validate Toss Payments webhook signature before processing

**Standard API response**
```json
{ "success": true, "data": {}, "message": "" }
```
- Base path: `/api/v1/`
- Auto-generated docs: `http://localhost:8000/docs`

---

## Frontend Rules (Web)

**State management**
- Server state → TanStack Query (React Query) — no exceptions
- Global UI state → Zustand (auth, modals, sidebar)
- Local state → useState only

**Rules**
- No direct axios calls in components — use `services/` + custom hooks
- No `any` type in TypeScript
- Tailwind classes only — no inline styles
- Types shared with mobile must go in `shared/types/`

---

## Web ↔ Mobile Strategy

Phase 1 — Web dashboard only (React + Vite)
Phase 2 — Add React Native mobile app (Expo)

Code sharing between web and mobile:
- `shared/types/` — TypeScript interfaces
- `hooks/` — data fetching hooks (reusable with same API)
- `services/` — Axios API client logic

UI components are NOT shared (React div vs React Native View).

---

## Core Domains
- **Member** — profile, health notes, contact
- **Membership** — SESSION | PERIOD | MONTHLY | DROPIN, remaining sessions, expiry
- **ClassSchedule** — PT | YOGA | PILATES | CROSSFIT, capacity, trainer
- **Attendance** — ATTENDED | NO_SHOW | CANCELLED
- **Payment** — transaction ID, amount, card last 4, approval number, refund status

---

## MVP Scope (Phase 1 only)
1. Studio owner login / auth
2. Member CRUD
3. Membership management (session tracking, expiry alerts)
4. Class schedule + booking
5. Attendance check-in
6. Payment recording via Toss Payments
7. Auto Kakao AlimTalk: expiry D-7 / D-3 / D-1
8. Dashboard: today's classes, revenue summary, expiring members


## Token & Context Optimization Rules
- **Surgical Code Modifications**: Only modify the exact lines of code that need changes. Do not rewrite whole files or modify unrelated formatting.
- **Minimal Explanation**: Provide highly concise explanations. Focus heavily on providing clean, working code snippets rather than verbose commentary.
- **No Speculative Coding**: Do not implement unrequested features, future abstractions, or speculative architectures that inflate context size.
- **Proactive /clear Reminders**: When a task is completed or the conversation switches topics, proactively advise the user to use the `/clear` command to reset the context window.