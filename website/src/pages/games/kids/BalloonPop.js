import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../../services/sounds';

const COLORS = ['#FF4757', '#FFD60A', '#06D6A0', '#00B4FF',
  '#7B2FFF', '#FF6B35', '#FF3D9A', '#FF9F1C', '#2EC4B6', '#E71D36'];

const GAME_MODES = {
  CLASSIC: 'classic',
  RAIN: 'rain',
  TIMED: 'timed',
  CHALLENGE: 'challenge',
  SURVIVAL: 'survival',
  SPEED: 'speed',
  MEMORY: 'memory',
  ENDLESS: 'endless'
};

const DIFFICULTY = {
  EASY: { name: 'Easy', speed: 1, targetPops: 3, timeLimit: 60, penalty: 0, balloonCount: 6 },
  MEDIUM: { name: 'Medium', speed: 1.5, targetPops: 5, timeLimit: 45, penalty: 10, balloonCount: 8 },
  HARD: { name: 'Hard', speed: 2, targetPops: 7, timeLimit: 30, penalty: 25, balloonCount: 10 }
};

// Balloon Component
const Balloon = ({ color, number, size, isPopped, onClick, style = {} }) => {
  if (isPopped) return null;
  
  const balloonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${size}px`,
    height: `${size * 1.2}px`,
    fontSize: `${size * 0.4}px`,
    fontWeight: 'bold',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`,
    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
    border: `2px solid ${color}`,
    boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.4)',
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, opacity 0.2s',
    animation: 'float 3s ease-in-out infinite',
    ...style
  };

  const stringStyle = {
    position: 'absolute',
    bottom: '-15px',
    width: '2px',
    height: '15px',
    background: 'linear-gradient(to bottom, #8B4513, #654321)',
    content: '""'
  };

  return (
    <div onClick={onClick} style={balloonStyle}>
      <div style={stringStyle}></div>
      {number}
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ games, selectedGame, onSelectGame, userStats }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{
      width: expanded ? '280px' : '70px',
      height: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e, #16213e)',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      position: 'fixed',
      left: 0,
      top: 0,
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      zIndex: 1000,
      boxShadow: '2px 0 10px rgba(0,0,0,0.3)'
    }}>
      {/* Toggle Button */}
      <button 
        onClick={() => setExpanded(!expanded)}
        style={{
          position: 'absolute',
          right: '10px',
          top: '10px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: '#fff',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem'
        }}
      >
        {expanded ? '◀' : '▶'}
      </button>

      {/* User Profile */}
      <div style={{
        padding: expanded ? '30px 20px' : '20px 10px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          width: expanded ? '80px' : '40px',
          height: expanded ? '80px' : '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF4757, #FFD60A)',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: expanded ? '2rem' : '1.2rem',
          marginBottom: expanded ? '10px' : '5px'
        }}>
          🎈
        </div>
        {expanded && (
          <>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>Balloon Popper</div>
            <div style={{ fontSize: '0.8rem', color: '#FFD60A' }}>Level {userStats.level}</div>
          </>
        )}
      </div>

      {/* Stats */}
      {expanded && (
        <div style={{
          padding: '15px',
          background: 'rgba(255,255,255,0.05)',
          margin: '10px',
          borderRadius: '10px'
        }}>
          <div style={{ color: '#fff', marginBottom: '5px' }}>⭐ Total Score: {userStats.totalScore}</div>
          <div style={{ color: '#fff', marginBottom: '5px' }}>🎯 Games Played: {userStats.gamesPlayed}</div>
          <div style={{ color: '#FFD60A' }}>🔥 Win Streak: {userStats.winStreak}</div>
        </div>
      )}

      {/* Games List */}
      <div style={{
        padding: expanded ? '20px' : '10px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 300px)'
      }}>
        {games.map((game, index) => (
          <button
            key={index}
            onClick={() => onSelectGame(game)}
            style={{
              width: '100%',
              padding: expanded ? '12px' : '12px 0',
              marginBottom: '8px',
              background: selectedGame?.id === game.id ? 'rgba(255,71,87,0.3)' : 'rgba(255,255,255,0.05)',
              border: selectedGame?.id === game.id ? '1px solid #FF4757' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: expanded ? 'flex-start' : 'center',
              gap: '10px',
              transition: 'all 0.2s',
              fontSize: expanded ? '1rem' : '1.2rem'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{game.icon}</span>
            {expanded && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold' }}>{game.name}</div>
                <div style={{ fontSize: '0.7rem', color: getDifficultyColor(game.difficulty.name) }}>{game.difficulty.name}</div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      {expanded && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }}>
          <button style={sidebarButtonStyle}>🏆 Achievements</button>
          <button style={sidebarButtonStyle}>⚙️ Settings</button>
        </div>
      )}
    </div>
  );
};

const getDifficultyColor = (difficulty) => {
  switch(difficulty) {
    case 'Easy': return '#06D6A0';
    case 'Medium': return '#FFD60A';
    case 'Hard': return '#FF4757';
    default: return '#fff';
  }
};

const sidebarButtonStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '8px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  cursor: 'pointer',
  textAlign: 'left'
};

