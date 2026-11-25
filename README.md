# Aster — AI chat app (React + Express + OpenAI Responses API)

1. `cd backend && cp .env.example .env` → set `OPENAI_API_KEY`, then `npm install && npm run dev` (port 8787)
2. `cd frontend && npm install && npm run dev` (port 5173, proxies /api to the backend)

Optional: `WEB_SEARCH=true` enables OpenAI's built-in web search tool (the toggle only appears when enabled).
Chats are stored in the browser (localStorage). MongoDB persistence and real accounts are not included yet.
