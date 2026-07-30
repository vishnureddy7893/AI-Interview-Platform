# Codebase map — AI Interview Platform

## Layout

```
AI-Interview-Platform/
├── backend/                 # Express API (port 5000)
│   ├── server.js            # App entry, mounts routes, /ask + /evaluate
│   ├── groq.js              # Groq client → askGroq(prompt)
│   ├── config/db.js         # MongoDB connect
│   ├── config/mail.js       # Nodemailer transporter
│   ├── controllers/         # dashboardController, jobController
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── utils/               # emailService, generateOTP
│   └── uploads/             # Multer resume files
└── frontend/                # Vite React app
    └── src/
        ├── App.jsx          # Routes
        ├── config/api.js    # Axios + Bearer from localStorage.auth
        ├── config/navigation.js
        ├── services/        # candidate, company, recruiter, team
        ├── components/      # ui, auth, layout, dashboards, forms
        └── *Dashboard.jsx / *Login.jsx / *Signup.jsx
```

Ignore `frontend_backup/` unless the user explicitly asks about it.

## Auth

| Role | Login path | Dashboard | Guard |
|------|------------|-----------|--------|
| `Candidate` | `/candidate/login` | `/candidate/dashboard` | `ProtectedRoute` |
| `Recruiter` | `/recruiter/login` | `/recruiter/dashboard` | `ProtectedRoute` |
| `CompanyAdmin` | `/company/login` | `/company/dashboard` | `ProtectedRoute` |

- Token + role stored as JSON in `localStorage` key `auth`.
- Axios attaches `Authorization: Bearer <token>` in `config/api.js`.
- Team invite accept: `/team/accept-invitation`.

## Backend API mounts (`server.js`)

| Mount | Router file | Domain |
|-------|-------------|--------|
| `/candidate` | `routes/candidateRoutes.js` | Register/login, profile, resume upload/parse, skills via Groq |
| `/recruiter` | `routes/recruiterRoutes.js` | Login, jobs list/create |
| `/company` | `routes/companyRoutes.js` | Register/login, profile |
| `/team` | `routes/teamRoutes.js` | Invite recruiters, invitations, accept flow |
| `/job` | `routes/jobRoutes.js` | Jobs |
| `/workflow` | `routes/workflowRoutes.js` | Hiring workflows / rounds |
| `/dashboard` | `routes/dashboardRoutes.js` | Dashboard aggregates |
| `POST /ask` | `server.js` | Generate interview question (Groq) |
| `POST /evaluate` | `server.js` | Score candidate answer (Groq) |

## Models (`backend/models/`)

| Model | Purpose |
|-------|---------|
| `Candidate` | Candidate accounts + profile fields |
| `Recruiter` | Recruiter accounts |
| `Company` | Company / admin |
| `Invitation` | Recruiter invite tokens |
| `Job` | Job postings + interview counters |
| `HiringWorkflow` | Multi-round hiring workflows |
| `Application` | Applications |
| `Interview` | Interview records |
| `Activity` | Activity feed events |
| `OTP` | OTP verification |
| — | `utils/generateOTP.js` for OTP generation |

## Frontend services

| File | Use for |
|------|---------|
| `services/candidateService.js` | Candidate API |
| `services/companyService.js` | Company API |
| `services/recruiterService.js` | Recruiter API |
| `services/teamService.js` | Team invites / members |

## Feature → start here

| Feature | Backend | Frontend |
|---------|---------|----------|
| Authentication | `*Routes` login/register + JWT | `ProtectedRoute`, login/signup pages, forms under `components/*` |
| Candidate module | `candidateRoutes.js`, `Candidate.js` | `Candidate*`, `components/candidate/` |
| Company module | `companyRoutes.js`, `Company.js` | `Company*`, `components/company/TeamManagement.jsx` |
| Recruiter module | `recruiterRoutes.js`, `teamRoutes.js` | `Recruiter*`, `RecruiterAcceptInvitation.jsx` |
| Interview flow | `server.js` `/ask` `/evaluate`, `Interview.js` | Dashboard cards / interview UI |
| Resume upload | Multer + `pdf-parse` in `candidateRoutes.js` | Candidate profile/upload flows |
| Email | `config/mail.js`, `utils/emailService.js` | Team invite UI triggers API |
| Groq AI | `groq.js`, `/ask`, `/evaluate`, resume skill parse | Any UI calling those endpoints |
| Hiring workflow | `workflowRoutes.js`, `HiringWorkflow.js` | Recruiter workflow UI (see backup for older WorkflowBuilder if needed) |

## Style notes

- Backend: async route handlers, `try/catch`, `console.error`, JSON responses.
- Frontend: functional components, Tailwind classes, toast libraries already in deps (`react-hot-toast` / `sonner`).
- Prefer extending an existing service method over adding a one-off `api.post` in a page.
