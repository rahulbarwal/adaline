# Adaline

A monorepo project built with Turborepo, containing a React frontend and Express backend.

## Prerequisites

- Node.js >= 18
- Yarn package manager

## Project Structure

```
adaline/
├── apps/
│   ├── frontend/    # React + Vite application
│   └── backend/     # Express + SQLite server
└── packages/
    └── shared-types/  # Common TypeScript types
```

## Getting Started

1. Install dependencies:

```bash
yarn install
```

2. Build shared packages:

```bash
yarn workspace @adaline/shared-types build
```

3. Start development servers:

For all applications:

```bash
yarn dev
```

Or individually:

```bash
# Frontend only
yarn workspace @adaline/frontend dev

# Backend only
yarn workspace @adaline/backend dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:3000`

## Build for Production

Build all applications:

```bash
yarn build
```

## Database Management

The backend uses SQLite for data storage. The database file is created automatically at first run.

To reset the database:

1. Stop the backend server
2. Delete the database file:

```bash
# From the project root
rm apps/backend/database.sqlite
```

3. Restart the backend server - a fresh database will be created automatically

## Available Scripts

- `yarn dev` - Start all applications in development mode
- `yarn build` - Build all applications for production
- `yarn lint` - Run linting across all applications
- `yarn format` - Format code using Prettier

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Express, SQLite
- **Shared**: TypeScript, Turborepo
