import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../../services/sounds';

const COLORS = [
  // Basic colors
  { name: 'Red', hex: '#FF4757', category: 'basic' },
  { name: 'Blue', hex: '#00B4FF', category: 'basic' },
  { name: 'Green', hex: '#06D6A0', category: 'basic' },
  { name: 'Yellow', hex: '#FFD60A', category: 'basic' },
  { name: 'Purple', hex: '#7B2FFF', category: 'basic' },
  { name: 'Orange', hex: '#FF6B35', category: 'basic' },
  { name: 'Pink', hex: '#FF3D9A', category: 'basic' },
  { name: 'Teal', hex: '#00CEC9', category: 'basic' },
  { name: 'Red', hex: '#FF4757', category: 'basic', family: 'warm' },
  { name: 'Blue', hex: '#2E86FA', category: 'basic', family: 'cool' },
  { name: 'Green', hex: '#06D6A0', category: 'basic', family: 'cool' },
  { name: 'Yellow', hex: '#FFD93D', category: 'basic', family: 'warm' },
  { name: 'Purple', hex: '#9B59B6', category: 'basic', family: 'cool' },
  { name: 'Orange', hex: '#FF9F43', category: 'basic', family: 'warm' },
  { name: 'Pink', hex: '#FD79A8', category: 'basic', family: 'warm' },
  { name: 'Brown', hex: '#8B4513', category: 'basic', family: 'earth' },
  { name: 'Black', hex: '#2C3A47', category: 'basic', family: 'neutral' },
  { name: 'White', hex: '#F8F9FA', category: 'basic', family: 'neutral' },
  { name: 'Gray', hex: '#7F8C8D', category: 'basic', family: 'neutral' },
  { name: 'Cyan', hex: '#00D2D3', category: 'basic', family: 'cool' },
  { name: 'Magenta', hex: '#E84342', category: 'basic', family: 'warm' },
  { name: 'Lime', hex: '#A3CB38', category: 'basic', family: 'cool' },
  { name: 'Indigo', hex: '#4834D4', category: 'basic', family: 'cool' },
  { name: 'Violet', hex: '#AA26DA', category: 'basic', family: 'cool' },
  { name: 'Gold', hex: '#F9CA24', category: 'basic', family: 'warm' },
  { name: 'Silver', hex: '#BDC3C7', category: 'basic', family: 'neutral' },
  { name: 'Maroon', hex: '#833471', category: 'basic', family: 'warm' },
  { name: 'Olive', hex: '#6AB04A', category: 'basic', family: 'earth' },
  
  // Extended colors
  { name: 'Brown', hex: '#8B4513', category: 'extended' },
  { name: 'Cyan', hex: '#00FFFF', category: 'extended' },
  { name: 'Magenta', hex: '#FF00FF', category: 'extended' },
  { name: 'Lime', hex: '#32CD32', category: 'extended' },
  { name: 'Coral', hex: '#FF7F50', category: 'extended' },
  { name: 'Indigo', hex: '#4B0082', category: 'extended' },
  { name: 'Gold', hex: '#FFD700', category: 'extended' },
  { name: 'Silver', hex: '#C0C0C0', category: 'extended' },
   { name: 'Coral', hex: '#FF6B6B', category: 'extended', family: 'warm' },
  { name: 'Turquoise', hex: '#1ABC9C', category: 'extended', family: 'cool' },
  { name: 'Lavender', hex: '#D6A2E8', category: 'extended', family: 'cool' },
  { name: 'Peach', hex: '#FFB8B8', category: 'extended', family: 'warm' },
  { name: 'Mint', hex: '#98D9C9', category: 'extended', family: 'cool' },
  { name: 'Rose', hex: '#FF80AB', category: 'extended', family: 'warm' },
  { name: 'Sky Blue', hex: '#89CFF0', category: 'extended', family: 'cool' },
  { name: 'Salmon', hex: '#FA8072', category: 'extended', family: 'warm' },
  { name: 'Beige', hex: '#F5E6D3', category: 'extended', family: 'earth' },
  { name: 'Crimson', hex: '#DC143C', category: 'extended', family: 'warm' },
  { name: 'Aqua', hex: '#00FFFF', category: 'extended', family: 'cool' },
  { name: 'Amber', hex: '#FFBF00', category: 'extended', family: 'warm' },
  { name: 'Emerald', hex: '#50C878', category: 'extended', family: 'cool' },
  { name: 'Ruby', hex: '#E0115F', category: 'extended', family: 'warm' },
  { name: 'Sapphire', hex: '#0F52BA', category: 'extended', family: 'cool' },
  { name: 'Topaz', hex: '#FFC87C', category: 'extended', family: 'warm' },
  { name: 'Plum', hex: '#8E4585', category: 'extended', family: 'cool' },
  { name: 'Mauve', hex: '#B784A7', category: 'extended', family: 'cool' },
  { name: 'Taupe', hex: '#483C32', category: 'extended', family: 'earth' },
  { name: 'Burgundy', hex: '#800020', category: 'extended', family: 'warm' },
  
  // Advanced colors
  { name: 'Turquoise', hex: '#40E0D0', category: 'advanced' },
  { name: 'Crimson', hex: '#DC143C', category: 'advanced' },
  { name: 'Violet', hex: '#8F00FF', category: 'advanced' },
  { name: 'Amber', hex: '#FFBF00', category: 'advanced' },
  { name: 'Emerald', hex: '#50C878', category: 'advanced' },
  { name: 'Ruby', hex: '#E0115F', category: 'advanced' },
  { name: 'Sapphire', hex: '#0F52BA', category: 'advanced' },
  { name: 'Rose', hex: '#FF007F', category: 'advanced' },
  { name: 'Mint', hex: '#98FB98', category: 'advanced' },
  { name: 'Lavender', hex: '#E6E6FA', category: 'advanced' },
  { name: 'Peach', hex: '#FFDAB9', category: 'advanced' },
  { name: 'Mauve', hex: '#E0B0FF', category: 'advanced' },
   { name: 'Chartreuse', hex: '#DFFF00', category: 'advanced', family: 'cool' },
  { name: 'Fuchsia', hex: '#FF77FF', category: 'advanced', family: 'warm' },
  { name: 'Celeste', hex: '#B2FFFF', category: 'advanced', family: 'cool' },
  { name: 'Vermilion', hex: '#E34234', category: 'advanced', family: 'warm' },
  { name: 'Aureolin', hex: '#FDEE00', category: 'advanced', family: 'warm' },
  { name: 'Capri', hex: '#00BFFF', category: 'advanced', family: 'cool' },
  { name: 'Cerulean', hex: '#007BA7', category: 'advanced', family: 'cool' },
  { name: 'Copper', hex: '#B87333', category: 'advanced', family: 'earth' },
  { name: 'Cinnabar', hex: '#E44D2E', category: 'advanced', family: 'warm' },
  { name: 'Denim', hex: '#1560BD', category: 'advanced', family: 'cool' },
  { name: 'Eggplant', hex: '#614051', category: 'advanced', family: 'cool' },
  { name: 'Flax', hex: '#EEDC82', category: 'advanced', family: 'earth' },
  { name: 'Glaucous', hex: '#6082B6', category: 'advanced', family: 'cool' },
  { name: 'Heliotrope', hex: '#DF73FF', category: 'advanced', family: 'cool' },
  { name: 'Iris', hex: '#5A4FCF', category: 'advanced', family: 'cool' },
  { name: 'Jade', hex: '#00A86B', category: 'advanced', family: 'cool' },
  { name: 'Koamaru', hex: '#333399', category: 'advanced', family: 'cool' },
  { name: 'Lilac', hex: '#C8A2C8', category: 'advanced', family: 'cool' },
  { name: 'Malachite', hex: '#0BDA51', category: 'advanced', family: 'cool' },
  { name: 'Navy', hex: '#000080', category: 'advanced', family: 'cool' }
];

