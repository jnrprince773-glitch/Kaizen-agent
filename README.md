# Nery

Nery is a mobile-first engineering cockpit for one developer: inspect first, make the smallest safe change, verify what actually happened, and leave the codebase better.

## What is included

- Mobile-first PWA shell
- Server-side AI chat route using Vercel AI Gateway's OpenAI-compatible API
- Nery engineering system prompt and operating contract
- Local audit ledger for visible work history
- Health endpoint
- Offline app shell via service worker
- No secrets or API keys committed

## Runtime

Nery sends chat requests from the browser to `/api/chat`. The API route keeps the AI Gateway credential server-side.

Set:

```bash
AI_GATEWAY_API_KEY=...
NERY_MODEL=openai/gpt-5.6-sol
```

The gateway base URL defaults to:

```
https://ai-gateway.vercel.sh/v1
```

## Local development

This repository is intentionally dependency-light. It can be deployed directly to Vercel.

For local Vercel development:

```bash
npm i -g vercel
vercel dev
```

Never place `AI_GATEWAY_API_KEY` in frontend code.

## Engineering workflow

`feat/*` or `fix/*` → pull request → `main`

Nery does not merge pull requests, force-push, rewrite history, or perform destructive database operations without explicit approval.

## Current scope

The first version is the Nery cockpit and AI interface. Direct GitHub/database mutation adapters are deliberately not included yet; adding those requires explicit permission design, least-privilege credentials, and auditable tool boundaries.

## Vercel

The chat route uses Vercel's documented OpenAI-compatible AI Gateway endpoint: `https://ai-gateway.vercel.sh/v1`.
