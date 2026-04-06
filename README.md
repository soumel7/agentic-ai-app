# ⚡ AgentAI — Full Agentic AI App with Free APIs

A complete, production-ready **Agentic AI** application built with React that uses Claude's tool-use API to autonomously call real APIs. Everything is **100% free**.

---

## 🚀 Features

- **Agentic Loop** — Claude autonomously decides when to call tools and chains multiple calls
- **6 Live Tools** — weather, YouTube search, country info, currency rates, calculator, facts
- **YouTube Search & Playback** — search and watch videos inline
- **Multi-conversation Sidebar** — track multiple chat sessions
- **Tool Panel** — test each tool individually, manage API keys
- **Dark theme** — beautiful dark UI with Syne font

---

## 🆓 Free APIs Used

| API | Purpose | Limit | Key Required |
|-----|---------|-------|-------------|
| **Anthropic Claude** | AI agent brain | $5 free credit | ✅ Yes |
| **Open-Meteo** | Weather data | Unlimited | ❌ No |
| **YouTube Data API v3** | Video search | 10,000 units/day | ✅ Yes (free) |
| **RestCountries** | Country info | Unlimited | ❌ No |
| **open.er-api.com** | Exchange rates | 1,500 req/month | ❌ No |
| **Local JS** | Calculator + Facts | Unlimited | ❌ No |

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Get free API keys

**Anthropic (required for agent):**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up → API Keys → Create Key
3. New accounts get $5 free credit

**YouTube (optional, for live search):**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → Enable "YouTube Data API v3"
3. Credentials → Create credentials → API key
4. Free: 10,000 units/day

### 3. Run the app
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Add API keys in the app
- Click **Tool Panel** tab
- Enter your Anthropic and YouTube keys
- Click **Save Keys** (stored in localStorage, never sent anywhere)

---

## 🏗️ Architecture

```
src/
├── App.js              # Root layout + routing
├── App.css             # Global dark theme styles
├── components/
│   ├── AgentChat.js    # Agentic loop + chat UI
│   ├── Sidebar.js      # Conversation list
│   ├── YouTubeSearch.js # Video search + player
│   └── ToolPanel.js    # Tool tester + API settings
└── utils/
    └── tools.js        # Tool definitions + executors
```

### The Agentic Loop (in `AgentChat.js`)

```
User message
    ↓
Call Claude API with tools
    ↓
Claude returns tool_use blocks?
    ├── YES → Execute tools → Feed results back → Loop
    └── NO  → Return final answer to user
```

Claude autonomously:
- Decides **which tools** to call
- Passes the **right arguments**
- **Chains** multiple tool calls
- Formats a **final answer** from tool results

---

## 💬 Example Queries

- *"What's the weather in Tokyo and convert 100 JPY to USD?"* → chains weather + exchange rate tools
- *"Find YouTube videos about LangChain and tell me about the US"* → chains YouTube + country tools
- *"Give me a science fact and calculate 1000 * 1.08 ** 20"* → chains facts + calculator
- *"What's the capital of Brazil and what languages do they speak?"* → country info tool

---

## 🛠️ Adding More Tools

1. Add tool definition to `TOOLS` array in `utils/tools.js`
2. Add executor function
3. Add case to `executeTool` switch
4. Claude will use it automatically!

---

## 📦 Dependencies

All free and open source:
- `react` + `react-dom` — UI framework
- `react-markdown` — render markdown in chat
- `lucide-react` — icons
- `uuid` — conversation IDs

---

## 🔐 Privacy

API keys are stored only in your browser's `localStorage`. They are never sent to any server other than the respective API providers (Anthropic, Google YouTube).
