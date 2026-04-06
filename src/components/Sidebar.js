import React from 'react';

export default function Sidebar({ open, conversations, activeId, onSelect, onNew }) {
  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">Conversations</span>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{conversations.length}</span>
      </div>
      <button className="new-btn" onClick={onNew}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Chat
      </button>
      <div className="conv-list">
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`conv-item ${conv.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            {conv.title}
          </div>
        ))}
      </div>
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text3)',
        lineHeight: 1.6
      }}>
        <div style={{ marginBottom: 4, fontWeight: 600, color: 'var(--text2)' }}>Free APIs Used</div>
        <div>• Anthropic Claude (claude.ai key)</div>
        <div>• YouTube Data v3 (Google)</div>
        <div>• Open-Meteo Weather</div>
        <div>• RestCountries</div>
        <div>• ExchangeRate API</div>
      </div>
    </div>
  );
}
