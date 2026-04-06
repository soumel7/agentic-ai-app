# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start       # Dev server at localhost:3000
npm run build   # Production build to /build
```

No test or lint scripts are configured.

## Architecture

This is a Create React App (React 18) frontend-only app that communicates directly with external APIs from the browser. There is no backend server.

### Core Pattern: Agentic Loop

The central feature lives in `src/components/AgentChat.js`. It implements a recursive tool-use loop:

1. User message → Claude API (`claude-opus-4-5`, max 4096 tokens)
2. If response contains `tool_use` blocks → execute tools → append `tool_result` → repeat
3. Loop capped at 10 iterations, then return final text response

The conversation history is maintained as a flat `messages` array that includes both assistant tool calls and tool results, as required by the Anthropic Messages API.

### State & Navigation

`src/App.js` owns global state: multiple named conversations (`conversations` array), the active conversation ID, and the active tab (`agentchat` | `youtube` | `toolpanel`). Conversation history persists in React state only (lost on page refresh — no persistence to localStorage or backend).

### Tools

`src/utils/tools.js` exports:
- `toolDefinitions` — Anthropic-format tool schemas passed in every API call
- `executeTool(name, input)` — dispatcher that calls the appropriate tool function

Six tools are available: `get_weather` (Open-Meteo, free), `search_youtube` (YouTube Data API v3, needs key), `get_country_info` (RestCountries, free), `get_exchange_rates` (open.er-api.com, free tier), `calculate` (local JS eval), `get_random_fact` (local data).

### API Keys

API keys are entered via the Tool Panel UI and stored in `localStorage` under keys like `anthropic_api_key` and `youtube_api_key`. They are read directly in component code via `localStorage.getItem(...)`. No environment variable is required at runtime — the `.env.example` file shows optional alternatives.

### Styling

Dark theme via CSS custom properties in `src/App.css`. Primary accent: `#7c6fff`. Fonts: Syne (UI) and JetBrains Mono (code) loaded from Google Fonts in `public/index.html`.
