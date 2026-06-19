# Staffly

**The HR & people-management module of the Centrely Suite** — the operations
platform for multi-site leisure centres (pools, gyms, sports halls, studios…).

Staffly gives **Site Managers** and **Duty Managers** one place to manage their
team: profiles, absence with the **Bradford Factor**, **certifications &
licences** with expiry alerts, **training** (records, a library and a
compliance matrix), performance notes, disciplinary records and a document
vault. The **Owner/Admin** gets visibility across every centre.

Staffly is a standalone app that borrows its **design language** from
**[Riskly](https://github.com/Nandui/riskly)** — the same Centrely Suite look
(fonts, tokens, sidebar shell, shadcn/ui primitives) and the shared
Auth.js setup and `Center`/`User` models — but none of Riskly's
risk-assessment functionality. The app lives at the root (`/`); Staffly domain
code is under `/src/components/staffly` and `/src/lib/staffly`.

## What it does

- **Staff directory** — every team member across your centres, with status,
  absence-YTD, Bradford score and a certification-health bar; searchable and
  filterable, with a "cert issues only" toggle.
- **Staff profile** — a tabbed profile: Overview · Absence · Performance ·
  Disciplinary · Documents · Certifications · Training · Timeline.
- **Absence & Bradford** — log absences (sickness counts toward the **Bradford
  Factor**, `B = S² × D`), run return-to-work interviews, and see an all-staff
  absence overview.
- **Certifications** — record qualifications/licences with auto-computed expiry;
  an organisation-wide overview with grouped views (≤30d, 31–90d, expired),
  filters and PDF/Excel export.
- **Notifications** — a server engine checks every cert against today and raises
  priority-sorted alerts (Low → Critical); the sidebar bell shows the
  unacknowledged Medium+ count.
- **Training** — per-staff records grouped by category, a programme library, and
  a **training matrix** (staff × required certs + programmes) colour-coded by
  compliance, with cell pop-overs and export.
- **Settings** — manage roles (and the certs they require) and certification
  types (built-ins are deactivatable; custom types are fully editable).

Data is scoped to the **current centre** (the sidebar switcher, shared with
Riskly), with an "All centres" overview.

## Tech stack

Matches Riskly exactly:

- **Next.js 16** (App Router, RSC, Server Actions) + **TypeScript 5** + **React 19**
- **Tailwind CSS v4** — design tokens in `src/app/globals.css` (`@theme`)
- **shadcn/ui** + **Radix UI** primitives · **lucide-react** icons · **motion** animations
- **Prisma** ORM with **PostgreSQL** (local via Docker; **Neon** on Vercel)
- **Zod** validation · **next-auth v5** (Credentials) · **@tanstack/react-table**
- **recharts** charts · **sonner** toasts · **date-fns**
- Exports: **jsPDF** + **html2canvas** (PDF), **SheetJS** (Excel); document vault via **Vercel Blob**

## Getting started

```bash
docker compose up -d   # start a local Postgres on localhost:5432
npm install            # install dependencies
npm run db:migrate     # create the tables from the Prisma migrations
npm run db:seed        # load demo data (3 LeisureWorld centres + 8 staff)
npm run dev            # http://localhost:3000  → /staffly
```

On first run, `/signin` prompts you to create the first **Admin**. The seed adds
demo staff, certifications (2 expired, 3 expiring), amber Bradford scores, a
training mix, a performance note and an open disciplinary record.

> Running a production build locally (`npm start`)? Auth.js needs to trust the
> host — set `AUTH_TRUST_HOST=true` in `.env`. On Vercel this is inferred
> automatically.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:migrate` | Create & apply a migration on your dev database |
| `npm run db:deploy` | Apply pending migrations (production) |
| `npm run db:seed` | Load demo data |
| `npm run db:reset` | Drop, re-migrate and reseed |
| `npm run db:studio` | Browse the data in Prisma Studio |

## Project structure

```
prisma/
  schema.prisma          # Center, User + Staffly models (StaffMember, CertRecord, …)
  seed.ts                # 3 centres, 8 staff + demo records
src/
  app/(app)/             # the app at root: dashboard (/), staff, absence, certifications, training-*, notifications, settings
  app/(auth)/signin/     # sign-in / first-run admin
  components/staffly/     # layout shell, staff/absence/cert/training/settings/shared components
  lib/staffly/
    bradford.ts          # Bradford Factor engine (B = S² × D)
    notifications.ts     # cert-expiry notification engine
    constants.ts         # enum metadata + badge styles
    validation.ts        # zod schemas
    data/                # read queries (server components)
    actions/             # server actions / mutations (zod-validated)
```

## Domain model (Staffly)

- **StaffMember** — a person at a `Center`, with a `StaffRole`, status and start/end dates.
- **StaffRole** — a role (Lifeguard, Duty Manager…) that requires certain `CertType`s and training programmes.
- **AbsenceRecord** — typed absence; sickness/unauthorised feed the Bradford Factor.
- **CertType / CertRecord** — certification catalogue and the records held by staff (issue + expiry).
- **TrainingProgramme / TrainingRecord** — the library and completed training (one-time or recurring).
- **PerformanceNote · DisciplinaryRecord · StaffDocument** — notes, formal records and the document vault.

`Center` and `User` are shared with Riskly — Staffly reads them and does not own them.

## Deployment

Hosted on **Vercel** with a **Neon** Postgres database; migrations run on every
deploy via `vercel-build`. See **[DEPLOY.md](DEPLOY.md)**.

---

*Staffly v1.1 — part of the Centrely Suite.*
