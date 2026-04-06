import React, { useState } from 'react';

export default function YouTubeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY || localStorage.getItem('youtube_key') || '';
    if (!apiKey) {
      setError('Add your free YouTube Data API v3 key in .env as REACT_APP_YOUTUBE_API_KEY or in Tool Panel → Settings. Get one free at console.cloud.google.com');
      return;
    }
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=12&type=video&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) { setError(data.error.message); return; }
      setResults(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') search(); };

  const demoVideos = [
    { id: { videoId: 'sal78ACtGTc' }, snippet: { title: 'Agentic AI Explained — Build Your First Agent', channelTitle: 'AI Engineering', thumbnails: { medium: { url: 'https://img.youtube.com/vi/sal78ACtGTc/mqdefault.jpg' } } } },
    { id: { videoId: 'aywZrzNaKjs' }, snippet: { title: 'LangChain Full Course for Beginners', channelTitle: 'freeCodeCamp', thumbnails: { medium: { url: 'https://img.youtube.com/vi/aywZrzNaKjs/mqdefault.jpg' } } } },
    { id: { videoId: 'PuqBpvHH-qw' }, snippet: { title: 'AutoGPT: Autonomous AI Agents Explained', channelTitle: 'Fireship', thumbnails: { medium: { url: 'https://img.youtube.com/vi/PuqBpvHH-qw/mqdefault.jpg' } } } },
    { id: { videoId: 'e1bTBhBPd7s' }, snippet: { title: 'React Tutorial for Beginners 2024', channelTitle: 'Programming with Mosh', thumbnails: { medium: { url: 'https://img.youtube.com/vi/e1bTBhBPd7s/mqdefault.jpg' } } } },
    { id: { videoId: 'RGOj5yH7evk' }, snippet: { title: 'Git and GitHub for Beginners', channelTitle: 'freeCodeCamp', thumbnails: { medium: { url: 'https://img.youtube.com/vi/RGOj5yH7evk/mqdefault.jpg' } } } },
    { id: { videoId: 'aircAruvnKk' }, snippet: { title: 'But what is a neural network?', channelTitle: '3Blue1Brown', thumbnails: { medium: { url: 'https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg' } } } },
  ];

  const showResults = results.length > 0 ? results : demoVideos;
  const isDemo = results.length === 0;

  return (
    <div className="yt-container">
      <div className="yt-header">
        <h2>YouTube Search</h2>
        <p>Search YouTube videos directly — powered by YouTube Data API v3 (free, 10,000 units/day)</p>
      </div>

      <div className="yt-search-row">
        <input
          className="yt-input"
          placeholder="Search YouTube videos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="yt-btn" onClick={search} disabled={loading}>
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 1s linear infinite'}}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Search
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          fontSize: 13, color: 'var(--red)', lineHeight: 1.6
        }}>
          {error}
        </div>
      )}

      {isDemo && !error && (
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
          Showing demo videos. Add your YouTube API key in .env (`REACT_APP_YOUTUBE_API_KEY`) or the Tool Panel to search live.
        </div>
      )}

      <div className="video-grid">
        {showResults.map((item, i) => (
          <div key={i} className="video-card" onClick={() => setSelected(item)}>
            <img
              className="video-thumb"
              src={item.snippet.thumbnails.medium.url}
              alt={item.snippet.title}
              onError={e => { e.target.src = `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`; }}
            />
            <div className="video-info">
              <div className="video-title">{item.snippet.title}</div>
              <div className="video-channel">{item.snippet.channelTitle}</div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="video-player-wrap" onClick={() => setSelected(null)}>
          <div className="video-player-inner" onClick={e => e.stopPropagation()}>
            <div className="video-player-header">
              <div className="video-player-title">{selected.snippet.title}</div>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <iframe
              className="video-iframe"
              src={`https://www.youtube.com/embed/${selected.id.videoId}?autoplay=1`}
              title={selected.snippet.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
