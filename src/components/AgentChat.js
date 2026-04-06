import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { TOOLS, executeTool } from '../utils/tools';

const SYSTEM_PROMPT = `You are AgentAI — a helpful, intelligent agentic assistant. You have access to several tools:
- get_weather: real-time weather for any city (Open-Meteo, free)
- search_youtube: search YouTube videos
- get_country_info: detailed info about any country (RestCountries, free)
- get_exchange_rates: live currency exchange rates (open.er-api.com, free)
- calculate: evaluate math expressions
- get_random_fact: get an interesting fact by category

Be proactive: use tools when relevant without being asked. Chain multiple tool calls if needed.
Format responses clearly with markdown. Be concise but thorough.`;

export default function AgentChat({ conversation, onUpdate }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const apiKey = process.env.REACT_APP_LLM_API_KEY || '';
  const ytKey = process.env.REACT_APP_YOUTUBE_API_KEY || localStorage.getItem('youtube_key') || '';
  const llmProvider = process.env.REACT_APP_LLM_PROVIDER || localStorage.getItem('llm_provider') || 'anthropic';

  // Helper: call Ollama local HTTP API with a simple prompt built from the conversation
  const callOllama = async (messagesForPrompt) => {
    try {
      const ollamaUrl = process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434';
      const model = process.env.REACT_APP_OLLAMA_MODEL || process.env.REACT_APP_LLM_MODEL || 'llama3:latest';
      const apiKeyO = process.env.REACT_APP_OLLAMA_API_KEY || '';

      // Build a plain-text prompt from system + conversation
      let prompt = SYSTEM_PROMPT + '\n\n';
      for (const m of messagesForPrompt) {
        const text = typeof m.content === 'string'
          ? m.content
          : (Array.isArray(m.content) ? m.content.map(b => b.text || '').join('\n') : JSON.stringify(m.content));
        const role = m.role === 'assistant' ? 'Assistant' : 'User';
        prompt += `${role}: ${text}\n`;
      }

      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKeyO ? { 'Authorization': `Bearer ${apiKeyO}` } : {})
        },
        body: JSON.stringify({ model, prompt, max_tokens: 1024 })
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Ollama error: ${res.status} ${t}`);
      }

      // Try parsing JSON, fall back to raw text
      const txt = await res.text();
      try {
        const j = JSON.parse(txt);
        // Many Ollama responses include a text field or `content` fields; try commonly-used paths
        return j.text || j.response || (j.output && j.output[0] && (j.output[0].content || j.output[0].text)) || JSON.stringify(j);
      } catch (e) {
        return txt;
      }
    } catch (e) {
      throw e;
    }
  };

  const { messages } = conversation;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || loading) return;
    if (llmProvider === 'anthropic' && !apiKey) {
      alert('LLM API key is missing for Anthropic. Set REACT_APP_LLM_API_KEY in your .env file and restart the dev server, or switch provider to Ollama.');
      return;
    }

    const userMsg = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    onUpdate(newMessages);
    setInput('');
    setLoading(true);

    // ─── AGENTIC LOOP ───────────────────────────────────────────────────────
    let loopMessages = newMessages;
    let iteration = 0;
    const maxIterations = 10; // safety limit

    try {
      // If provider is Ollama, do a single prompt-style call and return its text
      if (llmProvider === 'ollama') {
        const assistantText = await callOllama(loopMessages);
        const assistantMsg = { role: 'assistant', content: assistantText };
        loopMessages = [...loopMessages, assistantMsg];
        onUpdate(loopMessages);
        setLoading(false);
        return;
      }

      // Default/legacy: Anthropic loop
      while (iteration < maxIterations) {
        iteration++;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-opus-4-5',
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: TOOLS,
            messages: loopMessages.map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'API error');

        const assistantMsg = { role: 'assistant', content: data.content };

        // Check for tool use (safely handle non-array content)
        const toolUseBlocks = Array.isArray(data.content) ? data.content.filter(b => b.type === 'tool_use') : [];

        if (toolUseBlocks.length === 0 || data.stop_reason === 'end_turn') {
          // Final answer — no more tools
          loopMessages = [...loopMessages, assistantMsg];
          onUpdate(loopMessages);
          break;
        }

        // Execute all tool calls
        const toolResults = [];
        for (const toolBlock of toolUseBlocks) {
          const result = await executeTool(
            toolBlock.name,
            toolBlock.input,
            { youtube: ytKey }
          );
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: JSON.stringify(result)
          });
        }

        // Add assistant message + tool results
        loopMessages = [
          ...loopMessages,
          assistantMsg,
          { role: 'user', content: toolResults }
        ];
        onUpdate(loopMessages);
      }
    } catch (e) {
      const errMsg = {
        role: 'assistant',
        content: [{ type: 'text', text: `**Error:** ${e.message}\n\nCheck your LLM provider configuration and API keys.` }]
      };
      onUpdate([...loopMessages, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, apiKey, ytKey, onUpdate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const suggestions = [
    "What's the weather in Tokyo right now?",
    "Search YouTube for LangChain tutorials",
    "Tell me about France — history, population, currency",
    "Convert 100 USD to EUR, GBP, and INR",
    "Give me a random science fact",
    "Calculate compound interest: 1000 * 1.07 ** 10"
  ];

  // Flatten messages for display
  const displayMessages = [];
  for (const msg of messages) {
    if (msg.role === 'user') {
      if (typeof msg.content === 'string') {
        displayMessages.push({ type: 'user', text: msg.content });
      }
      // Skip tool_result messages from display (they're internal)
    } else if (msg.role === 'assistant') {
      const blocks = Array.isArray(msg.content) ? msg.content : [{ type: 'text', text: msg.content }];
      const toolCalls = blocks.filter(b => b.type === 'tool_use');
      const textBlocks = blocks.filter(b => b.type === 'text');
      if (toolCalls.length > 0) {
        displayMessages.push({ type: 'tool_calls', calls: toolCalls });
      }
      if (textBlocks.length > 0) {
        displayMessages.push({ type: 'ai', text: textBlocks.map(b => b.text).join('\n') });
      }
    }
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {displayMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <div className="empty-title">AgentAI is ready</div>
            <div className="empty-desc">
              Ask anything. The agent can check weather, search YouTube, look up countries, convert currencies, do math, and more — all using free APIs.
            </div>
            <div className="suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="suggestion-btn" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          displayMessages.map((msg, i) => {
            if (msg.type === 'tool_calls') {
              return (
                <div key={i} style={{ paddingLeft: 44 }}>
                  {msg.calls.map((call, j) => (
                    <div key={j} className="tool-call">
                      <div className="tool-call-header">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                        Calling tool: {call.name}
                      </div>
                      <div className="tool-call-body">
                        {JSON.stringify(call.input, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            if (msg.type === 'user') {
              return (
                <div key={i} className="msg user">
                  <div className="avatar user">U</div>
                  <div className="bubble">{msg.text}</div>
                </div>
              );
            }
            return (
              <div key={i} className="msg ai">
                <div className="avatar ai">A</div>
                <div className="bubble">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            );
          })
        )}
        {loading && (
          <div className="msg ai">
            <div className="avatar ai">A</div>
            <div className="bubble">
              <div className="thinking">
                <span/><span/><span/>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Ask the agent anything… (Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div className="input-hint">
          Enter to send · Shift+Enter for new line · Agent will use tools automatically
        </div>
      </div>
    </div>
  );
}
