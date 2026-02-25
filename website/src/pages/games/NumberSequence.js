import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

// Difficulty settings
const DIFFICULTIES = {
  EASY: { length: 5, timeBonus: 2, baseScore: 100 },
  MEDIUM: { length: 6, timeBonus: 1.5, baseScore: 150 },
  HARD: { length: 8, timeBonus: 1, baseScore: 200 }
};

// Pattern types
const PATTERN_TYPES = {
  ARITHMETIC: 'arithmetic',
  GEOMETRIC: 'geometric',
  FIBONACCI: 'fibonacci',
  SQUARES: 'squares',
  SUBTRACT: 'subtract',
  PRIME: 'prime',
  CUBES: 'cubes',
  RANDOM: 'random'
};

// Generate sequence based on pattern type and difficulty
const generateSequence = (difficulty = 'MEDIUM', patternType = 'RANDOM') => {
  const length = DIFFICULTIES[difficulty].length;
  const missingIdx = Math.floor(length / 2); // Missing number in the middle
  
  // Choose pattern type
  let type = patternType;
  if (patternType === 'RANDOM') {
    const types = Object.values(PATTERN_TYPES).filter(t => t !== 'RANDOM');
    type = types[Math.floor(Math.random() * types.length)];
  }
  
  let sequence, missing, options;
  let full = [];

  switch(type) {
    case PATTERN_TYPES.ARITHMETIC:
      // Arithmetic progression
      const start = Math.floor(Math.random() * 10) + 1;
      const diff = Math.floor(Math.random() * 5) + 1;
      full = Array.from({ length }, (_, i) => start + i * diff);
      break;
      
    case PATTERN_TYPES.GEOMETRIC:
      // Geometric progression
      const gStart = Math.floor(Math.random() * 3) + 1;
      const ratio = Math.floor(Math.random() * 2) + 2;
      full = Array.from({ length }, (_, i) => gStart * Math.pow(ratio, i));
      break;
      
    case PATTERN_TYPES.FIBONACCI:
      // Fibonacci-like
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      full = [a, b];
      for (let i = 2; i < length; i++) {
        full.push(full[i-1] + full[i-2]);
      }
      break;
      
    case PATTERN_TYPES.SQUARES:
      // Square numbers
      const sStart = Math.floor(Math.random() * 4) + 1;
      full = Array.from({ length }, (_, i) => (sStart + i) ** 2);
      break;
      
    case PATTERN_TYPES.CUBES:
      // Cube numbers
      const cStart = Math.floor(Math.random() * 3) + 1;
      full = Array.from({ length }, (_, i) => (cStart + i) ** 3);
      break;
      
    case PATTERN_TYPES.PRIME:
      // Prime numbers
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      const pStart = Math.floor(Math.random() * (primes.length - length));
      full = primes.slice(pStart, pStart + length);
      break;
      
    case PATTERN_TYPES.SUBTRACT:
      // Decreasing pattern
      const subStart = Math.floor(Math.random() * 50) + 50;
      const subDiff = Math.floor(Math.random() * 8) + 2;
      full = Array.from({ length }, (_, i) => subStart - i * subDiff);
      break;
      
    default:
      // Default to arithmetic
      const defStart = Math.floor(Math.random() * 10) + 1;
      const defDiff = Math.floor(Math.random() * 5) + 1;
      full = Array.from({ length }, (_, i) => defStart + i * defDiff);
  }

  missing = full[missingIdx];
  sequence = full.map((n, i) => i === missingIdx ? '?' : n);

  // Generate wrong options with appropriate range
  const wrongs = new Set();
  const range = difficulty === 'EASY' ? 5 : difficulty === 'MEDIUM' ? 10 : 20;
  
  while (wrongs.size < 3) {
    const offset = Math.floor(Math.random() * range * 2) - range;
    const w = missing + offset;
    // Ensure wrong answer is positive and not equal to correct answer
    if (w !== missing && w > 0 && w < 10000) wrongs.add(w);
  }

  // If we couldn't generate enough wrong options, add some defaults
  while (wrongs.size < 3) {
    const defaultWrong = missing + wrongs.size + 1;
    if (defaultWrong !== missing && defaultWrong > 0) wrongs.add(defaultWrong);
  }

  options = [...wrongs, missing].sort(() => Math.random() - 0.5);
  
  return { 
    sequence, 
    missing, 
    options, 
    patternType: type,
    fullSequence: full 
  };
};

