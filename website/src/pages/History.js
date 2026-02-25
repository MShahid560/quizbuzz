import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../services/api';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user) { navigate('/profile'); return; }
    getHistory(user.uid)
      .then(res => {
        if (res.data.success) setHistory(res.data.history);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  const categories = ['All', ...new Set(history.map(h => h.category))];
  const filtered = filter === 'All' 
    ? history 
    : history.filter(h => h.category === filter);

  // Calculate stats
  const totalGames = history.length;
  const totalCorrect = history.reduce((sum, h) => sum + (h.correct || 0), 0);
  const totalQuestions = history.reduce((sum, h) => 
    sum + (h.correct || 0) + (h.wrong || 0), 0);
  const avgAccuracy = totalQuestions > 0 
    ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestScore = history.length > 0 
    ? Math.max(...history.map(h => h.score || 0)) : 0;

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const getScoreColor = (correct, total) => {
    const pct = total > 0 ? (correct / total) * 100 : 0;
    if (pct >= 80) return '#06D6A0';
    if (pct >= 60) return '#FFD60A';
    return '#FF4757';
  };

  const getScoreEmoji = (correct, total) => {
    const pct = total > 0 ? (correct / total) * 100 : 0;
    if (pct >= 90) return '🏆';
    if (pct >= 70) return '🎉';
    if (pct >= 50) return '👍';
    return '💪';
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
      <div style={{ fontFamily: "'Fredoka One', cursive", 
        fontSize: '1.5rem', color: '#FFD60A' }}>
        Loading your history...
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 20px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2.5rem' }}>
          📊 Quiz History
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
          {user?.username}'s game history
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Games', value: totalGames, color: '#7B2FFF', icon: '🎮' },
          { label: 'Best Score', value: bestScore, color: '#FFD60A', icon: '⭐' },
          { label: 'Accuracy', value: avgAccuracy + '%', color: '#06D6A0', icon: '🎯' },
          { label: 'Correct', value: totalCorrect, color: '#00B4FF', icon: '✅' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#16213E', 
            borderRadius: '16px', padding: '16px 12px',
            textAlign: 'center', 
            border: `1px solid ${stat.color}33` }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
              {stat.icon}
            </div>
            <div style={{ fontFamily: "'Fredoka One', cursive", 
              fontSize: '1.4rem', color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.7rem', 
              color: 'rgba(255,255,255,0.4)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      {history.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px',
          overflowX: 'auto', paddingBottom: '8px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '8px 16px', borderRadius: '50px', 
              whiteSpace: 'nowrap',
              border: `1px solid ${filter===cat ? '#FFD60A' : 'rgba(255,255,255,0.2)'}`,
              background: filter===cat ? 'rgba(255,214,10,0.15)' : 'transparent',
              color: filter===cat ? '#FFD60A' : 'rgba(255,255,255,0.6)',
              fontFamily: "'Nunito', sans-serif", fontWeight: 700,
              fontSize: '0.8rem', cursor: 'pointer'
            }}>{cat}</button>
          ))}
        </div>
      )}

      {/* History List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px',
          background: '#16213E', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎮</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.5rem', marginBottom: '12px' }}>
            No games yet!
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
            Play your first quiz to see your history here!
          </p>
          <button onClick={() => navigate('/')} style={{
            background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            border: 'none', color: '#fff', padding: '12px 28px',
            borderRadius: '50px', fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', cursor: 'pointer'
          }}>🎮 Play Now!</button>
        </div>
      ) : (
        filtered.map((item, i) => {
          const total = (item.correct || 0) + (item.wrong || 0);
          const pct = total > 0 
            ? Math.round((item.correct / total) * 100) : 0;
          const scoreColor = getScoreColor(item.correct, total);
          const emoji = getScoreEmoji(item.correct, total);

          return (
            <div key={item.id || i} style={{
              background: '#16213E', borderRadius: '16px',
              padding: '16px 20px', marginBottom: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'transform 0.2s'
            }}>
              <div style={{ display: 'flex', 
                alignItems: 'center', gap: '14px' }}>
                
                {/* Emoji */}
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                  {emoji}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem',
                    marginBottom: '4px' }}>
                    {item.category}
                  </div>
                  <div style={{ display: 'flex', gap: '12px',
                    fontSize: '0.78rem', 
                    color: 'rgba(255,255,255,0.4)' }}>
                    <span>📅 {formatDate(item.createdAt)}</span>
                    <span>⚡ {item.difficulty || 'Easy'}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: '8px', 
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '50px', height: '4px' }}>
                    <div style={{
                      background: scoreColor,
                      height: '4px', borderRadius: '50px',
                      width: `${pct}%`, transition: 'width 0.5s'
                    }}/>
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Fredoka One', cursive",
                    color: '#FFD60A', fontSize: '1.2rem' }}>
                    ⭐ {item.score}
                  </div>
                  <div style={{ fontSize: '0.78rem', 
                    color: scoreColor, fontWeight: 700 }}>
                    {item.correct}/{total} ({pct}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Play Again Button */}
      {history.length > 0 && (
        <button onClick={() => navigate('/')} style={{
          width: '100%', marginTop: '16px',
          background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
          border: 'none', color: '#fff', padding: '16px',
          borderRadius: '16px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1.2rem', cursor: 'pointer'
        }}>🎮 Play More Quizzes!</button>
      )}
    </div>
  );
}