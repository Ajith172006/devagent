# DevAgent — Frontend

React + TypeScript + Tailwind CSS UI for the DevAgent developer workspace API.

## Stack

- **React 19** + **TypeScript**, scaffolded with **Vite**
- **Tailwind CSS v4** (CSS-based theming, see `src/index.css`)
- **react-router-dom** for client-side routing
- **lucide-react** for icons

## Getting started

Make sure the [backend](../backend) is running first (`npm run start:dev` inside
`backend/`, on port 3000 by default), then:

```bash
npm install
npm run dev
# open http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:3000` (configured in
`vite.config.ts`), so no CORS setup or `.env` is needed in development.

For a production build:

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

In production, either serve `dist/` behind the same reverse proxy as the API
(so `/api` still resolves), or point the app at a different API origin by
editing `BASE` in `src/api/client.ts`.

## Structure

```
src/
  api/
    client.ts     Small typed fetch wrapper (get/post/patch/put/del)
    modules.ts    One function group per backend module (snippets, ai, goals, ...)
  components/
    Layout.tsx    Sidebar + top bar + content shell
    Sidebar.tsx   IDE-style activity-bar navigation
    TopBar.tsx    Ambient streak + today's goal progress
    GutterCard.tsx  The signature diff-gutter card component
    ui.tsx        Button, Input, Textarea, Select, EmptyState, Loader, ErrorNote
  pages/          One page per DevAgent feature
  types.ts        Types mirroring the backend's entities/DTOs
```

## Design language

DevAgent's visual identity is drawn from the tools developers already use:
git diffs, commit hashes, and GitHub's contribution graph — rather than
generic dashboard chrome.

- **Palette**: ink-navy background, amber accent (a nod to LeetCode's own
  "Medium" color), diff-green / diff-red for git-style status
- **Type**: Space Grotesk for headings, Inter for body/UI, JetBrains Mono for
  code and data
- **Signature element**: every card carries a thin colored gutter bar on its
  left edge (`.gutter-card` in `src/index.css`), like a git diff marker, plus
  a quiet monospace short-hash label. The Goals page renders a real
  contribution-style heatmap instead of a generic chart.
