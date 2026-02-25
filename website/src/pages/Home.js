import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/api';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const COLORS = ['#7B2FFF','#FF3D9A','#00B4FF','#06D6A0','#FF6B35','#FFD60A','#FF4757','#7B2FFF','#06D6A0'];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [hoveredCat, setHoveredCat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(res => setCategories(res.data.categories));
  }, []);

  const startSavedQuiz = (category) => {
    navigate(`/quiz/${encodeURIComponent(category)}`, {
      state: { difficulty, mode: 'saved' }
    });
  };

  const startAIQuiz = (category) => {
    navigate(`/quiz/${encodeURIComponent(category)}`, {
      state: { difficulty, mode: 'ai' }
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(123,47,255,0.15)',
          border: '1px solid rgba(123,47,255,0.3)',
          borderRadius: '50px', padding: '6px 18px',
          fontSize: '0.85rem', fontWeight: 800,
          color: '#7B2FFF', marginBottom: '16px',
        }}>
          ⚡ 9 Categories • AI-Powered Questions
        </div>

        <h1 style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: '3.5rem', marginBottom: '16px',
          lineHeight: 1.1, color: 'var(--text)',
        }}>
          Test Your <br />
          <span style={{
            background: 'linear-gradient(135deg, #FFD60A, #FF6B35, #FF3D9A)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Knowledge!
          </span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem',
          marginBottom: '28px' }}>
          Play free — no sign up needed to start!
        </p>

        {/* Difficulty picker */}
        <div style={{ display: 'flex', gap: '12px',
          justifyContent: 'center', marginBottom: '16px' }}>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)} style={{
              padding: '10px 24px', borderRadius: '50px',
              border: '2px solid',
              borderColor: difficulty === d ? '#FFD60A' : 'rgba(255,255,255,0.2)',
              background: difficulty === d
                ? 'rgba(255,214,10,0.15)' : 'transparent',
              color: difficulty === d ? '#FFD60A' : 'var(--text-muted)',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800, cursor: 'pointer', fontSize: '1rem',
              transition: 'all 0.2s',
            }}>{d}</button>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          👇 Pick a category below to start!
        </div>
      </div>

      {/* ── Daily Challenge Banner ── */}
      <div onClick={() => navigate('/daily')} style={{
        background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
        borderRadius: '20px', padding: '16px 24px',
        margin: '0 auto 36px', maxWidth: '560px',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(255,107,53,0.4)',
        transition: 'transform 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '1.3rem', color: '#0D0D1A' }}>
            🎯 Daily Challenge
          </div>
          <div style={{ color: '#0D0D1A', opacity: 0.7,
            fontSize: '0.85rem', fontWeight: 700 }}>
            New quiz every day • Bonus XP • Build streaks!
          </div>
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2rem' }}>🔥</div>
      </div>

      {/* ── Category Section — THIS IS THE "QUIZ" ── */}
      {/* id="categories" lets the navbar Quiz button scroll here */}
      <div id="categories">
        <div style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.6rem', marginBottom: '20px',
          color: 'var(--text)',
        }}>
          Choose a Category 🎯
        </div>

        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px',
            color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🐝</div>
            Loading categories...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {categories.map((cat, i) => (
              <div key={cat.id}
                onMouseEnter={() => setHoveredCat(cat.id)}
                onMouseLeave={() => setHoveredCat(null)}
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${hoveredCat === cat.id
                    ? COLORS[i] : COLORS[i] + '33'}`,
                  borderRadius: '20px', padding: '24px 16px',
                  textAlign: 'center',
                  transform: hoveredCat === cat.id
                    ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredCat === cat.id
                    ? `0 8px 24px ${COLORS[i]}33` : 'none',
                  transition: 'all 0.25s',
                }}>
                <span style={{ fontSize: '2.5rem',
                  marginBottom: '12px', display: 'block' }}>
                  {cat.icon}
                </span>
                <div style={{ fontWeight: 800, fontSize: '0.9rem',
                  color: 'var(--text)', marginBottom: '14px' }}>
                  {cat.name}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startSavedQuiz(cat.name)} style={{
                    flex: 1, padding: '8px 6px', borderRadius: '10px',
                    background: `${COLORS[i]}22`,
                    border: `1px solid ${COLORS[i]}`,
                    color: '#ffffff', fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800, fontSize: '0.7rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>🎮 Play</button>
                  <button onClick={() => startAIQuiz(cat.name)} style={{
                    flex: 1, padding: '8px 6px', borderRadius: '10px',
                    background: 'rgba(123,47,255,0.2)',
                    border: '1px solid #7B2FFF', color: '#ffffff',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800, fontSize: '0.7rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>🤖 AI</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}