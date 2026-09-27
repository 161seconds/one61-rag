# One61 RAG

React, NestJS, and Python RAG monorepo.

## Project structure

```text
frontend/                      React + Vite
backend/
  api/                         NestJS API
  ai/                          FastAPI RAG service
  notification-delivery/      Notification delivery service
  notification-worker/        Notification queue worker
packages/                      Shared TypeScript packages
docker/                        Application Dockerfiles
```

## Local development

```bash
docker compose up -d
pnpm install
pnpm db:generate
pnpm dev
```

The frontend runs at `http://localhost:5173`; the API runs at
`http://localhost:3002`.

Run the AI service separately:

```bash
cd backend/ai
uv sync --extra dev
docker compose up -d
cd ../..
pnpm dev:ai
```

The AI health endpoint is `http://localhost:8000/health`.

## Adding components

To add components, run:

```bash
pnpm dlx shadcn@latest add button -c frontend
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@aqua-calendar/ui/components/button";
```
