# TODO.md — Path to Production

Based on [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) and the current `frontend/` + `backend/` implementation.

**Goal:** Company onboard → invite recruiter → post job → candidate apply → AI interview → status update, with secure APIs, env-based config, and critical-path tests.

**Estimates assume** one developer familiar with this repo. Times are calendar effort (not wall-clock including reviews).

---

## Legend

| Field | Scale |
|-------|--------|
| **Priority** | Critical → High → Medium → Low |
| **Difficulty** | S (simple) · M (moderate) · L (large) · XL (complex / multi-system) |
| **Time** | Person-days (d) |

**Priority meaning**

| Priority | Meaning |
|----------|---------|
| Critical | Blocks safe/deployable use or breaks core auth/data integrity |
| High | Required for production MVP hiring loop |
| Medium | Strong product value; can follow MVP if sequenced carefully |
| Low | Nice-to-have, optional track, or cleanup after MVP |

---

## Recommended execution order

Work top-to-bottom. Do not start High product features until Critical security/config items are done.

| Order | ID | Priority | Item | Diff | Time |
|------:|----|----------|------|------|------|
| 1 | C01 | Critical | Env-based config (DB, port, CORS, API URL, model) | M | 1d |
| 2 | C02 | Critical | Declare/fix `mongoose` + dependency hygiene | S | 0.5d |
| 3 | C03 | Critical | Remove debug/unauthenticated PII endpoints | S | 0.5d |
| 4 | C04 | Critical | Shared JWT auth middleware + lock down mutating APIs | L | 3d |
| 5 | C05 | Critical | Fix candidate `auth` vs `localStorage.candidate` split | S | 0.5d |
| 6 | C06 | Critical | Secure SMTP TLS (remove blind TLS disable) | S | 0.5d |
| 7 | C07 | Critical | `.env.example` + secrets hygiene docs | S | 0.25d |
| 8 | C08 | Critical | Fix schema refs + broken `jobController` | M | 1d |
| 9 | H01 | High | Unifyify Job API to `Job` schema (one source of truth) | L | 2d |
| 10 | H02 | High | Recruiter/Company job create & list UI | L | 3d |
| 11 | H03 | High | Candidate profile builder UI (from backup patterns) | M | 2d |
| 12 | H04 | High | Resume upload + parse UI wired to APIs | M | 1.5d |
| 13 | H05 | High | Candidate job board + apply → Application lifecycle | L | 3d |
| 14 | H06 | High | Wire real candidate dashboard (`GET /dashboard/:id`) | M | 1.5d |
| 15 | H07 | High | Recruiter applications inbox + status updates | L | 2.5d |
| 16 | H08 | High | Enforce recruiter permissions on job/application APIs | M | 1.5d |
| 17 | H09 | High | Align routes/nav pages (no dead sidebar items) | M | 1d |
| 18 | H10 | High | Rename/clarify company registration route & copy | S | 0.5d |
| 19 | M01 | Medium | Interview scheduling CRUD + UI | L | 3d |
| 20 | M02 | Medium | Active AI interview session UI + persist results | L | 4d |
| 21 | M03 | Medium | Harden Groq resume JSON parsing | M | 1d |
| 22 | M04 | Medium | Workflow builder UI + link to Job.workflowId | L | 3d |
| 23 | M05 | Medium | Activity feed writes on key events | M | 1.5d |
| 24 | M06 | Medium | Company/recruiter dashboard real metrics | M | 2d |
| 25 | M07 | Medium | Backend layering extract (controllers/services) | L | 3d |
| 26 | M08 | Medium | Rate limits + Helmet + request validation | M | 2d |
| 27 | M09 | Medium | Automated tests for critical paths | L | 3d |
| 28 | M10 | Medium | Password reset / account recovery | M | 2d |
| 29 | L01 | Low | Email/phone OTP verification | M | 2d |
| 30 | L02 | Low | Coding assessment engine | XL | 10–15d |
| 31 | L03 | Low | Reports / analytics module | L | 3d |
| 32 | L04 | Low | Real-time notifications | L | 3d |
| 33 | L05 | Low | Email queue + retries | M | 2d |
| 34 | L06 | Low | Object storage for resumes (S3-compatible) | M | 2d |
| 35 | L07 | Low | CI/CD pipeline | M | 1.5d |
| 36 | L08 | Low | Archive/remove `frontend_backup` from deploy | S | 0.5d |
| 37 | L09 | Low | Accessibility + performance pass | M | 2d |
| 38 | L10 | Low | Admin audit logs | M | 2d |
| 39 | L11 | Low | Remove unused deps/UI (Google AI, OTP stubs if unused) | S | 0.5d |

