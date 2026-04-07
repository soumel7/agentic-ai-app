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
    <div className="p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[22px] font-bold mb-2">YouTube Search</h2>
        <p className="text-content-2 text-sm">Search YouTube videos directly — powered by YouTube Data API v3 (free, 10,000 units/day)</p>
      </div>

      {/* Search Row */}
      <div className="flex gap-2.5 mb-6">
        <input
          className="flex-1 bg-surface-2 border border-border-strong text-content px-4 py-2.5 rounded-app text-sm font-syne outline-none transition-colors focus:border-accent placeholder:text-content-3"
          placeholder="Search YouTube videos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          className="bg-accent border-none text-white px-5 py-2.5 rounded-app text-sm font-syne font-semibold cursor-pointer flex items-center gap-2 transition-colors hover:bg-accent-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={search}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
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

      {/* Error */}
      {error && (
        <div className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.25)] rounded-app p-3 px-4 mb-4 text-[13px] text-danger leading-relaxed">
          {error}
        </div>
      )}

      {/* Demo notice */}
      {isDemo && !error && (
        <div className="text-xs text-content-3 mb-4">
          Showing demo videos. Add your YouTube API key in .env (`REACT_APP_YOUTUBE_API_KEY`) or the Tool Panel to search live.
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {showResults.map((item, i) => (
          <div
            key={i}
            className="bg-surface-2 border border-border rounded-app-lg overflow-hidden cursor-pointer transition-all hover:border-border-strong hover:-translate-y-0.5"
            onClick={() => setSelected(item)}
          >
            <img
              className="w-full aspect-video object-cover block"
              src={item.snippet.thumbnails.medium.url}
              alt={item.snippet.title}
              onError={e => { e.target.src = `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`; }}
            />
            <div className="p-3">
              <div className="text-[13px] font-semibold mb-1.5 leading-snug line-clamp-2">
                {item.snippet.title}
              </div>
              <div className="text-xs text-content-2">{item.snippet.channelTitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999]"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-[90vw] max-w-[900px] bg-surface-2 rounded-app-lg overflow-hidden border border-border-strong"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="text-sm font-semibold">{selected.snippet.title}</div>
              <button
                className="bg-transparent border-none text-content-2 cursor-pointer text-xl leading-none px-2 py-1 rounded-md hover:text-content hover:bg-surface-3"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>
            <iframe
              className="w-full aspect-video block border-none"
              src={`https://www.youtube.com/embed/${selected.id.videoId}?autoplay=1`}
              title={selected.snippet.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
