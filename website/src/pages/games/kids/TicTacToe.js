import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../../services/sounds';

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const checkWinner = (board) => {
  for (let [a,b,c] of WIN_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  }
  return board.every(Boolean) ? 'draw' : null;
};

// AI difficulty levels
const getEasyMove = (board) => {
  const empty = board.map((v,i) => v ? null : i).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
};

const getMediumMove = (board) => {
  if (Math.random() > 0.5) {
    return getBestMove(board);
  }
  return getEasyMove(board);
};

const getBestMove = (board) => {
  // Try to win
  for (let [a,b,c] of WIN_COMBOS) {
    const line = [board[a], board[b], board[c]];
    if (line.filter(x => x === 'O').length === 2 && line.includes(null)) {
      return [a,b,c][line.indexOf(null)];
    }
  }
  // Block player
  for (let [a,b,c] of WIN_COMBOS) {
    const line = [board[a], board[b], board[c]];
    if (line.filter(x => x === 'X').length === 2 && line.includes(null)) {
      return [a,b,c][line.indexOf(null)];
    }
  }
  // Take center
  if (!board[4]) return 4;
  // Take corners
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }
  // Take any empty
  const empty = board.map((v,i) => v ? null : i).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
};

// Theme configurations
const THEMES = {
  default: {
    name: '🌙 Default',
    background: '#0A0F1E',
    boardBg: '#16213E',
    player: '#06D6A0',
    cpu: '#FF4757',
    draw: '#FFD60A',
    accent1: '#7B2FFF',
    accent2: '#FF3D9A',
    text: '#fff'
  },
  ocean: {
    name: '🌊 Ocean',
    background: '#0F2A44',
    boardBg: '#1E4B6E',
    player: '#64B5F6',
    cpu: '#FF8A80',
    draw: '#FFD54F',
    accent1: '#4FC3F7',
    accent2: '#0288D1',
    text: '#E1F5FE'
  },
  sunset: {
    name: '🌅 Sunset',
    background: '#2D1B3A',
    boardBg: '#4A2F4D',
    player: '#FFB74D',
    cpu: '#FF8A65',
    draw: '#FFD54F',
    accent1: '#FF7043',
    accent2: '#F06292',
    text: '#FFF3E0'
  },
  forest: {
    name: '🌲 Forest',
    background: '#1B3B2B',
    boardBg: '#2D5A3A',
    player: '#81C784',
    cpu: '#E57373',
    draw: '#FFB74D',
    accent1: '#66BB6A',
    accent2: '#43A047',
    text: '#E8F5E9'
  },
  midnight: {
    name: '🌃 Midnight',
    background: '#121212',
    boardBg: '#1E1E2F',
    player: '#BB86FC',
    cpu: '#CF6679',
    draw: '#03DAC6',
    accent1: '#3700B3',
    accent2: '#6200EE',
    text: '#FFFFFF'
  }
};

