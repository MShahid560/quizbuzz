import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ArcadeGamePlayer() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const game = state?.game;

  useEffect(() => {
    if (!game) navigate('/games');
  }, [game, navigate]);

  if (!game) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0D0D1A',
      zIndex: 9999, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 16px', background: '#16213E',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', padding: '6px 14px', borderRadius: '8px',
          cursor: 'pointer', fontFamily: "'Fredoka One', cursive" }}>
          ← Back
        </button>
        {game.thumb && (
          <img src={game.thumb} alt={game.title}
            style={{ width: '32px', height: '32px',
              borderRadius: '6px', objectFit: 'cover' }}
            onError={e => e.target.style.display = 'none'}/>
        )}
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.1rem', flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' }}>{game.title}</div>
        <span style={{ background: 'rgba(255,214,10,0.15)',
          border: '1px solid rgba(255,214,10,0.3)',
          color: '#FFD60A', padding: '4px 10px',
          borderRadius: '6px', fontSize: '0.72rem',
          fontWeight: 800 }}>🎮 {game.category}</span>

        {/* Open in new tab button */}
        <a href={game.url} target="_blank" rel="noopener noreferrer"
          style={{ background: 'rgba(123,47,255,0.2)',
            border: '1px solid #7B2FFF', color: '#fff',
            padding: '6px 14px', borderRadius: '8px',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '0.82rem', textDecoration: 'none',
            whiteSpace: 'nowrap' }}>
          ↗ Full Screen
        </a>
      </div>

      {/* Game area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {loading && !iframeError && (
          <div style={{ position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0D0D1A', gap: '16px', zIndex: 1 }}>
            <div style={{ fontSize: '4rem',
              animation: 'spin 1s linear infinite' }}>🎮</div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.6)' }}>
              Loading {game.title}...
            </div>
          </div>
        )}

        {iframeError ? (
          /* Game blocked iframe — show open in new tab */
          <div style={{ position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0D0D1A', gap: '20px', padding: '20px' }}>
            {game.thumb && (
              <img src={game.thumb} alt={game.title}
                style={{ width: '180px', height: '135px',
                  borderRadius: '16px', objectFit: 'cover' }}/>
            )}
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.8rem' }}>{game.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)',
              textAlign: 'center', maxWidth: '360px',
              lineHeight: 1.6, fontSize: '0.9rem' }}>
              {game.description}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)',
              fontSize: '0.82rem' }}>
              This game opens in a new tab
            </div>
            <a href={game.url} target="_blank"
              rel="noopener noreferrer" style={{
              background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
              border: 'none', color: '#fff', padding: '16px 36px',
              borderRadius: '16px',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              🎮 Play {game.title} →
            </a>
            <button onClick={() => navigate('/games')} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)', padding: '10px 24px',
              borderRadius: '10px', cursor: 'pointer',
              fontFamily: "'Fredoka One', cursive" }}>
              ← Back to Games
            </button>
          </div>
        ) : (
          <iframe src={game.url} title={game.title}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setIframeError(true); }}
            style={{ width: '100%', height: '100%', border: 'none',
              opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}
            allow="fullscreen; autoplay"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}