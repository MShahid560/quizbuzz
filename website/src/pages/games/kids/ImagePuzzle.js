import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../../services/sounds';

const PUZZLES = [
  { emoji: ['🌍','🌎','🌏','🗺️'], name: 'World', pieces: ['🏔️','🌊','🌲','🏜️','🌋','❄️','🦁','🦅'] },
  { emoji: ['🚀','⭐','🌙','🪐'], name: 'Space', pieces: ['☀️','💫','🌟','🛸','🌌','☄️','🔭','👨‍🚀'] },
  { emoji: ['🐬','🐳','🦈','🐙'], name: 'Ocean', pieces: ['🐠','🦀','🐚','🌊','🐋','🦑','🐟','🦞'] },
  { emoji: ['🦁','🐘','🦒','🦓'], name: 'Safari', pieces: ['🦏','🦛','🐆','🦍','🦜','🐊','🦩','🦟'] },
];

export default function ImagePuzzle() {
  const navigate = useNavigate();
  const [puzzle] = useState(
    PUZZLES[Math.floor(Math.random() * PUZZLES.length)]
  );
  const [gridSize] = useState(3);
  const [tiles, setTiles] = useState(() => {
    const arr = [...Array(gridSize * gridSize - 1).keys()];
    return [...arr.sort(() => Math.random() - 0.5), null];
  });
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState('playing');
  const [score, setScore] = useState(0);

  const isSolved = useCallback(() => {
    return tiles.every((t, i) =>
      i === tiles.length - 1 ? t === null : t === i
    );
  }, [tiles]);

  const moveTile = (idx) => {
    const emptyIdx = tiles.indexOf(null);
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    const emptyRow = Math.floor(emptyIdx / gridSize);
    const emptyCol = emptyIdx % gridSize;
    const adjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
    if (!adjacent) return;

    const newTiles = [...tiles];
    [newTiles[idx], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[idx]];
    setTiles(newTiles);
    setMoves(m => m + 1);
    playSound('click');

    if (newTiles.every((t, i) =>
      i === newTiles.length - 1 ? t === null : t === i
    )) {
      const pts = Math.max(100, 1000 - moves * 10);
      setScore(pts);
      setStatus('finished');
      playSound('complete');
    }
  };

  const TILE_EMOJIS = puzzle.pieces;

  if (status === 'finished') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🧩</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', color: '#FFD60A', marginBottom: '8px' }}>
        Puzzle Solved!
      </div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '3rem', marginBottom: '8px' }}>⭐ {score}</div>
      <div style={{ color: 'rgba(255,255,255,0.5)',
        marginBottom: '24px' }}>Solved in {moves} moves!</div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => window.location.reload()} style={{
          flex: 1, background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
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

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Back</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>🧩 Image Puzzle</div>
        <div style={{ color: 'rgba(255,255,255,0.4)',
          fontSize: '0.85rem' }}>Moves: {moves}</div>
      </div>

      {/* Theme */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center',
          gap: '8px', marginBottom: '8px' }}>
          {puzzle.emoji.map((e, i) => (
            <span key={i} style={{ fontSize: '1.8rem' }}>{e}</span>
          ))}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
          Arrange tiles in order 1-{gridSize * gridSize - 1} →
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '8px', marginBottom: '20px' }}>
        {tiles.map((tile, idx) => (
          <button key={idx} onClick={() => moveTile(idx)}
            style={{ aspectRatio: '1', borderRadius: '14px',
              background: tile === null
                ? 'rgba(255,255,255,0.03)'
                : `linear-gradient(135deg, 
                    ${['#7B2FFF','#FF3D9A','#00B4FF',
                       '#06D6A0','#FF6B35','#FFD60A',
                       '#FF4757','#00CEC9'][tile % 8]},
                    ${['#FF3D9A','#00B4FF','#06D6A0',
                       '#FFD60A','#7B2FFF','#FF6B35',
                       '#FF3D9A','#7B2FFF'][tile % 8]})`,
              border: tile === null
                ? '2px dashed rgba(255,255,255,0.1)'
                : '2px solid rgba(255,255,255,0.2)',
              cursor: tile === null ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
              color: '#fff' }}>
            {tile !== null && (
              <>
                <div style={{ fontSize: '1.8rem' }}>
                  {TILE_EMOJIS[tile % TILE_EMOJIS.length]}
                </div>
                <div style={{ fontFamily: "'Fredoka One', cursive",
                  fontSize: '0.85rem', opacity: 0.8 }}>
                  {tile + 1}
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      <button onClick={() => {
        const arr = [...Array(gridSize * gridSize - 1).keys()];
        setTiles([...arr.sort(() => Math.random() - 0.5), null]);
        setMoves(0);
      }} style={{ width: '100%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'rgba(255,255,255,0.7)', padding: '12px',
        borderRadius: '12px', fontFamily: "'Fredoka One', cursive",
        fontSize: '1rem', cursor: 'pointer' }}>
        🔀 Shuffle Again
      </button>
    </div>
  );
}