**Rough totals (ordered path)**

| Priority | Items | Estimated time |
|----------|------:|----------------|
| Critical | 8 | ~7.25d |
| High | 10 | ~18.5d |
| Medium | 10 | ~24.5d |
| Low | 11 | ~28.5–33.5d |
| **MVP (Critical + High)** | **18** | **~25.75d (~5 weeks)** |
| **Production-quality (+ Medium)** | **28** | **~50d (~10 weeks)** |
| **Full backlog (+ Low)** | **39** | **~80–85d** |

---

## Critical

### C01 — Environment-based configuration
- **Difficulty:** M  
- **Time:** 1d  
- **Why:** Hardcoded Mongo URI, port `5000`, Axios base URL, and Groq model block deployability.  
- **Affected files:**  
  - `backend/config/db.js`  
  - `backend/server.js`  
  - `backend/groq.js`  
  - `frontend/src/config/api.js`  
  - `backend/.env` / new `backend/.env.example`  
  - `frontend/.env.example` (e.g. `VITE_API_URL`)  
  - optionally `PROJECT_ARCHITECTURE.md` / `AGENTS.md` (docs only)

### C02 — Fix dependency declaration (`mongoose`, unused packages)
- **Difficulty:** S  
- **Time:** 0.5d  
- **Why:** `mongoose` is required everywhere but missing from `backend/package.json`; `@google/generative-ai` is unused.  
- **Affected files:**  
  - `backend/package.json`  
  - `backend/package-lock.json`

### C03 — Remove debug & open PII list endpoints
- **Difficulty:** S  
- **Time:** 0.5d  
- **Why:** `GET /team/debug-*` and unauthenticated `GET /candidate/all` / `GET /recruiter/all` leak data.  
- **Affected files:**  
  - `backend/routes/teamRoutes.js`  
  - `backend/routes/candidateRoutes.js`  
  - `backend/routes/recruiterRoutes.js`

### C04 — Shared auth middleware; protect mutating APIs
- **Difficulty:** L  
- **Time:** 3d  
- **Why:** Candidate profile/resume/job/workflow routes trust body `email` / `recruiterId`; candidate JWT lacks `role`.  
- **Affected files:**  
  - new `backend/middleware/auth.js` (or similar)  
  - `backend/routes/candidateRoutes.js`  
  - `backend/routes/jobRoutes.js`  
  - `backend/routes/recruiterRoutes.js`  
  - `backend/routes/workflowRoutes.js`  
  - `backend/routes/dashboardRoutes.js`  
  - `backend/routes/companyRoutes.js`  
  - `backend/server.js` (`/ask`, `/evaluate` rate/auth policy)  
  - possibly `frontend/src/services/*` if response contracts change slightly

### C05 — Unify client auth storage (`auth` only)
- **Difficulty:** S  
- **Time:** 0.5d  
- **Why:** Login writes `auth`; `CandidateDashboard` / `HeroSection` still read `candidate`.  
- **Affected files:**  
  - `frontend/src/CandidateDashboard.jsx`  
  - `frontend/src/components/dashboard/sections/HeroSection.jsx`  
  - `frontend/src/components/layout/Sidebar.jsx` (logout keys)  
  - `frontend/src/config/navigation.js`  
  - any remaining `localStorage.getItem("candidate")` usages

### C06 — Secure email TLS configuration
- **Difficulty:** S  
- **Time:** 0.5d  
- **Why:** `NODE_TLS_REJECT_UNAUTHORIZED = "0"` and `rejectUnauthorized: false` weaken TLS.  
- **Affected files:**  
  - `backend/config/mail.js`

### C07 — `.env.example` and secrets documentation
- **Difficulty:** S  
- **Time:** 0.25d  
- **Why:** Onboarding and production require documented vars (`JWT_SECRET`, Groq, SMTP, `FRONTEND_URL`, etc.).  
- **Affected files:**  
  - new `backend/.env.example`  
  - new `frontend/.env.example`  
  - `.gitignore` (verify)  
  - optionally README / architecture appendix

### C08 — Schema ref fixes + remove/repair broken job controller
- **Difficulty:** M  
- **Time:** 1d  
- **Why:** Refs to nonexistent `CompanyAdmin` / `Workflow`; `jobController.js` is orphaned and broken.  
- **Affected files:**  
  - `backend/models/Job.js`  
  - `backend/models/Invitation.js`  
  - `backend/controllers/jobController.js` (delete or rewrite)  
  - `backend/routes/jobRoutes.js`  
  - any populate calls depending on old refs