// Main Game Component
export default function BalloonPop() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameMode, setGameMode] = useState(GAME_MODES.CLASSIC);
  const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userStats, setUserStats] = useState({
    level: 1,
    totalScore: 0,
    gamesPlayed: 0,
    winStreak: 0
  });
  
  const [targetNum, setTargetNum] = useState(5);
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [poppedCount, setPoppedCount] = useState(0);
  const [status, setStatus] = useState('playing');
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [highScores, setHighScores] = useState({});
  const [memorySequence, setMemorySequence] = useState([]);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [survivalWave, setSurvivalWave] = useState(1);
  const [countdown, setCountdown] = useState(0);
  
  const TOTAL_ROUNDS = 5;
  const TARGET_POPS = difficulty.targetPops;
  const animationRef = useRef();
  const gameAreaRef = useRef();
  const mountedRef = useRef(true);
  const timerRef = useRef();

  // Available games
  const availableGames = [
    // Classic Mode
    { id: 1, name: 'Classic', icon: '🎈', mode: GAME_MODES.CLASSIC, difficulty: DIFFICULTY.EASY, description: 'Pop the correct numbers' },
    { id: 2, name: 'Classic', icon: '🎈', mode: GAME_MODES.CLASSIC, difficulty: DIFFICULTY.MEDIUM, description: 'Faster gameplay' },
    { id: 3, name: 'Classic', icon: '🎈', mode: GAME_MODES.CLASSIC, difficulty: DIFFICULTY.HARD, description: 'Expert challenge' },
    // Rain Mode
    { id: 4, name: 'Rain', icon: '🌧️', mode: GAME_MODES.RAIN, difficulty: DIFFICULTY.EASY, description: 'Falling balloons' },
    { id: 5, name: 'Rain', icon: '🌧️', mode: GAME_MODES.RAIN, difficulty: DIFFICULTY.MEDIUM, description: 'Faster falling' },
    { id: 6, name: 'Rain', icon: '🌧️', mode: GAME_MODES.RAIN, difficulty: DIFFICULTY.HARD, description: 'Very fast fall' },
    // Timed Mode
    { id: 7, name: 'Timed', icon: '⏱️', mode: GAME_MODES.TIMED, difficulty: DIFFICULTY.EASY, description: '60 seconds' },
    { id: 8, name: 'Timed', icon: '⏱️', mode: GAME_MODES.TIMED, difficulty: DIFFICULTY.MEDIUM, description: '45 seconds' },
    { id: 9, name: 'Timed', icon: '⏱️', mode: GAME_MODES.TIMED, difficulty: DIFFICULTY.HARD, description: '30 seconds' },
    // Challenge Mode
    { id: 10, name: 'Challenge', icon: '⚡', mode: GAME_MODES.CHALLENGE, difficulty: DIFFICULTY.EASY, description: 'Smart difficulty' },
    { id: 11, name: 'Challenge', icon: '⚡', mode: GAME_MODES.CHALLENGE, difficulty: DIFFICULTY.MEDIUM, description: 'Adaptive challenge' },
    { id: 12, name: 'Challenge', icon: '⚡', mode: GAME_MODES.CHALLENGE, difficulty: DIFFICULTY.HARD, description: 'Expert adaptive' },
    // Survival Mode
    { id: 13, name: 'Survival', icon: '🏆', mode: GAME_MODES.SURVIVAL, difficulty: DIFFICULTY.EASY, description: '5 seconds per pop' },
    { id: 14, name: 'Survival', icon: '🏆', mode: GAME_MODES.SURVIVAL, difficulty: DIFFICULTY.MEDIUM, description: '4 seconds per pop' },
    { id: 15, name: 'Survival', icon: '🏆', mode: GAME_MODES.SURVIVAL, difficulty: DIFFICULTY.HARD, description: '3 seconds per pop' },
    // Speed Mode
    { id: 16, name: 'Speed', icon: '⚡', mode: GAME_MODES.SPEED, difficulty: DIFFICULTY.EASY, description: 'Quick reactions' },
    { id: 17, name: 'Speed', icon: '⚡', mode: GAME_MODES.SPEED, difficulty: DIFFICULTY.MEDIUM, description: 'Very fast' },
    { id: 18, name: 'Speed', icon: '⚡', mode: GAME_MODES.SPEED, difficulty: DIFFICULTY.HARD, description: 'Lightning fast' },
    // Memory Mode
    { id: 19, name: 'Memory', icon: '🧠', mode: GAME_MODES.MEMORY, difficulty: DIFFICULTY.EASY, description: 'Remember sequence' },
    { id: 20, name: 'Memory', icon: '🧠', mode: GAME_MODES.MEMORY, difficulty: DIFFICULTY.MEDIUM, description: 'Longer sequence' },
    { id: 21, name: 'Memory', icon: '🧠', mode: GAME_MODES.MEMORY, difficulty: DIFFICULTY.HARD, description: 'Complex pattern' },
    // Endless Mode
    { id: 22, name: 'Endless', icon: '∞', mode: GAME_MODES.ENDLESS, difficulty: DIFFICULTY.EASY, description: 'No rounds' },
    { id: 23, name: 'Endless', icon: '∞', mode: GAME_MODES.ENDLESS, difficulty: DIFFICULTY.MEDIUM, description: 'Increasing speed' },
    { id: 24, name: 'Endless', icon: '∞', mode: GAME_MODES.ENDLESS, difficulty: DIFFICULTY.HARD, description: 'Intense endless' }
  ];

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('balloonHighScores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
    
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
  }, []);

  // Save stats
  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(userStats));
  }, [userStats]);

  // Save high score
  useEffect(() => {
    if (score > 0) {
      const modeKey = `${gameMode}_${difficulty.name}`;
      const currentHigh = highScores[modeKey] || 0;
      if (score > currentHigh) {
        const newHighScores = { ...highScores, [modeKey]: score };
        setHighScores(newHighScores);
        localStorage.setItem('balloonHighScores', JSON.stringify(newHighScores));
      }
    }
  }, [score, gameMode, difficulty, highScores]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Generate balloons with guaranteed target numbers
  const generateBalloonsWithTarget = useCallback((target, diff, mode, wave = 1) => {
    const balloons = [];
    let count = diff.balloonCount;
    
    // Adjust for survival/challenge modes
    if (mode === GAME_MODES.SURVIVAL) count += wave - 1;
    if (mode === GAME_MODES.CHALLENGE) count += Math.floor(wave / 2);
    if (mode === GAME_MODES.ENDLESS) count = 8 + Math.floor(wave / 2);
    
    // Ensure at least 3 target balloons
    const targetCount = Math.max(3, Math.floor(count * 0.4));
    
    // Grid-based positioning
    const cols = 4;
    const rows = Math.ceil(count / cols);
    const cellWidth = 100 / cols;
    const cellHeight = 70 / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = (col * cellWidth) + (cellWidth * 0.3) + (Math.random() * cellWidth * 0.4);
      const y = mode === GAME_MODES.RAIN 
        ? -20 - (Math.random() * 30)
        : (row * cellHeight) + (cellHeight * 0.2) + (Math.random() * cellHeight * 0.3);
      
      const isTarget = i < targetCount;
      
      balloons.push({
        id: i + Date.now() + Math.random(),
        number: isTarget ? target : getRandomNumber(target, diff),
        isTarget: isTarget,
        x: Math.min(90, Math.max(5, x)),
        y: y,
        color: COLORS[i % COLORS.length],
        popped: false,
        size: 45 + (i % 3) * 5,
        speed: (0.3 + Math.random() * diff.speed) * (mode === GAME_MODES.SPEED ? 2 : 1) * (mode === GAME_MODES.ENDLESS ? 1 + (wave * 0.1) : 1),
        falling: mode === GAME_MODES.RAIN
      });
    }

    // Shuffle and ensure target balloons are visible
    return balloons.sort(() => Math.random() - 0.5);
  }, []);

  const getRandomNumber = (targetNum, difficulty) => {
    const range = difficulty === DIFFICULTY.HARD ? 8 : 5;
    let num;
    do {
      num = Math.floor(Math.random() * 9) + 1;
    } while (Math.abs(num - targetNum) > range || num === targetNum);
    return num;
  };

  // Define nextRound first to avoid circular dependency
  const nextRound = useCallback(() => {
    if (!mountedRef.current) return;

    if (gameMode === GAME_MODES.CHALLENGE) {
      // Challenge mode: smart difficulty adjustment
      if (combo >= 3) {
        setDifficulty(DIFFICULTY.HARD);
      } else if (combo >= 1) {
        setDifficulty(DIFFICULTY.MEDIUM);
      }
      setSurvivalWave(w => w + 1);
    }

    if (gameMode === GAME_MODES.MEMORY) {
      // Memory mode: add to sequence
      const newNumber = Math.floor(Math.random() * 9) + 1;
      setMemorySequence(prev => [...prev, newNumber]);
      setMemoryIndex(0);
      setTargetNum(newNumber);
      setBalloons(generateBalloonsWithTarget(newNumber, difficulty, gameMode, survivalWave));
    } else if (round >= TOTAL_ROUNDS && gameMode !== GAME_MODES.ENDLESS && gameMode !== GAME_MODES.SURVIVAL) {
      // Game complete for round-based modes
      setStatus('finished');
      setIsPlaying(false);
      setUserStats(prev => ({
        ...prev,
        totalScore: prev.totalScore + score,
        gamesPlayed: prev.gamesPlayed + 1,
        winStreak: prev.winStreak + 1,
        level: Math.floor((prev.totalScore + score) / 1000) + 1
      }));
      playSound('complete');
    } else if (gameMode === GAME_MODES.ENDLESS) {
      // Endless mode: continue with new wave
      setSurvivalWave(w => w + 1);
      const newTarget = Math.floor(Math.random() * 9) + 1;
      setTargetNum(newTarget);
      setBalloons(generateBalloonsWithTarget(newTarget, {
        ...difficulty,
        speed: difficulty.speed * (1 + survivalWave * 0.1)
      }, gameMode, survivalWave + 1));
      setFeedback(`🌊 Wave ${survivalWave + 1}`);
      playSound('complete');
    } else {
      // Next round for other modes
      const newTarget = Math.floor(Math.random() * 9) + 1;
      setTargetNum(newTarget);
      setBalloons(generateBalloonsWithTarget(newTarget, difficulty, gameMode, survivalWave));
      setRound(r => r + 1);
      setPoppedCount(0);
      setFeedback('');
    }
  }, [round, gameMode, difficulty, TOTAL_ROUNDS, combo, survivalWave, generateBalloonsWithTarget, score]);

  // Check if round is complete (all target balloons popped)
  const checkRoundComplete = useCallback(() => {
    const remainingTargets = balloons.filter(b => !b.popped && b.isTarget).length;
    if (remainingTargets === 0) {
      if (gameMode === GAME_MODES.ENDLESS) {
        // Endless mode: generate new wave with increased difficulty
        setSurvivalWave(w => w + 1);
        const newTarget = Math.floor(Math.random() * 9) + 1;
        setTargetNum(newTarget);
        setBalloons(generateBalloonsWithTarget(newTarget, {
          ...difficulty,
          speed: difficulty.speed * (1 + survivalWave * 0.1)
        }, gameMode, survivalWave + 1));
        setCombo(c => c + 1);
        setFeedback(`🎉 Wave ${survivalWave + 1} Complete! +${100 * combo}`);
        setScore(s => s + (100 * combo));
        playSound('complete');
      } else if (gameMode === GAME_MODES.SURVIVAL) {
        // Survival mode: next wave with more balloons
        setSurvivalWave(w => w + 1);
        const newTarget = Math.floor(Math.random() * 9) + 1;
        setTargetNum(newTarget);
        setBalloons(generateBalloonsWithTarget(newTarget, difficulty, gameMode, survivalWave + 1));
        setCombo(c => c + 1);
        setCountdown(5);
        setFeedback(`🌊 Wave ${survivalWave + 1}`);
        setScore(s => s + (200 * combo));
        playSound('complete');
      } else {
        // Other modes: go to next round
        nextRound();
      }
    }
  }, [balloons, gameMode, difficulty, targetNum, survivalWave, combo, generateBalloonsWithTarget, nextRound]);

  // Check round completion
  useEffect(() => {
    if (isPlaying && status === 'playing') {
      checkRoundComplete();
    }
  }, [balloons, isPlaying, status, checkRoundComplete]);

  // Game timer for timed/survival modes
  useEffect(() => {
    if (!isPlaying || status !== 'playing') return;
    
    if (gameMode === GAME_MODES.TIMED) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setStatus('finished');
            setIsPlaying(false);
            playSound('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    if (gameMode === GAME_MODES.SURVIVAL) {
      setCountdown(5);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setStatus('finished');
            setIsPlaying(false);
            playSound('wrong');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, status, isPlaying, survivalWave]);

  // Rain animation
  useEffect(() => {
    if (!isPlaying || gameMode !== GAME_MODES.RAIN || status !== 'playing') return;

    const animate = () => {
      if (!mountedRef.current) return;
      
      setBalloons(prev => prev.map(balloon => {
        if (balloon.popped) return balloon;
        
        let newY = balloon.y + balloon.speed;
        if (newY > 100) {
          newY = -10;
          if (!balloon.isTarget && difficulty.penalty > 0) {
            setScore(s => Math.max(0, s - difficulty.penalty));
            setFeedback('💨 Missed! -' + difficulty.penalty);
            playSound('wrong');
          }
        }
        
        return { ...balloon, y: newY };
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameMode, status, difficulty, isPlaying]);

  const popBalloon = (balloon) => {
    if (!isPlaying || balloon.popped || status !== 'playing') return;
    
    setBalloons(prev => prev.map(b =>
      b.id === balloon.id ? { ...b, popped: true } : b
    ));
    
    if (gameMode === GAME_MODES.MEMORY) {
      // Memory mode: need to pop in sequence
      if (balloon.number === memorySequence[memoryIndex]) {
        const pointsEarned = 100 + (combo * 20);
        setScore(s => s + pointsEarned);
        setMemoryIndex(prev => prev + 1);
        setCombo(c => c + 1);
        setFeedback(`✅ Correct! +${pointsEarned}`);
        playSound('correct');
        
        if (memoryIndex + 1 >= memorySequence.length) {
          // Sequence complete
          nextRound();
        }
      } else {
        setCombo(0);
        setScore(s => Math.max(0, s - difficulty.penalty));
        setFeedback(`❌ Wrong! That's ${balloon.number}`);
        playSound('wrong');
      }
    } else {
      // Regular gameplay
      if (balloon.number === targetNum) {
        const comboBonus = combo * 20;
        const pointsEarned = 100 + comboBonus;
        setScore(s => s + pointsEarned);
        setPoppedCount(c => c + 1);
        setCombo(c => c + 1);
        setFeedback(`🎯 +${pointsEarned} (Combo: ${combo + 1})`);
        playSound('correct');
        
        // Survival mode: reset countdown
        if (gameMode === GAME_MODES.SURVIVAL) {
          setCountdown(5);
        }
        
        // Visual feedback
        if (gameAreaRef.current) {
          gameAreaRef.current.style.backgroundColor = 'rgba(6, 214, 160, 0.1)';
          setTimeout(() => {
            if (gameAreaRef.current) {
              gameAreaRef.current.style.backgroundColor = '';
            }
          }, 200);
        }
      } else {
        setCombo(0);
        const penalty = difficulty.penalty;
        setScore(s => Math.max(0, s - penalty));
        setFeedback(`❌ That's ${balloon.number}! -${penalty}`);
        playSound('wrong');
        
        // Survival mode: reduce time
        if (gameMode === GAME_MODES.SURVIVAL) {
          setCountdown(prev => Math.max(1, prev - 2));
        }
        
        // Visual feedback
        if (gameAreaRef.current) {
          gameAreaRef.current.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
          setTimeout(() => {
            if (gameAreaRef.current) {
              gameAreaRef.current.style.backgroundColor = '';
            }
          }, 200);
        }
      }
    }
  };

  const startGame = (game) => {
    setSelectedGame(game);
    setGameMode(game.mode);
    setDifficulty(game.difficulty);
    setIsPlaying(true);
    const newTarget = Math.floor(Math.random() * 9) + 1;
    setTargetNum(newTarget);
    
    if (game.mode === GAME_MODES.MEMORY) {
      const firstNum = Math.floor(Math.random() * 9) + 1;
      setMemorySequence([firstNum]);
      setMemoryIndex(0);
      setBalloons(generateBalloonsWithTarget(firstNum, game.difficulty, game.mode));
    } else {
      setBalloons(generateBalloonsWithTarget(newTarget, game.difficulty, game.mode));
    }
    
    setScore(0);
    setRound(1);
    setSurvivalWave(1);
    setPoppedCount(0);
    setStatus('playing');
    setFeedback('');
    setTimeLeft(game.difficulty.timeLimit);
    setCombo(0);
  };

  const exitToMenu = () => {
    setIsPlaying(false);
    setSelectedGame(null);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const currentHighScore = selectedGame ? highScores[`${selectedGame.mode}_${selectedGame.difficulty.name}`] || 0 : 0;

  // Game Over Screen
  if (!isPlaying && selectedGame && status === 'finished') {
    const isHighScore = score >= currentHighScore;
    return (
      <div style={{ marginLeft: '280px', padding: '20px' }}>
        <div style={gameOverContainerStyle}>
          <div style={gameOverContentStyle}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎈</div>
            <div style={gameOverTitleStyle}>
              Game Complete!
            </div>
            {isHighScore && (
              <div style={highScoreStyle}>
                🏆 New High Score! 🏆
              </div>
            )}
            <div style={scoreDisplayStyle}>⭐ {score}</div>
            <div style={gameInfoStyle}>
              <div>Mode: {selectedGame.name} • {selectedGame.difficulty.name}</div>
              <div>Wave: {survivalWave}</div>
              <div>Best: {currentHighScore}</div>
              <div>Combo: x{combo}</div>
            </div>
            <div style={buttonGroupStyle}>
              <button onClick={() => startGame(selectedGame)} style={playAgainButtonStyle}>
                🔄 Play Again
              </button>
              <button onClick={exitToMenu} style={menuButtonStyle}>
                🎮 Change Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Selection Screen
  if (!selectedGame) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar 
          games={availableGames}
          selectedGame={selectedGame}
          onSelectGame={startGame}
          userStats={userStats}
        />
        <div style={{ marginLeft: '280px', padding: '40px', flex: 1 }}>
          <div style={welcomeContainerStyle}>
            <h1 style={welcomeTitleStyle}>🎈 Welcome to Balloon Pop!</h1>
            <p style={welcomeTextStyle}>Select a game from the sidebar to start playing</p>
            
            <div style={featureGridStyle}>
              <div style={featureCardStyle}>
                <div style={featureIconStyle}>🎯</div>
                <h3>8 Game Modes</h3>
                <p>Classic, Rain, Timed, Challenge, Survival, Speed, Memory, Endless</p>
              </div>
              <div style={featureCardStyle}>
                <div style={featureIconStyle}>⚡</div>
                <h3>3 Difficulties</h3>
                <p>Easy, Medium, Hard - Each with unique challenges</p>
              </div>
              <div style={featureCardStyle}>
                <div style={featureIconStyle}>🏆</div>
                <h3>24 Total Games</h3>
                <p>Find your perfect challenge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Game Screen
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar 
        games={availableGames}
        selectedGame={selectedGame}
        onSelectGame={startGame}
        userStats={userStats}
      />
      
      <div style={{ marginLeft: '280px', flex: 1, padding: '20px' }}>
        <div style={gameContainerStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <button onClick={exitToMenu} style={backButtonStyle}>
              ← Change Game
            </button>
            <div style={gameTitleStyle}>
              {selectedGame.icon} {selectedGame.name} • {selectedGame.difficulty.name}
            </div>
            <div style={scoreStyle}>⭐ {score}</div>
          </div>

          {/* Target Display */}
          <div style={targetContainerStyle}>
            <div style={targetLabelStyle}>
              {gameMode === GAME_MODES.MEMORY ? 'Remember sequence:' : 'Pop all balloons with number:'}
            </div>
            <div style={targetNumberStyle}>
              {gameMode === GAME_MODES.MEMORY 
                ? memorySequence.join(' → ') 
                : targetNum}
            </div>
            <div style={statsStyle}>
              <span>
                {gameMode === GAME_MODES.MEMORY 
                  ? `${memoryIndex}/${memorySequence.length} correct`
                  : `${poppedCount}/${balloons.filter(b => b.isTarget).length} popped`}
              </span>
              {gameMode !== GAME_MODES.ENDLESS && gameMode !== GAME_MODES.SURVIVAL && (
                <span>Round {round}/{TOTAL_ROUNDS}</span>
              )}
              {(gameMode === GAME_MODES.ENDLESS || gameMode === GAME_MODES.SURVIVAL) && (
                <span>Wave {survivalWave}</span>
              )}
              {gameMode === GAME_MODES.TIMED && (
                <span>⏱️ {timeLeft}s</span>
              )}
              {gameMode === GAME_MODES.SURVIVAL && (
                <span>⏱️ {countdown}s left</span>
              )}
              <span>Combo: x{combo}</span>
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div style={feedbackStyle(feedback.includes('+') || feedback.includes('🎉') || feedback.includes('🌊') ? '#06D6A0' : '#FF4757')}>
              {feedback}
            </div>
          )}

          {/* Game Area */}
          <div ref={gameAreaRef} style={gameAreaStyle}>
            {balloons.map(balloon => (
              <Balloon
                key={balloon.id}
                color={balloon.color}
                number={balloon.number}
                size={balloon.size}
                isPopped={balloon.popped}
                onClick={() => popBalloon(balloon)}
                style={{
                  position: 'absolute',
                  left: `${balloon.x}%`,
                  top: `${balloon.y}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: balloon.popped ? 0 : 1
                }}
              />
            ))}
            
            {/* Victory message when all targets popped */}
            {balloons.filter(b => !b.popped && b.isTarget).length === 0 && balloons.length > 0 && (
              <div style={victoryMessageStyle}>
                {gameMode === GAME_MODES.ENDLESS || gameMode === GAME_MODES.SURVIVAL
                  ? `🎉 Wave Complete! Get ready for wave ${survivalWave + 1}`
                  : '🎉 All target balloons popped! Next round coming...'}
              </div>
            )}
          </div>

          {/* High Score */}
          <div style={highScoreBarStyle}>
            🏆 High Score: {currentHighScore}
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const welcomeContainerStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  textAlign: 'center'
};

const welcomeTitleStyle = {
  fontFamily: "'Fredoka One', cursive",
  fontSize: '2.5rem',
  color: '#FFD60A',
  marginBottom: '20px'
};

const welcomeTextStyle = {
  fontSize: '1.2rem',
  color: 'rgba(255,255,255,0.8)',
  marginBottom: '40px'
};

const featureGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginTop: '40px'
};

const featureCardStyle = {
  background: 'rgba(255,255,255,0.05)',
  padding: '30px 20px',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.1)'
};

const featureIconStyle = {
  fontSize: '3rem',
  marginBottom: '15px'
};

const backButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: '8px 12px',
  borderRadius: '8px',
  transition: 'all 0.2s',
  ':hover': {
    background: 'rgba(255,255,255,0.1)'
  }
};

const gameContainerStyle = {
  maxWidth: '600px',
  margin: '0 auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px'
};

const gameTitleStyle = {
  fontFamily: "'Fredoka One', cursive",
  fontSize: '1.3rem',
  color: '#fff'
};

const scoreStyle = {
  fontFamily: "'Fredoka One', cursive",
  color: '#FFD60A',
  fontSize: '1.3rem'
};

const targetContainerStyle = {
  background: 'linear-gradient(135deg, #FF4757, #FF3D9A)',
  borderRadius: '20px',
  padding: '20px',
  textAlign: 'center',
  marginBottom: '15px',
  boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)'
};

const targetLabelStyle = {
  fontFamily: "'Fredoka One', cursive",
  fontSize: '1rem',
  color: 'rgba(255,255,255,0.9)',
  marginBottom: '5px'
};

const targetNumberStyle = {
  fontFamily: "'Fredoka One', cursive",
  fontSize: '3rem',
  color: '#fff',
  lineHeight: 1,
  marginBottom: '10px',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
};

const statsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  color: 'rgba(255,255,255,0.9)',
  fontSize: '0.9rem',
  fontFamily: "'Fredoka One', cursive",
  flexWrap: 'wrap',
  gap: '10px'
};

const feedbackStyle = (color) => ({
  textAlign: 'center',
  color: color,
  fontWeight: 'bold',
  marginBottom: '10px',
  fontSize: '1.1rem',
  padding: '8px',
  background: 'rgba(0,0,0,0.3)',
  borderRadius: '10px'
});

const gameAreaStyle = {
  position: 'relative',
  height: '450px',
  background: 'linear-gradient(180deg, #0D0D2A, #1A1A4A)',
  borderRadius: '24px',
  overflow: 'hidden',
  border: '2px solid rgba(255,255,255,0.1)',
  transition: 'background-color 0.2s'
};

const victoryMessageStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: '#FFD60A',
  fontSize: '1.2rem',
  textAlign: 'center',
  background: 'rgba(0,0,0,0.7)',
  padding: '20px 30px',
  borderRadius: '50px',
  border: '2px solid #FFD60A',
  animation: 'pulse 1.5s ease-in-out infinite',
  zIndex: 10
};

const highScoreBarStyle = {
  textAlign: 'center',
  marginTop: '15px',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.9rem',
  padding: '8px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '10px'
};

const gameOverContainerStyle = {
  maxWidth: '500px',
  margin: '40px auto'
};

const gameOverContentStyle = {
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '30px',
  padding: '40px 20px',
  textAlign: 'center',
  border: '1px solid rgba(255,255,255,0.1)'
};

const gameOverTitleStyle = {
  fontFamily: "'Fredoka One', cursive",
  fontSize: '2.2rem',
  color: '#FFD60A',
  marginBottom: '10px'
};

const highScoreStyle = {
  color: '#FFD60A',
  fontSize: '1.3rem',
  marginBottom: '10px',
  animation: 'pulse 1s ease-in-out infinite'
};

const scoreDisplayStyle = {
  fontFamily: "'Fredoka One', cursive",
  fontSize: '4rem',
  marginBottom: '15px',
  color: '#fff'
};

const gameInfoStyle = {
  color: 'rgba(255,255,255,0.7)',
  marginBottom: '25px',
  fontSize: '1rem',
  lineHeight: '1.6'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '10px',
  flexDirection: 'column'
};

const playAgainButtonStyle = {
  background: 'linear-gradient(135deg, #FF4757, #FF3D9A)',
  border: 'none',
  color: '#fff',
  padding: '15px',
  borderRadius: '12px',
  fontFamily: "'Fredoka One', cursive",
  fontSize: '1.1rem',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  ':hover': { transform: 'scale(1.02)' }
};

const menuButtonStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#fff',
  padding: '15px',
  borderRadius: '12px',
  fontFamily: "'Fredoka One', cursive",
  fontSize: '1.1rem',
  cursor: 'pointer'
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
document.head.appendChild(style);