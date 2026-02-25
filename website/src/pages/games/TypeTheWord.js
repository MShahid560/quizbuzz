import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

const WORDS = ['apple','banana','science','history','planet',
  'elephant','rocket','python','matrix','thunder',
  'dolphin','volcano','rainbow','gravity','journey',
  'kingdom','mystery','pyramid','oxygen','carbon',
  'photon','quantum','silicon','algebra','biology'];

export default function TypeTheWord() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('ready');
  const [fallingWords, setFallingWords] = useState([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const inputRef = useRef(null);
  const gameRef = useRef(null);
  const { user } = useAuth();

  const addWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const x = Math.random() * 70 + 5;
    setFallingWords(prev => [
      ...prev,
      { id: Date.now(), word, x, y: 0, speed: 0.3 + (level * 0.1) }
    ]);
  }, [level]);

  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(addWord, Math.max(1500, 3000 - level * 200));
    return () => clearInterval(interval);
  }, [status, addWord, level]);

  useEffect(() => {
    if (status !== 'playing') return;
    const tick = setInterval(() => {
      setFallingWords(prev => {
        const updated = prev.map(w => ({ ...w, y: w.y + w.speed }));
        const missed = updated.filter(w => w.y >= 90);
        if (missed.length > 0) {
          setLives(l => {
            const newLives = l - missed.length;
            if (newLives <= 0) { setStatus('finished'); playSound('wrong'); }
            else playSound('wrong');
            return Math.max(0, newLives);
          });
        }
        return updated.filter(w => w.y < 90);
      });
    }, 50);
    return () => clearInterval(tick);
  }, [status]);

  useEffect(() => {
    if (score > 0 && score % 300 === 0) setLevel(l => l + 1);
  }, [score]);

  const handleType = (e) => {
    const val = e.target.value.toLowerCase().trim();
    setInput(val);
    const match = fallingWords.find(w => w.word === val);
    if (match) {
      setFallingWords(prev => prev.filter(w => w.id !== match.id));
      setScore(s => s + Math.round(100 + (match.y < 50 ? 50 : 0)));
      setInput('');
      playSound('correct');
    }
  };

  if (status === 'ready') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>⌨️</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', marginBottom: '8px' }}>Type The Word!</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>
        Words fall from the sky. Type them before they hit the ground!<br/>
        You have 3 lives ❤️❤️❤️
      </div>
      <button onClick={() => { setStatus('playing');
        setTimeout(() => inputRef.current?.focus(), 100); }}
        style={{ width: '100%',
          background: 'linear-gradient(135deg, #7B2FFF, #00B4FF)',
          border: 'none', color: '#fff', padding: '18px',
          borderRadius: '16px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1.4rem', cursor: 'pointer' }}>
        ⌨️ Start Typing!
      </button>
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
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>⌨️</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', marginBottom: '8px' }}>Game Over!</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '3rem', color: '#FFD60A', marginBottom: '8px' }}>
        ⭐ {score}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)',
        marginBottom: '24px' }}>Level {level} reached!</div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => { setStatus('playing'); setScore(0);
          setLives(3); setLevel(1); setFallingWords([]);
          setTimeout(() => inputRef.current?.focus(), 100); }}
          style={{ flex: 1,
            background: 'linear-gradient(135deg, #7B2FFF, #00B4FF)',
            border: 'none', color: '#fff', padding: '14px',
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
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px' }}>
        <div>{'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>⌨️ Type The Word</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A' }}>⭐ {score}</div>
      </div>

      <div style={{ color: 'rgba(255,255,255,0.4)',
        textAlign: 'center', marginBottom: '8px', fontSize: '0.82rem' }}>
        Level {level} • Words getting faster!
      </div>

      {/* Game Area */}
      <div ref={gameRef} style={{ position: 'relative', height: '350px',
        background: '#0D0D1A', borderRadius: '20px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>

        {/* Ground line */}
        <div style={{ position: 'absolute', bottom: '10%', left: 0,
          right: 0, height: '2px',
          background: 'rgba(255,71,87,0.4)' }}/>

        {fallingWords.map(w => (
          <div key={w.id} style={{
            position: 'absolute', left: `${w.x}%`,
            top: `${w.y}%`,
            background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            borderRadius: '8px', padding: '6px 12px',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', color: '#fff',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(123,47,255,0.4)',
            transform: 'translateX(-50%)'
          }}>
            {w.word}
          </div>
        ))}

        {fallingWords.length === 0 && (
          <div style={{ position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.2)',
            fontFamily: "'Fredoka One', cursive" }}>
            Words coming...
          </div>
        )}
      </div>

      <input ref={inputRef} value={input}
        onChange={handleType}
        placeholder="Type the word here..."
        autoFocus
        style={{ width: '100%', background: 'rgba(255,255,255,0.06)',
          border: '2px solid #7B2FFF', color: '#fff',
          padding: '16px 20px', borderRadius: '14px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.3rem', outline: 'none',
          textAlign: 'center', boxSizing: 'border-box' }}/>
    </div>
  );
}