---

## High

### H01 — Single Job API aligned to `Job` schema
- **Difficulty:** L  
- **Time:** 2d  
- **Why:** `/recruiter/jobs` field names diverge from `Job` model; dual create paths confuse clients.  
- **Affected files:**  
  - `backend/routes/jobRoutes.js`  
  - `backend/routes/recruiterRoutes.js`  
  - new `backend/controllers/jobController.js` / `backend/services/jobService.js`  
  - `backend/models/Job.js`  
  - `frontend/src/services/` (new `jobService.js`)

### H02 — Job create & list UI (recruiter + company)
- **Difficulty:** L  
- **Time:** 3d  
- **Why:** MVP requires posting jobs; recruiter “Create Job” is currently a no-op; company Jobs page missing.  
- **Affected files:**  
  - `frontend/src/RecruiterDashboard.jsx`  
  - `frontend/src/CompanyDashboard.jsx`  
  - new job form/list components under `frontend/src/components/`  
  - `frontend/src/services/jobService.js`  
  - optionally port patterns from `frontend_backup/src/RecruiterCreateJob.jsx`

### H03 — Candidate profile builder UI
- **Difficulty:** M  
- **Time:** 2d  
- **Why:** APIs exist; active UI does not (backup has pages).  
- **Affected files:**  
  - `frontend/src/CandidateDashboard.jsx`  
  - new/adapted components under `frontend/src/components/candidate/`  
  - `frontend/src/services/candidateService.js`  
  - reference: `frontend_backup/src/CandidatePersonalDetails.jsx`, `CandidateAcademicDetails.jsx`, `CandidateProjects.jsx`, `CandidateCertifications.jsx`

### H04 — Resume upload + parse UI
- **Difficulty:** M  
- **Time:** 1.5d  
- **Why:** Backend upload/parse ready; no active frontend wiring.  
- **Affected files:**  
  - `frontend/src/services/candidateService.js`  
  - new resume component(s)  
  - `frontend/src/config/api.js` (multipart headers if needed)  
  - reference: `frontend_backup/src/CandidateResumeUpload.jsx`  
  - `backend/routes/candidateRoutes.js` (only if auth/path tweaks needed)

### H05 — Job board + apply → Application lifecycle
- **Difficulty:** L  
- **Time:** 3d  
- **Why:** Core hiring loop; `Application` model unused by UI/write APIs.  
- **Affected files:**  
  - new `backend/routes/applicationRoutes.js` + controller/service  
  - `backend/models/Application.js`  
  - `backend/server.js`  
  - `frontend/src/components/dashboard/Jobs.jsx`  
  - `frontend/src/services/` application + job services  
  - `frontend/src/CandidateDashboard.jsx` / navigation pages

### H06 — Real candidate dashboard data
- **Difficulty:** M  
- **Time:** 1.5d  
- **Why:** `GET /dashboard/:candidateId` exists; cards are static mocks.  
- **Affected files:**  
  - `frontend/src/components/dashboard/Home.jsx`  
  - `frontend/src/components/dashboard/cards/*`  
  - `frontend/src/components/dashboard/sections/*`  
  - `frontend/src/services/` (dashboard helper)  
  - `backend/controllers/dashboardController.js` (if response shape needs UI fields)

### H07 — Recruiter applications inbox + status updates
- **Difficulty:** L  
- **Time:** 2.5d  
- **Why:** Recruiters must review and move candidates through pipeline statuses.  
- **Affected files:**  
  - application routes/services (from H05)  
  - `frontend/src/RecruiterDashboard.jsx`  
  - new applications components  
  - `frontend/src/config/navigation.js`

### H08 — Honor recruiter `permissions` on APIs
- **Difficulty:** M  
- **Time:** 1.5d  
- **Why:** Permissions stored on invite/recruiter but not enforced beyond role.  
- **Affected files:**  
  - `backend/middleware/auth.js` (extend)  
  - `backend/routes/jobRoutes.js`  
  - `backend/routes/teamRoutes.js`  
  - application/interview routes  
  - `backend/models/Recruiter.js`

