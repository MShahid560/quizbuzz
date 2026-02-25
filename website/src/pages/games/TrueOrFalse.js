import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

const STATEMENTS = [
  { text: 'The Great Wall of China is visible from space', answer: false },
  { text: 'Humans have more than 5 senses', answer: true },
  { text: 'Lightning never strikes the same place twice', answer: false },
  { text: 'The sun is a star', answer: true },
  { text: 'Goldfish have a memory of only 3 seconds', answer: false },
  { text: 'Bananas are technically berries', answer: true },
  { text: 'The Pacific Ocean is larger than all land combined', answer: true },
  { text: 'Dogs are colorblind and see only black and white', answer: false },
  { text: 'Mount Everest is the tallest mountain on Earth', answer: true },
  { text: 'Humans only use 10% of their brain', answer: false },
  { text: 'Honey never expires', answer: true },
  { text: 'The moon has its own light', answer: false },
  { text: 'A group of flamingos is called a flamboyance', answer: true },
  { text: 'Water boils at 100°C at sea level', answer: true },
  { text: 'Carrots were originally purple', answer: true },
  { text: 'An octopus has 6 hearts', answer: false },
  { text: 'Sound travels faster than light', answer: false },
  { text: 'Cleopatra lived closer in time to the Moon landing than to the pyramids', answer: true },
  { text: 'Sharks are mammals', answer: false },
  { text: 'There are more stars in the universe than grains of sand on Earth', answer: true },
];

export default function TrueOrFalse() {
  const navigate = useNavigate();
  const [shuffled] = useState([...STATEMENTS].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(6);
  const [status, setStatus] = useState('playing');
  const [streak, setStreak] = useState(0);
  const { user } = useAuth();

  const nextQ = useCallback(() => {
    if (current + 1 >= shuffled.length) {
      setStatus('finished'); playSound('complete');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTimeLeft(6);
    }
  }, [current, shuffled.length]);

  useEffect(() => {
    if (status !== 'playing' || selected !== null) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setSelected('timeout');
          setStreak(0);
          playSound('wrong');
          setTimeout(nextQ, 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status, selected, nextQ]);

  const handleAnswer = (answer) => {
    if (selected !== null) return;
    setSelected(answer);
    const isCorrect = answer === shuffled[current].answer;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const pts = 100 + (newStreak > 2 ? newStreak * 20 : 0) + (timeLeft * 10);
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      playSound('correct');
    } else {
      setStreak(0);
      playSound('wrong');
    }
    setTimeout(nextQ, 800);
  };

  if (status === 'finished') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>✅</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', marginBottom: '8px' }}>Done!</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '3rem', color: '#FFD60A', marginBottom: '8px' }}>
        ⭐ {score}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)',
        marginBottom: '24px' }}>
        {correct}/{shuffled.length} correct!
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => window.location.reload()} style={{
          flex: 1, background: 'linear-gradient(135deg, #06D6A0, #FFD60A)',
          border: 'none', color: '#0D0D1A', padding: '14px',
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

  const q = shuffled[current];
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Back</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>✅ True or False</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A' }}>⭐ {score}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between',
        marginBottom: '8px' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          {current + 1}/{shuffled.length}
          {streak >= 2 && <span style={{ marginLeft: '8px',
            color: '#FF6B35', fontWeight: 800 }}>🔥 {streak}x</span>}
        </span>
        <span style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2rem',
          color: timeLeft <= 2 ? '#FF4757' : '#FFD60A' }}>{timeLeft}s</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50px',
        height: '6px', marginBottom: '28px' }}>
        <div style={{ background: '#06D6A0', height: '6px',
          borderRadius: '50px', width: `${(timeLeft / 6) * 100}%`,
          transition: 'width 1s linear' }}/>
      </div>

      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '32px', textAlign: 'center', marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: '120px', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem',
          lineHeight: 1.6 }}>{q.text}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '16px' }}>
        {[true, false].map(answer => {
          const isCorrect = answer === q.answer;
          const isSelected = answer === selected;
          let bg = answer
            ? 'linear-gradient(135deg, #06D6A022, #00B4FF22)'
            : 'linear-gradient(135deg, #FF475722, #FF6B3522)';
          let border = answer
            ? 'rgba(6,214,160,0.3)' : 'rgba(255,71,87,0.3)';
          if (selected !== null) {
            if (isCorrect) { border = '#06D6A0'; bg = 'rgba(6,214,160,0.2)'; }
            else if (isSelected) { border = '#FF4757'; bg = 'rgba(255,71,87,0.2)'; }
          }
          return (
            <button key={String(answer)} onClick={() => handleAnswer(answer)}
              disabled={selected !== null}
              style={{ background: bg, border: `2px solid ${border}`,
                color: '#fff', padding: '28px', borderRadius: '16px',
                fontFamily: "'Fredoka One', cursive", fontSize: '2rem',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.2s' }}>
              {answer ? '✅ TRUE' : '❌ FALSE'}
            </button>
          );
        })}
      </div>
    </div>
  );
}