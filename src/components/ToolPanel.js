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

  const statusBadge = (loaded, yesText, noText) => (
    <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
      loaded
        ? 'bg-[rgba(52,211,153,0.15)] text-success'
        : 'bg-[rgba(248,113,113,0.15)] text-danger'
    }`}>
      {loaded ? yesText : noText}
    </span>
  );

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[22px] font-bold mb-2">Tool Panel</h2>
        <p className="text-content-2 text-sm">Test individual tools and configure API keys. All APIs listed here are free to use.</p>
      </div>

      {/* API Key Settings */}
      <div className="bg-surface-2 border border-border rounded-app-lg p-5 mb-6">
        <h3 className="text-sm font-bold mb-3 text-content-2 tracking-wide">API KEYS</h3>

        <div className="flex items-center gap-3 py-2 text-[13px]">
          <span className="text-content-2 flex-1">LLM API Key</span>
          {statusBadge(llmKeyLoaded, '✓ Loaded from .env', '✗ Not set — add REACT_APP_LLM_API_KEY to .env')}
        </div>

        <div className="flex items-center gap-3 py-2 border-t border-border text-[13px]">
          <span className="text-content-2 flex-1">Provider</span>
          <select
            className="bg-surface-3 border border-border-strong text-content px-2 py-1 rounded-md text-xs font-mono outline-none focus:border-accent"
            value={llmProvider}
            onChange={e => { setLlmProvider(e.target.value); localStorage.setItem('llm_provider', e.target.value); }}
          >
            <option value="anthropic">Anthropic</option>
            <option value="ollama">Ollama (local)</option>
          </select>
          <span className="text-xs text-content-3 ml-2">
            Selected provider (also configurable via REACT_APP_LLM_PROVIDER in .env)
          </span>
        </div>

        <div className="text-[11px] text-content-3 pb-3">
          Set <code className="font-mono bg-white/[0.08] px-1 py-0.5 rounded">REACT_APP_LLM_API_KEY</code> in your <code className="font-mono bg-white/[0.08] px-1 py-0.5 rounded">.env</code> file. Restart the dev server after changes.
        </div>

        <div className="flex items-center gap-3 py-2 border-t border-border text-[13px]">
          <span className="text-content-2 flex-1">YouTube Data API v3</span>
          {statusBadge(youtubeKeyLoadedFromEnv, '✓ Loaded from .env', '✗ Not set in .env')}
        </div>

        <div className="text-[11px] text-content-3 pb-2">
          Add <code className="font-mono bg-white/[0.08] px-1 py-0.5 rounded">REACT_APP_YOUTUBE_API_KEY</code> to your <code className="font-mono bg-white/[0.08] px-1 py-0.5 rounded">.env</code> and restart the dev server to load it.
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-6">
        {TOOLS_INFO.map(tool => (
          <div key={tool.toolName} className="bg-surface-2 border border-border rounded-app-lg p-5 transition-colors hover:border-border-strong">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-app bg-surface-3 border border-border-strong flex items-center justify-center text-lg">
                {tool.icon}
              </div>
              <div className="text-[15px] font-bold">{tool.name}</div>
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border
                ${tool.badge === 'free'
                  ? 'bg-[rgba(52,211,153,0.12)] text-success border-[rgba(52,211,153,0.25)]'
                  : 'bg-[rgba(251,191,36,0.1)] text-warning border-[rgba(251,191,36,0.2)]' }`}>
                {tool.badge}
              </span>
            </div>

            <div className="text-[13px] text-content-2 leading-relaxed mb-3.5">{tool.desc}</div>

            {tool.apiUrl && (
              <div className="text-[11px] text-content-3 mb-2.5">
                <a href={tool.apiUrl} target="_blank" rel="noreferrer" className="text-accent-3 hover:underline">
                  {tool.apiUrl.replace('https://', '')}
                </a>
              </div>
            )}

            <button
              className="w-full bg-surface-3 border border-border-strong text-content px-3.5 py-2 rounded-app text-[13px] font-syne font-semibold cursor-pointer transition-all hover:border-accent hover:text-accent-3 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => runTool(tool.toolName, tool.demo)}
              disabled={loading[tool.toolName]}
            >
              {loading[tool.toolName] ? 'Running...' : '▶ Run Demo'}
            </button>

            {results[tool.toolName] && (
              <div className="bg-surface-3 border border-border rounded-app p-4 mt-3 text-[13px] leading-[1.7] text-content-2 whitespace-pre-wrap font-mono max-h-[200px] overflow-y-auto">
                {results[tool.toolName]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Setup Guide */}
      <div className="bg-surface-2 border border-border rounded-app-lg p-5 mb-6">
        <h3 className="text-sm font-bold mb-3 text-content-2 tracking-wide">QUICK SETUP GUIDE</h3>
        {([
          { step: '1', text: 'Add REACT_APP_LLM_API_KEY=<your-key> to the .env file at the project root, then restart npm start.' },
          { step: '2', text: 'Get a free YouTube API key at console.cloud.google.com → Enable YouTube Data API v3 → Create credentials.' },
          { step: '3', text: 'Paste your YouTube key above if you want a session override. Adding it to .env is preferred.' },
          { step: '4', text: 'Go to Agent Chat and ask anything — the agent uses tools automatically!' },
        ]).map(({ step, text }) => (
          <div key={step} className="flex items-start gap-4 py-2 border-t border-border first:border-t-0 text-[13px]">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5">
              {step}
            </div>
            <span className="text-content-2 leading-relaxed">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
