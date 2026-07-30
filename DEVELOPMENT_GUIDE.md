# Development Guide — AI Interview Platform

Welcome. This guide helps a new developer set up, understand, and contribute to the project quickly.

**Read also**

| Doc | Purpose |
|-----|---------|
| [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) | System design, APIs, schemas, gaps |
| [TODO.md](./TODO.md) | Prioritized backlog to production |
| [AGENTS.md](./AGENTS.md) | AI / Cursor agent working rules |

**Active codebases:** `frontend/` and `backend/` only. Treat `frontend_backup/` as reference/legacy — do not ship or extend it unless restoring a specific feature into `frontend/`.

---

## 1. Local setup

### Prerequisites

| Tool | Suggested version | Notes |
|------|-------------------|--------|
| Node.js | 20 LTS or newer | Required for Vite 8 / Express 5 |
| npm | Bundled with Node | Used in both apps |
| MongoDB | 6+ | Local service or MongoDB Atlas |
| Git | Latest | — |
| Code editor | Cursor / VS Code | Optional: ESLint extension for frontend |

Optional for full local testing:

- SMTP inbox (Gmail App Password, Mailtrap, or similar) for recruiter invitations
- [Groq](https://console.groq.com/) API key for `/ask`, `/evaluate`, and resume parse

### Clone and install

```bash
git clone <repository-url>
cd AI-Interview-Platform

cd backend
npm install
cd ../frontend
npm install
```

### Create backend env file

```bash
cd backend
# Create .env (gitignored). See section 2 for keys.
```

There is not yet a committed `.env.example` in the repo — use the template in **§2**.

### Verify MongoDB

Default connection (hardcoded today in `backend/config/db.js`):

```text
mongodb://127.0.0.1:27017/AIHiringPlatform
```

Ensure MongoDB is running before starting the backend.

### First-run smoke path

1. Start backend (§3) and frontend (§4).
2. Open the Vite URL (usually `http://localhost:5173`).
3. Register a company via `/recruiter/signup` (this creates a **CompanyAdmin**).
4. Log in at `/company/login` → Team → invite a recruiter.
5. Accept invite from email (or copy `invitationUrl` from API response) → set password → `/recruiter/login`.
6. Separately register a candidate at `/candidate/signup` → `/candidate/login`.

---

## 2. Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret for signing/verifying JWTs |
| `GROQ_API_KEY` | For AI features | Groq API key (`backend/groq.js`) |
| `EMAIL_HOST` | For invites | SMTP host (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | For invites | SMTP port (e.g. `587`) |
| `EMAIL_USER` | For invites | SMTP username / from address |
| `EMAIL_PASS` | For invites | SMTP password or app password |
| `FRONTEND_URL` | Recommended | Base URL for invitation links (e.g. `http://localhost:5173`) |

**Template**

```env
JWT_SECRET=replace-with-a-long-random-string
GROQ_API_KEY=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=http://localhost:5173
```

### Not env-driven yet (know these defaults)

| Setting | Current value | Location |
|---------|---------------|----------|
| MongoDB URI | `mongodb://127.0.0.1:27017/AIHiringPlatform` | `backend/config/db.js` |
| Backend port | `5000` | `backend/server.js` |
| Frontend API base | `http://localhost:5000` | `frontend/src/config/api.js` |
| Groq model | `llama-3.3-70b-versatile` | `backend/groq.js` |

Moving these into env is tracked as **C01** in [TODO.md](./TODO.md).

### Frontend

No `VITE_*` variables are required today. When C01 lands, prefer:

```env
VITE_API_URL=http://localhost:5000
```

### Security notes

- Never commit `backend/.env` (already in `.gitignore`).
- Do not commit real SMTP or Groq keys.
- `backend/config/mail.js` currently disables TLS rejection for local SMTP convenience — do **not** keep that pattern in production (see TODO **C06**).

---

## 3. Backend startup

```bash
cd backend
npm install          # first time / after package changes
node server.js
```

Expected console signals:

- `MongoDB Connected: ...`
- `Server running on port 5000`
- Optionally `Gmail SMTP Connected Successfully` if mail env is valid

Health check:

```bash
curl http://localhost:5000/
```

Expected JSON roughly: `{ "status": "success", "message": "AI Hiring Platform Backend Running" }`.

### Backend layout reminder

| Path | Role |
|------|------|
| `server.js` | App entry, mounts, `/ask`, `/evaluate` |
| `routes/` | HTTP routers |
| `controllers/` | Controllers (partial; many routes still inline) |
| `models/` | Mongoose schemas |
| `config/` | DB + mail |
| `utils/` | Email, OTP helper |
| `groq.js` | `askGroq(prompt)` |
| `uploads/` | Resume PDFs (created at runtime; gitignored) |

Target layering (prefer when adding features):

```text
Routes → Controllers → Services → Models
```

---

## 4. Frontend startup

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

Other scripts:

```bash
npm run build      # production build → dist/
npm run preview    # preview production build
npm run lint       # ESLint
```

### Path alias

`@/` maps to `frontend/src/` (see `vite.config.js`). Prefer:

```js
import api from "@/config/api";
import { Button } from "@/components/ui/button";
```

### Auth storage

After login, clients store:

```json
{
  "token": "<jwt>",
  "role": "Candidate | Recruiter | CompanyAdmin",
  "user": { }
}
```

in `localStorage` key **`auth`**. Axios attaches `Authorization: Bearer <token>` via `src/config/api.js`.

**Known quirk:** some candidate dashboard code still reads `localStorage.candidate` — prefer `auth` and fix call sites when you touch those files (TODO **C05**).

---

## 5. Folder conventions

```text
AI-Interview-Platform/
├── backend/                 # API only
├── frontend/                # Active React app
├── frontend_backup/         # Legacy reference — do not treat as source of truth
├── .cursor/                 # Project rules + skills for Cursor agents
├── PROJECT_ARCHITECTURE.md
├── TODO.md
├── DEVELOPMENT_GUIDE.md     # this file
└── AGENTS.md
```

### Frontend (`frontend/src`)

| Folder / pattern | Convention |
|------------------|------------|
| `*Login.jsx`, `*Dashboard.jsx`, `Home.jsx` | **Pages** (route-level) |
| `components/` | Reusable UI by domain (`candidate`, `company`, `recruiter`, `dashboard`, `home`, `layout`, `auth`) |
| `components/ui/` | shadcn-style primitives — reuse before inventing new base controls |
| `services/` | API calls only (Axios via `config/api.js`) |
| `config/` | API client, navigation config |
| `lib/` | Small shared helpers (`cn`, etc.) |

```text
Pages → Components → Services → api.js
```

### Backend (`backend`)

| Folder | Convention |
|--------|------------|
| `routes/` | Mount paths, validate HTTP, call controller/service |
| `controllers/` | Req/res orchestration |
| `services/` | Prefer creating this for new business logic (not fully present yet) |
| `models/` | Schemas only |
| `middleware/` | Prefer shared auth here when implementing C04 |
| `utils/` | Pure helpers (email, OTP) |
| `config/` | Infrastructure wiring |

### Do / don’t

| Do | Don’t |
|----|--------|
| Add API methods to existing `services/*.js` | Duplicate Axios clients |
| Reuse `components/ui/*` | Copy-paste new button/input primitives |
| Extend `emailService.js` for mail | Add a second Nodemailer stack |
| Use `askGroq` from `groq.js` | Scatter new Groq clients |
| Work in `frontend/` + `backend/` | Build features only in `frontend_backup/` |

---

## 6. Coding conventions

### General

- Read related files before editing (routes + models + services + UI).
- Prefer reuse over new utilities/services/components.
- Preserve existing API response shapes where clients already depend on them (`success`, `message`, `data` / entity fields).
- No unused imports, variables, or dead code in your diff.
- Avoid hardcoded secrets; use env for credentials.
- Explain non-trivial file changes in PRs (what / why / risk).

### Backend (JavaScript / CommonJS)

- Use `require` / `module.exports` (project is `"type": "commonjs"`).
- Async route handlers with `try/catch`; return JSON errors consistently.
- Passwords: `bcryptjs` (cost factor **10** is the existing pattern).
- Tokens: `jsonwebtoken`, expiry often `7d`.
- Roles must stay exact: `Candidate`, `Recruiter`, `CompanyAdmin`.
- Keep AI prompts and Groq calls centralized when possible.

### Frontend (React / JSX)

- Function components only.
- Route protection via `ProtectedRoute` + `allowedRoles`.
- Domain HTTP through `services/*`, not ad-hoc `fetch` in pages (except temporary prototypes).
- Tailwind + existing `cn()` helper; match surrounding spacing/typography.
- Toasts: project already uses Sonner / react-hot-toast — follow the nearest screen.

### Schema / migrations

- There is no formal migration tool yet. If you change Mongoose schemas:
  - Document impact on existing documents.
  - Prefer additive fields with defaults.
  - Call out backfill needs in the PR.

### Cursor project rules

Always-on rules under `.cursor/rules/` encode architecture and quality expectations. Follow them when using Cursor agents.

---

## 7. Branch strategy

Suggested GitFlow-lite (adopt even if history is currently simple):

| Branch | Purpose |
|--------|---------|
| `main` | Stable / releasable |
| `develop` | Integration branch (optional for small teams; otherwise PR into `main`) |
| `feature/<short-name>` | New features (e.g. `feature/job-board`) |
| `fix/<short-name>` | Bug fixes |
| `chore/<short-name>` | Tooling, deps, docs |
| `hotfix/<short-name>` | Urgent production fixes from `main` |

### Workflow

1. Pull latest `main` (or `develop`).
2. Create a branch from it.
3. Implement with small, reviewable commits.
4. Open a PR into `main` / `develop`.
5. Require review for auth, payments (N/A), email, and schema changes.
6. Squash or rebase per team preference; avoid force-push to shared integration branches.

### Scope tips

- One concern per PR when possible (align with TODO IDs, e.g. `C04 auth middleware`).
- Do not mix large refactors with feature work unless the refactor is required for the feature.

---

## 8. Commit message format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(optional-scope): <short summary in imperative mood>

[optional body — why, not only what]

[optional footer]
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New user-facing capability |
| `fix` | Bug fix |
| `refactor` | Internal structure, same behavior |
| `docs` | Markdown / comments only |
| `style` | Formatting only |
| `perf` | Performance |
| `test` | Tests |
| `chore` | Tooling, deps, ignore files |
| `security` | Auth, secrets, vulnerability fixes |

### Scopes (suggested)

`candidate`, `company`, `recruiter`, `team`, `job`, `interview`, `auth`, `email`, `frontend`, `backend`, `docs`

### Examples

```text
feat(team): send recruiter invitation emails via SMTP

fix(auth): read candidate dashboard user from localStorage auth

docs: add DEVELOPMENT_GUIDE for contributor onboarding

chore(backend): add mongoose to package.json dependencies
```

Keep the subject ≤ ~72 characters. Reference TODO IDs in the body when useful (`Addresses C05`).

---

## 9. Testing checklist

Automated backend tests are minimal today (`npm test` is a stub). Until M09 lands, use this **manual** checklist before merging.

### Always

- [ ] Backend starts without crash; Mongo connects
- [ ] Frontend `npm run dev` loads; `npm run lint` clean for touched files
- [ ] No console errors on the screens you changed
- [ ] Login still works for roles you touched (`Candidate` / `Recruiter` / `CompanyAdmin`)
- [ ] `ProtectedRoute` still redirects unauthenticated users correctly

### Auth / team

- [ ] Company register + login
- [ ] Invite recruiter → email or `invitationUrl` → accept → recruiter login
- [ ] Inactive / deleted recruiter cannot perform restricted actions (when APIs enforce it)
- [ ] Wrong-role login paths rejected (admin must use company login)

### Candidate

- [ ] Register + login
- [ ] Profile update endpoints / UI (if changed)
- [ ] Resume upload PDF only; non-PDF rejected
- [ ] Parse resume returns skills when Groq key is set

### Jobs / applications (when feature exists)

- [ ] Create job as recruiter/admin
- [ ] List jobs for creator/company
- [ ] Candidate apply once; duplicate apply handled
- [ ] Status transitions update lists on both sides

### AI

- [ ] `POST /ask` returns a question
- [ ] `POST /evaluate` returns scores/feedback
- [ ] Failure with missing `GROQ_API_KEY` is handled gracefully (no uncaught crash)

### Regression

- [ ] Existing team management still loads
- [ ] Invitation accept page still works with query `token`
- [ ] API response fields expected by frontend services unchanged (or frontend updated in same PR)

---

## 10. Deployment checklist

Use before any staging/production deploy.

### Build artifacts

- [ ] `cd frontend && npm ci && npm run build` succeeds
- [ ] Backend `npm ci --omit=dev` (or equivalent) on the server
- [ ] Node version on server matches local/CI

### Configuration

- [ ] Production `.env` set on the host/secrets manager (never bake secrets into images)
- [ ] `JWT_SECRET` is strong and unique per environment
- [ ] `FRONTEND_URL` points at the real SPA origin (invitation links)
- [ ] MongoDB URI points at the managed cluster (once C01 removes hardcoded local URI)
- [ ] CORS allowlist matches frontend origin(s)
- [ ] API base URL in the built frontend points at the production API

### Process / hosting

- [ ] Process manager (PM2, systemd, container) restarts on failure
- [ ] Reverse proxy (Nginx/Caddy) terminates TLS
- [ ] Uploads directory is persistent **or** object storage is configured
- [ ] Log rotation enabled
- [ ] Health check endpoint monitored (`GET /`)

### Data

- [ ] Backup strategy for MongoDB documented and tested
- [ ] Indexes reviewed for hot queries (email unique, invitation token, etc.)

### Do not deploy

- [ ] `GET /team/debug-admin` / `debug-invitations` still enabled
- [ ] `frontend_backup/` as a served app
- [ ] TLS verification disabled for SMTP in production

---

## 11. Production checklist

Stricter than deploy — “are we ready for real users?”

### Security

- [ ] JWT required on all mutating and PII-read endpoints
- [ ] Role + permission checks enforced server-side
- [ ] Rate limiting on auth and AI routes
- [ ] Helmet (or equivalent) security headers
- [ ] Input validation on all public bodies
- [ ] No open candidate/recruiter listing without auth
- [ ] SMTP TLS verified; no global TLS disable
- [ ] Dependency audit (`npm audit`) reviewed

### Reliability

- [ ] Env-only configuration (no hardcoded local Mongo/API URLs)
- [ ] Structured error logging + alerting
- [ ] Email send failures don’t silently corrupt invite state (or are retried)
- [ ] Groq/LLM failures return safe API errors
- [ ] Resume parse tolerates non-JSON model output

### Product MVP (from TODO definition of done)

- [ ] Company → invite → job → apply → status update works end-to-end
- [ ] Candidate profile + resume flows in **active** frontend
- [ ] Dashboards show real data for the logged-in user
- [ ] Navigation only links to implemented pages
- [ ] Smoke tests (or checklist evidence) for auth + invite + apply

### Legal / ops

- [ ] Privacy policy / terms linked if collecting candidate data
- [ ] Data retention plan for resumes and emails
- [ ] On-call / support path for SMTP and API outages

---

## 12. Troubleshooting guide

| Symptom | Likely cause | What to try |
|---------|--------------|-------------|
| Backend exits immediately | MongoDB not running / wrong host | Start Mongo; confirm `127.0.0.1:27017`; check `config/db.js` logs |
| `JWT` errors / 401 on team routes | Missing/invalid `JWT_SECRET` or token | Ensure `.env` loaded; re-login; send `Authorization: Bearer …` |
| Company team APIs 401 | Not logged in as `CompanyAdmin` or token role mismatch | Use `/company/login`; inspect `localStorage.auth.role` |
| Recruiter login forbidden | Invitation not accepted / inactive | Complete accept-invitation; check `invitationAccepted`, `isActive`, `status` |
| Invitation email missing | SMTP env wrong or TLS issues | Check `mail.js` verify logs; confirm App Password; copy `invitationUrl` from invite API response |
| Invitation link wrong host | `FRONTEND_URL` unset | Set `FRONTEND_URL=http://localhost:5173` |
| Frontend calls fail (CORS / network) | Backend down or wrong API URL | Confirm port 5000; check `config/api.js` baseURL |
| Candidate dashboard blank / wrong user | Reads `localStorage.candidate` instead of `auth` | Inspect storage; align with `auth` (C05) |
| Resume upload fails | Not PDF / uploads folder missing / cwd | Use PDF; run server from `backend/` so `uploads/` resolves |
| Parse resume 500 | Missing Groq key or non-JSON LLM output | Set `GROQ_API_KEY`; inspect raw Groq response |
| `/ask` or `/evaluate` 500 | Groq key/quota/model | Verify key; check Groq console |
| `mongoose` module errors | Package not declared/installed | `npm install mongoose` in `backend` (C02) |
| Module not found `@/…` | Wrong cwd or Vite alias | Run from `frontend/`; confirm `vite.config.js` alias |
| Port already in use | Another process on 5000/5173 | Stop other process or change port temporarily |

### Useful inspection snippets

Browser console:

```js
JSON.parse(localStorage.getItem("auth"))
```

Invite accept URL shape:

```text
{FRONTEND_URL}/team/accept-invitation?token={invitationToken}
```

---

## 13. Common project commands

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

### Git (typical)

```bash
git checkout main
git pull
git checkout -b feature/short-name
git status
git add <files>
git commit -m "feat(scope): summary"
git push -u origin HEAD
```

### Quick API checks

```bash
# Health
curl http://localhost:5000/

# Generate interview question (needs Groq)
curl -X POST http://localhost:5000/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"category\":\"Java\",\"difficulty\":\"Easy\"}"
```

*(On macOS/Linux, use `\` line continuations instead of `^`.)*

### MongoDB (local examples)

```bash
# Shell into local DB name used by the app
mongosh AIHiringPlatform
```

---

## 14. Future roadmap

Aligned with [TODO.md](./TODO.md) and architecture Phase 0–4.

### Near term — stabilize (Critical)

1. Env-based DB/port/API/model config  
2. Dependency hygiene (`mongoose`, remove unused packages)  
3. Remove debug/open PII endpoints  
4. Shared JWT middleware on mutating APIs  
5. Fix `auth` localStorage consistency  
6. Production-safe SMTP TLS  
7. Schema ref / broken controller cleanup  

### MVP — hiring loop (High)

1. Single Job API + create/list UI  
2. Candidate profile + resume UI in active frontend  
3. Job board + applications lifecycle  
4. Real dashboards + recruiter inbox  
5. Navigation aligned to real pages  
6. Permission enforcement  

### Next — interviews & quality (Medium)

1. Interview scheduling  
2. Multi-turn AI interview UI with persisted scores  
3. Hardened resume JSON parsing  
4. Workflow builder linked to jobs  
5. Activity event writes  
6. Controllers/services extraction  
7. Rate limits, validation, automated tests  
8. Password reset  

### Later — scale & polish (Low)

1. OTP verification  
2. Coding assessment engine  
3. Reports, notifications, audit logs  
4. Email queue, S3 uploads, CI/CD  
5. A11y/performance; archive `frontend_backup`  

### Success criteria (production-ready MVP)

- Three roles complete: **company onboard → invite recruiter → post job → candidate apply → AI interview → status update**
- No unauthenticated PII dumps  
- Configuration via environment only  
- Critical paths covered by tests or a signed manual checklist  

---

## Getting help

1. Search [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) for the module (candidate, team, job, …).  
2. Check [TODO.md](./TODO.md) for whether work is already planned (use the ID in your branch/PR).  
3. Inspect existing services/routes before adding files.  
4. Ask in team chat with: reproduction steps, role used, `auth.role`, and backend log snippet.

Welcome aboard — prefer small PRs, reuse existing layers, and keep `frontend/` + `backend/` as the only sources of truth.
