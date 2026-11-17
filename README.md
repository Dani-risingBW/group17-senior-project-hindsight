# Hindsight — Social Media Research Navigator

An AI-driven research platform that turns a decade of Social Media Technology Conference
materials (2012–2024) from the Cathy Hughes School of Communications into a structured,
searchable, and verifiable archive.

**Live app:** https://social-archive-pilot.lovable.app

> Group 17 Senior Project. See [docs/project-overview.md](docs/project-overview.md) for the full
> problem statement and solution description.

## Features

- **Ask the Navigator** — chat with the archive; every answer cites its source documents.
- **Then & Now** — compare early research predictions with later evidence and modern AI algorithms.
- **Timeline** — browse how research themes evolved across conference years.
- **Document view** — open the original submission behind any citation.
- **Saved** — bookmark documents and revisit past chat sessions.

## Tech Stack

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing) + [Vite](https://vite.dev)
- TypeScript, [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) (Radix UI)
- [TanStack Query](https://tanstack.com/query), React Hook Form + Zod, Recharts
- Built and synced with [Lovable](https://lovable.dev)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20+ and npm, **or** [Bun](https://bun.sh) (the project's lockfile is `bun.lock`)

### Install and run

```sh
git clone https://github.com/Dani-risingBW/group17-senior-project-hindsight.git
cd group17-senior-project-hindsight

npm install        # or: bun install
npm run dev        # or: bun run dev
```

Open the local URL printed in the terminal.

### Environment variables

Copy `.env.example` to `.env` and adjust as needed. The app runs without any variables set.

| Variable            | Description                                                                        |
| ------------------- | ---------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL of the real backend. When unset, the app uses mock data from `src/data/`. |

## Scripts

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start the development server  |
| `npm run build`   | Build for production          |
| `npm run preview` | Preview the production build  |
| `npm run lint`    | Run ESLint                    |
| `npm run format`  | Format code with Prettier     |
| `npm test`        | Run unit tests (requires Bun) |

## Project Structure

```
src/
├── routes/          # File-based routes (see src/routes/README.md)
├── components/      # App components; ui/ holds shadcn/ui primitives
├── lib/api.ts       # Single data-access layer (mock today, real backend via VITE_API_BASE_URL)
├── data/            # Mock archive records
└── hooks/           # Shared React hooks
docs/                # Project documentation
```

All UI data access goes through [`src/lib/api.ts`](src/lib/api.ts), so the backend team can swap in
a real API without changing the UI.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch, commit, and pull request workflow.

> [!IMPORTANT]
> This repository is connected to Lovable. Commits pushed to `main` sync back to the Lovable
> editor. **Never force-push or rewrite history on `main`**, and keep `main` in a working state.

## Roadmap

See [roadmap.md](roadmap.md).
