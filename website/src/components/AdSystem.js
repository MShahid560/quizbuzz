import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GAME_ADS = [
  { id: 'word-scramble',   icon: '🔤', title: 'Word Scramble',
    desc: 'Can you unscramble all 8 words?',
    color: '#7B2FFF', color2: '#FF3D9A' },
  { id: 'galaxy-shooter',  icon: '🚀', title: 'Galaxy Shooter',
    desc: 'Shoot the correct answers in space!',
    color: '#0D0D1A', color2: '#7B2FFF' },
  { id: 'survival',        icon: '💀', title: 'Survival Mode',
    desc: 'One wrong answer = Game Over!',
    color: '#2C3E50', color2: '#FF4757' },
  { id: 'memory-flip',     icon: '🃏', title: 'Memory Flip',
    desc: 'Test your memory — match all pairs!',
    color: '#00B4FF', color2: '#06D6A0' },
  { id: 'speed-round',     icon: '⚡', title: 'Speed Round',
    desc: 'Only 5 seconds! How fast are you?',
    color: '#FF4757', color2: '#FF6B35' },
  { id: 'hangman',         icon: '🎯', title: 'Hangman',
    desc: 'Guess the word before it\'s too late!',
    color: '#FF3D9A', color2: '#7B2FFF' },
  { id: 'daily',           icon: '🌟', title: 'Daily Challenge',
    desc: 'Complete today\'s challenge for bonus XP!',
    color: '#FFD60A', color2: '#FF6B35',
    route: '/daily' },
  { id: 'balloon-pop',     icon: '🎈', title: 'Balloon Pop',
    desc: 'Kids love this one — pop the right balloons!',
    color: '#FF4757', color2: '#FF3D9A' },
];

// Pages where ads should NOT show
const NO_AD_PAGES = [
  '/quiz/', '/games/word-scramble', '/games/memory-flip',
  '/games/math-challenge', '/games/hangman', '/games/speed-round',
  '/games/survival', '/games/flag-quiz', '/games/true-or-false',
  '/games/number-sequence', '/games/type-the-word',
  '/games/tic-tac-toe', '/games/color-match', '/games/animal-sounds',
  '/games/kids-math', '/games/balloon-pop', '/games/galaxy-shooter',
  '/games/image-puzzle', '/daily',
  '/games/arcade/play'

];

const AD_INTERVAL = 25 * 60 * 1000; // 25 minutes

