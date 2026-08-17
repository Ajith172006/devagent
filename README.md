# DevAgent

An AI-powered developer workspace: code snippets, AI debugging, code
explanations, GitHub integration, a LeetCode tracker, daily coding goals with
streaks, a portfolio generator, and notes.

```
devagent-fullstack/
  backend/    Java 21 + Spring Boot 3 + Spring Data JPA (PostgreSQL / SQL)
  frontend/   React 19 + TypeScript + Tailwind UI + Vite
```

## Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Java 21, Spring Boot 3, Spring Data JPA, Spring Security
- **Database**: PostgreSQL / H2 SQL

## Run it

Two terminals:

```bash
# terminal 1 — Spring Boot API on :8080 (context-path: /api)
cd backend
./mvnw spring-boot:run

# terminal 2 — React UI on :5173 (proxies /api to :8080)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

