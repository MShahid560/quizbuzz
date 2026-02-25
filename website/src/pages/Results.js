import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveScore, updateXP } from '../services/api';

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { score=0, correct=0, wrong=0, category='', difficulty='' } = state || {};
  const total = correct + wrong;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const [xpEarned, setXpEarned] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [saved, setSaved] = useState(false);

  let emoji, title;
  if (pct >= 90) { emoji='🏆'; title='Outstanding!'; }
  else if (pct >= 70) { emoji='🎉'; title='Great Job!'; }
  else if (pct >= 50) { emoji='👍'; title='Good Effort!'; }
  else { emoji='💪'; title='Keep Going!'; }

useEffect(() => {
  if (user && score > 0 && !saved) {
    setSaved(true);

    // Save score to Firebase
  saveScore({
  userId: user.uid,
  username: user.username,
  avatar: user.avatar || null,
  photo: user.photo || null,
  category,
  difficulty,
  score,
  correct,
  wrong,
  timeTaken: total * 15
}).then(() => console.log('✅ Score saved!'))
      .catch(err => console.log('❌ Score save error:', err));

    // Update XP
    updateXP({
      uid: user.uid,
      correct,
      difficulty,
      timeTaken: total * 15
    }).then(res => {
      if (res.data.success) {
        setXpEarned(res.data.xpEarned);
        setNewLevel(res.data.newLevel);
        setLeveledUp(res.data.leveledUp);
        login({ ...user, xp: res.data.newXP, level: res.data.newLevel });
      }
    }).catch(err => console.log('❌ XP error:', err));
  }
}, []);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', 
      padding: '40px 20px', textAlign: 'center' }}>

      {/* Level Up Banner */}
      {leveledUp && (
        <div style={{ background: 'linear-gradient(135deg, #FFD60A, #FF6B35)',
          borderRadius: '20px', padding: '20px', marginBottom: '24px',
          animation: 'pulse 1s ease-in-out' }}>
          <div style={{ fontSize: '3rem' }}>🎊</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.8rem', color: '#0D0D1A' }}>
            LEVEL UP!
          </div>
          <div style={{ color: '#0D0D1A', fontWeight: 800 }}>
            You reached Level {newLevel}! 🚀
          </div>
        </div>
      )}

      <div style={{ fontSize: '5rem', marginBottom: '16px' }}>{emoji}</div>
      <div style={{ fontFamily: "'Fredoka One', cursive", 
        fontSize: '2.5rem', marginBottom: '8px' }}>{title}</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
        {category} • {difficulty}
      </div>

      {/* Score Card */}
      <div style={{ background: '#16213E', borderRadius: '24px', 
        padding: '30px', marginBottom: '16px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", 
          fontSize: '4rem', color: '#06D6A0' }}>{correct}/{total}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>
          Questions Correct
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive", 
          fontSize: '2rem', color: '#FFD60A' }}>⭐ {score} pts</div>

        {/* XP Earned */}
        {user && xpEarned > 0 && (
          <div style={{ marginTop: '12px', padding: '10px',
            background: 'rgba(123,47,255,0.2)', borderRadius: '12px',
            border: '1px solid rgba(123,47,255,0.4)' }}>
            <span style={{ color: '#7B2FFF', fontWeight: 800 }}>
              +{xpEarned} XP earned! 
            </span>
            {user.level && (
              <span style={{ color: 'rgba(255,255,255,0.5)', 
                fontSize: '0.85rem', marginLeft: '8px' }}>
                Level {user.level}
              </span>
            )}
          </div>
        )}

        {user && (
          <div style={{ marginTop: '8px', fontSize: '0.85rem', 
            color: '#06D6A0', fontWeight: 700 }}>
            ✅ Score saved to leaderboard!
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          ['✅','Correct', correct,'#06D6A0'],
          ['❌','Wrong', wrong,'#FF4757'],
          ['📊','Score %', pct+'%','#00B4FF']
        ].map(([icon, label, val, color]) => (
          <div key={label} style={{ flex: 1, background: '#16213E', 
            borderRadius: '16px', padding: '16px',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '1.5rem' }}>{icon}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", 
              fontSize: '1.4rem', color }}>{val}</div>
            <div style={{ fontSize: '0.7rem', 
              color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <button onClick={() => navigate(`/quiz/${encodeURIComponent(category)}`, {
        state: { difficulty, mode: 'saved' }
      })} style={{
        width: '100%', 
        background: 'linear-gradient(135deg, #06D6A0, #00B4FF)',
        border: 'none', color: '#0D0D1A', padding: '16px', 
        borderRadius: '16px', fontFamily: "'Fredoka One', cursive", 
        fontSize: '1.2rem', cursor: 'pointer', marginBottom: '12px'
      }}>🔄 Play Again</button>

      <button onClick={() => navigate('/')} style={{
        width: '100%', 
        background: 'linear-gradient(135deg, #FFD60A, #FF6B35)',
        border: 'none', color: '#0D0D1A', padding: '16px', 
        borderRadius: '16px', fontFamily: "'Fredoka One', cursive", 
        fontSize: '1.2rem', cursor: 'pointer', marginBottom: '12px'
      }}>🏠 Back to Home</button>

      <button onClick={() => navigate(`/quiz/${encodeURIComponent(category)}`, {
        state: { difficulty, mode: 'ai' }
      })} style={{
        width: '100%', background: 'rgba(123,47,255,0.2)',
        border: '2px solid #7B2FFF', color: '#fff', 
        padding: '16px', borderRadius: '16px',
        fontFamily: "'Fredoka One', cursive", fontSize: '1rem', 
        cursor: 'pointer', marginBottom: '12px'
      }}>🤖 Try AI Quiz</button>

      {/* Guest prompt */}
      {!user && (
        <div style={{ background: 'linear-gradient(135deg,rgba(123,47,255,0.3),rgba(255,61,154,0.3))',
          border: '1px solid rgba(123,47,255,0.4)', borderRadius: '20px', 
          padding: '20px', marginTop: '8px' }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.1rem', marginBottom: '8px' }}>
            🚀 Save your score & earn XP!
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', 
            marginBottom: '14px' }}>
            Sign in to track progress, earn XP & climb the leaderboard!
          </p>
          <button onClick={() => navigate('/profile')} style={{
            background: 'linear-gradient(135deg,#7B2FFF,#FF3D9A)', 
            border: 'none', color: '#fff', padding: '12px 28px', 
            borderRadius: '50px', fontFamily: "'Fredoka One', cursive", 
            fontSize: '1rem', cursor: 'pointer'
          }}>🔐 Sign In Free</button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}