export default function AdSystem() {
  const navigate = useNavigate();
  const location = useLocation();
  const [banner, setBanner] = useState(null);
  const [popup, setPopup] = useState(null);
  const [sideAd, setSideAd] = useState(null);
  const [sideVisible, setSideVisible] = useState(false);

  const isGamePage = NO_AD_PAGES.some(p =>
    location.pathname.startsWith(p)
  );

  const getRandomAd = useCallback(() =>
    GAME_ADS[Math.floor(Math.random() * GAME_ADS.length)],
  []);

  // Show banner 3s after page load (not on game pages)
  useEffect(() => {
    if (isGamePage) {
      setBanner(null);
      setSideVisible(false);
      return;
    }

    // Show side ad after 5s
    const sideTimer = setTimeout(() => {
      setSideAd(getRandomAd());
      setSideVisible(true);
    }, 5000);

    return () => clearTimeout(sideTimer);
  }, [location.pathname, isGamePage, getRandomAd]);

  // Show banner ad 3s after arriving on non-game page
  useEffect(() => {
    if (isGamePage) { setBanner(null); return; }
    const t = setTimeout(() => {
      setBanner(getRandomAd());
    }, 3000);
    return () => clearTimeout(t);
  }, [location.pathname, isGamePage, getRandomAd]);

  // Show popup every 25 minutes of site use
  useEffect(() => {
    const lastPopup = parseInt(
      localStorage.getItem('quizbuzz_last_popup') || '0'
    );
    const now = Date.now();

    // First popup after 25 mins from first visit
    if (!lastPopup) {
      localStorage.setItem('quizbuzz_last_popup', now.toString());
    }

    const timeUntilNext = Math.max(0,
      AD_INTERVAL - (now - lastPopup)
    );

    const t = setTimeout(() => {
      if (!isGamePage) {
        setPopup(getRandomAd());
        localStorage.setItem(
          'quizbuzz_last_popup', Date.now().toString()
        );
      }
    }, timeUntilNext || AD_INTERVAL);

    return () => clearTimeout(t);
  }, [isGamePage, getRandomAd]);

  const handleAdClick = (ad) => {
    const route = ad.route || `/games/${ad.id}`;
    navigate(route);
    setBanner(null);
    setPopup(null);
    setSideVisible(false);
  };

  if (isGamePage) return null;

  return (
    <>
      {/* ===== BOTTOM BANNER ===== */}
      {banner && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 900, padding: '0 16px 16px',
          pointerEvents: 'none' }}>
          <div style={{
            background: `linear-gradient(135deg, ${banner.color}ee,
              ${banner.color2}ee)`,
            backdropFilter: 'blur(12px)',
            borderRadius: '16px', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            pointerEvents: 'all',
            maxWidth: '600px', margin: '0 auto' }}>

            <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>
              {banner.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1rem', marginBottom: '2px' }}>
                {banner.title}
              </div>
              <div style={{ fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.8)',
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' }}>
                {banner.desc}
              </div>
            </div>
            <button onClick={() => handleAdClick(banner)} style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '8px 16px',
              borderRadius: '10px',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '0.85rem', cursor: 'pointer',
              flexShrink: 0, whiteSpace: 'nowrap' }}>
              Play →
            </button>
            <button onClick={() => setBanner(null)} style={{
              background: 'rgba(0,0,0,0.2)', border: 'none',
              color: 'rgba(255,255,255,0.7)', width: '28px',
              height: '28px', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1rem',
              flexShrink: 0 }}>×</button>
          </div>
        </div>
      )}

      {/* ===== POPUP (every 25 mins) ===== */}
      {popup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '20px' }}
          onClick={() => setPopup(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#16213E', borderRadius: '24px',
              padding: '32px', maxWidth: '380px', width: '100%',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              textAlign: 'center',
              animation: 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>

            {/* Banner */}
            <div style={{ background: `linear-gradient(135deg,
              ${popup.color}, ${popup.color2})`,
              borderRadius: '16px', padding: '24px',
              marginBottom: '20px', fontSize: '4rem' }}>
              {popup.icon}
            </div>

            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.6rem', marginBottom: '8px' }}>
              {popup.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)',
              marginBottom: '20px', fontSize: '0.9rem',
              lineHeight: 1.6 }}>
              {popup.desc}
            </div>

            {/* Recommendation badge */}
            <div style={{ background: 'rgba(255,214,10,0.15)',
              border: '1px solid rgba(255,214,10,0.3)',
              borderRadius: '8px', padding: '6px 12px',
              fontSize: '0.75rem', color: '#FFD60A',
              fontWeight: 800, display: 'inline-block',
              marginBottom: '20px' }}>
              ⭐ RECOMMENDED FOR YOU
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleAdClick(popup)} style={{
                flex: 1,
                background: `linear-gradient(135deg,
                  ${popup.color}, ${popup.color2})`,
                border: 'none', color: '#fff', padding: '14px',
                borderRadius: '14px',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '1.1rem', cursor: 'pointer' }}>
                🎮 Play Now!
              </button>
              <button onClick={() => setPopup(null)} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.5)',
                padding: '14px 18px', borderRadius: '14px',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '0.9rem', cursor: 'pointer' }}>
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDE RECOMMENDATION CARD ===== */}
      {sideAd && (
        <div style={{ position: 'fixed', right: 0, top: '50%',
          transform: sideVisible
            ? 'translateY(-50%) translateX(0)'
            : 'translateY(-50%) translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          zIndex: 800, padding: '0 12px 0 0' }}>
          <div style={{ background: '#16213E', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
            overflow: 'hidden', width: '180px' }}>

            {/* Close tab */}
            <button onClick={() => setSideVisible(false)} style={{
              position: 'absolute', top: '6px', right: '18px',
              background: 'rgba(0,0,0,0.4)', border: 'none',
              color: 'rgba(255,255,255,0.6)', width: '22px',
              height: '22px', borderRadius: '50%', cursor: 'pointer',
              fontSize: '0.8rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 1 }}>×</button>

            <div style={{ background: `linear-gradient(135deg,
              ${sideAd.color}, ${sideAd.color2})`,
              padding: '16px', textAlign: 'center',
              fontSize: '2.5rem' }}>
              {sideAd.icon}
            </div>

            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800,
                color: '#FFD60A', textTransform: 'uppercase',
                letterSpacing: '1px', marginBottom: '4px' }}>
                Play Now
              </div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '0.95rem', marginBottom: '4px' }}>
                {sideAd.title}
              </div>
              <div style={{ fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '10px', lineHeight: 1.4 }}>
                {sideAd.desc}
              </div>
              <button onClick={() => handleAdClick(sideAd)} style={{
                width: '100%',
                background: `linear-gradient(135deg,
                  ${sideAd.color}, ${sideAd.color2})`,
                border: 'none', color: '#fff', padding: '8px',
                borderRadius: '8px',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '0.85rem', cursor: 'pointer' }}>
                🎮 Play!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}