const DIFFICULTY_SETTINGS = {
  easy: {
    name: 'Easy',
    timeLimit: 0,
    optionsCount: 4,
    colorCategories: ['basic'],
    baseScore: 100,
    description: 'Basic colors only',
    maxRounds: 15
  },
  medium: {
    name: 'Medium',
    timeLimit: 8,
    optionsCount: 6,
    colorCategories: ['basic', 'extended'],
    baseScore: 150,
    description: 'Basic + Extended colors',
    maxRounds: 20
  },
  hard: {
    name: 'Hard',
    timeLimit: 5,
    optionsCount: 8,
    colorCategories: ['basic', 'extended', 'advanced'],
    baseScore: 200,
    description: 'All colors, faster pace',
    maxRounds: 25
  }
};

const ACHIEVEMENTS = {
  firstWin: { name: 'First Steps', icon: '🎯', condition: (stats) => stats.score > 0 },
  perfectRound: { name: 'Perfect!', icon: '💯', condition: (stats) => stats.perfectRounds > 0 },
  speedDemon: { name: 'Speed Demon', icon: '⚡', condition: (stats) => stats.fastestTime < 3 },
  colorMaster: { name: 'Color Master', icon: '🎨', condition: (stats) => stats.totalRounds > 50 },
  highScore: { name: 'High Roller', icon: '👑', condition: (stats) => stats.highestScore > 1000 },
};

