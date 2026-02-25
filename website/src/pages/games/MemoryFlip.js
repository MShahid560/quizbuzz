import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

// Expanded emoji sets with different themes
const THEMES = {
  ANIMALS: ['🐯', '🦁', '🐺', '🦊', '🐼', '🐨', '🦄', '🐲', '🐸', '🐧', '🦉', '🦅'],
  FOOD: ['🍎', '🍕', '🍔', '🌮', '🍣', '🍦', '🍩', '🍪', '🍇', '🍉', '🥑', '🥨'],
  SPORTS: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🚴'],
  EMOJIS: ['😀', '😂', '😎', '🥳', '😱', '😍', '🤔', '😴', '🥶', '🤯', '🥺', '😈']
};

// Difficulty settings
const DIFFICULTIES = {
  EASY: { pairs: 6, gridCols: 3, timeBonus: 2 },
  MEDIUM: { pairs: 8, gridCols: 4, timeBonus: 1.5 },
  HARD: { pairs: 12, gridCols: 4, timeBonus: 1 }
};

const createCards = (theme, difficulty) => {
  const selectedEmojis = THEMES[theme].slice(0, DIFFICULTIES[difficulty].pairs);
  const pairs = [...selectedEmojis, ...selectedEmojis];
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
};

// Leaderboard Component
const Leaderboard = ({ scores, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#16213E',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px',
      padding: '24px',
      zIndex: 1000,
      width: '90%',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.8rem',
          color: '#FFD60A'
        }}>🏆 Top Scores</div>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }}>✕</button>
      </div>
      
      {scores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
          No scores yet. Play a game!
        </div>
      ) : (
        <div>
          {scores.map((score, index) => (
            <div key={score.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: index === 0 ? 'rgba(255,214,10,0.1)' : index === 1 ? 'rgba(192,192,192,0.1)' : index === 2 ? 'rgba(205,127,50,0.1)' : 'none',
              borderRadius: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: index === 0 ? '#FFD60A' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Fredoka One', cursive",
                color: '#000'
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{score.playerName || 'Anonymous'}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                  {score.theme} • {score.difficulty} • {score.date}
                </div>
              </div>
              <div style={{
                fontFamily: "'Fredoka One', cursive",
                color: '#FFD60A',
                fontSize: '1.2rem'
              }}>
                {score.score}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.8rem'
      }}>
        Best Score: {scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0}
      </div>
    </div>
  );
};

export default function MemoryFlip() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Moved inside the component
  const [theme, setTheme] = useState('ANIMALS');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState('playing');
  const [disabled, setDisabled] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [bestTime, setBestTime] = useState(Infinity);
  const [bestMoves, setBestMoves] = useState(Infinity);

  // Load leaderboard from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('memoryFlipLeaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  // Save leaderboard to localStorage
  useEffect(() => {
    if (leaderboard.length > 0) {
      localStorage.setItem('memoryFlipLeaderboard', JSON.stringify(leaderboard));
    }
  }, [leaderboard]);

  useEffect(() => {
    if (status !== 'playing') return;
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (matched === DIFFICULTIES[difficulty].pairs && status === 'playing') {
      setStatus('finished');
      playSound('complete');
      
      // Calculate score
      const maxPairs = DIFFICULTIES[difficulty].pairs;
      const baseScore = maxPairs * 100;
      const movePenalty = moves * 10;
      const timePenalty = time * 5;
      const finalScore = Math.max(0, baseScore - movePenalty - timePenalty);
      
      // Update stats
      setGamesPlayed(prev => prev + 1);
      setTotalScore(prev => prev + finalScore);
      if (time < bestTime) setBestTime(time);
      if (moves < bestMoves) setBestMoves(moves);
      
      // Add to leaderboard
      const newEntry = {
        id: Date.now(),
        playerName: user?.displayName || user?.email || 'Anonymous',
        score: finalScore,
        moves,
        time,
        theme,
        difficulty,
        date: new Date().toLocaleDateString()
      };
      setLeaderboard(prev => [newEntry, ...prev].sort((a, b) => b.score - a.score).slice(0, 20));
    }
  }, [matched, status, moves, time, theme, difficulty, user, bestTime, bestMoves]);

  const handleFlip = (id) => {
    if (disabled || status !== 'playing') return;
    const card = cards.find(c => c.id === id);
    if (card.flipped || card.matched) return;

    const newCards = cards.map(c =>
      c.id === id ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setDisabled(true);
      const [id1, id2] = newFlipped;
      const c1 = newCards.find(c => c.id === id1);
      const c2 = newCards.find(c => c.id === id2);

      if (c1.emoji === c2.emoji) {
        setCards(prev => prev.map(c =>
          c.id === id1 || c.id === id2
            ? { ...c, matched: true, flipped: true } : c
        ));
        setMatched(m => m + 1);
        playSound('correct');
        setFlipped([]);
        setDisabled(false);
      } else {
        playSound('wrong');
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === id1 || c.id === id2
              ? { ...c, flipped: false } : c
          ));
          setFlipped([]);
          setDisabled(false);
        }, 800);
      }
    }
  };

  const startGame = () => {
    setCards(createCards(theme, difficulty));
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setMatched(0);
    setStatus('playing');
    setDisabled(false);
    setGameStarted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Game Setup Screen
  if (!gameStarted) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
          marginBottom: '20px'
        }}>← Back to Games</button>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🃏</div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '2.5rem', marginBottom: '8px' }}>Memory Flip</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Test your memory! Match the pairs.
          </p>
        </div>

        {/* Theme Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontFamily: "'Fredoka One', cursive",
            marginBottom: '15px', color: '#FFD60A' }}>🎨 Select Theme</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.keys(THEMES).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: theme === t ? '#FFD60A' : 'rgba(255,255,255,0.1)',
                  background: theme === t ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.05)',
                  color: theme === t ? '#FFD60A' : '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {t} {THEMES[t][0]}{THEMES[t][1]}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontFamily: "'Fredoka One', cursive",
            marginBottom: '15px', color: '#FFD60A' }}>⚡ Select Difficulty</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {Object.keys(DIFFICULTIES).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  flex: 1,
                  padding: '15px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: difficulty === d ? '#FFD60A' : 'rgba(255,255,255,0.1)',
                  background: difficulty === d ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.05)',
                  color: difficulty === d ? '#FFD60A' : '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {d} ({DIFFICULTIES[d].pairs} pairs)
              </button>
            ))}
          </div>
        </div>

        {/* Stats Preview */}
        {gamesPlayed > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive",
              marginBottom: '15px', color: '#FFD60A' }}>📊 Your Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#06D6A0' }}>{gamesPlayed}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Games Played</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#FFD60A' }}>{totalScore}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total Score</div>
              </div>
              {bestTime < Infinity && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#7B2FFF' }}>{formatTime(bestTime)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Best Time</div>
                </div>
              )}
              {bestMoves < Infinity && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#FF4757' }}>{bestMoves}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Best Moves</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={startGame}
            style={{
              flex: 1,
              padding: '20px',
              background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
              border: 'none',
              borderRadius: '16px',
              color: '#fff',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            🚀 Start Game
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              padding: '20px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              color: '#FFD60A',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            🏆
          </button>
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 999
            }} onClick={() => setShowLeaderboard(false)} />
            <Leaderboard scores={leaderboard} onClose={() => setShowLeaderboard(false)} />
          </>
        )}
      </div>
    );
  }

  // Calculate current score
  const currentScore = status === 'playing' 
    ? Math.max(0, (DIFFICULTIES[difficulty].pairs * 100) - (moves * 10) - (time * 5))
    : 0;

  // Game Over Screen
  if (status === 'finished') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🎉</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', marginBottom: '16px' }}>Perfect Match!</div>
      
      {/* Score Display */}
      <div style={{
        background: 'linear-gradient(135deg, #7B2FFF20, #FF3D9A20)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
          Final Score
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '4rem', color: '#FFD60A', lineHeight: 1 }}>
          {Math.max(0, (DIFFICULTIES[difficulty].pairs * 100) - (moves * 10) - (time * 5))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px', marginBottom: '24px' }}>
        {[
          ['🎯', 'Moves', moves],
          ['⏱️', 'Time', formatTime(time)],
          ['✅', 'Pairs', `${matched}/${DIFFICULTIES[difficulty].pairs}`],
          ['🎨', 'Theme', theme.toLowerCase()]
        ].map(([icon, label, val]) => (
          <div key={label} style={{ background: '#16213E',
            borderRadius: '14px', padding: '16px',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem', color: '#FFD60A' }}>{val}</div>
            <div style={{ fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={startGame} style={{
          flex: 1, background: 'linear-gradient(135deg, #00B4FF, #06D6A0)',
          border: 'none', color: '#0D0D1A', padding: '14px',
          borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>🔄 Play Again</button>
        <button onClick={() => setGameStarted(false)} style={{
          flex: 1, background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
          padding: '14px', borderRadius: '14px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>🎮 New Setup</button>
        <button onClick={() => navigate('/games')} style={{
          padding: '14px', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
          borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>🏠</button>
      </div>
    </div>
  );

  // Game Play Screen
  const gridCols = DIFFICULTIES[difficulty].gridCols;
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => setGameStarted(false)} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Setup</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>🃏 Memory Flip</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A' }}>⭐ {currentScore}</div>
      </div>

      {/* Game Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>MOVES</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem' }}>{moves}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>TIME</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem' }}>
              {formatTime(time)}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>PAIRS</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem' }}>
            {matched}/{DIFFICULTIES[difficulty].pairs}
          </div>
        </div>
      </div>

      {/* Theme & Difficulty Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <span style={{
          background: 'rgba(255,214,10,0.1)',
          color: '#FFD60A',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          border: '1px solid #FFD60A40'
        }}>
          {theme} {THEMES[theme][0]}
        </span>
        <span style={{
          background: difficulty === 'EASY' ? 'rgba(6,214,160,0.1)' :
                      difficulty === 'MEDIUM' ? 'rgba(255,214,10,0.1)' : 'rgba(255,71,87,0.1)',
          color: difficulty === 'EASY' ? '#06D6A0' :
                 difficulty === 'MEDIUM' ? '#FFD60A' : '#FF4757',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          border: `1px solid ${difficulty === 'EASY' ? '#06D6A0' : difficulty === 'MEDIUM' ? '#FFD60A' : '#FF4757'}40`
        }}>
          {difficulty}
        </span>
      </div>

      {/* Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: '10px'
      }}>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleFlip(card.id)}
            style={{
              aspectRatio: '1',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              cursor: card.matched ? 'default' : 'pointer',
              background: card.flipped || card.matched
                ? 'linear-gradient(135deg, #00B4FF22, #06D6A022)'
                : 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
              border: `2px solid ${
                card.matched ? '#06D6A0' :
                card.flipped ? '#00B4FF' : 'transparent'
              }`,
              transform: card.flipped || card.matched ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.2s ease',
              opacity: card.matched ? 0.7 : 1,
              boxShadow: card.flipped || card.matched
                ? '0 4px 8px rgba(0,0,0,0.2)'
                : '0 8px 16px rgba(0,0,0,0.3)'
            }}
          >
            {card.flipped || card.matched ? card.emoji : '❓'}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        marginTop: '24px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px',
        height: '6px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #06D6A0, #00B4FF)',
          height: '6px',
          width: `${(matched / DIFFICULTIES[difficulty].pairs) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}