import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const hostname = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ─── Our Own Games ───────────────────────────────────────────
const regularGames = [
  { id: 'word-scramble',   title: 'Word Scramble',   icon: '🔤',
    desc: 'Unscramble the jumbled word!',
    color: '#7B2FFF', color2: '#FF3D9A', badge: 'Word' },
  { id: 'memory-flip',     title: 'Memory Flip',     icon: '🃏',
    desc: 'Match all card pairs!',
    color: '#00B4FF', color2: '#06D6A0', badge: 'Memory' },
  { id: 'math-challenge',  title: 'Math Challenge',  icon: '🧮',
    desc: 'Solve math problems fast!',
    color: '#FF6B35', color2: '#FFD60A', badge: 'Math' },
  { id: 'hangman',         title: 'Hangman',         icon: '🎯',
    desc: 'Guess the hidden word!',
    color: '#FF3D9A', color2: '#7B2FFF', badge: 'Word' },
  { id: 'speed-round',     title: 'Speed Round',     icon: '⚡',
    desc: '5 seconds per question!',
    color: '#FF4757', color2: '#FF6B35', badge: '🔥 Quiz' },
  { id: 'survival',        title: 'Survival Mode',   icon: '💀',
    desc: 'One wrong = Game Over!',
    color: '#2C3E50', color2: '#FF4757', badge: '💀 Hard' },
  { id: 'flag-quiz',       title: 'Flag Quiz',       icon: '🏳️',
    desc: 'Guess the country from its flag!',
    color: '#06D6A0', color2: '#00B4FF', badge: 'Geo' },
  { id: 'type-the-word',   title: 'Type The Word',   icon: '⌨️',
    desc: 'Type falling words fast!',
    color: '#7B2FFF', color2: '#00B4FF', badge: 'Typing' },
  { id: 'true-or-false',   title: 'True or False',   icon: '✅',
    desc: 'Rapid fire true or false!',
    color: '#06D6A0', color2: '#FFD60A', badge: 'Quiz' },
  { id: 'number-sequence', title: 'Number Sequence', icon: '🔢',
    desc: 'Find the missing number!',
    color: '#FF6B35', color2: '#7B2FFF', badge: 'Logic' },
];

const kidsGames = [
  { id: 'image-puzzle',  title: 'Image Puzzle',  icon: '🧩',
    color: '#FF6B35', color2: '#FFD60A', badge: '🧒 Kids' },
  { id: 'tic-tac-toe',  title: 'Tic Tac Toe',   icon: '❌',
    color: '#7B2FFF', color2: '#FF3D9A', badge: '🧒 Kids' },
  { id: 'color-match',  title: 'Color Match',   icon: '🎨',
    color: '#FF3D9A', color2: '#FF6B35', badge: '🧒 Kids' },
  { id: 'animal-sounds',title: 'Animal Sounds', icon: '🐾',
    color: '#06D6A0', color2: '#00B4FF', badge: '🧒 Kids' },
  { id: 'kids-math',    title: 'Kids Math',     icon: '➕',
    color: '#FFD60A', color2: '#FF6B35', badge: '🧒 Kids' },
  { id: 'balloon-pop',  title: 'Balloon Pop',   icon: '🎈',
    color: '#FF4757', color2: '#FF3D9A', badge: '🧒 Kids' },
  { id: 'galaxy-shooter',title: 'Galaxy Shooter',icon: '🚀',
    color: '#0D0D1A', color2: '#7B2FFF', badge: '🧒 Kids' },
];

const ARCADE_CATS = [
  { id: '',           label: '🔥 All',        color: '#FF4757' },
  { id: 'shooter',    label: '🔫 Shooter',    color: '#FF6B35' },
  { id: 'mmorpg',     label: '⚔️ MMORPG',    color: '#7B2FFF' },
  { id: 'strategy',   label: '♟️ Strategy',   color: '#00B4FF' },
  { id: 'puzzle',     label: '🧩 Puzzle',     color: '#06D6A0' },
  { id: 'racing',     label: '🏎️ Racing',    color: '#FFD60A' },
  { id: 'Geography',  label: '🌍 Geography',  color: '#FF3D9A' },
  { id: 'Math',       label: '🧮 Math',       color: '#FF6B35' },
  { id: 'Typing',     label: '⌨️ Typing',    color: '#7B2FFF' },
  { id: '3D Shooter', label: '🎯 3D Games',   color: '#FF4757' },
  { id: 'Drawing',    label: '🎨 Drawing',    color: '#06D6A0' },
];