### H09 — Align sidebar navigation with real pages
- **Difficulty:** M  
- **Time:** 1d  
- **Why:** Nav lists profile/applications/assessments/etc. that do not render.  
- **Affected files:**  
  - `frontend/src/config/navigation.js`  
  - `frontend/src/CandidateDashboard.jsx`  
  - `frontend/src/CompanyDashboard.jsx`  
  - `frontend/src/components/layout/Sidebar.jsx`  
  - `frontend/src/components/layout/BottomNav.jsx`

### H10 — Clarify company registration route/branding
- **Difficulty:** S  
- **Time:** 0.5d  
- **Why:** `/recruiter/signup` registers companies — confusing for users and docs.  
- **Affected files:**  
  - `frontend/src/App.jsx`  
  - `frontend/src/RecruiterSignup.jsx` (rename/move)  
  - `frontend/src/Home.jsx` / portal links  
  - `frontend/src/components/home/PortalSection.jsx`

---

## Medium

### M01 — Interview scheduling CRUD + UI
- **Difficulty:** L  
- **Time:** 3d  
- **Why:** `Interview` model exists; no create/list/update APIs or calendar UI.  
- **Affected files:**  
  - new `backend/routes/interviewRoutes.js` + controller/service  
  - `backend/models/Interview.js`  
  - `backend/server.js`  
  - frontend interview list/schedule components  
  - `frontend/src/services/interviewService.js`

### M02 — AI interview session in active frontend + persistence
- **Difficulty:** L  
- **Time:** 4d  
- **Why:** `/ask` + `/evaluate` are demos; need multi-turn UI and stored scores/feedback.  
- **Affected files:**  
  - `backend/server.js` (or dedicated interview AI routes)  
  - `backend/groq.js`  
  - possibly new `InterviewSession` fields/model or extend `Interview`  
  - new `frontend/src/` interview page  
  - `frontend/src/App.jsx`  
  - reference: `frontend_backup/src/InterviewPage.jsx`

### M03 — Harden resume parse (safe JSON from LLM)
- **Difficulty:** M  
- **Time:** 1d  
- **Why:** Raw `JSON.parse` on Groq output is brittle.  
- **Affected files:**  
  - `backend/routes/candidateRoutes.js`  
  - new `backend/utils/parseLlmJson.js` (or services)

### M04 — Workflow builder UI + correct Job link
- **Difficulty:** L  
- **Time:** 3d  
- **Why:** Workflow API exists; builder only in backup; `workflowId` ref wrong until C08.  
- **Affected files:**  
  - `frontend` workflow components (port from `frontend_backup/src/components/recruiter/workflow/*`)  
  - `backend/routes/workflowRoutes.js`  
  - `backend/models/HiringWorkflow.js`  
  - `backend/models/Job.js`  
  - job create UI (H02)

### M05 — Write Activity events on key actions
- **Difficulty:** M  
- **Time:** 1.5d  
- **Why:** Dashboard reads `Activity` but nothing consistently writes it.  
- **Affected files:**  
  - application/interview/candidate/resume routes or services  
  - `backend/models/Activity.js`  
  - `backend/controllers/dashboardController.js`

### M06 — Real company & recruiter dashboard metrics
- **Difficulty:** M  
- **Time:** 2d  
- **Why:** Recruiter stats hardcoded; company home placeholder.  
- **Affected files:**  
  - `frontend/src/RecruiterDashboard.jsx`  
  - `frontend/src/CompanyDashboard.jsx`  
  - new/extend dashboard routes/controllers  
  - `backend/models/Job.js`, `Application.js`, `Interview.js`

### M07 — Extract Routes → Controllers → Services
- **Difficulty:** L  
- **Time:** 3d  
- **Why:** Project architecture rule; fat routes hinder testing and reuse.  
- **Affected files:**  
  - most `backend/routes/*.js`  
  - new `backend/controllers/*`  
  - new `backend/services/*`  
  - `backend/utils/emailService.js` (keep or fold)

### M08 — Rate limiting, Helmet, CORS allowlist, validation
- **Difficulty:** M  
- **Time:** 2d  
- **Why:** Production hardening for auth/AI/upload abuse.  
- **Affected files:**  
  - `backend/server.js`  
  - new middleware validators  
  - `backend/package.json`

### M09 — Automated tests for critical paths
- **Difficulty:** L  
- **Time:** 3d  
- **Why:** Backend test script is a stub; need auth, invite, apply, interview smoke tests.  
- **Affected files:**  
  - `backend/package.json` scripts  
  - new `backend/tests/**` or `backend/__tests__/**`  
  - optionally frontend component/e2e tests  
  - CI config later (L07)

