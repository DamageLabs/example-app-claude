# CellarSync

A self-hosted wine collection inventory management system for individual collectors and small groups.

Track what you own, where it's stored, when to drink it, and what you thought of it.

## Project Planning Workflow

This project follows a three-step planning workflow that turns a product idea into a structured, trackable development plan.

### Step 1: Write the PRD

Create a comprehensive Product Requirements Document that defines the full scope of the project.

```
docs/PRD.md
```

The PRD covers:

- Problem statement and solution overview
- User personas and stories
- Functional requirements (data models, features, API design)
- Non-functional requirements (performance, accessibility, security)
- Technical architecture and stack decisions
- Testing strategy and coverage targets
- Infrastructure and deployment plan
- Milestones broken into delivery phases

**Output:** A single document that serves as the source of truth for what gets built.

### Step 2: Generate GitHub Issues from the PRD

Break the PRD down into actionable, well-scoped GitHub issues organized by milestone.

Each issue includes:

- Detailed requirements extracted from the relevant PRD sections
- Acceptance criteria as a checklist
- Labels for area (`area:backend`, `area:frontend`, `area:database`, etc.) and type (`type:feature`, `type:setup`)
- Milestone assignment matching the PRD phases

Issues are grouped into milestones:
| Milestone | Scope |
|-----------|-------|
| **Phase 1: Foundation** | Monorepo, database, auth, SPA shell, CI pipeline |
| **Phase 2: Core Inventory** | Wine/bottle CRUD, storage locations, search |
| **Phase 3: Tasting & Analytics** | Tasting notes, dashboard, alerts, export |
| **Phase 4: Polish & Deploy** | E2E tests, GCP deployment, security, docs |

**Output:** A backlog of trackable issues linked to milestones in GitHub.

### Step 3: Generate the Roadmap from GitHub Issues

Synthesize all open issues into a comprehensive development roadmap.

```
docs/ROADMAP.md
```

The roadmap includes:

- Visual overview of all phases
- Issue dependency graph showing execution order
- Week-by-week focus areas with parallel backend/frontend tracks
- Exit criteria for each phase
- Progress tracking tables (by milestone, area, type, priority)
- Critical path analysis
- Risk summary linked to mitigating issues

**Output:** A living document that maps the full development timeline and tracks progress.

### Workflow Diagram

```
   PRD                    GitHub Issues              Roadmap
┌──────────┐           ┌────────────────┐        ┌────────────────┐
│ Problem   │           │ #59 Monorepo   │        │ Phase 1        │
│ Users     │  ──────►  │ #60 Schemas    │  ────► │  Dependencies  │
│ Features  │  Extract  │ #61 API Server │  Build │  Week Plan     │
│ API       │  & scope  │ #62 Database   │  from  │  Exit Criteria │
│ Arch      │  issues   │ ...            │  open  │                │
│ Testing   │           │ #91 Docs       │  state │ Phase 2 ...    │
│ Infra     │           │                │        │                │
│ Phases    │           │ 33 issues      │        │ Progress       │
│           │           │ 4 milestones   │        │ Critical Path  │
└──────────┘           └────────────────┘        └────────────────┘
```

## Tech Stack

| Layer          | Technology                                                               |
| -------------- | ------------------------------------------------------------------------ |
| Frontend       | React 19, Vite, React Router v7, TanStack Query, Tailwind CSS, shadcn/ui |
| Backend        | Node.js, Fastify, better-sqlite3, Drizzle ORM, Zod                       |
| Database       | SQLite (WAL mode), FTS5 full-text search                                 |
| Testing        | Vitest, React Testing Library, Supertest, Playwright                     |
| CI/CD          | GitHub Actions                                                           |
| Infrastructure | GCP VM, Nginx, PM2, Let's Encrypt                                        |

## Project Status

See the [Roadmap](docs/ROADMAP.md) for current progress.

## Documentation

| Document                   | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| [PRD](docs/PRD.md)         | Product requirements, architecture, and API design        |
| [Roadmap](docs/ROADMAP.md) | Development timeline, dependencies, and progress tracking |

## License

[Apache 2.0](LICENSE)