// ─── Small game card (like games.co.uk thumbnail) ────────────
const ArcadeCard = ({ game, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onClick(game)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: 'pointer', borderRadius: '12px',
        overflow: 'hidden', position: 'relative',
        transform: hov ? 'translateY(-3px) scale(1.03)' : 'none',
        transition: 'all 0.2s ease',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
        background: '#16213E',
        border: hov ? '1px solid #7B2FFF'
          : '1px solid rgba(255,255,255,0.06)' }}>

      {/* Thumbnail */}
      <div style={{ position: 'relative', paddingTop: '75%',
        background: '#0D0D2A', overflow: 'hidden' }}>
        {game.thumb ? (
          <img src={game.thumb} alt={game.title}
            style={{ position: 'absolute', inset: 0, width: '100%',
              height: '100%', objectFit: 'cover',
              transition: 'transform 0.3s',
              transform: hov ? 'scale(1.08)' : 'scale(1)' }}/>
        ) : (
          <div style={{ position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2.5rem',
            background: 'linear-gradient(135deg,#16213E,#0D0D1A)' }}>
            🎮
          </div>
        )}

        {/* Play overlay on hover */}
        {hov && (
          <div style={{ position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center' }}>
            <div style={{ background: '#7B2FFF', borderRadius: '50%',
              width: '44px', height: '44px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.2rem' }}>
              ▶
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700,
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: hov ? '#fff' : 'rgba(255,255,255,0.85)' }}>
          {game.title}
        </div>
      </div>
    </div>
  );
};

// ─── Our game card ────────────────────────────────────────────
const OurGameCard = ({ game, hovered, setHovered, navigate }) => (
  <div onClick={() => navigate(`/games/${game.id}`)}
    onMouseEnter={() => setHovered(game.id)}
    onMouseLeave={() => setHovered(null)}
    style={{ background: '#16213E', borderRadius: '16px',
      border: `1px solid ${hovered === game.id
        ? game.color : 'rgba(255,255,255,0.08)'}`,
      cursor: 'pointer', overflow: 'hidden',
      transform: hovered === game.id
        ? 'translateY(-4px) scale(1.02)' : 'none',
      transition: 'all 0.25s ease',
      boxShadow: hovered === game.id
        ? `0 12px 40px ${game.color}44` : 'none' }}>
    <div style={{ background:
      `linear-gradient(135deg, ${game.color}, ${game.color2})`,
      padding: '20px', textAlign: 'center',
      position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px',
        width: '70px', height: '70px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)' }}/>
      <div style={{ fontSize: '2.5rem',
        position: 'relative' }}>{game.icon}</div>
    </div>
    <div style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.1rem' }}>{game.title}</div>
        <span style={{ fontSize: '0.6rem', fontWeight: 800,
          background: `${game.color}33`,
          border: `1px solid ${game.color}66`,
          color: game.color, padding: '2px 7px',
          borderRadius: '50px' }}>{game.badge}</span>
      </div>
      {game.desc && (
        <div style={{ color: 'rgba(255,255,255,0.45)',
          fontSize: '0.78rem', marginBottom: '12px',
          lineHeight: 1.4 }}>{game.desc}</div>
      )}
      <button style={{ width: '100%',
        background: `linear-gradient(135deg, ${game.color}, ${game.color2})`,
        border: 'none', color: '#fff', padding: '9px',
        borderRadius: '9px',
        fontFamily: "'Fredoka One', cursive",
        fontSize: '0.88rem', cursor: 'pointer' }}>
        🎮 Play Now
      </button>
    </div>
  </div>
);

