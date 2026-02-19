# Klozbuy — Social Marketplace

**Klozbuy** is a location-aware social commerce platform built for Nigerian communities. It lets individuals and businesses post products, services, and events to nearby neighbours, and lets users discover, react to, and buy from people around them — all in one social feed.

---

## What It Does

| Feature | Description |
|---|---|
| 📍 **Location-based feed** | Discover posts from people and businesses near you using GPS coordinates |
| 🛍️ **Products** | List items for sale with pricing, condition, stock, and negotiation options |
| 🔧 **Services** | Offer services with hourly/fixed/per-project pricing and a service radius |
| 📅 **Events** | Create online or in-person events with ticketing and attendance tracking |
| 💬 **Social interactions** | React (like, love, support, interesting, want), comment, and mention other users |
| 📨 **Messaging** | Real-time direct messages and group conversations |
| 🔔 **Notifications** | Activity notifications for reactions, comments, follows, and mentions |
| 👤 **Profiles** | Individual and business profiles with verification, followers, and reviews |
| 🔎 **Search & Discover** | Full-text search across posts, products, services, and users |
| 📣 **Promoted posts** | Boost posts with location-targeted advertising and budget controls |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Database | MySQL (via [TiDB Serverless](https://tidbcloud.com)) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [better-auth](https://better-auth.com) |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |

---

## Project Structure

```
src/
├── app/            # Next.js App Router pages & API routes
├── components/     # Reusable UI components
├── controllers/    # Business-logic controllers
├── db/
│   ├── schemas/    # Drizzle table definitions
│   └── index.ts    # DB client
├── hooks/          # Custom React hooks (e.g. useLocation)
├── lib/            # Utilities (geolocation, ID generation, …)
├── models/         # Data-access layer
├── providers/      # React context providers
├── services/       # External-service integrations
└── types/          # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18 (or [Bun](https://bun.sh))
- A MySQL-compatible database (e.g. TiDB Serverless)

### Installation

```bash
# Install dependencies
npm install        # or: bun install

# Copy the example env file and fill in your values
cp .env.example .env
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `BETTER_AUTH_SECRET` | Secret key for better-auth |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the app |

### Database

```bash
# Push schema to your database
npm run db:push

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

### Development Server

```bash
npm run dev     # starts on http://localhost:3300 (port set in package.json scripts)
```

### Build for Production

```bash
npm run build
npm run start
```

---

## Scripts

| Script | Description |
|---|---|
| `dev` | Start the development server (port 3300) |
| `build` | Build for production |
| `start` | Start the production server |
| `lint` | Run ESLint |
| `db:push` | Push Drizzle schema changes to the database |
| `db:gen` | Generate Drizzle migration files |
| `db:studio` | Open Drizzle Studio |

---

## License

Private — all rights reserved.
