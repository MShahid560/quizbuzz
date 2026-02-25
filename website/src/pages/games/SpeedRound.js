import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedQuestions } from '../../services/api';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

const CATEGORIES = [
  'General Knowledge', 'Science and Technology', 'Sports',
  'History', 'Geography', 'Movies and Entertainment',
  'Islamic Religion and Culture', 'Math and Logic',
  'Books and Student Knowledge'
];

// Difficulty settings
const DIFFICULTIES = {
  EASY: { timer: 8, points: 100, name: '🌟 Easy', color: '#06D6A0' },
  MEDIUM: { timer: 5, points: 200, name: '⚡ Medium', color: '#FFD60A' },
  HARD: { timer: 3, points: 300, name: '🔥 Hard', color: '#FF4757' },
  INSANE: { timer: 2, points: 500, name: '💀 Insane', color: '#7B2FFF' }
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
        }}>🏆 Speed Demons</div>
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
          No scores yet. Test your speed!
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
                  {score.category} • {score.difficulty} • {score.date}
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
        Fastest Finger: {scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0}
      </div>
    </div>
  );
};

export default function SpeedRound() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Moved inside the component
  
  const [status, setStatus] = useState('ready');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState('General Knowledge');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(15);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [fastestTime, setFastestTime] = useState(Infinity);
  const [answerTimes, setAnswerTimes] = useState([]);
  
  const letters = ['A', 'B', 'C', 'D'];
  const COLORS = ['#7B2FFF', '#FF3D9A', '#00B4FF', '#06D6A0'];

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('speedRoundLeaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
    
    // Load user stats
    const stats = localStorage.getItem('speedRoundStats');
    if (stats) {
      const parsed = JSON.parse(stats);
      setGamesPlayed(parsed.gamesPlayed || 0);
      setTotalScore(parsed.totalScore || 0);
      setBestScore(parsed.bestScore || 0);
    }
  }, []);

  // Save leaderboard to localStorage
  useEffect(() => {
    if (leaderboard.length > 0) {
      localStorage.setItem('speedRoundLeaderboard', JSON.stringify(leaderboard));
    }
  }, [leaderboard]);

  // Save user stats
  useEffect(() => {
    if (gamesPlayed > 0 || totalScore > 0) {
      localStorage.setItem('speedRoundStats', JSON.stringify({
        gamesPlayed,
        totalScore,
        bestScore
      }));
    }
  }, [gamesPlayed, totalScore, bestScore]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await getSavedQuestions(selectedCat, 'Easy', questionCount, '');
      if (res.data.success && res.data.questions?.length > 0) {
        // Shuffle questions for variety
        const shuffled = [...res.data.questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, questionCount));
        setStatus('playing');
        setTimeLeft(DIFFICULTIES[difficulty].timer);
        setAnswerTimes([]);
      } else {
        alert(`No questions for "${selectedCat}" yet! Generate some in Admin first.`);
      }
    } catch (err) {
      alert('Failed to load questions!');
    }
    setLoading(false);
  };

  const nextQuestion = useCallback(() => {
    if (current + 1 >= questions.length) {
      setStatus('finished');
      playSound('complete');
      
      // Update stats
      setGamesPlayed(prev => prev + 1);
      setTotalScore(prev => prev + score);
      if (score > bestScore) setBestScore(score);
      
      // Calculate average answer time
      const avgTime = answerTimes.length > 0 
        ? answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length 
        : 0;
      if (avgTime < fastestTime && avgTime > 0) setFastestTime(avgTime);
      
      // Save to leaderboard
      const newEntry = {
        id: Date.now(),
        playerName: user?.displayName || user?.email || 'Anonymous',
        score,
        correct,
        total: questions.length,
        category: selectedCat,
        difficulty,
        avgTime: avgTime.toFixed(1),
        date: new Date().toLocaleDateString()
      };
      setLeaderboard(prev => [newEntry, ...prev].sort((a, b) => b.score - a.score).slice(0, 20));
      
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTimeLeft(DIFFICULTIES[difficulty].timer);
    }
  }, [current, questions.length, score, correct, selectedCat, difficulty, user, bestScore, fastestTime, answerTimes]);

  useEffect(() => {
    if (status !== 'playing' || selected !== null) return;
    
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          playSound('wrong');
          setSelected(-1);
          
          // Record time for this question (max time)
          setAnswerTimes(prevTimes => [...prevTimes, DIFFICULTIES[difficulty].timer]);
          
          setTimeout(nextQuestion, 800);
          return 0;
        }
        
        // Play tick sound when time is running low
        if (prev <= 3) {
          playSound('urgentTick');
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(t);
  }, [status, selected, nextQuestion, difficulty]);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    
    // Calculate time taken for this answer
    const timeTaken = DIFFICULTIES[difficulty].timer - timeLeft;
    setAnswerTimes(prevTimes => [...prevTimes, timeTaken]);
    
    if (idx === parseInt(questions[current].correct)) {
      // Points = base points + time bonus (faster answers get more points)
      const basePoints = DIFFICULTIES[difficulty].points;
      const timeBonus = Math.floor(timeLeft * 10);
      const roundPoints = basePoints + timeBonus;
      
      setScore(s => s + roundPoints);
      setCorrect(c => c + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    setTimeout(nextQuestion, 800);
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (seconds === Infinity || !seconds) return 'N/A';
    return seconds.toFixed(1) + 's';
  };

  // READY SCREEN
  if (status === 'ready') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Back</button>
        <button onClick={() => setShowLeaderboard(true)} style={{
          background: 'none', border: 'none',
          color: '#FFD60A', fontSize: '1.5rem', cursor: 'pointer'
        }}>🏆</button>
      </div>

      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>⚡</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', marginBottom: '8px' }}>Speed Round!</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>
        How fast can you answer? Time is money! 💰
      </div>

      {/* Category Selection */}
      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '20px', marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
          marginBottom: '10px', fontWeight: 700 }}>
          📚 SELECT CATEGORY
        </div>
        <select value={selectedCat}
          onChange={e => setSelectedCat(e.target.value)}
          style={{ width: '100%', background: '#0D0D1A',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', padding: '12px 14px', borderRadius: '10px',
            fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem' }}>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Difficulty Selection */}
      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '20px', marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
          marginBottom: '15px', fontWeight: 700 }}>
          ⚡ SELECT DIFFICULTY
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Object.entries(DIFFICULTIES).map(([key, diff]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: difficulty === key ? diff.color : 'rgba(255,255,255,0.1)',
                background: difficulty === key ? `${diff.color}20` : 'rgba(255,255,255,0.05)',
                color: difficulty === key ? diff.color : '#fff',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {diff.name}
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                {diff.timer}s • {diff.points}pts
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Question Count */}
      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '20px', marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
          marginBottom: '15px', fontWeight: 700 }}>
          ❓ NUMBER OF QUESTIONS
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[5, 10, 15, 20].map(num => (
            <button
              key={num}
              onClick={() => setQuestionCount(num)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: questionCount === num ? '#FFD60A' : 'rgba(255,255,255,0.1)',
                background: questionCount === num ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.05)',
                color: questionCount === num ? '#FFD60A' : '#fff',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {num}
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
          marginBottom: '20px'
        }}>
          <h3 style={{ fontFamily: "'Fredoka One', cursive",
            marginBottom: '15px', color: '#FFD60A' }}>📊 Your Speed Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: '#06D6A0' }}>{gamesPlayed}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Games Played</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: '#FFD60A' }}>{totalScore}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total Score</div>
            </div>
            {bestScore > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#FF4757' }}>{bestScore}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Best Score</div>
              </div>
            )}
            {fastestTime < Infinity && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#7B2FFF' }}>{formatTime(fastestTime)}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Fastest Avg</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap',
        justifyContent: 'center', marginBottom: '24px' }}>
        {[
          [`⚡ ${DIFFICULTIES[difficulty].timer}s timer`, DIFFICULTIES[difficulty].color],
          [`❓ ${questionCount} questions`, '#FFD60A'],
          [`💰 ${DIFFICULTIES[difficulty].points}pts/base`, '#06D6A0'],
          ['🎯 Time bonus', '#7B2FFF']
        ].map(([label, color]) => (
          <div key={label} style={{
            background: `${color}20`,
            border: `1px solid ${color}40`,
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: color
          }}>
            {label}
          </div>
        ))}
      </div>

      <button onClick={loadQuestions} disabled={loading} style={{
        width: '100%',
        background: 'linear-gradient(135deg, #FF4757, #FF6B35)',
        border: 'none', color: '#fff', padding: '18px', borderRadius: '16px',
        fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1
      }}>
        {loading ? '⏳ Loading Questions...' : '⚡ START SPEED ROUND!'}
      </button>

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

  // FINISHED SCREEN
  if (status === 'finished') {
    const pct = Math.round((correct / questions.length) * 100);
    const avgTime = answerTimes.length > 0 
      ? (answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length).toFixed(1) 
      : 0;
    
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto',
        padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>
          {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2.5rem', marginBottom: '8px' }}>
          Speed Complete!
        </div>
        
        {/* Score Display */}
        <div style={{
          background: 'linear-gradient(135deg, #FF475720, #FF6B3520)',
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
            ['✅', 'Correct', `${correct}/${questions.length}`],
            ['📊', 'Accuracy', `${pct}%`],
            ['⚡', 'Avg Time', `${avgTime}s`],
            ['💰', 'Points/Q', Math.round(score / questions.length)]
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
            setStatus('ready'); setCurrent(0);
            setScore(0); setCorrect(0);
            setSelected(null); setTimeLeft(5);
            setQuestions([]);
          }} style={{ flex: 1,
            background: 'linear-gradient(135deg, #FF4757, #FF6B35)',
            border: 'none', color: '#fff', padding: '14px',
            borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', cursor: 'pointer' }}>⚡ Play Again</button>
          <button onClick={() => navigate('/games')} style={{
            flex: 1, background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            padding: '14px', borderRadius: '14px',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', cursor: 'pointer' }}>🎮 All Games</button>
        </div>
      </div>
    );
  }

  // PLAYING SCREEN
  if (!questions.length) return null;
  const q = questions[current];
  if (!q) return null;

  // Calculate timer color and animation
  const timerColor = timeLeft <= 2 ? '#FF4757' : 
                     timeLeft <= 3 ? '#FFD60A' : '#06D6A0';
  const timerScale = timeLeft <= 2 ? 'scale(1.1)' : 'scale(1)';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      {/* Speed Header */}
      <div style={{
        background: `linear-gradient(135deg, ${DIFFICULTIES[difficulty].color}, #FF6B35)`,
        borderRadius: '16px', padding: '12px 20px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚡ {DIFFICULTIES[difficulty].name}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#fff', fontSize: '1rem' }}>
          {current + 1}/{questions.length}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#fff', fontSize: '1rem' }}>⭐ {score}</div>
      </div>

      {/* Big Timer */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: '5rem',
          color: timerColor,
          lineHeight: 1,
          transform: timerScale,
          transition: 'transform 0.2s ease',
          textShadow: timeLeft <= 2 ? '0 0 20px #FF4757' : 'none'
        }}>
          {timeLeft}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
          seconds left • {DIFFICULTIES[difficulty].points}pts + time bonus
        </div>
      </div>

      {/* Timer Bar */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px',
        height: '8px',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: timerColor,
          height: '8px',
          width: `${(timeLeft / DIFFICULTIES[difficulty].timer) * 100}%`,
          transition: 'width 1s linear',
          boxShadow: timeLeft <= 2 ? `0 0 10px ${timerColor}` : 'none'
        }}/>
      </div>

      {/* Category Badge */}
      <div style={{
        display: 'inline-block',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        padding: '4px 12px',
        marginBottom: '12px',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.5)'
      }}>
        {selectedCat}
      </div>

      {/* Question */}
      <div style={{
        background: '#16213E',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center',
        boxShadow: '0 8px 0 rgba(0,0,0,0.3)'
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: '1.2rem',
          lineHeight: 1.6,
          color: '#fff'
        }}>
          {q.question}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === parseInt(q.correct);
          const isSelected = i === selected;
          
          let bg = 'rgba(255,255,255,0.04)';
          let border = 'rgba(255,255,255,0.1)';
          let transform = 'scale(1)';
          
          if (selected !== null) {
            if (isCorrect) {
              bg = 'rgba(6,214,160,0.2)';
              border = '#06D6A0';
            } else if (isSelected) {
              bg = 'rgba(255,71,87,0.2)';
              border = '#FF4757';
            }
          } else if (!selected && timeLeft <= 2) {
            // Pulse effect when time is running out
            transform = 'scale(1.02)';
          }
          
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              style={{
                background: bg,
                border: `2px solid ${border}`,
                color: '#fff',
                padding: '14px 20px',
                borderRadius: '14px',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s ease',
                transform: transform,
                boxShadow: !selected && timeLeft <= 2 ? '0 0 10px rgba(255,71,87,0.3)' : 'none'
              }}
            >
              <span style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: COLORS[i],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: "'Fredoka One', cursive",
                fontSize: '0.85rem'
              }}>
                {letters[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Progress Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        {questions.map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i < current ? '#06D6A0' :
                         i === current ? '#FFD60A' :
                         'rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes timerPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}