export default function TicTacToe() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ you: 0, cpu: 0, draw: 0 });
  const [winLine, setWinLine] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [theme, setTheme] = useState('default');
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    winStreak: 0,
    bestStreak: 0
  });
  const [moveHistory, setMoveHistory] = useState([]);
  
  // ✅ FIX: Use a ref to track if CPU move is in progress
  const isProcessingRef = useRef(false);

  const currentTheme = THEMES[theme];

  // ✅ FIXED: Removed moveHistory from dependencies and added guard
  useEffect(() => {
    if (!playerTurn && !winner && gameStarted && !isProcessingRef.current) {
      isProcessingRef.current = true;
      
      const timer = setTimeout(() => {
        let move;
        switch(difficulty) {
          case 'easy':
            move = getEasyMove(board);
            break;
          case 'medium':
            move = getMediumMove(board);
            break;
          case 'hard':
            move = getBestMove(board);
            break;
          default:
            move = getBestMove(board);
        }
        
        if (move !== undefined) {
          const newBoard = [...board];
          newBoard[move] = 'O';
          setBoard(newBoard);
          
          // ✅ FIX: Use functional update for moveHistory
          setMoveHistory(prev => [...prev, { player: 'O', position: move }]);
          
          const w = checkWinner(newBoard);
          if (w) {
            setWinner(w);
            for (let combo of WIN_COMBOS) {
              if (combo.every(i => newBoard[i] === w)) {
                setWinLine(combo); break;
              }
            }
            if (w === 'O') {
              setScores(s => ({ ...s, cpu: s.cpu + 1 }));
              setStats(prev => ({
                ...prev,
                gamesPlayed: prev.gamesPlayed + 1,
                winStreak: 0
              }));
              if (soundEnabled) playSound('wrong');
            } else if (w === 'draw') {
              setScores(s => ({ ...s, draw: s.draw + 1 }));
              setStats(prev => ({
                ...prev,
                gamesPlayed: prev.gamesPlayed + 1,
                winStreak: 0
              }));
              if (soundEnabled) playSound('draw');
            }
          } else {
            setPlayerTurn(true);
          }
        }
        isProcessingRef.current = false;
      }, 500);
      
      return () => {
        clearTimeout(timer);
        isProcessingRef.current = false;
      };
    }
  }, [playerTurn, board, winner, gameStarted, difficulty, soundEnabled]); // ✅ REMOVED moveHistory

  const handleClick = (i) => {
    if (!playerTurn || board[i] || winner) return;
    
    if (!gameStarted) setGameStarted(true);
    
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    
    // ✅ FIX: Use functional update for moveHistory
    setMoveHistory(prev => [...prev, { player: 'X', position: i }]);
    
    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      for (let combo of WIN_COMBOS) {
        if (combo.every(idx => newBoard[idx] === w)) {
          setWinLine(combo); break;
        }
      }
      if (w === 'X') {
        setScores(s => ({ ...s, you: s.you + 1 }));
        setStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          winStreak: prev.winStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.winStreak + 1)
        }));
        if (soundEnabled) playSound('correct');
      } else if (w === 'draw') {
        setScores(s => ({ ...s, draw: s.draw + 1 }));
        setStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          winStreak: 0
        }));
        if (soundEnabled) playSound('draw');
      }
    } else {
      setPlayerTurn(false);
    }
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinLine(null);
    setPlayerTurn(true);
    setGameStarted(false);
    setMoveHistory([]);
    isProcessingRef.current = false;
  };

  const resetScores = () => {
    setScores({ you: 0, cpu: 0, draw: 0 });
    setStats({ gamesPlayed: 0, winStreak: 0, bestStreak: 0 });
  };

  const getStatusMessage = () => {
    if (winner) {
      if (winner === 'X') return '🎉 You Win!';
      if (winner === 'draw') return '🤝 Draw!';
      return '🤖 CPU Wins!';
    }
    if (!gameStarted) return '👆 Click to start';
    return playerTurn ? '👆 Your turn (X)' : '🤖 CPU thinking...';
  };

  const getStatusColor = () => {
    if (winner === 'X') return currentTheme.player;
    if (winner === 'O') return currentTheme.cpu;
    if (winner === 'draw') return currentTheme.draw;
    return currentTheme.text;
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto', 
      padding: '30px 20px',
      minHeight: '100vh',
      background: currentTheme.background,
      color: currentTheme.text,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <button 
          onClick={() => navigate('/games')} 
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: currentTheme.text,
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ← Back
        </button>
        <div style={{ 
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem',
          color: currentTheme.text
        }}>
          ❌ Tic Tac Toe
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: currentTheme.text,
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem'
          }}
        >
          ⚙️
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          background: currentTheme.boardBg,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${currentTheme.text}22`
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Game Settings</h3>
          
          {/* Difficulty */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '8px', opacity: 0.7 }}>🤖 Difficulty:</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['easy', 'medium', 'hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: difficulty === d ? currentTheme.accent1 : 'rgba(255,255,255,0.1)',
                    color: difficulty === d ? '#fff' : currentTheme.text,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '8px', opacity: 0.7 }}>🎨 Theme:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: theme === key ? currentTheme.accent1 : 'rgba(255,255,255,0.1)',
                    color: theme === key ? '#fff' : currentTheme.text,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '8px', opacity: 0.7 }}>🔊 Sound:</div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: soundEnabled ? currentTheme.accent1 : 'rgba(255,255,255,0.1)',
                color: soundEnabled ? '#fff' : currentTheme.text,
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {soundEnabled ? '🔊 On' : '🔇 Off'}
            </button>
          </div>
        </div>
      )}

      {/* Scores */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '16px' 
      }}>
        {[
          ['😊 You', scores.you, currentTheme.player],
          ['🤝 Draw', scores.draw, currentTheme.draw],
          ['🤖 CPU', scores.cpu, currentTheme.cpu]
        ].map(([label, val, color]) => (
          <div 
            key={label} 
            style={{ 
              flex: 1, 
              background: currentTheme.boardBg,
              borderRadius: '14px', 
              padding: '12px',
              textAlign: 'center', 
              border: `1px solid ${color}44`,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ 
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.8rem', 
              color,
              lineHeight: 1
            }}>
              {val}
            </div>
            <div style={{ 
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '4px'
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        background: currentTheme.boardBg,
        borderRadius: '12px',
        padding: '12px'
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.gamesPlayed}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Games</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.winStreak}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Current Streak</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.bestStreak}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Best Streak</div>
        </div>
      </div>

      {/* Status */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '16px',
        fontFamily: "'Fredoka One', cursive", 
        fontSize: '1.2rem',
        color: getStatusColor(),
        padding: '8px',
        background: currentTheme.boardBg,
        borderRadius: '12px'
      }}>
        {getStatusMessage()}
        {difficulty !== 'medium' && gameStarted && !winner && (
          <span style={{ fontSize: '0.8rem', marginLeft: '8px', opacity: 0.7 }}>
            ({difficulty})
          </span>
        )}
      </div>

      {/* Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        {board.map((cell, i) => {
          const isWinCell = winLine?.includes(i);
          return (
            <button 
              key={i} 
              onClick={() => handleClick(i)}
              disabled={!!winner || (!playerTurn && gameStarted)}
              style={{
                aspectRatio: '1', 
                borderRadius: '16px',
                background: isWinCell
                  ? (winner === 'X' ? `${currentTheme.player}33`
                    : `${currentTheme.cpu}33`)
                  : 'rgba(255,255,255,0.06)',
                border: `2px solid ${isWinCell
                  ? (winner === 'X' ? currentTheme.player : currentTheme.cpu)
                  : 'rgba(255,255,255,0.1)'}`,
                fontFamily: "'Fredoka One', cursive",
                fontSize: '3rem', 
                cursor: winner || (!playerTurn && gameStarted) ? 'default' : 'pointer',
                color: cell === 'X' ? currentTheme.player : currentTheme.cpu,
                transition: 'all 0.2s',
                boxShadow: isWinCell ? `0 0 15px ${currentTheme.text}33` : 'none',
                opacity: cell ? 1 : 0.8
              }}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={reset} 
          style={{
            flex: 2,
            background: `linear-gradient(135deg, ${currentTheme.accent1}, ${currentTheme.accent2})`,
            border: 'none', 
            color: '#fff', 
            padding: '14px',
            borderRadius: '14px', 
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.1rem', 
            cursor: 'pointer',
            boxShadow: `0 8px 16px ${currentTheme.accent1}66`,
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          🔄 New Game
        </button>
        
        <button 
          onClick={resetScores}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: currentTheme.text,
            padding: '14px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          📊 Reset
        </button>
      </div>

      {/* Move History */}
      {moveHistory.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: currentTheme.boardBg,
          borderRadius: '12px',
          fontSize: '0.9rem'
        }}>
          <div style={{ marginBottom: '8px', opacity: 0.7 }}>📝 Last moves:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {moveHistory.slice(-5).map((move, idx) => (
              <span key={idx} style={{
                background: move.player === 'X' ? currentTheme.player + '33' : currentTheme.cpu + '33',
                padding: '4px 8px',
                borderRadius: '12px',
                color: move.player === 'X' ? currentTheme.player : currentTheme.cpu
              }}>
                {move.player} {Math.floor(move.position/3)+1},{move.position%3+1}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}