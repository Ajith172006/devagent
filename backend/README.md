# DevAgent

An AI-powered developer workspace API, built with **NestJS**. DevAgent brings
together the daily tools a programmer reaches for — a snippet library, an AI
debugger, a code explainer, a GitHub summary, a LeetCode tracker, daily coding
goals with streaks, a portfolio generator, and notes — behind one clean REST API.

## Stack

- **NestJS 10** (TypeScript, modular architecture)
- **TypeORM** with the pure-JS `sql.js` (SQLite/WASM) driver — no native
  build step, works anywhere Node runs
- **Google Gen AI SDK** for AI debugging and code explanations (Gemini)
- **GitHub REST API** (via native `fetch`) for profile/repo summaries
- `class-validator` / `class-transformer` for request validation

## Project layout

```
src/
  ai/            AI debugging + code explanation (Google Gemini API)
  github/        GitHub profile/repo summary integration
  goals/         Daily coding goals + streak tracking
  leetcode/      LeetCode problem tracker + stats
  notes/         Freeform notes
  portfolio/     Aggregates the above into a JSON or exportable HTML portfolio
  snippets/      Code snippet library
  app.module.ts  Wires everything together
  main.ts        Bootstraps the app (global prefix: /api)
```

Every feature module follows the same shape: `*.entity.ts` (if it persists
data), `dto/*.dto.ts` (validated request bodies), `*.service.ts` (business
logic), `*.controller.ts` (routes), `*.module.ts` (wiring).

## Getting started

```bash
npm install
cp .env.example .env
# edit .env and add GEMINI_API_KEY (required for /ai/*),
# optionally GITHUB_TOKEN (raises GitHub's rate limit from 60 to 5000/hr)

npm run start:dev
# DevAgent is running on http://localhost:3000/api
```

The SQLite database is a single file (`devagent.sqlite` by default,
configurable via `DATABASE_PATH`) that's created automatically on first run.

## API reference

All routes are prefixed with `/api`.

### Snippets — `/api/snippets`
| Method | Path | Description |
|---|---|---|
| POST | `/` | Create a snippet (`title`, `code`, `language`, `tags?`, `description?`) |
| GET | `/?language=&tag=&search=` | List/filter snippets |
| GET | `/:id` | Get one snippet |
| PATCH | `/:id` | Update a snippet |
| DELETE | `/:id` | Delete a snippet |

### AI — `/api/ai`
| Method | Path | Description |
|---|---|---|
| POST | `/debug` | Debug code (`code`, `language?`, `errorMessage?`, `context?`) → root cause, fix, explanation, prevention tip |
| POST | `/explain` | Explain code (`code`, `language?`, `level?: beginner\|intermediate\|expert`) |

Requires `GEMINI_API_KEY` in `.env`.

### GitHub — `/api/github`
| Method | Path | Description |
|---|---|---|
| GET | `/:username/profile` | Raw GitHub profile |
| GET | `/:username/repos?limit=` | Public repos, sorted by last updated |
| GET | `/:username/summary` | Profile + language breakdown + top starred repos |

### LeetCode tracker — `/api/leetcode`
| Method | Path | Description |
|---|---|---|
| POST | `/` | Log a problem (`title`, `difficulty: Easy\|Medium\|Hard`, `status?`, `url?`, `topics?`, `notes?`) |
| GET | `/?status=&difficulty=&topic=` | List/filter entries |
| GET | `/stats` | Solved/attempted counts by difficulty + top topics |
| GET | `/:id` | Get one entry |
| PATCH | `/:id` | Update an entry (auto-stamps `solvedAt` when status becomes `Solved`) |
| DELETE | `/:id` | Delete an entry |

### Daily coding goals — `/api/goals`
| Method | Path | Description |
|---|---|---|
| POST | `/` | Set/update the goal for a day (`date: YYYY-MM-DD`, `targetMinutes`, `focus?`) |
| GET | `/` | List all goals, most recent first |
| GET | `/streak` | Current streak, longest streak, total completed days |
| GET | `/:date` | Get the goal for a specific day |
| PUT | `/:date/progress` | Log minutes worked (`minutes`) — auto-completes once the target is hit |
| DELETE | `/:date` | Remove a day's goal |

### Notes — `/api/notes`
| Method | Path | Description |
|---|---|---|
| POST | `/` | Create a note (`title`, `content`, `tags?`, `pinned?`) |
| GET | `/?search=` | List notes, pinned first |
| GET | `/:id` | Get one note |
| PATCH | `/:id` | Update a note |
| DELETE | `/:id` | Delete a note |

### Portfolio — `/api/portfolio`
| Method | Path | Description |
|---|---|---|
| GET | `/?githubUsername=` | JSON portfolio data (GitHub summary + LeetCode stats + streak + featured snippets) |
| GET | `/export?githubUsername=&displayName=` | Self-contained, styled static HTML portfolio page — save the response as `.html` and open it, or host it anywhere |

## Notes on design choices

- **`sql.js` over `better-sqlite3`**: `better-sqlite3` requires a native
  compilation step (`node-gyp`) which needs to download Node headers from
  `nodejs.org`. In network-restricted environments that step fails, so
  DevAgent uses `sql.js`, a WASM build of SQLite with zero native
  dependencies, configured with `autoSave: true` so it still persists to a
  single file on disk.
- **GitHub calls are unauthenticated by default**: fine for light use (60
  req/hr per IP). Set `GITHUB_TOKEN` in `.env` to raise that to 5,000/hr.
- **AI endpoints fail fast with a clear error** if `GEMINI_API_KEY` isn't
  set, rather than silently returning nothing.
