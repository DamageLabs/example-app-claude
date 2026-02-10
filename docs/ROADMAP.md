# CellarSync Development Roadmap

> Auto-generated from open GitHub issues on 2026-02-10
> **33 issues** across **4 milestones** | **0% complete**

---

## Overview

```
Phase 1         Phase 2          Phase 3            Phase 4
Foundation      Core Inventory   Tasting & Analytics Polish & Deploy
Weeks 1-2       Weeks 3-4        Weeks 5-6           Weeks 7-8
[9 issues]      [8 issues]       [7 issues]          [9 issues]
───────────── ──────────────── ────────────────── ──────────────────
 Monorepo        Wine CRUD        Tasting Notes       E2E Tests
 Database        Bottle CRUD      Dashboard           GCP / Nginx
 Auth (JWT)      Storage Mgmt     Drink Alerts        CI/CD Deploy
 React SPA       FTS5 Search      Data Export         Backups
 CI Pipeline     Filter UI        Phase 3 Tests       Security
 Seed Data       Phase 2 Tests                        Accessibility
                                                      User Mgmt
                                                      Documentation
```

---

## Issue Dependency Graph

The following shows the recommended execution order within each phase.
Issues on the same line can be worked on in parallel.

```
PHASE 1: FOUNDATION
────────────────────────────────────────────────────────────────────
#59 Monorepo scaffolding
 ├──► #60 Shared package (Zod schemas, types, constants)
 ├──► #61 Fastify API server
 │     └──► #62 SQLite + Drizzle ORM
 │           └──► #63 JWT Authentication (backend)
 └──► #64 React SPA (Vite, Tailwind, shadcn/ui)
       └──► #65 Login page + frontend auth flow  ◄── #63
             └──► #67 Local dev workflow + seed data  ◄── #62
 #66 GitHub Actions CI pipeline  ◄── #59

PHASE 2: CORE INVENTORY
────────────────────────────────────────────────────────────────────
#68 Wine CRUD API ──────────────► #69 Wine catalog frontend
#70 Bottle CRUD API ────────────► #71 Bottle management frontend
#72 Storage Location management (API + frontend)
#73 Full-text search API (FTS5) ► #74 Search and filter UI
                                  #75 Unit + functional tests

PHASE 3: TASTING & ANALYTICS
────────────────────────────────────────────────────────────────────
#76 Tasting Notes API ──────────► #77 Tasting Notes frontend
#78 Dashboard statistics API ───► #79 Dashboard frontend (charts)
#80 Drink window alerts (API + frontend)
#81 Data export (CSV + JSON)
                                  #82 Unit + functional tests

PHASE 4: POLISH & DEPLOY
────────────────────────────────────────────────────────────────────
#83 User Management API ────────► #84 Admin user management UI
#86 GCP VM + Nginx ─────────────► #87 Deployment pipeline (CI/CD)
#88 Automated backup system
#89 Security hardening
#85 E2E tests (Playwright)
#90 Responsive design + accessibility QA
#91 Setup guide + API documentation
```

---

## Phase 1: Foundation — Weeks 1-2

> **Goal:** A developer can clone the repo, run `npm install && npm run dev`,
> log in, and hit the health endpoint.

