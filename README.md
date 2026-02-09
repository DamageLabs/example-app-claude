# CellarSync

Wine collection inventory management system for personal and small group use.

**Tech Stack:** React 19 + Vite | Fastify | SQLite + Drizzle ORM | GitHub Actions CI/CD

## Quick Start

```bash
# Prerequisites: Node.js >= 20, npm >= 10

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations and seed with sample data
npm run db:migrate
npm run db:seed

# Start development servers (API + Web concurrently)
npm run dev
```

- **API:** http://localhost:3001
- **Web:** http://localhost:5173 (proxies `/api` to the API server)

## Test Accounts

| Role   | Email                      | Password         |
|--------|----------------------------|------------------|
| Admin  | admin@cellarsync.local     | adminpassword1   |
| Member | member@cellarsync.local    | memberpassword1  |

## Available Scripts

| Script               | Description                                    |
|----------------------|------------------------------------------------|
| `npm run dev`        | Start API and Web dev servers concurrently     |
| `npm run build`      | Build web app for production                   |
| `npm run lint`       | Run ESLint across all packages                 |
| `npm run lint:fix`   | Run ESLint with auto-fix                       |
| `npm run typecheck`  | TypeScript type checking across all packages   |
| `npm run test`       | Run all tests                                  |
| `npm run test:unit`  | Run unit tests only                            |
| `npm run test:functional` | Run functional/API tests               |
| `npm run test:e2e`   | Run Playwright end-to-end tests                |
| `npm run test:coverage` | Run tests with coverage report              |
| `npm run db:migrate` | Run database migrations                        |
| `npm run db:seed`    | Seed database with sample data                 |
| `npm run db:studio`  | Open Drizzle Studio (visual DB browser)        |
| `npm run format`     | Format code with Prettier                      |
| `npm run format:check` | Check code formatting                        |

## Project Structure

```
cellarsync/
├── packages/
│   └── shared/           # Zod schemas, TypeScript types, constants
├── apps/
│   ├── api/              # Fastify backend (port 3001)
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── db/       # Drizzle schema, migrations, seed
│   │   │   ├── services/ # Business logic
│   │   │   ├── plugins/  # Fastify plugins (JWT, etc.)
│   │   │   └── middleware/
│   │   ├── drizzle/      # Migration files
│   │   └── tests/
│   └── web/              # React SPA (port 5173)
│       ├── src/
│       └── tests/
├── docs/
│   ├── PRD.md            # Product requirements document
│   └── ROADMAP.md        # Development roadmap
└── data/                 # SQLite databases (gitignored)
```

## API Endpoints

```
GET  /api/health           # Health check
POST /api/auth/login       # Login (returns JWT tokens)
POST /api/auth/refresh     # Refresh access token
POST /api/auth/logout      # Invalidate refresh token
```

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Development Roadmap](docs/ROADMAP.md)

## License

Apache License 2.0 — see [LICENSE](LICENSE).
