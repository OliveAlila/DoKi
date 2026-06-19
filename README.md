# Doki

Doki is a climate tech platform for managing and tracing agricultural waste to divert it from landfills and abate carbon emissions. The platform serves as a marketplace and audit ledger for organic waste, connecting sellers (farms, mills) with buyers (bio-energy plants, composters).

## Repository Structure

This project is a monorepo managed with Bun workspaces.

- `apps/api`: Backend Express application using Prisma and SQLite. Manages listings, transactions, and audit logs.
- `apps/web`: Next.js 15 web dashboard. Features an interactive climate console, landfill avoidance stats, and geo-spatial proximity maps using Leaflet and Recharts.
- `apps/mobile`: Expo / React Native mobile client. Features an AI scanner for organic waste classification built with NativeWind v4 for styling.

## Scripts

All primary commands should be run from the repository root using Bun.

### Development

| Command | Use case |
|---|---|
| `bun dev` | All 3 apps, clean labelled output, no hot-reload on mobile |
| `bun dev:mobile` | Mobile only, full interactive TTY with QR code + hot-reload |
| `bun dev:api` / `bun dev:web` | Individual apps |
| `bun dev:all` | Starts API, Web, and Mobile concurrently. Mobile is run in non-interactive CI mode |

**Note**: For the QR code, run `bun dev:mobile` in a dedicated terminal tab — Expo needs a real TTY to render it. This script intentionally uses `cd apps/mobile && bun run dev` to bypass Bun's `--filter` multiplexer, which would otherwise swallow the interactive session.

### Database Operations

The database operations are routed to the API workspace.

- `bun db:generate`: Generates the Prisma client.
- `bun db:push`: Pushes schema changes to the SQLite database.
- `bun db:migrate`: Creates and applies database migrations.
- `bun db:seed`: Seeds the database with initial regional profiles, categories, and dummy transactions.
- `bun db:studio`: Opens Prisma Studio to view and edit database contents.

### Typechecking and Linting

- `bun typecheck`: Runs TypeScript type checking across all apps concurrently.
- `bun lint:web`: Runs ESLint on the Web application.

### Mobile Builds

- `bun android`: Starts the Expo Android build/run process.
- `bun ios`: Starts the Expo iOS build/run process.

### Maintenance

- `bun reinstall`: Cleans all `node_modules` directories and `bun.lock`, then performs a fresh `bun install`.

## Setup Instructions

1. Install dependencies:
   ```bash
   bun install
   ```

2. Generate the Prisma client and seed the database:
   ```bash
   bun db:generate
   bun db:push
   bun db:seed
   ```

3. Start the primary services (API and Web):
   ```bash
   bun dev
   ```

4. Start the mobile app (in a separate terminal for interactive mode):
   ```bash
   bun dev:mobile
   ```

## Tech Stack

- Package Manager: Bun
- Database: SQLite (via Prisma with Bun adapter)
- Web: Next.js 15, Mantine v9, Recharts, React-Leaflet
- Mobile: React Native, Expo 56, NativeWind v4 (Tailwind CSS v3)
- Backend: Express, CORS, Cookie Parser
