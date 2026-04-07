import React from 'react';

export default function Sidebar({ open, conversations, activeId, onSelect, onNew }) {
  return (
    <div className={`fixed top-0 left-0 w-[260px] h-screen bg-surface-2 border-r border-border flex flex-col z-[100] transition-transform duration-[250ms] ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <span className="text-[13px] font-semibold text-content-2 tracking-wider uppercase">
          Conversations
        </span>
        <span className="text-xs text-content-3">{conversations.length}</span>
      </div>

      {/* New Chat Button */}
      <button
        className="flex items-center gap-2 bg-accent text-white border-none rounded-app px-3 py-2 text-[13px] font-syne font-semibold cursor-pointer mx-4 mt-3 mb-2 transition-colors hover:bg-accent-2"
        onClick={onNew}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Chat
      </button>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`px-3 py-2.5 rounded-app cursor-pointer text-[13px] transition-all whitespace-nowrap overflow-hidden text-ellipsis mb-0.5
              ${conv.id === activeId
                ? 'bg-surface-4 text-accent-3'
                : 'text-content-2 hover:bg-surface-3 hover:text-content'}`}
            onClick={() => onSelect(conv.id)}
          >
            {conv.title}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border text-[11px] text-content-3 leading-relaxed">
        <div className="mb-1 font-semibold text-content-2">Free APIs Used</div>
        <div>• Anthropic Claude (claude.ai key)</div>
        <div>• YouTube Data v3 (Google)</div>
        <div>• Open-Meteo Weather</div>
        <div>• RestCountries</div>
        <div>• ExchangeRate API</div>
      </div>
    </div>
  );
}
