# DevAgent

An AI-powered developer workspace: code snippets, AI debugging, code
explanations, GitHub integration, a LeetCode tracker, daily coding goals with
streaks, a portfolio generator, and notes.

```
devagent-fullstack/
  backend/    NestJS REST API (see backend/README.md for full API reference)
  frontend/   React + TypeScript + Tailwind UI (see frontend/README.md)
```

## Run it

Two terminals:

```bash
# terminal 1 — API on :3000
cd backend
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY for AI debug/explain
npm run start:dev

# terminal 2 — UI on :5173, proxies /api to :3000
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

See each package's own README for architecture details, the full API
reference, and design notes.