### M10 — Password reset / account recovery
- **Difficulty:** M  
- **Time:** 2d  
- **Why:** Production accounts need recovery without DB edits.  
- **Affected files:**  
  - new auth routes + email templates in `emailService.js`  
  - `frontend` forgot/reset pages  
  - `frontend/src/App.jsx`  
  - Candidate/Recruiter/Company models (reset token fields) or OTP reuse

---

## Low

### L01 — Email/phone OTP verification
- **Difficulty:** M  
- **Time:** 2d  
- **Why:** `emailVerified` / `phoneVerified` and OTP model unused; UI stubs exist.  
- **Affected files:**  
  - `backend/models/OTP.js`  
  - `backend/utils/generateOTP.js`  
  - candidate/company routes  
  - `frontend/src/components/recruiter/RecruiterOtpForm.jsx`  
  - `emailService.js`

### L02 — Coding assessment engine
- **Difficulty:** XL  
- **Time:** 10–15d  
- **Why:** Only enum placeholders (`Coding`, `Assessment`); needs problems, runner, UI.  
- **Affected files:**  
  - new models (Problem, Submission)  
  - new backend services + sandbox/judge integration  
  - new frontend editor UI  
  - workflow round config  
  - `backend/models/Interview.js`, `Application.js`

### L03 — Reports / analytics module
- **Difficulty:** L  
- **Time:** 3d  
- **Affected files:** company/recruiter report pages, aggregation APIs, chart components

### L04 — Real-time notifications
- **Difficulty:** L  
- **Time:** 3d  
- **Affected files:** notification model/API, WebSocket or polling, navbar bell UI, `navigation.js`

### L05 — Email queue with retries
- **Difficulty:** M  
- **Time:** 2d  
- **Affected files:** `emailService.js`, `mail.js`, optional queue worker, `teamRoutes.js` invite path

### L06 — Cloud object storage for resumes
- **Difficulty:** M  
- **Time:** 2d  
- **Affected files:** upload route, `Candidate.resumeUrl`, static `/uploads` serving, env vars

### L07 — CI/CD pipeline
- **Difficulty:** M  
- **Time:** 1.5d  
- **Affected files:** `.github/workflows/*` (or equivalent), test scripts, deploy config

### L08 — Archive or exclude `frontend_backup` from deploy
- **Difficulty:** S  
- **Time:** 0.5d  
- **Affected files:** `frontend_backup/**`, `.gitignore` / deploy docs, README note

### L09 — Accessibility & performance pass
- **Difficulty:** M  
- **Time:** 2d  
- **Affected files:** shared layout/forms, landing, dashboards, image/font loading

### L10 — Admin audit logs
- **Difficulty:** M  
- **Time:** 2d  
- **Affected files:** new Audit model, middleware, team/job/application mutations

### L11 — Remove unused dependencies and dead UI
- **Difficulty:** S  
- **Time:** 0.5d  
- **Affected files:** `backend/package.json`, unused recruiter signup/OTP components if superseded, dead imports

---

## Definition of done — Production MVP

Check off when all **Critical** and **High** items are complete:

- [ ] No unauthenticated PII list/debug endpoints  
- [ ] All mutating APIs require valid JWT + role (and permissions where applicable)  
- [ ] Config via environment variables only  
- [ ] Company → invite recruiter → create job → candidate apply → status update works in **active** `frontend/`  
- [ ] Candidate profile + resume upload/parse usable in active UI  
- [ ] Dashboards show real data for the logged-in user  
- [ ] Navigation only links to implemented pages  
- [ ] Smoke tests cover auth + invite + apply  

**Production quality** additionally requires Medium items M01–M09 (AI interview path, hardening, tests) before calling the system production-ready beyond MVP.

---

## Suggested sprint slicing

| Sprint | Focus | IDs | ~Days |
|-------:|-------|-----|------:|
| 1 | Secure foundation | C01–C08 | 7.25 |
| 2 | Jobs API + UI | H01–H02, H10 | 5.5 |
| 3 | Candidate profile + resume + board/apply | H03–H05 | 6.5 |
| 4 | Dashboards + recruiter inbox + nav/permissions | H06–H09 | 6.5 |
| 5 | Interviews + AI session | M01–M03 | 8 |
| 6 | Workflows + activity + metrics | M04–M06 | 6.5 |
| 7 | Hardening + tests + reset | M07–M10 | 10 |
| 8+ | Low backlog as needed | L01–L11 | varies |

---

*Generated from architecture inspection. Do not treat estimates as commitments; re-estimate after Sprint 1 once auth middleware lands.*
