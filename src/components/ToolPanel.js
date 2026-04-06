import React, { useState } from 'react';
import { executeTool } from '../utils/tools';

const TOOLS_INFO = [
  {
    name: 'Weather Lookup',
    icon: '🌤',
    badge: 'free',
    desc: 'Real-time weather for any city using Open-Meteo API. No API key needed — completely free and unlimited.',
    apiUrl: 'https://open-meteo.com',
    toolName: 'get_weather',
    demo: { city: 'London' }
  },
  {
    name: 'YouTube Search',
    icon: '▶',
    badge: 'free',
    desc: "Search YouTube using Google's YouTube Data API v3. Free tier: 10,000 units/day. Requires API key.",
    apiUrl: 'https://console.cloud.google.com',
    toolName: 'search_youtube',
    demo: { query: 'agentic AI tutorial', max_results: 3 }
  },
  {
    name: 'Country Info',
    icon: '🌍',
    badge: 'free',
    desc: 'Detailed country data — population, languages, currencies — via RestCountries API. No key needed.',
    apiUrl: 'https://restcountries.com',
    toolName: 'get_country_info',
    demo: { country: 'Japan' }
  },
  {
    name: 'Exchange Rates',
    icon: '💱',
    badge: 'free',
    desc: 'Live currency exchange rates via Open Exchange Rates API. Free tier: 1,500 req/month. No key needed.',
    apiUrl: 'https://open.er-api.com',
    toolName: 'get_exchange_rates',
    demo: { base: 'USD', targets: ['EUR', 'GBP', 'JPY', 'INR'] }
  },
  {
    name: 'Calculator',
    icon: '🔢',
    badge: 'free',
    desc: 'Safe evaluation of math expressions. No API needed — runs locally in your browser.',
    toolName: 'calculate',
    demo: { expression: '1000 * 1.07 ** 10' }
  },
  {
    name: 'Random Facts',
    icon: '💡',
    badge: 'free',
    desc: 'Interesting facts across categories: science, history, geography, animals. Local database, no API.',
    toolName: 'get_random_fact',
    demo: { category: 'science' }
  }
];

export default function ToolPanel() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [youtubeKey, setYoutubeKey] = useState(process.env.REACT_APP_YOUTUBE_API_KEY || localStorage.getItem('youtube_key') || '');
  const llmKeyLoaded = Boolean(process.env.REACT_APP_LLM_API_KEY);
  const youtubeKeyLoadedFromEnv = Boolean(process.env.REACT_APP_YOUTUBE_API_KEY);
  const providerInit = process.env.REACT_APP_LLM_PROVIDER || localStorage.getItem('llm_provider') || 'anthropic';
  const [llmProvider, setLlmProvider] = useState(providerInit);

  const runTool = async (toolName, demo) => {
    setLoading(l => ({ ...l, [toolName]: true }));
    setResults(r => ({ ...r, [toolName]: null }));
    const ytKey = process.env.REACT_APP_YOUTUBE_API_KEY || youtubeKey || '';
    const result = await executeTool(toolName, demo, { youtube: ytKey });
    setResults(r => ({ ...r, [toolName]: JSON.stringify(result, null, 2) }));
    setLoading(l => ({ ...l, [toolName]: false }));
  };

  return (
    <div className="tools-container">
      <div className="tools-header">
        <h2>Tool Panel</h2>
        <p>Test individual tools and configure API keys. All APIs listed here are free to use.</p>
      </div>

      {/* API KEY SETTINGS */}
      <div className="api-info">
        <h3>API KEYS</h3>

        <div className="api-row" style={{ marginBottom: 8 }}>
          <span className="api-key">LLM API Key</span>
          <span style={{
            fontSize: 12,
            padding: '3px 10px',
            borderRadius: 6,
            background: llmKeyLoaded ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            color: llmKeyLoaded ? '#34d399' : '#f87171',
            fontWeight: 600
          }}>
            {llmKeyLoaded ? '✓ Loaded from .env' : '✗ Not set — add REACT_APP_LLM_API_KEY to .env'}
          </span>
        </div>
        <div className="api-row" style={{ alignItems: 'center', gap: 12 }}>
          <span className="api-key">Provider</span>
          <select value={llmProvider} onChange={e => { setLlmProvider(e.target.value); localStorage.setItem('llm_provider', e.target.value); }}>
            <option value="anthropic">Anthropic</option>
            <option value="ollama">Ollama (local)</option>
          </select>
          <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>
            Selected provider (also configurable via REACT_APP_LLM_PROVIDER in .env)
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', paddingBottom: 12 }}>
          Set <code>REACT_APP_LLM_API_KEY</code> in your <code>.env</code> file. Restart the dev server after changes.
          To switch providers, just update the value — no code changes needed.
        </div>

        <div className="api-row" style={{ alignItems: 'center', gap: 12 }}>
          <span className="api-key">YouTube Data API v3</span>
          
          <span style={{
            fontSize: 12,
            padding: '3px 10px',
            borderRadius: 6,
            background: youtubeKeyLoadedFromEnv ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            color: youtubeKeyLoadedFromEnv ? '#34d399' : '#f87171',
            fontWeight: 600
          }}>{youtubeKeyLoadedFromEnv ? '✓ Loaded from .env' : '✗ Not set in .env'}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', paddingBottom: 8 }}>
          Add <code>REACT_APP_YOUTUBE_API_KEY</code> to your <code>.env</code> and restart the dev server to load it. The input above is a session override only.
        </div>
      </div>

      {/* TOOLS GRID */}
      <div className="tools-grid">
        {TOOLS_INFO.map(tool => (
          <div key={tool.toolName} className="tool-card">
            <div className="tool-card-header">
              <div className="tool-icon">{tool.icon}</div>
              <div>
                <div className="tool-name">{tool.name}</div>
              </div>
              <span className={`tool-badge ${tool.badge}`}>{tool.badge}</span>
            </div>
            <div className="tool-desc">{tool.desc}</div>
            {tool.apiUrl && (
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                <a href={tool.apiUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent3)' }}>
                  {tool.apiUrl.replace('https://', '')}
                </a>
              </div>
            )}
            <button
              className="tool-run-btn"
              onClick={() => runTool(tool.toolName, tool.demo)}
              disabled={loading[tool.toolName]}
            >
              {loading[tool.toolName] ? 'Running...' : '▶ Run Demo'}
            </button>
            {results[tool.toolName] && (
              <div className="tool-result">{results[tool.toolName]}</div>
            )}
          </div>
        ))}
      </div>

      {/* SETUP GUIDE */}
      <div className="api-info">
        <h3>QUICK SETUP GUIDE</h3>
        {[
          { step: '1', text: 'Add REACT_APP_LLM_API_KEY=<your-key> to the .env file at the project root, then restart npm start.', key: 'LLM' },
          { step: '2', text: 'Get a free YouTube API key at console.cloud.google.com → Enable YouTube Data API v3 → Create credentials.', key: 'YouTube' },
          { step: '3', text: 'Paste your YouTube key above if you want a session override. Adding it to .env is preferred.', key: null },
          { step: '4', text: 'Go to Agent Chat and ask anything — the agent uses tools automatically!', key: null },
        ].map(({ step, text }) => (
          <div key={step} className="api-row" style={{ alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 1
            }}>{step}</div>
            <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
