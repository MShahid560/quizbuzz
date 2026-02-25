import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../../services/sounds';

const generate = () => {
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    answer = a + b;
  } else {
    a = Math.floor(Math.random() * 10) + 5;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  }
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = answer + Math.floor(Math.random() * 6) - 3;
    if (w !== answer && w >= 0) wrongs.add(w);
  }
  const options = [...wrongs, answer].sort(() => Math.random() - 0.5);
  return { a, b, op, answer, options };
};

export default function KidsMath() {
  const navigate = useNavigate();
  const [q, setQ] = useState(generate);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('playing');
  const [stars, setStars] = useState([]);
  const TOTAL = 10;

  const nextRound = useCallback(() => {
    if (round >= TOTAL) { setStatus('finished'); playSound('levelUp'); }
    else { setRound(r => r + 1); setQ(generate()); setSelected(null); }
  }, [round]);

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === q.answer) {
      setScore(s => s + 100);
      const id = Date.now();
      setStars(prev => [...prev, id]);
      setTimeout(() => setStars(prev => prev.filter(s => s !== id)), 1000);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    setTimeout(nextRound, 1000);
  };

  const EMOJIS = ['🌟', '⭐', '✨', '🎉', '🏆'];

  if (status === 'finished') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🌟</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', color: '#FFD60A', marginBottom: '8px' }}>
        Amazing Job!
      </div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '4rem', marginBottom: '24px' }}>
        ⭐ {score}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => { setScore(0); setRound(1);
          setSelected(null); setStatus('playing'); setQ(generate()); }}
          style={{ flex: 1,
            background: 'linear-gradient(135deg, #FFD60A, #FF6B35)',
            border: 'none', color: '#0D0D1A', padding: '14px',
            borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
            fontSize: '1.1rem', cursor: 'pointer' }}>🔄 Play Again</button>
        <button onClick={() => navigate('/games')} style={{
          flex: 1, background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
          padding: '14px', borderRadius: '14px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>🎮 All Games</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px',
      position: 'relative', overflow: 'hidden' }}>

      {/* Floating stars */}
      {stars.map(id => (
        <div key={id} className="animate-float-up" style={{
          position: 'absolute', top: '40%',
          left: `${30 + Math.random() * 40}%`,
          fontSize: '2rem', pointerEvents: 'none', zIndex: 100 }}>
          {EMOJIS[Math.floor(Math.random() * EMOJIS.length)]}
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Back</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>➕ Kids Math</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A' }}>⭐ {score}</div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center',
        gap: '6px', marginBottom: '24px' }}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <div key={i} style={{ width: '10px', height: '10px',
            borderRadius: '50%',
            background: i < round - 1 ? '#FFD60A'
              : i === round - 1 ? '#FF6B35'
              : 'rgba(255,255,255,0.1)' }}/>
        ))}
      </div>

      {/* Question */}
      <div style={{ background: 'linear-gradient(135deg, #FFD60A22, #FF6B3522)',
        border: '2px solid rgba(255,214,10,0.3)',
        borderRadius: '24px', padding: '40px',
        textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '4rem', color: '#FFD60A' }}>
          {q.a} {q.op} {q.b} = ?
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '14px' }}>
        {q.options.map((opt, i) => {
          const isCorrect = opt === q.answer;
          const isSelected = opt === selected;
          let bg = 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))';
          let border = 'rgba(255,255,255,0.15)';
          if (selected !== null) {
            if (isCorrect) { bg = 'rgba(6,214,160,0.3)'; border = '#06D6A0'; }
            else if (isSelected) { bg = 'rgba(255,71,87,0.3)'; border = '#FF4757'; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(opt)}
              disabled={selected !== null}
              style={{ background: bg, border: `3px solid ${border}`,
                color: '#fff', padding: '24px', borderRadius: '18px',
                fontFamily: "'Fredoka One', cursive", fontSize: '2.5rem',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: selected === null
                  ? '0 4px 12px rgba(0,0,0,0.2)' : 'none' }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}