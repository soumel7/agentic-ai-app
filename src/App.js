import React, { useState } from 'react';
import AgentChat from './components/AgentChat';
import Sidebar from './components/Sidebar';
import YouTubeSearch from './components/YouTubeSearch';
import ToolPanel from './components/ToolPanel';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [conversations, setConversations] = useState([
    { id: '1', title: 'New Conversation', messages: [], createdAt: new Date() }
  ]);
  const [activeConvId, setActiveConvId] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const updateMessages = (convId, messages) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        const firstUserMsg = messages.find(m => m.role === 'user');
        const title = firstUserMsg
          ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '')
          : c.title;
        return { ...c, messages, title };
      })
    );
  };

  const newConversation = () => {
    const id = Date.now().toString();
    setConversations(prev => [
      { id, title: 'New Conversation', messages: [], createdAt: new Date() },
      ...prev
    ]);
    setActiveConvId(id);
    setActiveTab('chat');
  };

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        conversations={conversations}
        activeId={activeConvId}
        onSelect={id => { setActiveConvId(id); setActiveTab('chat'); }}
        onNew={newConversation}
      />
      <div className={`main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="brand">
            <div className="brand-dot"></div>
            <span>JARVIS</span>
          </div>
          <nav className="tabs">
            {[
              { key: 'chat', label: 'Agent Chat' },
              { key: 'youtube', label: 'YouTube Search' },
              { key: 'tools', label: 'Tool Panel' },
            ].map(t => (
              <button
                key={t.key}
                className={`tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="status-badge">
            <span className="status-dot"></span>
            Free APIs
          </div>
        </header>

        <div className="content">
          {activeTab === 'chat' && activeConv && (
            <AgentChat
              conversation={activeConv}
              onUpdate={(msgs) => updateMessages(activeConvId, msgs)}
            />
          )}
          {activeTab === 'youtube' && <YouTubeSearch />}
          {activeTab === 'tools' && <ToolPanel />}
        </div>
      </div>
    </div>
  );
}