const generateRound = (difficulty, usedColors = []) => {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  
  // Filter colors by selected categories
  const availableColors = COLORS.filter(c => 
    settings.colorCategories.includes(c.category)
  );
  
  // Get correct color, avoiding recently used ones if possible
  let correct;
  const unusedColors = availableColors.filter(c => !usedColors.includes(c.name));
  
  if (unusedColors.length > 0) {
    correct = unusedColors[Math.floor(Math.random() * unusedColors.length)];
  } else {
    correct = availableColors[Math.floor(Math.random() * availableColors.length)];
  }
  
  // Get wrong options
  const otherColors = availableColors.filter(c => c.name !== correct.name);
  const shuffled = [...otherColors].sort(() => Math.random() - 0.5);
  const wrongOptions = shuffled.slice(0, settings.optionsCount - 1);
  
  // Mix correct with wrong options
  const options = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
  
  return { correct, options, startTime: Date.now() };
};

export default function ColorMatch() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('easy');
  const [round, setRound] = useState(() => generateRound('easy'));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalRounds, setTotalRounds] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('playing');
  const [showSidebar, setShowSidebar] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [usedColors, setUsedColors] = useState([]);
  const [stats, setStats] = useState({
    perfectRounds: 0,
    fastestTime: Infinity,
    highestScore: 0,
    totalCorrect: 0,
    totalRounds: 0
  });
  const [achievements, setAchievements] = useState({});

  const settings = DIFFICULTY_SETTINGS[difficulty];
  const maxRounds = settings?.maxRounds || 15;

  useEffect(() => {
    if (status !== 'playing') return;
    
    if (settings?.timeLimit > 0) {
      setTimeLeft(settings.timeLimit);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [round, status, settings?.timeLimit]);

  const handleTimeout = () => {
    if (selected || status !== 'playing') return;
    setSelected('timeout');
    setLives(prev => Math.max(0, prev - 1)); // Prevent negative lives
    setCombo(0);
    playSound('wrong');
    setTimeout(nextRound, 800);
  };

  const nextRound = useCallback(() => {
    if (lives <= 0) { 
      setStatus('finished');
      updateStats();
      return;
    }
    
    setRound(generateRound(difficulty, usedColors));
    setSelected(null);
    if (round?.correct?.name) {
      setUsedColors(prev => [...prev, round.correct.name].slice(-10));
    }
  }, [lives, difficulty, usedColors, round?.correct?.name]);

  useEffect(() => {
    if (totalRounds >= maxRounds && status === 'playing') { 
      setStatus('finished'); 
      playSound('complete');
      updateStats();
    }
  }, [totalRounds, maxRounds, status]);

  const updateStats = () => {
    setStats(prev => ({
      ...prev,
      highestScore: Math.max(prev.highestScore, score),
      totalRounds: prev.totalRounds + totalRounds
    }));
  };

  const handleAnswer = (color) => {
    if (selected || status !== 'playing') return;
    
    const reactionTime = (Date.now() - round.startTime) / 1000;
    setSelected(color.name);
    setTotalRounds(t => t + 1);
    
    if (color.name === round.correct.name) {
      // Calculate score with combo and time bonus
      const timeBonus = settings?.timeLimit > 0 
        ? Math.max(0, Math.floor((settings.timeLimit - reactionTime) * 10)) 
        : 50;
      const roundScore = (settings?.baseScore || 100) + timeBonus + (combo * 25);
      
      setScore(s => s + roundScore);
      setCombo(c => {
        const newCombo = c + 1;
        setMaxCombo(m => Math.max(m, newCombo));
        return newCombo;
      });
      
      setStats(prev => ({
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        fastestTime: Math.min(prev.fastestTime, reactionTime),
        perfectRounds: reactionTime < 2 ? prev.perfectRounds + 1 : prev.perfectRounds
      }));
      
      playSound('correct');
    } else {
      setLives(prev => Math.max(0, prev - 1)); // Prevent negative lives
      setCombo(0);
      playSound('wrong');
    }
    
    setTimeout(nextRound, 800);
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setTotalRounds(0);
    setSelected(null);
    setCombo(0);
    setMaxCombo(0);
    setUsedColors([]);
    setRound(generateRound(difficulty));
    setStatus('playing');
  };

  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setRound(generateRound(newDifficulty));
    resetGame();
  };

  const getTimeColor = () => {
    if (!settings?.timeLimit) return '#06D6A0';
    if (timeLeft > settings.timeLimit * 0.6) return '#06D6A0';
    if (timeLeft > settings.timeLimit * 0.3) return '#FFD60A';
    return '#FF4757';
  };

  // Helper function to render hearts safely
  const renderHearts = () => {
    const safeLives = Math.max(0, Math.min(3, lives)); // Ensure between 0 and 3
    return '❤️'.repeat(safeLives) + '🖤'.repeat(3 - safeLives);
  };

  if (status === 'finished') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🎨</div>
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2.5rem', marginBottom: '8px' }}>
        Game Complete!
      </div>
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '3rem', color: '#FFD60A', marginBottom: '8px' }}>
        ⭐ {score}
      </div>
      <div style={{ marginBottom: '24px', color: 'rgba(255,255,255,0.6)' }}>
        Max Combo: {maxCombo}x | Perfect Rounds: {stats.perfectRounds}
      </div>
      
      {/* Achievements */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: "'Fredoka One', cursive", marginBottom: '12px' }}>🏆 Achievements</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {Object.entries(ACHIEVEMENTS).map(([key, ach]) => {
            const unlocked = ach.condition({...stats, score});
            return (
              <div key={key} style={{
                padding: '8px 12px',
                background: unlocked ? 'rgba(255,214,10,0.2)' : 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                border: `1px solid ${unlocked ? '#FFD60A' : 'rgba(255,255,255,0.1)'}`,
                opacity: unlocked ? 1 : 0.5
              }}>
                {ach.icon} {ach.name}
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={resetGame} style={{
          flex: 1,
          background: 'linear-gradient(135deg, #FF3D9A, #FF6B35)',
          border: 'none', color: '#fff', padding: '14px',
          borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer'
        }}>🔄 Play Again</button>
        <button onClick={() => navigate('/games')} style={{
          flex: 1, background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
          padding: '14px', borderRadius: '14px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer'
        }}>🎮 All Games</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', maxWidth: '900px', margin: '0 auto', padding: '20px', gap: '20px' }}>
      
      {/* Sidebar */}
      {showSidebar && (
        <div style={{
          width: '220px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", margin: 0 }}>🎮 Features</h3>
            <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
          
          {/* Difficulty Selector */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              DIFFICULTY
            </div>
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
              <button
                key={key}
                onClick={() => changeDifficulty(key)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '6px',
                  borderRadius: '10px',
                  border: 'none',
                  background: difficulty === key 
                    ? 'linear-gradient(135deg, #FF3D9A, #FF6B35)'
                    : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>{setting.name}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{setting.description}</div>
              </button>
            ))}
          </div>
          
          {/* Stats */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              STATS
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>⚡ Best Time: {stats.fastestTime < Infinity ? `${stats.fastestTime.toFixed(1)}s` : '-'}</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>💯 Perfect: {stats.perfectRounds}</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>🎯 Accuracy: {stats.totalCorrect > 0 ? Math.round((stats.totalCorrect / totalRounds) * 100) : 0}%</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>🔥 Max Combo: {maxCombo}x</div>
          </div>
          
          {/* Color Categories */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              COLOR POOL
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {settings?.colorCategories.map(cat => (
                <span key={cat} style={{
                  padding: '4px 8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  textTransform: 'capitalize'
                }}>{cat}</span>
              ))}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              {COLORS.filter(c => settings?.colorCategories.includes(c.category)).length} colors
            </div>
          </div>

          {/* Current Game Info */}
          <div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              GAME INFO
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>🎯 Round: {totalRounds}/{maxRounds}</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>❤️ Lives: {lives}/3</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>⭐ Score: {score}</div>
          </div>
        </div>
      )}
      
      {/* Main Game Area */}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!showSidebar && (
              <button onClick={() => setShowSidebar(true)} style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer'
              }}>☰ Menu</button>
            )}
            <button onClick={() => navigate('/games')} style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer'
            }}>← Back</button>
          </div>
          
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem' }}>
            🎨 Color Match
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: '#FFD60A' }}>⭐ {score}</div>
            {combo > 1 && (
              <div style={{
                background: 'linear-gradient(135deg, #FF3D9A, #FF6B35)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                animation: 'pulse 1s infinite'
              }}>
                {combo}x COMBO!
              </div>
            )}
          </div>
        </div>

        {/* Game Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>{renderHearts()}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              {totalRounds}/{maxRounds}
            </span>
          </div>
          
          {/* Timer */}
          {timeLeft !== null && timeLeft > 0 && (
            <div style={{
              background: getTimeColor(),
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              transition: 'background 0.3s'
            }}>
              ⏱️ {timeLeft}s
            </div>
          )}
        </div>

        {/* Color Display */}
        <div style={{
          borderRadius: '20px', height: '160px',
          background: round.correct.hex, marginBottom: '16px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: `0 12px 40px ${round.correct.hex}66`
        }}>
        </div>

        <div style={{
          textAlign: 'center', marginBottom: '20px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)'
        }}>
          What color is this? 🎨
        </div>

        {/* Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(4, Math.ceil((settings?.optionsCount || 4) / 2))}, 1fr)`,
          gap: '12px'
        }}>
          {round.options.map((color, i) => {
            const isCorrect = color.name === round.correct.name;
            const isSelected = color.name === selected;
            let border = 'rgba(255,255,255,0.15)';
            
            if (selected) {
              if (isCorrect) border = '#06D6A0';
              else if (isSelected) border = '#FF4757';
            }
            
            return (
              <button
                key={i}
                onClick={() => handleAnswer(color)}
                disabled={!!selected}
                style={{
                  padding: '16px', borderRadius: '14px',
                  border: `3px solid ${border}`,
                  background: `${color.hex}33`,
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '1.2rem', color: '#fff',
                  cursor: selected ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: selected && !isCorrect && !isSelected ? 0.5 : 1,
                  transform: selected && isCorrect ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%', background: color.hex,
                  margin: '0 auto 6px',
                  boxShadow: `0 4px 10px ${color.hex}80`
                }}/>
                {color.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add keyframe animation for combo pulse */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}