import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../../services/sounds';

const generateQuestion = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const answer = op === '+' ? a + b : Math.abs(a - b);
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = answer + Math.floor(Math.random() * 6) - 3;
    if (w !== answer && w >= 0) wrongs.add(w);
  }
  const targets = [...wrongs, answer]
    .sort(() => Math.random() - 0.5)
    .map((num, i) => ({
      id: i, num, x: 10 + i * 22,
      isCorrect: num === answer, destroyed: false
    }));
  return { question: `${a} ${op} ${b} = ?`, answer, targets };
};

export default function GalaxyShooter() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('ready');
  const [q, setQ] = useState(generateQuestion);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(1);
  const [shipX, setShipX] = useState(50);
  const [bullet, setBullet] = useState(null);
  const [explosions, setExplosions] = useState([]);
  const gameRef = useRef(null);
  const TOTAL = 10;

  const shoot = useCallback(() => {
    if (bullet) return;
    setBullet({ x: shipX, y: 80 });
    playSound('click');
  }, [bullet, shipX]);

  useEffect(() => {
    if (status !== 'playing' || !bullet) return;
    const t = setInterval(() => {
      setBullet(prev => {
        if (!prev) return null;
        const newY = prev.y - 3;
        if (newY <= 25) {
          // Check hit
          const hit = q.targets.find(
            t => !t.destroyed && Math.abs(t.x - prev.x) < 12
          );
          if (hit) {
            if (hit.isCorrect) {
              setScore(s => s + 200);
              playSound('correct');
              setExplosions(prev => [...prev,
                { id: Date.now(), x: hit.x, emoji: '💥' }]);
              setTimeout(() => setExplosions(prev =>
                prev.filter(e => e.id !== Date.now())), 500);
              setTimeout(() => {
                setRound(r => {
                  if (r >= TOTAL) { setStatus('finished'); return r; }
                  return r + 1;
                });
                setQ(generateQuestion());
              }, 600);
            } else {
              setLives(l => {
                const newL = l - 1;
                if (newL <= 0) setStatus('finished');
                return newL;
              });
              playSound('wrong');
            }
          }
          return null;
        }
        return { ...prev, y: newY };
      });
    }, 16);
    return () => clearInterval(t);
  }, [status, bullet, q.targets]);

  const handleMouseMove = (e) => {
    if (!gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setShipX(Math.max(5, Math.min(95, x)));
  };

  const handleTouch = (e) => {
    if (!gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setShipX(Math.max(5, Math.min(95, x)));
  };

  if (status === 'ready') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🚀</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', marginBottom: '8px' }}>Galaxy Shooter!</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>
        Move your ship and shoot the correct answer! 🎯<br/>
        Click/tap to shoot • Move mouse/finger to aim
      </div>
      <button onClick={() => setStatus('playing')} style={{
        width: '100%',
        background: 'linear-gradient(135deg, #0D0D1A, #7B2FFF)',
        border: '2px solid #7B2FFF', color: '#fff', padding: '18px',
        borderRadius: '16px', fontFamily: "'Fredoka One', cursive",
        fontSize: '1.4rem', cursor: 'pointer' }}>🚀 Launch!</button>
      <button onClick={() => navigate('/games')} style={{
        marginTop: '12px', width: '100%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'rgba(255,255,255,0.6)', padding: '12px',
        borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
        fontSize: '1rem', cursor: 'pointer' }}>← Back to Games</button>
    </div>
  );

  if (status === 'finished') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🚀</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', marginBottom: '8px' }}>
        {lives <= 0 ? 'Ship Destroyed!' : 'Mission Complete!'}
      </div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '3rem', color: '#FFD60A', marginBottom: '24px' }}>
        ⭐ {score}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => { setStatus('playing'); setScore(0);
          setLives(3); setRound(1); setQ(generateQuestion());
          setBullet(null); }} style={{ flex: 1,
          background: 'linear-gradient(135deg, #0D0D1A, #7B2FFF)',
          border: '2px solid #7B2FFF', color: '#fff', padding: '14px',
          borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>🔄 Play Again</button>
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        marginBottom: '12px' }}>
        <div>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, 3 - lives))}</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A' }}>⭐ {score}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)',
          fontSize: '0.85rem' }}>Round {round}/{TOTAL}</div>
      </div>

      {/* Question */}
      <div style={{ background: '#16213E', borderRadius: '14px',
        padding: '14px', textAlign: 'center', marginBottom: '12px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2rem', color: '#FFD60A' }}>{q.question}</div>
      </div>

      {/* Game Area */}
      <div ref={gameRef}
        onClick={shoot}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouch}
        onTouchStart={shoot}
        style={{ position: 'relative', height: '380px',
          background: 'linear-gradient(180deg, #000010, #0D0D2A)',
          borderRadius: '20px', overflow: 'hidden', cursor: 'crosshair',
          border: '1px solid #7B2FFF33' }}>

        {/* Stars */}
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} style={{ position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '2px', height: '2px', borderRadius: '50%',
            background: 'white', opacity: Math.random() * 0.8 + 0.2 }}/>
        ))}

        {/* Targets */}
        {q.targets.map(target => (
          <div key={target.id} style={{
            position: 'absolute', left: `${target.x}%`, top: '15%',
            transform: 'translateX(-50%)',
            textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>👾</div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem', color: '#FFD60A',
              background: 'rgba(0,0,0,0.5)', borderRadius: '8px',
              padding: '2px 8px' }}>{target.num}</div>
          </div>
        ))}

        {/* Bullet */}
        {bullet && (
          <div style={{ position: 'absolute',
            left: `${bullet.x}%`, top: `${bullet.y}%`,
            transform: 'translateX(-50%)',
            width: '6px', height: '20px', borderRadius: '3px',
            background: 'linear-gradient(180deg, #FFD60A, #FF6B35)',
            boxShadow: '0 0 10px #FFD60A' }}/>
        )}

        {/* Explosions */}
        {explosions.map(exp => (
          <div key={exp.id} style={{ position: 'absolute',
            left: `${exp.x}%`, top: '15%',
            fontSize: '2.5rem',
            transform: 'translateX(-50%)',
            animation: 'bounceIn 0.3s ease' }}>
            {exp.emoji}
          </div>
        ))}

        {/* Ship */}
        <div style={{ position: 'absolute',
          left: `${shipX}%`, top: '78%',
          transform: 'translateX(-50%)',
          fontSize: '2.5rem', transition: 'left 0.05s linear' }}>
          🚀
        </div>

        {/* Tap hint */}
        <div style={{ position: 'absolute', bottom: '8px',
          width: '100%', textAlign: 'center',
          color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          Move to aim • Tap/Click to shoot
        </div>
      </div>
    </div>
  );
}