| #                      | Issue                                                        | Area                           | Priority | Depends On    |
| ---------------------- | ------------------------------------------------------------ | ------------------------------ | -------- | ------------- |
| [#59](../../issues/59) | Set up monorepo scaffolding with npm workspaces              | `type:setup`                   | **High** | —             |
| [#60](../../issues/60) | Set up shared package with Zod schemas, types, and constants | `area:backend` `area:frontend` | Medium   | #59           |
| [#61](../../issues/61) | Set up Fastify API server with TypeScript                    | `area:backend`                 | **High** | #59           |
| [#62](../../issues/62) | Set up SQLite database with Drizzle ORM                      | `area:database`                | **High** | #61           |
| [#63](../../issues/63) | Implement user authentication system (JWT)                   | `area:backend` `area:security` | **High** | #62, #60      |
| [#64](../../issues/64) | Set up React SPA with Vite, Tailwind, and shadcn/ui          | `area:frontend`                | **High** | #59           |
| [#65](../../issues/65) | Implement login page and frontend auth flow                  | `area:frontend`                | **High** | #64, #63      |
| [#66](../../issues/66) | Set up GitHub Actions CI pipeline                            | `area:infra`                   | **High** | #59           |
| [#67](../../issues/67) | Set up local development workflow with seed data             | `type:setup`                   | **High** | #62, #64, #65 |

### Week 1 Focus

Start with the foundation layer — these must be done first and sequentially:

1. **#59** — Monorepo scaffolding (everything depends on this)
2. **#61** + **#64** — API server and React SPA (parallel tracks)
3. **#60** — Shared package (needed before auth and forms)
4. **#62** — Database schema and ORM

### Week 2 Focus

Build on the foundation with auth and dev tooling: 5. **#63** — Backend JWT authentication 6. **#65** — Frontend login and auth flow 7. **#66** — CI pipeline 8. **#67** — Dev workflow, seed data, and integration

### Exit Criteria

- [ ] `npm install && npm run dev` starts both servers
- [ ] Login with seeded credentials works
- [ ] `GET /api/health` returns 200
- [ ] CI pipeline passes on push to main

---

## Phase 2: Core Inventory — Weeks 3-4

> **Goal:** A user can log in, add wines and bottles, assign storage locations,
> search the collection, and mark bottles as consumed.

| #                      | Issue                                                  | Area                           | Priority | Depends On |
| ---------------------- | ------------------------------------------------------ | ------------------------------ | -------- | ---------- |
| [#68](../../issues/68) | Implement Wine CRUD API endpoints                      | `area:backend`                 | **High** | Phase 1    |
| [#69](../../issues/69) | Implement Wine catalog frontend pages                  | `area:frontend`                | **High** | #68        |
| [#70](../../issues/70) | Implement Bottle CRUD API endpoints                    | `area:backend`                 | **High** | #68        |
| [#71](../../issues/71) | Implement Bottle management frontend                   | `area:frontend`                | **High** | #70        |
| [#72](../../issues/72) | Implement Storage Location management (API + frontend) | `area:backend` `area:frontend` | Medium   | Phase 1    |
| [#73](../../issues/73) | Implement full-text search API with FTS5               | `area:backend` `area:database` | Medium   | #68        |
| [#74](../../issues/74) | Implement search and filter UI                         | `area:frontend`                | Medium   | #73, #69   |
| [#75](../../issues/75) | Write unit and functional tests for core inventory     | `area:testing`                 | Medium   | #68-#74    |

### Week 3 Focus — CRUD APIs + Primary UI

Two parallel tracks: **API-first** and **frontend follows**.

| Backend Track       | Frontend Track                     |
| ------------------- | ---------------------------------- |
| #68 Wine CRUD API   | #69 Wine catalog pages (after #68) |
| #70 Bottle CRUD API | #72 Storage locations (parallel)   |

### Week 4 Focus — Bottles UI, Search, Tests

| Backend Track                             | Frontend Track           |
| ----------------------------------------- | ------------------------ |
| #73 FTS5 search API                       | #71 Bottle management UI |
|                                           | #74 Search and filter UI |
| #75 Unit + functional tests (both tracks) |

### Exit Criteria

- [ ] Full wine CRUD works end-to-end (API + UI)
- [ ] Bottles can be added, consumed, and tracked
- [ ] Storage locations can be created and assigned
- [ ] Search returns results in < 300ms
- [ ] Filter by color, region, vintage, and drink window works
- [ ] Test coverage >= 80% for new code

---

## Phase 3: Tasting & Analytics — Weeks 5-6

> **Goal:** A user can record tasting notes, view collection analytics,
> receive drink window alerts, and export their data.

| #                      | Issue                                                | Area                           | Priority | Depends On |
| ---------------------- | ---------------------------------------------------- | ------------------------------ | -------- | ---------- |
| [#76](../../issues/76) | Implement Tasting Notes API                          | `area:backend`                 | Medium   | Phase 2    |
| [#77](../../issues/77) | Implement Tasting Notes frontend                     | `area:frontend`                | Medium   | #76        |
| [#78](../../issues/78) | Implement Dashboard statistics API                   | `area:backend`                 | Medium   | Phase 2    |
| [#79](../../issues/79) | Implement Dashboard frontend with charts             | `area:frontend`                | Medium   | #78        |
| [#80](../../issues/80) | Implement drink window alerts system                 | `area:backend` `area:frontend` | Medium   | #78        |
| [#81](../../issues/81) | Implement data export (CSV + JSON)                   | `area:backend`                 | Medium   | Phase 2    |
| [#82](../../issues/82) | Write unit and functional tests for Phase 3 features | `area:testing`                 | Medium   | #76-#81    |

### Week 5 Focus — APIs + Tasting UI

Three parallel API tracks, then frontend follows:

| Backend Track           | Frontend Track                   |
| ----------------------- | -------------------------------- |
| #76 Tasting Notes API   | #77 Tasting Notes UI (after #76) |
| #78 Dashboard stats API |                                  |
| #81 Data export API     |                                  |

### Week 6 Focus — Dashboard, Alerts, Tests

| Backend Track                             | Frontend Track                   |
| ----------------------------------------- | -------------------------------- |
| #80 Drink window alerts                   | #79 Dashboard charts (after #78) |
|                                           | #80 Alert UI (continued)         |
| #82 Unit + functional tests (both tracks) |

### Exit Criteria

- [ ] Tasting notes with structured fields (appearance, nose, palate, finish)
- [ ] Dashboard shows total bottles, value, breakdowns, consumption trends
- [ ] Recharts visualizations render: pie, bar, and line charts
- [ ] Drink window alerts surface wines that are ready or past peak
- [ ] CSV and JSON export download correctly (admin only)
- [ ] Test coverage >= 80% for new code

---

## Phase 4: Polish & Deploy — Weeks 7-8

> **Goal:** Application is running in production on GCP, all tests pass,
> backups are verified, and a non-technical user can start cataloging wines.

| #                      | Issue                                                       | Area                           | Priority | Depends On    |
| ---------------------- | ----------------------------------------------------------- | ------------------------------ | -------- | ------------- |
| [#83](../../issues/83) | Implement User Management API (admin only)                  | `area:backend` `area:security` | Medium   | Phase 1 (#63) |
| [#84](../../issues/84) | Implement Admin user management UI                          | `area:frontend`                | Medium   | #83           |
| [#85](../../issues/85) | Write E2E tests with Playwright                             | `area:testing`                 | Medium   | Phases 1-3    |
| [#86](../../issues/86) | Set up GCP VM provisioning and Nginx configuration          | `area:infra`                   | Medium   | —             |
| [#87](../../issues/87) | Set up production deployment pipeline (GitHub Actions)      | `area:infra`                   | Medium   | #86, #66      |
| [#88](../../issues/88) | Implement automated backup system (SQLite to GCS)           | `area:infra` `area:database`   | Medium   | #86           |
| [#89](../../issues/89) | Implement security hardening (rate limiting, headers, CORS) | `area:security`                | **High** | Phase 1 (#61) |
| [#90](../../issues/90) | Responsive design and accessibility QA                      | `area:frontend`                | Medium   | Phases 1-3    |
| [#91](../../issues/91) | Write setup guide and API documentation                     | `documentation`                | Medium   | All phases    |

### Week 7 Focus — Infrastructure + User Mgmt + Security

Multiple parallel workstreams:

| Infra Track         | Feature Track     | Quality Track          |
| ------------------- | ----------------- | ---------------------- |
| #86 GCP VM + Nginx  | #83 User Mgmt API | #89 Security hardening |
| #87 Deploy pipeline | #84 Admin UI      | #85 E2E tests (start)  |

### Week 8 Focus — Polish, Tests, Docs

| Infra Track           | Quality Track            | Docs Track        |
| --------------------- | ------------------------ | ----------------- |
| #88 Automated backups | #85 E2E tests (finish)   | #91 Documentation |
|                       | #90 Responsive + a11y QA |                   |

### Exit Criteria

- [ ] Application live on GCP VM with HTTPS
- [ ] CI/CD pipeline: push to main auto-deploys
- [ ] Daily automated backups running and verified
- [ ] All 15 Playwright E2E tests pass
- [ ] Rate limiting and security headers active
- [ ] WCAG 2.1 AA compliance verified
- [ ] Admin can create/manage user accounts from the UI
- [ ] Setup guide and API reference docs published

---

## Progress Tracking

### By Milestone

| Milestone                    | Total  | Done  | Remaining | Progress                        |
| ---------------------------- | ------ | ----- | --------- | ------------------------------- |
| Phase 1: Foundation          | 9      | 0     | 9         | ![](https://progress-bar.xyz/0) |
| Phase 2: Core Inventory      | 8      | 0     | 8         | ![](https://progress-bar.xyz/0) |
| Phase 3: Tasting & Analytics | 7      | 0     | 7         | ![](https://progress-bar.xyz/0) |
| Phase 4: Polish & Deploy     | 9      | 0     | 9         | ![](https://progress-bar.xyz/0) |
| **Total**                    | **33** | **0** | **33**    | ![](https://progress-bar.xyz/0) |

### By Area

| Area           | Issues | Key Numbers                                                     |
| -------------- | ------ | --------------------------------------------------------------- |
| Backend        | 14     | #61, #62, #63, #68, #70, #72, #73, #76, #78, #80, #81, #83, #89 |
| Frontend       | 13     | #64, #65, #69, #71, #72, #74, #77, #79, #80, #84, #90           |
| Database       | 4      | #62, #73, #88                                                   |
| Infrastructure | 5      | #66, #86, #87, #88                                              |
| Security       | 4      | #63, #83, #89                                                   |
| Testing        | 4      | #75, #82, #85                                                   |
| Documentation  | 1      | #91                                                             |

### By Type

| Type          | Count | Issues                                       |
| ------------- | ----- | -------------------------------------------- |
| Setup         | 9     | #59, #60, #61, #62, #64, #66, #67, #86, #87  |
| Feature       | 19    | #63, #65, #68-74, #76-81, #83, #84, #88, #89 |
| Testing       | 3     | #75, #82, #85                                |
| Enhancement   | 1     | #90                                          |
| Documentation | 1     | #91                                          |

### Priority Distribution

| Priority | Count | Issues                        |
| -------- | ----- | ----------------------------- |
| **High** | 16    | #59, #61-66, #67-71, #89      |
| Medium   | 14    | #60, #72-78, #79-88, #90, #91 |

---

## Critical Path

The longest chain of dependent issues that determines the minimum project timeline:

```
#59 Monorepo ─► #61 Fastify ─► #62 SQLite ─► #63 Auth ─► #68 Wine API ─► #70 Bottle API
                                                                              │
         #64 React SPA ─► #65 Login UI ◄──────────────────┘                   │
                                                                              ▼
         #73 FTS5 Search ─► #74 Filter UI          #76 Tasting API ─► #78 Dashboard API
                                                         │                    │
                                                         ▼                    ▼
                                                   #77 Tasting UI      #79 Dashboard UI
                                                                              │
                                                                              ▼
                                                   #85 E2E Tests ◄──── #80 Drink Alerts
                                                         │
                                                         ▼
                                              #86 GCP VM ─► #87 Deploy Pipeline
                                                                    │
                                                                    ▼
                                                            Production Launch
```

**Estimated critical path duration:** ~8 weeks (as designed in the PRD)

---

## Risk Summary

| Risk                       | Impact                       | Mitigation              | Related Issues |
| -------------------------- | ---------------------------- | ----------------------- | -------------- |
| SQLite write contention    | Writes queue/fail under load | WAL mode + busy_timeout | #62            |
| Data loss                  | Collection lost              | Daily backups to GCS    | #88            |
| Single VM failure          | App offline                  | PM2 auto-restart        | #86            |
| JWT secret compromise      | Unauthorized access          | Env vars, rotation      | #63, #89       |
| Dependency vulnerabilities | Security exploit             | npm audit in CI         | #66, #89       |

---

## Tech Stack Reference

| Layer          | Technology                                                                         |
| -------------- | ---------------------------------------------------------------------------------- |
| Frontend       | React 19, Vite, React Router v7, TanStack Query, Tailwind CSS, shadcn/ui, Recharts |
| Backend        | Node.js, Fastify, better-sqlite3, Drizzle ORM, Zod, @fastify/jwt                   |
| Database       | SQLite (WAL mode), FTS5                                                            |
| Testing        | Vitest, React Testing Library, Supertest, Playwright                               |
| CI/CD          | GitHub Actions                                                                     |
| Infrastructure | GCP e2-small VM, Nginx, PM2, Let's Encrypt, GCS (backups)                          |
| Language       | TypeScript (strict mode, end-to-end)                                               |

---

_This roadmap is derived from the [PRD](./PRD.md) and reflects all open GitHub issues.
Update this document as issues are completed or scope changes._