// ─── Section header (like games.co.uk) ───────────────────────
const SectionHeader = ({ title, color, count, onSeeAll }) => (
  <div style={{ display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '14px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '1.5rem', color }}>{title}</div>
      {count && (
        <span style={{ background: `${color}22`,
          border: `1px solid ${color}55`, color,
          padding: '2px 10px', borderRadius: '50px',
          fontSize: '0.72rem', fontWeight: 800 }}>
          {count}
        </span>
      )}
    </div>
    {onSeeAll && (
      <button onClick={onSeeAll} style={{ background: 'none',
        border: `1px solid ${color}55`, color,
        padding: '4px 14px', borderRadius: '50px',
        fontFamily: "'Fredoka One', cursive",
        fontSize: '0.78rem', cursor: 'pointer' }}>
        See All →
      </button>
    )}
  </div>
);

// ─── Main Games Page ──────────────────────────────────────────
export default function Games() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [arcadeGames, setArcadeGames] = useState([]);
  const [hotGames, setHotGames] = useState([]);
  const [editorPick, setEditorPick] = useState(null);
  const [arcadeCat, setArcadeCat] = useState('');
  const [arcadeLoading, setArcadeLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Load arcade games
  const loadArcade = useCallback(async (cat = '') => {
    setArcadeLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/arcade/games?category=${cat}&amount=24`
      );
      if (res.data.success && Array.isArray(res.data.games)) {
        const games = res.data.games;
        setArcadeGames(games);
        if (cat === '') {
          // Hot = first 4 for featured row
          setHotGames(games.slice(0, 8));
          // Editor pick = random from top 5
          setEditorPick(games[Math.floor(Math.random() * 5)]);
          // Recommended = random 8
          const shuffled = [...games].sort(
            () => Math.random() - 0.5
          );
          setRecommended(shuffled.slice(0, 8));
        }
      }
    } catch (err) {
      console.error('Arcade load error:', err);
    } finally {
      setArcadeLoading(false);
    }
  }, []);

  useEffect(() => { loadArcade(''); }, [loadArcade]);

  const handleCatChange = (cat) => {
    setArcadeCat(cat);
    loadArcade(cat);
  };

  const openArcadeGame = (game) => {
    navigate('/games/arcade/play', { state: { game } });
  };

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = arcadeGames.filter(g =>
      g.title?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q)
    );
    setSearchResults(results.slice(0, 12));
  }, [searchQuery, arcadeGames]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto',
      padding: '24px 16px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent' }}>
            🎮 Games
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)',
            fontSize: '0.85rem' }}>
            Quiz Games • Arcade • Kids Zone
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍 Search arcade games..."
            style={{ background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', padding: '10px 16px',
              borderRadius: '50px', outline: 'none',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.9rem', width: '240px' }}/>

          {searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '110%',
              left: 0, right: 0, background: '#16213E',
              borderRadius: '12px', zIndex: 100,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map((g, i) => (
                <div key={i} onClick={() => {
                  openArcadeGame(g);
                  setSearchQuery('');
                }} style={{ display: 'flex', alignItems: 'center',
                  gap: '10px', padding: '10px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.15s' }}
                  onMouseEnter={e =>
                    e.currentTarget.style.background =
                      'rgba(255,255,255,0.06)'}
                  onMouseLeave={e =>
                    e.currentTarget.style.background = 'transparent'}>
                  {g.thumb && (
                    <img src={g.thumb} alt={g.title}
                      style={{ width: '36px', height: '36px',
                        borderRadius: '6px', objectFit: 'cover' }}/>
                  )}
                  <div>
                    <div style={{ fontSize: '0.88rem',
                      fontWeight: 700 }}>{g.title}</div>
                    <div style={{ fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.4)' }}>
                      {g.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hub button */}
        <button onClick={() => navigate('/games/hub')} style={{
          background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
          border: 'none', color: '#fff', padding: '10px 20px',
          borderRadius: '50px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '0.9rem', cursor: 'pointer' }}>
          🏆 Games Hub
        </button>
      </div>

      {/* ── RECOMMENDED FOR YOU (arcade) ── */}
      {recommended.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <SectionHeader title="⭐ Recommended For You"
            color="#FFD60A" count={recommended.length}/>
          <div style={{ display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px' }}>
            {recommended.map((g, i) => (
              <ArcadeCard key={i} game={g}
                onClick={openArcadeGame}/>
            ))}
          </div>
        </div>
      )}

      {/* ── EDITOR'S PICK + HOT GAMES (like games.co.uk layout) ── */}
      {editorPick && hotGames.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <SectionHeader title="🎯 Editor's Picks"
            color="#FF3D9A"/>
          <div style={{ display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px' }}>

            {/* Big editor pick */}
            <div onClick={() => openArcadeGame(editorPick)}
              style={{ borderRadius: '16px', overflow: 'hidden',
                cursor: 'pointer', position: 'relative',
                gridRow: 'span 2', minHeight: '260px',
                background: '#0D0D1A' }}>
              {editorPick.thumb && (
                <img src={editorPick.thumb} alt={editorPick.title}
                  style={{ width: '100%', height: '100%',
                    objectFit: 'cover', display: 'block' }}/>
              )}
              <div style={{ position: 'absolute', bottom: 0,
                left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                padding: '24px 16px 16px' }}>
                <div style={{ fontFamily: "'Fredoka One', cursive",
                  fontSize: '1.4rem',
                  marginBottom: '8px' }}>
                  {editorPick.title}
                </div>
                <button style={{
                  background: '#FF3D9A', border: 'none',
                  color: '#fff', padding: '8px 20px',
                  borderRadius: '8px',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '0.9rem', cursor: 'pointer' }}>
                  PLAY NOW
                </button>
              </div>
            </div>

            {/* 4 small picks */}
            {hotGames.slice(1, 5).map((g, i) => (
              <ArcadeCard key={i} game={g}
                onClick={openArcadeGame}/>
            ))}
          </div>
        </div>
      )}

      {/* ── ARCADE SECTION (category tabs + grid) ── */}
      <div style={{ marginBottom: '36px' }}>
        <SectionHeader title="🕹️ Arcade Games"
          color="#7B2FFF"
          count={`${arcadeGames.length}+`}/>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '8px',
          flexWrap: 'wrap', marginBottom: '16px' }}>
          {ARCADE_CATS.map(cat => (
            <button key={cat.id}
              onClick={() => handleCatChange(cat.id)}
              style={{ padding: '7px 16px', borderRadius: '50px',
                border: `1px solid ${arcadeCat === cat.id
                  ? cat.color : 'rgba(255,255,255,0.1)'}`,
                background: arcadeCat === cat.id
                  ? `${cat.color}22` : 'transparent',
                color: arcadeCat === cat.id
                  ? cat.color : 'rgba(255,255,255,0.5)',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '0.85rem', cursor: 'pointer',
                transition: 'all 0.2s' }}>
              {cat.label}
            </button>
          ))}
        </div>

        {arcadeLoading ? (
          <div style={{ textAlign: 'center', padding: '60px',
            color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px',
              display: 'inline-block',
              animation: 'spin 1s linear infinite' }}>🎮</div>
            <div style={{ fontFamily: "'Fredoka One', cursive" }}>
              Loading games...
            </div>
          </div>
        ) : arcadeGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: "'Fredoka One', cursive" }}>
            No games found. Check your backend! 🔧
          </div>
        ) : (
          <div style={{ display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px' }}>
            {arcadeGames.map((g, i) => (
              <ArcadeCard key={i} game={g}
                onClick={openArcadeGame}/>
            ))}
          </div>
        )}
      </div>

      {/* ── OUR QUIZ GAMES ── */}
      <div style={{ marginBottom: '36px' }}>
        <SectionHeader title="🧠 Quiz Games"
          color="#06D6A0"
          count={regularGames.length}
          onSeeAll={() => {}}/>
        <div style={{ display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px' }}>
          {regularGames.map(game => (
            <OurGameCard key={game.id} game={game}
              hovered={hovered} setHovered={setHovered}
              navigate={navigate}/>
          ))}
        </div>
      </div>

      {/* ── KIDS ZONE ── */}
      <div>
        <div style={{ background:
          'linear-gradient(135deg, #FF6B3515, #FFD60A15)',
          border: '1px solid rgba(255,107,53,0.25)',
          borderRadius: '14px', padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '1.8rem' }}>🌈</div>
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              color: '#FFD60A', fontSize: '1rem' }}>
              Kids Zone
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)',
              fontSize: '0.78rem' }}>
              Simple & colorful games for young players 🎈
            </div>
          </div>
        </div>
        <SectionHeader title="🧒 Kids Zone"
          color="#FF6B35" count={kidsGames.length}/>
        <div style={{ display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px' }}>
          {kidsGames.map(game => (
            <OurGameCard key={game.id} game={game}
              hovered={hovered} setHovered={setHovered}
              navigate={navigate}/>
          ))}
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}