// Pattern type display names and icons
const PATTERN_INFO = {
  [PATTERN_TYPES.ARITHMETIC]: { name: '➕ Arithmetic', icon: '➕', color: '#06D6A0' },
  [PATTERN_TYPES.GEOMETRIC]: { name: '✖️ Geometric', icon: '✖️', color: '#FFD60A' },
  [PATTERN_TYPES.FIBONACCI]: { name: '🌀 Fibonacci', icon: '🌀', color: '#7B2FFF' },
  [PATTERN_TYPES.SQUARES]: { name: '🔲 Squares', icon: '🔲', color: '#FF6B35' },
  [PATTERN_TYPES.CUBES]: { name: '🧊 Cubes', icon: '🧊', color: '#00B4FF' },
  [PATTERN_TYPES.PRIME]: { name: '🔢 Prime', icon: '🔢', color: '#FF4757' },
  [PATTERN_TYPES.SUBTRACT]: { name: '⬇️ Decreasing', icon: '⬇️', color: '#FF8C42' },
  [PATTERN_TYPES.RANDOM]: { name: '🎲 Random', icon: '🎲', color: '#9D4EDD' }
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
                  {PATTERN_INFO[score.patternType]?.name || score.patternType} • {score.difficulty} • {score.date}
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

export default function NumberSequence() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Moved inside the component
  
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [patternType, setPatternType] = useState('RANDOM');
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('playing');
  const [feedback, setFeedback] = useState('');
  const [q, setQ] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  const TOTAL = 10;

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('numberSequenceLeaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  // Save leaderboard to localStorage
  useEffect(() => {
    if (leaderboard.length > 0) {
      localStorage.setItem('numberSequenceLeaderboard', JSON.stringify(leaderboard));
    }
  }, [leaderboard]);

  // Timer effect
  useEffect(() => {
    if (status !== 'playing' || selected !== null || !gameStarted) return;
    
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setFeedback('⏰ Time\'s up!');
          setStreak(0);
          setSelected(-1);
          playSound('wrong');
          setTimeout(() => {
            if (round >= TOTAL) {
              setStatus('finished');
              playSound('complete');
            } else {
              nextRound();
            }
          }, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(t);
  }, [status, selected, round, gameStarted]);

  const nextRound = useCallback(() => {
    if (round >= TOTAL) {
      setStatus('finished');
      playSound('complete');
      
      // Calculate final stats
      const finalScore = score;
      setGamesPlayed(prev => prev + 1);
      setTotalScore(prev => prev + finalScore);
      if (streak > bestStreak) setBestStreak(streak);
      
      // Save to leaderboard
      const newEntry = {
        id: Date.now(),
        playerName: user?.displayName || user?.email || 'Anonymous',
        score: finalScore,
        correct,
        total: TOTAL,
        patternType,
        difficulty,
        streak,
        date: new Date().toLocaleDateString()
      };
      setLeaderboard(prev => [newEntry, ...prev].sort((a, b) => b.score - a.score).slice(0, 20));
      
    } else {
      setRound(r => r + 1);
      setQ(generateSequence(difficulty, patternType));
      setSelected(null);
      setFeedback('');
      setTimeLeft(difficulty === 'EASY' ? 20 : difficulty === 'MEDIUM' ? 15 : 10);
    }
  }, [round, score, correct, streak, patternType, difficulty, user, bestStreak, TOTAL]);

  const handleAnswer = (opt) => {
    if (selected !== null || !q) return;
    setSelected(opt);
    
    if (opt === q.missing) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Calculate points based on difficulty, time left, and streak
      const basePoints = DIFFICULTIES[difficulty].baseScore;
      const timeBonus = Math.floor(timeLeft * 2);
      const streakBonus = newStreak > 2 ? 50 * (newStreak - 2) : 0;
      const roundPoints = basePoints + timeBonus + streakBonus;
      
      setScore(s => s + roundPoints);
      setCorrect(c => c + 1);
      setFeedback(`✅ +${roundPoints} points!`);
      playSound('correct');
    } else {
      setStreak(0);
      setFeedback(`❌ Answer: ${q.missing}`);
      playSound('wrong');
    }
    
    setTimeout(() => {
      if (round >= TOTAL) {
        setStatus('finished');
        playSound('complete');
      } else {
        nextRound();
      }
    }, 1200);
  };

  const startGame = () => {
    setQ(generateSequence(difficulty, patternType));
    setRound(1);
    setScore(0);
    setCorrect(0);
    setSelected(null);
    setStatus('playing');
    setFeedback('');
    setStreak(0);
    setTimeLeft(difficulty === 'EASY' ? 20 : difficulty === 'MEDIUM' ? 15 : 10);
    setGameStarted(true);
  };

  const timerColor = timeLeft <= 5 ? '#FF4757'
    : timeLeft <= 8 ? '#FFD60A' : '#06D6A0';

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
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🔢</div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '2.5rem', marginBottom: '8px' }}>Number Sequence</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Find the missing number in the pattern
          </p>
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
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Type Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontFamily: "'Fredoka One', cursive",
            marginBottom: '15px', color: '#FFD60A' }}>🎲 Pattern Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.entries(PATTERN_INFO).map(([type, info]) => (
              <button
                key={type}
                onClick={() => setPatternType(type)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: patternType === type ? info.color : 'rgba(255,255,255,0.1)',
                  background: patternType === type ? `${info.color}20` : 'rgba(255,255,255,0.05)',
                  color: patternType === type ? info.color : '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center'
                }}
              >
                <span>{info.icon}</span>
                <span>{info.name}</span>
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
              {bestStreak > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#FF6B35' }}>{bestStreak}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Best Streak</div>
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
              background: 'linear-gradient(135deg, #FF6B35, #7B2FFF)',
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

  // Game Finished Screen
  if (status === 'finished') {
    const accuracy = Math.round((correct / TOTAL) * 100);
    
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto',
        padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🔢</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2.5rem', marginBottom: '8px' }}>Complete!</div>
        
        {/* Score Display */}
        <div style={{
          background: 'linear-gradient(135deg, #FF6B3520, #7B2FFF20)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            Final Score
          </div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '4rem', color: '#FFD60A', lineHeight: 1 }}>
            ⭐ {score}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '24px' }}>
          {[
            ['✅', 'Correct', `${correct}/${TOTAL}`],
            ['🎯', 'Accuracy', `${accuracy}%`],
            ['🔥', 'Best Streak', bestStreak],
            ['🎲', 'Pattern', PATTERN_INFO[patternType]?.icon || '🔢']
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
          <button onClick={() => {
            setGameStarted(false);
            setRound(1);
            setScore(0);
            setCorrect(0);
            setStatus('playing');
          }} style={{ flex: 1,
            background: 'linear-gradient(135deg, #FF6B35, #7B2FFF)',
            border: 'none', color: '#fff', padding: '14px',
            borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', cursor: 'pointer' }}>🔄 Play Again</button>
          <button onClick={() => navigate('/games')} style={{
            padding: '14px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', cursor: 'pointer' }}>🎮 All Games</button>
        </div>
      </div>
    );
  }

  // Game Play Screen
  if (!q) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => setGameStarted(false)} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Setup</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>🔢 Number Sequence</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A' }}>⭐ {score}</div>
      </div>

      {/* Progress and Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Round {round}/{TOTAL}
          </span>
          {streak > 1 && (
            <span style={{ marginLeft: '10px', color: '#FF6B35', fontWeight: 800 }}>
              🔥 {streak}x
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: PATTERN_INFO[patternType]?.color + '20',
            color: PATTERN_INFO[patternType]?.color,
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem'
          }}>
            {PATTERN_INFO[patternType]?.icon} {PATTERN_INFO[patternType]?.name}
          </span>
          <span style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.8rem',
            color: timerColor
          }}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div style={{ background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px', height: '6px', marginBottom: '28px' }}>
        <div style={{
          background: timerColor,
          height: '6px',
          borderRadius: '50px',
          width: `${(timeLeft / (difficulty === 'EASY' ? 20 : difficulty === 'MEDIUM' ? 15 : 10)) * 100}%`,
          transition: 'width 1s linear'
        }}/>
      </div>

      {/* Sequence Display */}
      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '32px', marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)',
          fontSize: '0.8rem', marginBottom: '16px',
          textAlign: 'center', fontWeight: 700 }}>
          FIND THE MISSING NUMBER
        </div>
        <div style={{ display: 'flex', justifyContent: 'center',
          gap: '10px', flexWrap: 'wrap' }}>
          {q.sequence.map((n, i) => (
            <div key={i} style={{ width: '52px', height: '52px',
              borderRadius: '12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: n === '?'
                ? 'linear-gradient(135deg, #FF6B35, #7B2FFF)'
                : 'rgba(255,255,255,0.08)',
              border: n === '?'
                ? 'none' : '1px solid rgba(255,255,255,0.15)',
              fontFamily: "'Fredoka One', cursive",
              fontSize: n === '?' ? '1.5rem' : '1.1rem',
              color: n === '?' ? '#fff' : '#FFD60A' }}>
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Answer Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px' }}>
        {q.options.map((opt, i) => {
          const isCorrect = opt === q.missing;
          const isSelected = opt === selected;
          let bg = 'rgba(255,255,255,0.06)';
          let border = 'rgba(255,255,255,0.1)';
          if (selected !== null) {
            if (isCorrect) { bg = 'rgba(6,214,160,0.2)'; border = '#06D6A0'; }
            else if (isSelected) { bg = 'rgba(255,71,87,0.2)'; border = '#FF4757'; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(opt)}
              disabled={selected !== null}
              style={{ background: bg, border: `2px solid ${border}`,
                color: '#fff', padding: '20px', borderRadius: '14px',
                fontFamily: "'Fredoka One', cursive", fontSize: '2rem',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.2s' }}>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div style={{ textAlign: 'center', marginTop: '16px',
          fontWeight: 800, fontSize: '1rem',
          color: feedback.includes('✅') ? '#06D6A0' : '#FF4757' }}>
          {feedback}
        </div>
      )}

      {/* Hint for pattern (on medium/hard) */}
      {difficulty !== 'EASY' && (
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '16px'
        }}>
          💡 Look for the pattern: {PATTERN_INFO[patternType]?.name}
        </div>
      )}
    </div>
  );
}