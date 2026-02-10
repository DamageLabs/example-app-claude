# Product Requirements Document: CellarSync

## Wine Collection Inventory Management System

**Version:** 1.0
**Date:** 2026-02-09
**Status:** Draft

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas & Stories](#3-user-personas--stories)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [Infrastructure & Deployment](#7-infrastructure--deployment)
8. [Development Workflow](#8-development-workflow)
9. [Testing Strategy](#9-testing-strategy)
10. [API Design](#10-api-design)
11. [Security Considerations](#11-security-considerations)
12. [Risks & Mitigations](#12-risks--mitigations)
13. [Milestones & Phases](#13-milestones--phases)
14. [Open Questions & Assumptions](#14-open-questions--assumptions)

---

## 1. Overview & Purpose

### Problem Statement

Wine collectors — whether managing a personal cellar of 50 bottles or a shared collection of several thousand — lack a lightweight, self-hosted tool for tracking what they own, where it's stored, when to drink it, and what they thought of it. Existing solutions are either expensive SaaS platforms with unnecessary social features, mobile-only apps without proper data export, or spreadsheets that quickly become unmaintainable.

### Solution

**CellarSync** is a web-based wine collection inventory management system designed for individual collectors and small groups (e.g., a household, wine club, or small restaurant). It provides:

- A searchable, filterable inventory of all bottles in a collection
- Storage location tracking (cellar, rack, shelf, bin position)
- Drink window and aging recommendations
- Tasting notes and personal ratings
- Purchase and valuation history
- Consumption tracking and statistics

The application is intentionally simple, self-hosted, and optimized for a small number of concurrent users — making SQLite a natural fit as the data store.

---

## 2. Goals & Success Metrics

### Primary Goals

| Goal   | Description                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| **G1** | Provide a complete digital inventory of a wine collection accessible from any device                                |
| **G2** | Enable fast lookup — find any bottle by producer, region, vintage, varietal, or storage location in under 2 seconds |
| **G3** | Track the full lifecycle of a bottle: acquisition, storage, consumption, and review                                 |
| **G4** | Support a small group of users with distinct accounts sharing a single collection                                   |

### Success Metrics

| Metric               | Target                                                               | Measurement         |
| -------------------- | -------------------------------------------------------------------- | ------------------- |
| Inventory accuracy   | 100% of physical bottles represented digitally                       | Manual audit        |
| Search latency (p95) | < 500ms for filtered queries across 10,000 bottles                   | Application logs    |
| Data durability      | Zero data loss events                                                | Backup verification |
| Test coverage        | >= 80% line coverage across all test suites                          | CI reports          |
| Uptime               | 99% monthly (allows ~7h downtime/month, acceptable for personal use) | GCP monitoring      |

---

## 3. User Personas & Stories

### Personas

**Collector (Primary)**
A wine enthusiast with 100–5,000 bottles. Wants to know what they have, where it is, and when to drink it. Accesses the app from a laptop at home or a phone in the cellar.

**Household Member (Secondary)**
A partner or family member who occasionally checks the collection to pick a bottle for dinner or to avoid buying duplicates. Needs read access and basic search, may log consumption.

**Admin (Technical)**
The person who hosts the application, manages backups, and creates user accounts. Likely the same person as the primary collector.

### User Stories

#### Inventory Management

- **US-1:** As a collector, I want to add a new bottle to my inventory so that my collection is digitally tracked.
- **US-2:** As a collector, I want to scan or search for a wine by name, producer, or barcode so I can quickly add bottles without typing everything manually.
- **US-3:** As a collector, I want to assign a storage location (cellar, rack, row, column) to each bottle so I can physically find it.
- **US-4:** As a collector, I want to record the purchase price and date so I can track my collection's value over time.
- **US-5:** As a collector, I want to mark a bottle as consumed, recording the date, occasion, and optionally a tasting note.

#### Search & Browse

- **US-6:** As a collector, I want to filter my inventory by region, varietal, vintage, producer, color (red/white/rosé/sparkling/dessert), or drink window so I can decide what to open.
- **US-7:** As a household member, I want to search for "something red from Burgundy under $50" so I can pick a bottle for dinner.
- **US-8:** As a collector, I want to see bottles approaching their optimal drink window so I don't miss peak readiness.

#### Tasting Notes & Ratings

- **US-9:** As a collector, I want to add tasting notes (appearance, nose, palate, finish) and a personal rating (1–100 or 5-star) to any bottle I've consumed.
- **US-10:** As a collector, I want to view my tasting history to remember what I liked.

#### Collection Analytics

- **US-11:** As a collector, I want to see a dashboard summarizing my collection: total bottles, total value, breakdown by region/varietal/vintage, and consumption rate.
- **US-12:** As a collector, I want to see my consumption history over time (bottles per month, average rating).

#### Administration

- **US-13:** As an admin, I want to create and manage user accounts (invite-only, no public registration) so I control who accesses the collection.
- **US-14:** As an admin, I want to export my entire collection as CSV or JSON for backup or migration purposes.
- **US-15:** As an admin, I want the system to perform automatic daily backups of the SQLite database.

---

## 4. Functional Requirements

### FR-1: Wine Catalog Entry

Each wine entry must capture:

| Field         | Type    | Required | Notes                                                   |
| ------------- | ------- | -------- | ------------------------------------------------------- |
| `name`        | string  | Yes      | Wine name / cuvée                                       |
| `producer`    | string  | Yes      | Winery / domaine / château                              |
| `region`      | string  | Yes      | e.g., Burgundy, Napa Valley, Barossa                    |
| `sub_region`  | string  | No       | e.g., Gevrey-Chambertin, Oakville                       |
| `country`     | string  | Yes      |                                                         |
| `vintage`     | integer | No       | Null for NV (non-vintage)                               |
| `varietal`    | string  | Yes      | Primary grape(s) or blend name                          |
| `color`       | enum    | Yes      | red, white, rosé, sparkling, dessert, fortified, orange |
| `bottle_size` | enum    | Yes      | 375ml, 750ml, 1.5L, 3L, other                           |
| `alcohol_pct` | decimal | No       | ABV percentage                                          |
| `drink_from`  | integer | No       | Year (start of drink window)                            |
| `drink_to`    | integer | No       | Year (end of drink window)                              |
| `notes`       | text    | No       | General notes about the wine                            |

### FR-2: Inventory (Bottle) Tracking

Each physical bottle is a separate inventory record linked to a wine entry:

| Field              | Type    | Required | Notes                                     |
| ------------------ | ------- | -------- | ----------------------------------------- |
| `wine_id`          | FK      | Yes      | References wine catalog                   |
| `storage_location` | string  | No       | Free-text or structured (see FR-3)        |
| `purchase_date`    | date    | No       |                                           |
| `purchase_price`   | decimal | No       |                                           |
| `purchase_source`  | string  | No       | Shop, auction, winery, gift               |
| `status`           | enum    | Yes      | in_stock, consumed, gifted, sold, spoiled |
| `consumed_date`    | date    | No       | Set when status changes                   |
| `added_by`         | FK      | Yes      | User who added the bottle                 |

A single wine entry can have many bottle records (e.g., 6 bottles of the same wine).

### FR-3: Storage Location Management

Users can define a hierarchical storage structure:

- **Location** (e.g., "Basement Cellar", "Kitchen Rack")
  - **Zone/Section** (e.g., "Left wall", "Top shelf")
    - **Position** (e.g., "Row 3, Col 5")

This is optional — users can also use free-text location strings for simpler setups.

### FR-4: Tasting Notes

| Field           | Type    | Required |
| --------------- | ------- | -------- | ----------- |
| `bottle_id`     | FK      | Yes      |
| `user_id`       | FK      | Yes      |
| `tasted_date`   | date    | Yes      |
| `rating`        | integer | No       | 1–100 scale |
| `appearance`    | text    | No       |
| `nose`          | text    | No       |
| `palate`        | text    | No       |
| `finish`        | text    | No       |
| `overall_notes` | text    | No       |
| `occasion`      | string  | No       |

### FR-5: Search & Filtering

- Full-text search across wine name, producer, region, varietal, and notes
- Filter by: color, region, country, vintage range, price range, drink window status (too young / ready / past peak), rating range, storage location, status
- Sort by: name, vintage, rating, price, date added, drink window
- SQLite FTS5 extension recommended for full-text search

### FR-6: Dashboard & Analytics

- Total bottles in stock, total value (sum of purchase prices)
- Breakdown charts: by color, by region, by vintage decade, by varietal
- Consumption rate: bottles consumed per month (rolling 12 months)
- Drink window alerts: bottles entering their optimal window, bottles past peak
- Average rating of consumed bottles

### FR-7: User Management

- Admin-only user creation (no self-registration)
- Roles: `admin` (full access + user management) and `member` (collection read/write, no user management)
- JWT-based authentication with refresh token rotation
- Password requirements: minimum 12 characters

### FR-8: Data Export

- CSV export of full collection (wines + bottles + tasting notes)
- JSON export matching the internal data model
- Triggered manually from the UI by admin users

---

## 5. Non-Functional Requirements

### Performance

| Requirement                | Target                                   |
| -------------------------- | ---------------------------------------- |
| Initial page load (cold)   | < 3s on broadband                        |
| API response time (p95)    | < 500ms for queries up to 10,000 bottles |
| Search response time (p95) | < 300ms using FTS5                       |
| Concurrent users supported | 5–10 simultaneous                        |

### Reliability

- Application should recover automatically from crashes via process manager (systemd or PM2)
- SQLite database must use WAL (Write-Ahead Logging) mode for concurrent read access
- Daily automated backups with 30-day retention

### Scalability

This application is intentionally designed for small-scale use. Scaling beyond a single VM or beyond ~50,000 bottles is out of scope for v1. If scaling is needed later, the migration path is SQLite -> PostgreSQL with minimal query changes if using a query builder like Knex.js or Drizzle ORM.

### Accessibility

- WCAG 2.1 AA compliance for all UI components
- Keyboard navigation support
- Responsive design supporting desktop (1024px+) and mobile (375px+)

### Internationalization

- English only for v1
- Currency stored as decimal + currency code (default USD) to support future localization
- Wine regions and varietals stored as user-entered strings (no fixed taxonomy)

---

## 6. Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                    GCP VM (e2-small)                 │
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │   Nginx      │    │   Node.js Backend         │   │
│  │   (Reverse   │───▶│   (Express/Fastify)       │   │
│  │    Proxy)    │    │                           │   │
│  │              │    │   ┌────────────────────┐  │   │
│  │  Serves SPA  │    │   │  better-sqlite3    │  │   │
│  │  static files│    │   │  (sync driver)     │  │   │
│  └──────────────┘    │   └────────┬───────────┘  │   │
│                      │            │              │   │
│                      └────────────┼──────────────┘   │
│                                   │                  │
│                      ┌────────────▼───────────┐      │
│                      │   SQLite Database       │      │
│                      │   (WAL mode)            │      │
│                      │   /var/data/cellar.db   │      │
│                      └─────────────────────────┘      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Frontend (React SPA)

| Choice           | Recommendation               | Rationale                                                      |
| ---------------- | ---------------------------- | -------------------------------------------------------------- |
| Build tool       | **Vite**                     | Fast HMR, native ESM, excellent React support                  |
| Routing          | **React Router v7**          | Industry standard, file-based routing optional                 |
| State management | **TanStack Query**           | Server state caching, automatic refetching, optimistic updates |
| UI components    | **shadcn/ui + Tailwind CSS** | Accessible components, utility-first CSS, minimal bundle       |
| Forms            | **React Hook Form + Zod**    | Performant forms with schema validation shared with backend    |
| Charts           | **Recharts**                 | Lightweight, React-native charting for dashboard               |

#### Backend (Node.js API)

| Choice           | Recommendation     | Rationale                                                         |
| ---------------- | ------------------ | ----------------------------------------------------------------- |
| Framework        | **Fastify**        | Faster than Express, built-in schema validation, good DX          |
| SQLite driver    | **better-sqlite3** | Synchronous API (no callback hell), fastest Node SQLite driver    |
| Query builder    | **Drizzle ORM**    | Type-safe, lightweight, excellent SQLite support, SQL-like syntax |
| Validation       | **Zod**            | Shared schemas between frontend and backend                       |
| Auth             | **@fastify/jwt**   | JWT signing/verification, refresh token support                   |
| Full-text search | **SQLite FTS5**    | Built-in, no external dependency                                  |

#### Shared

| Choice             | Recommendation           | Rationale                                                             |
| ------------------ | ------------------------ | --------------------------------------------------------------------- |
| Language           | **TypeScript**           | End-to-end type safety                                                |
| Monorepo           | **npm workspaces**       | Simple, no extra tooling (Turborepo if build speed becomes a concern) |
| Validation schemas | **Zod (shared package)** | Single source of truth for API contracts                              |

### Data Flow

```
User Action (React)
  → TanStack Query (cache check)
    → HTTP Request (fetch)
      → Fastify Route Handler
        → Zod Validation (request)
          → Drizzle ORM Query
            → better-sqlite3
              → SQLite DB (WAL mode)
            ← Result rows
          ← Typed result
        ← Zod Validation (response)
      ← JSON Response
    ← Cache update
  ← UI Re-render
```

### SQLite Schema Considerations

#### WAL Mode (Write-Ahead Logging)

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -20000;  -- 20MB cache
PRAGMA foreign_keys = ON;
```

**Why WAL mode:**

- Allows concurrent reads while a write is in progress
- Significantly better read performance for multi-user scenarios
- Only one writer at a time (acceptable for 5–10 users)

#### Concurrency Strategy

- SQLite allows **one writer at a time**. With `busy_timeout = 5000`, write attempts will retry for up to 5 seconds before failing.
- For this application's scale (5–10 concurrent users, mostly reads), this is sufficient.
- Write-heavy operations (bulk import) should use transactions to batch writes.

#### Backup Strategy

- **Daily backup:** Copy the database file using `.backup` API (safe even while DB is in use with WAL mode)
- **Backup location:** Separate directory on the VM + optional GCS bucket upload
- **Retention:** 30 days local, 90 days in GCS
- **Pre-backup checkpoint:** `PRAGMA wal_checkpoint(TRUNCATE)` to ensure WAL is flushed

#### Core Tables

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE wines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    producer TEXT NOT NULL,
    region TEXT NOT NULL,
    sub_region TEXT,
    country TEXT NOT NULL,
    vintage INTEGER,
    varietal TEXT NOT NULL,
    color TEXT NOT NULL CHECK (color IN ('red','white','rosé','sparkling','dessert','fortified','orange')),
    bottle_size TEXT NOT NULL DEFAULT '750ml',
    alcohol_pct REAL,
    drink_from INTEGER,
    drink_to INTEGER,
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE bottles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wine_id INTEGER NOT NULL REFERENCES wines(id),
    storage_location TEXT,
    purchase_date TEXT,
    purchase_price REAL,
    purchase_currency TEXT DEFAULT 'USD',
    purchase_source TEXT,
    status TEXT NOT NULL DEFAULT 'in_stock'
        CHECK (status IN ('in_stock','consumed','gifted','sold','spoiled')),
    consumed_date TEXT,
    added_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tasting_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bottle_id INTEGER NOT NULL REFERENCES bottles(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    tasted_date TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 100),
    appearance TEXT,
    nose TEXT,
    palate TEXT,
    finish TEXT,
    overall_notes TEXT,
    occasion TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE storage_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES storage_locations(id),
    description TEXT,
    capacity INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE wines_fts USING fts5(
    name, producer, region, sub_region, country, varietal, notes,
    content='wines',
    content_rowid='id'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER wines_ai AFTER INSERT ON wines BEGIN
    INSERT INTO wines_fts(rowid, name, producer, region, sub_region, country, varietal, notes)
    VALUES (new.id, new.name, new.producer, new.region, new.sub_region, new.country, new.varietal, new.notes);
END;

CREATE TRIGGER wines_ad AFTER DELETE ON wines BEGIN
    INSERT INTO wines_fts(wines_fts, rowid, name, producer, region, sub_region, country, varietal, notes)
    VALUES ('delete', old.id, old.name, old.producer, old.region, old.sub_region, old.country, old.varietal, old.notes);
END;

CREATE TRIGGER wines_au AFTER UPDATE ON wines BEGIN
    INSERT INTO wines_fts(wines_fts, rowid, name, producer, region, sub_region, country, varietal, notes)
    VALUES ('delete', old.id, old.name, old.producer, old.region, old.sub_region, old.country, old.varietal, old.notes);
    INSERT INTO wines_fts(rowid, name, producer, region, sub_region, country, varietal, notes)
    VALUES (new.id, new.name, new.producer, new.region, new.sub_region, new.country, new.varietal, new.notes);
END;
```

#### Indexes

```sql
CREATE INDEX idx_wines_producer ON wines(producer);
CREATE INDEX idx_wines_region ON wines(region);
CREATE INDEX idx_wines_country ON wines(country);
CREATE INDEX idx_wines_vintage ON wines(vintage);
CREATE INDEX idx_wines_color ON wines(color);
CREATE INDEX idx_bottles_wine_id ON bottles(wine_id);
CREATE INDEX idx_bottles_status ON bottles(status);
CREATE INDEX idx_bottles_storage ON bottles(storage_location);
CREATE INDEX idx_tasting_notes_bottle ON tasting_notes(bottle_id);
CREATE INDEX idx_tasting_notes_user ON tasting_notes(user_id);
CREATE INDEX idx_tasting_notes_rating ON tasting_notes(rating);
```

---

## 7. Infrastructure & Deployment

### GCP VM Configuration

| Setting      | Value                             | Rationale                                     |
| ------------ | --------------------------------- | --------------------------------------------- |
| Machine type | **e2-small** (2 vCPU, 2GB RAM)    | Sufficient for <10 concurrent users           |
| OS           | **Ubuntu 24.04 LTS**              | Long-term support, wide tooling compatibility |
| Disk         | **20GB balanced persistent disk** | SSD-backed for SQLite performance             |
| Region       | User's nearest GCP region         | Latency optimization                          |
| Static IP    | **Reserved external IP**          | Stable DNS target                             |
| Firewall     | Allow TCP 80, 443 only            | HTTPS via Let's Encrypt                       |

### Software Stack on VM

```
Nginx (reverse proxy, static file serving, TLS termination)
  └── Node.js (Fastify API server, managed by PM2)
        └── SQLite database file (/var/data/cellarsync/cellar.db)
```

### Environment Configuration

Three environments, with parity maintained through shared configuration:

| Environment    | Database                              | API URL                             | Purpose           |
| -------------- | ------------------------------------- | ----------------------------------- | ----------------- |
| **Local dev**  | `./data/cellar-dev.db`                | `http://localhost:3001`             | Development       |
| **Test/CI**    | `:memory:` or `./data/cellar-test.db` | N/A (in-process)                    | Automated testing |
| **Production** | `/var/data/cellarsync/cellar.db`      | `https://cellarsync.yourdomain.com` | Live              |

Environment variables (`.env` file, not committed):

```env
NODE_ENV=production|development|test
PORT=3001
DATABASE_PATH=/var/data/cellarsync/cellar.db
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BACKUP_DIR=/var/backups/cellarsync
CORS_ORIGIN=https://cellarsync.yourdomain.com
```

### Deployment Pipeline

```
Push to main
  → GitHub Actions: lint + test
    → On success: SSH deploy to GCP VM
      → git pull (or rsync built artifacts)
      → npm ci --production
      → Run database migrations (Drizzle migrate)
      → PM2 restart cellarsync
      → Health check (curl /api/health)
      → Notify on failure
```

### Deployment Strategy

- **Method:** Pull-based deployment via SSH from GitHub Actions
- **Zero-downtime:** Not required for personal use; PM2 restart is acceptable (< 2s downtime)
- **Rollback:** `git revert` + redeploy, or restore previous PM2 snapshot
- **Database migrations:** Forward-only, applied automatically on deploy via Drizzle Kit

---

## 8. Development Workflow

### Local Development Setup

```bash
# Prerequisites: Node.js >= 20, npm >= 10

# Clone and install
git clone <repo-url>
cd cellarsync
npm install          # installs all workspace dependencies

# Setup local environment
cp .env.example .env.local

# Run database migrations and seed
npm run db:migrate
npm run db:seed      # inserts sample wines for development

# Start development servers
npm run dev          # runs both frontend (Vite) and backend (Fastify) concurrently
```

### Project Structure (npm workspaces)

```
cellarsync/
├── package.json              # root workspace config
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI
├── packages/
│   └── shared/               # shared Zod schemas, types, constants
│       ├── src/
│       │   ├── schemas/      # Zod validation schemas
│       │   ├── types/        # TypeScript types
│       │   └── constants/    # wine colors, bottle sizes, etc.
│       └── package.json
├── apps/
│   ├── api/                  # Fastify backend
│   │   ├── src/
│   │   │   ├── routes/       # API route handlers
│   │   │   ├── db/           # Drizzle schema, migrations
│   │   │   ├── services/     # business logic
│   │   │   ├── middleware/   # auth, error handling
│   │   │   └── index.ts      # server entry
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── functional/
│   │   └── package.json
│   └── web/                  # React SPA
│       ├── src/
│       │   ├── components/   # UI components
│       │   ├── pages/        # route pages
│       │   ├── hooks/        # custom React hooks
│       │   ├── lib/          # API client, utilities
│       │   └── main.tsx      # entry point
│       ├── tests/
│       │   ├── unit/
│       │   └── e2e/
│       └── package.json
├── data/                     # local SQLite databases (gitignored)
├── scripts/                  # backup, seed, migration helpers
└── docs/
    └── PRD.md                # this document
```

### Development Experience

| Feature                | Tool                         | Details                                    |
| ---------------------- | ---------------------------- | ------------------------------------------ |
| Frontend hot reload    | Vite HMR                     | Instant updates on save                    |
| Backend hot reload     | **tsx watch**                | Restarts Fastify on file change            |
| Concurrent dev servers | **concurrently**             | Single `npm run dev` starts both           |
| Database viewer        | **Drizzle Studio**           | `npm run db:studio` for visual DB browsing |
| API testing            | **Bruno** or **HTTPie**      | Recommended for manual endpoint testing    |
| Linting                | **ESLint + Prettier**        | Shared config across workspaces            |
| Type checking          | **TypeScript** (strict mode) | `npm run typecheck` across all packages    |

### Seed Data

Development seed data should include:

- 2 user accounts (1 admin, 1 member)
- ~50 wines across diverse regions and varietals
- ~120 bottles (some wines with multiple bottles)
- ~30 tasting notes with varied ratings
- 3–5 storage locations with hierarchical structure

---

## 9. Testing Strategy

### Testing Pyramid

```
         ╱  E2E / Feature  ╲        ~15 tests   (Playwright)
        ╱   (user workflows) ╲
       ╱─────────────────────╲
      ╱   Functional / API    ╲     ~60 tests   (Vitest + Supertest)
     ╱   (endpoints, services) ╲
    ╱──────────────────────────╲
   ╱       Unit Tests           ╲   ~150 tests  (Vitest + RTL)
  ╱  (functions, components,     ╲
 ╱    schemas, utilities)         ╲
╱──────────────────────────────────╲
```

### Test Tooling

| Layer            | Tool                               | Scope                                                                     |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| Unit (backend)   | **Vitest**                         | Pure functions, schema validation, utilities, service methods (mocked DB) |
| Unit (frontend)  | **Vitest + React Testing Library** | Component rendering, hooks, user interactions                             |
| Functional (API) | **Vitest + Supertest**             | Full HTTP request/response cycle against Fastify with a test SQLite DB    |
| Feature / E2E    | **Playwright**                     | Browser-based user workflows across frontend + backend                    |

### Coverage Targets

| Area                  | Line Coverage | Branch Coverage |
| --------------------- | ------------- | --------------- |
| Shared schemas        | >= 95%        | >= 90%          |
| API routes & services | >= 85%        | >= 80%          |
| React components      | >= 75%        | >= 70%          |
| Overall               | >= 80%        | >= 75%          |

### Unit Tests (~150 tests)

**Backend unit tests:**

- Zod schema validation (valid input, invalid input, edge cases for each entity)
- Service-layer business logic with mocked database
  - Wine CRUD operations
  - Bottle status transitions (in_stock → consumed, etc.)
  - Drink window calculation logic
  - Collection statistics aggregation
- Utility functions (date formatting, currency handling, CSV generation)
- Auth utilities (JWT token generation, password hashing)

**Frontend unit tests:**

- Component rendering (wine card, bottle list, tasting form, search bar, dashboard charts)
- Custom hooks (useWines, useBottles, useSearch, useAuth)
- Form validation behavior
- Filter/sort logic
- Empty states, loading states, error states

### Functional Tests (~60 tests)

API endpoint tests using Supertest against a real Fastify instance with a test SQLite database:

- **Auth:** register (admin only), login, refresh token, logout, invalid credentials
- **Wines CRUD:** create, read (single + list), update, delete, validation errors
- **Bottles CRUD:** create, update status, consume with tasting note, bulk add
- **Tasting Notes:** create, update, list by bottle, list by user
- **Search:** full-text search, filtered queries, sort orders, pagination
- **Storage Locations:** CRUD, hierarchical queries
- **Dashboard:** statistics endpoint accuracy
- **Export:** CSV format correctness, JSON format correctness
- **Authorization:** member vs. admin permissions, accessing other users' data

Each functional test:

1. Seeds a fresh test database (using in-memory SQLite or a temp file)
2. Executes HTTP requests
3. Asserts response status, headers, and body
4. Verifies database state where appropriate

### Feature / Integration Tests (~15 tests)

End-to-end tests using Playwright with both frontend and backend running:

- **F-1:** User login flow (enter credentials, receive JWT, redirect to dashboard)
- **F-2:** Add a new wine and bottles (fill form, submit, verify in inventory)
- **F-3:** Search and filter inventory (type query, apply filters, verify results)
- **F-4:** Consume a bottle and add tasting notes (mark consumed, fill tasting form, verify)
- **F-5:** Dashboard displays correct statistics (add bottles, check counts and charts)
- **F-6:** Storage location management (create locations, assign bottles, browse by location)
- **F-7:** Export collection as CSV (trigger export, verify downloaded file)
- **F-8:** Admin creates a new user account
- **F-9:** Member cannot access admin functions
- **F-10:** Edit an existing wine's details
- **F-11:** Search with no results shows appropriate empty state
- **F-12:** Drink window alerts appear for ready-to-drink wines
- **F-13:** Responsive layout works on mobile viewport
- **F-14:** Pagination through a large wine list
- **F-15:** Logout clears session and redirects to login

### GitHub Actions CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: unit-coverage
          path: coverage/

  functional-tests:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run test:functional -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: functional-coverage
          path: coverage/

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, functional-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Test npm Scripts

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:functional && npm run test:e2e",
    "test:unit": "vitest run --project unit",
    "test:functional": "vitest run --project functional",
    "test:e2e": "playwright test",
    "test:watch": "vitest --project unit",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 10. API Design

### Base URL

```
Production:  https://cellarsync.yourdomain.com/api
Development: http://localhost:3001/api
```

### Authentication Endpoints

```
POST   /api/auth/login          # Login, returns access + refresh tokens
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/logout          # Invalidate refresh token
```

### Resource Endpoints

```
# Wines (catalog)
GET    /api/wines                 # List wines (paginated, filterable, searchable)
GET    /api/wines/:id             # Get single wine with bottle count
POST   /api/wines                 # Create wine
PUT    /api/wines/:id             # Update wine
DELETE /api/wines/:id             # Delete wine (only if no bottles reference it)

# Bottles (inventory)
GET    /api/wines/:wineId/bottles          # List bottles for a wine
POST   /api/wines/:wineId/bottles          # Add bottle(s) to inventory
PUT    /api/bottles/:id                     # Update bottle details
PATCH  /api/bottles/:id/consume             # Mark bottle as consumed
DELETE /api/bottles/:id                     # Remove bottle record

# Tasting Notes
GET    /api/bottles/:bottleId/notes         # Get tasting notes for a bottle
POST   /api/bottles/:bottleId/notes         # Add tasting note
PUT    /api/notes/:id                       # Update tasting note
DELETE /api/notes/:id                       # Delete tasting note

# Storage Locations
GET    /api/storage                          # List all locations (tree)
POST   /api/storage                          # Create location
PUT    /api/storage/:id                      # Update location
DELETE /api/storage/:id                      # Delete location (must be empty)

# Search
GET    /api/search?q=<query>&filters=<...>   # Full-text + filtered search

# Dashboard
GET    /api/dashboard/stats                   # Collection statistics
GET    /api/dashboard/alerts                  # Drink window alerts

# Export
GET    /api/export/csv                        # Download CSV export
GET    /api/export/json                       # Download JSON export

# Users (admin only)
GET    /api/users                             # List users
POST   /api/users                             # Create user
PUT    /api/users/:id                         # Update user
DELETE /api/users/:id                         # Delete user

# Health
GET    /api/health                            # Health check
```

### Request/Response Format

All requests and responses use JSON. Pagination follows a consistent pattern:

**Paginated List Request:**

```
GET /api/wines?page=1&limit=25&sort=vintage&order=desc&color=red&region=Burgundy
```

**Paginated List Response:**

```json
{
  "data": [
    {
      "id": 42,
      "name": "Clos de Vougeot Grand Cru",
      "producer": "Domaine Leroy",
      "region": "Burgundy",
      "vintage": 2019,
      "varietal": "Pinot Noir",
      "color": "red",
      "bottleCount": 3,
      "drinkWindow": { "from": 2027, "to": 2045 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "totalPages": 6
  }
}
```

**Error Response:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid wine data",
    "details": [{ "field": "vintage", "message": "Must be between 1800 and current year" }]
  }
}
```

**Standard HTTP Status Codes:**

| Code | Usage                              |
| ---- | ---------------------------------- |
| 200  | Successful GET, PUT, PATCH         |
| 201  | Successful POST (resource created) |
| 204  | Successful DELETE                  |
| 400  | Validation error                   |
| 401  | Not authenticated                  |
| 403  | Not authorized (wrong role)        |
| 404  | Resource not found                 |
| 409  | Conflict (e.g., duplicate entry)   |
| 500  | Internal server error              |

---

## 11. Security Considerations

### Authentication & Authorization

- **Password hashing:** bcrypt with cost factor 12
- **JWT access tokens:** 15-minute expiry, signed with HS256
- **JWT refresh tokens:** 7-day expiry, stored in DB, rotated on use
- **Refresh token rotation:** Old refresh tokens invalidated when a new one is issued; detect token reuse as a potential compromise signal
- **No public registration:** Admin creates all accounts

### Input Validation

- All inputs validated with Zod schemas at the API boundary
- Parameterized queries via Drizzle ORM (prevents SQL injection)
- String length limits on all text fields (name: 255, notes: 10,000)
- File upload: Not supported in v1 (no image uploads)

### SQLite-Specific Security

- Database file permissions: `chmod 600` (owner read/write only)
- Database directory: owned by the Node.js process user, not root
- No network-exposed SQLite: only accessible through the application layer
- WAL file and SHM file inherit parent directory permissions

### Network Security

- **TLS:** Let's Encrypt certificate via Certbot, auto-renewed
- **Nginx:** HTTPS only, HTTP redirects to HTTPS
- **GCP Firewall:** Allow inbound TCP 80, 443 only; deny all other inbound
- **CORS:** Restricted to the application's domain
- **Rate limiting:** Fastify rate limiter — 100 requests/minute per IP for API, 10 requests/minute for auth endpoints
- **Security headers:** Helmet middleware (CSP, HSTS, X-Frame-Options, etc.)

### GCP IAM

- VM service account with minimal permissions (only GCS access for backups if used)
- SSH access restricted to specific IP addresses or Identity-Aware Proxy
- No public SSH (port 22 blocked in firewall; use GCP IAP tunnel)

---

## 12. Risks & Mitigations

### High Risk

| Risk                                | Impact                                               | Probability           | Mitigation                                                                                                                                 |
| ----------------------------------- | ---------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **SQLite single-writer contention** | Write requests fail or queue under concurrent writes | Low (small user base) | WAL mode + `busy_timeout = 5000ms`. Monitor for SQLITE_BUSY errors. If frequent, batch writes in transactions or queue writes server-side. |
| **Data loss (disk failure)**        | Entire collection lost                               | Low                   | Daily automated backups to GCS. Periodic backup verification by restoring to a test DB. VM persistent disk provides some redundancy.       |
| **Single VM failure**               | Application offline                                  | Medium                | PM2 auto-restart on crash. GCP VM uptime SLA. Acceptable for personal use — no HA required. Document manual recovery steps.                |

### Medium Risk

| Risk                         | Impact              | Probability | Mitigation                                                                                                                         |
| ---------------------------- | ------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **SQLite file corruption**   | Database unreadable | Very Low    | WAL mode reduces corruption risk. Integrity check via `PRAGMA integrity_check` in backup script. Keep multiple backup generations. |
| **Disk space exhaustion**    | DB writes fail      | Low         | Monitor disk usage. SQLite DB for 10,000 bottles is ~5–10MB — minimal risk. Set up GCP disk usage alert at 80%.                    |
| **JWT secret compromise**    | Unauthorized access | Low         | Store secrets in environment variables, not in code. Rotate secrets periodically. Refresh token rotation limits blast radius.      |
| **Dependency vulnerability** | Security exploit    | Medium      | `npm audit` in CI pipeline. Dependabot alerts enabled. Pin major versions.                                                         |

### Low Risk

| Risk                    | Impact                              | Probability                | Mitigation                                                                                       |
| ----------------------- | ----------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| **Outgrowing SQLite**   | Performance degradation             | Very Low (at <50K bottles) | Query builder (Drizzle) abstracts the DB layer. Migration path to PostgreSQL is straightforward. |
| **Need for mobile app** | Users want native mobile experience | Low                        | Responsive SPA works on mobile browsers. API-first design enables future native app.             |

---

## 13. Milestones & Phases

### Phase 1: Foundation (Weeks 1–2)

**Deliverables:**

- [ ] Project scaffolding (monorepo, TypeScript, Vite, Fastify)
- [ ] SQLite database setup with Drizzle ORM (schema, migrations, WAL mode)
- [ ] User authentication (JWT login, refresh, middleware)
- [ ] Basic API skeleton (health check, auth routes)
- [ ] CI pipeline (lint, typecheck, unit tests running in GitHub Actions)
- [ ] Local development workflow (concurrent dev servers, seed data)

**Exit Criteria:** A developer can clone the repo, run `npm install && npm run dev`, log in, and hit the health endpoint.

### Phase 2: Core Inventory (Weeks 3–4)

**Deliverables:**

- [ ] Wine CRUD API + frontend pages (list, detail, add, edit)
- [ ] Bottle CRUD API + frontend (add bottles, update status)
- [ ] Storage location management
- [ ] Basic search (FTS5) and filter UI
- [ ] Unit + functional tests for all new endpoints and components

**Exit Criteria:** A user can log in, add wines and bottles, assign storage locations, search the collection, and mark bottles as consumed.

### Phase 3: Tasting & Analytics (Weeks 5–6)

**Deliverables:**

- [ ] Tasting notes API + frontend (add/edit/view notes with ratings)
- [ ] Dashboard with collection statistics and charts
- [ ] Drink window alerts
- [ ] Data export (CSV + JSON)
- [ ] Functional and unit tests for all new features

**Exit Criteria:** A user can record tasting notes, view collection analytics, receive drink window alerts, and export their data.

### Phase 4: Polish & Deploy (Weeks 7–8)

**Deliverables:**

- [ ] End-to-end tests (Playwright, all 15 feature tests)
- [ ] GCP VM provisioning and Nginx configuration
- [ ] Production deployment pipeline (GitHub Actions → SSH → PM2)
- [ ] Automated backup system (daily SQLite backup to GCS)
- [ ] Security hardening (rate limiting, headers, firewall)
- [ ] Responsive design QA (desktop + mobile)
- [ ] Admin user management UI
- [ ] Documentation (setup guide, API reference)

**Exit Criteria:** Application is running in production on GCP, all tests pass in CI, backups are verified, and a non-technical user can be given an account and start cataloging wines.

---

## 14. Open Questions & Assumptions

### Open Questions

| #      | Question                                                                                                          | Impact                                                                | Default Assumption                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| **Q1** | Should wine images be supported (bottle photos, label scans)?                                                     | Requires file storage (GCS bucket or local disk)                      | No images in v1; add in v2 if needed                   |
| **Q2** | Is barcode/label scanning desired (via phone camera)?                                                             | Significant frontend complexity; possible third-party API integration | Out of scope for v1                                    |
| **Q3** | Should the app integrate with any wine databases (e.g., Wine-Searcher, Vivino API) for auto-populating wine data? | Dependency on external APIs, potential cost                           | No external integrations in v1; manual data entry only |
| **Q4** | What is the domain name / will there be a custom domain?                                                          | Affects TLS setup and CORS configuration                              | Use a custom domain with Let's Encrypt                 |
| **Q5** | Should there be email notifications (e.g., drink window alerts)?                                                  | Requires email service integration                                    | No email in v1; alerts shown in-app only               |
| **Q6** | What is the expected maximum collection size?                                                                     | Affects indexing strategy and query optimization                      | Designed for up to 10,000 bottles; tested up to 50,000 |
| **Q7** | Will multiple separate collections be needed (e.g., personal + restaurant)?                                       | Schema and auth model changes                                         | Single collection shared by all users in v1            |
| **Q8** | Is there a preference for the GCP region?                                                                         | Latency                                                               | us-central1 (Iowa) as default                          |

### Assumptions

1. The application is for a small group (1–10 users) and does not need horizontal scaling.
2. SQLite's single-writer limitation is acceptable given the read-heavy workload.
3. The GCP VM will be the only production environment (no staging environment for v1).
4. All users share one wine collection (no multi-tenancy).
5. Wine data is entered manually (no bulk import from external services in v1).
6. The application does not need offline support or PWA capabilities in v1.
7. English is the only supported language.
8. 750ml is the default bottle size and the most common entry.
9. The collector is technically capable of SSH-ing into a VM for initial setup and troubleshooting.
10. Budget for GCP hosting is minimal (~$15–25/month for an e2-small VM with persistent disk).

---

_This PRD is a living document. Update it as decisions are made on the open questions above._
