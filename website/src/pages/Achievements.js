// src/pages/Achievements.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACHIEVEMENTS, getUserAchievements } from '../services/achievements';
import useSEO from '../hooks/useSEO';

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Achievements',
    description: 'Unlock achievements and earn XP by playing Quiz Buzz games!'
  });

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    getUserAchievements(user.uid).then(data => {
      setUnlocked(data.map(a => a.achievementId));
      setLoading(false);
    });
  }, [user]);

  const unlockedCount = unlocked.length;
  const totalXP = ACHIEVEMENTS
    .filter(a => unlocked.includes(a.id))
    .reduce((sum, a) => sum + a.xp, 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center',
        gap: '16px', marginBottom: '28px' }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', padding: '8px 16px', borderRadius: '10px',
          cursor: 'pointer', fontFamily: "'Fredoka One', cursive" }}>
          ← Back
        </button>
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '2rem',
            background: 'linear-gradient(135deg, #FFD60A, #FF6B35)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent' }}>
            🏆 Achievements
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)',
            fontSize: '0.82rem' }}>
            {unlockedCount}/{ACHIEVEMENTS.length} unlocked
            • {totalXP} XP earned
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.08)',
        borderRadius: '50px', height: '10px', marginBottom: '28px' }}>
        <div style={{ background:
          'linear-gradient(135deg, #FFD60A, #FF6B35)',
          borderRadius: '50px', height: '10px',
          width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`,
          transition: 'width 1s ease' }}/>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px',
          color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
          Loading achievements...
        </div>
      ) : !user ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔐</div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '1.5rem', marginBottom: '16px' }}>
            Sign in to track achievements!
          </div>
          <button onClick={() => navigate('/profile')} style={{
            background: 'linear-gradient(135deg,#FFD60A,#FF6B35)',
            border: 'none', color: '#0D0D1A', padding: '12px 28px',
            borderRadius: '50px',
            fontFamily: "'Fredoka One', cursive",
            cursor: 'pointer', fontSize: '1rem' }}>
            Sign In →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px' }}>
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            return (
              <div key={ach.id} style={{ background: '#16213E',
                borderRadius: '16px', padding: '16px',
                border: `1px solid ${isUnlocked
                  ? ach.color : 'rgba(255,255,255,0.06)'}`,
                opacity: isUnlocked ? 1 : 0.5,
                transition: 'all 0.2s',
                boxShadow: isUnlocked
                  ? `0 4px 20px ${ach.color}33` : 'none' }}>
                <div style={{ display: 'flex',
                  alignItems: 'center', gap: '10px',
                  marginBottom: '8px' }}>
                  <div style={{ width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: isUnlocked
                      ? `${ach.color}22` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isUnlocked
                      ? ach.color : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                    {isUnlocked ? ach.icon : '🔒'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Fredoka One', cursive",
                      fontSize: '0.95rem',
                      color: isUnlocked ? '#fff'
                        : 'rgba(255,255,255,0.4)' }}>
                      {ach.title}
                    </div>
                    {ach.xp > 0 && (
                      <div style={{ fontSize: '0.7rem',
                        color: isUnlocked ? '#FFD60A'
                          : 'rgba(255,255,255,0.25)',
                        fontWeight: 800 }}>
                        +{ach.xp} XP
                      </div>
                    )}
                  </div>
                  {isUnlocked && (
                    <div style={{ fontSize: '1.2rem' }}>✅</div>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem',
                  color: isUnlocked
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(255,255,255,0.25)',
                  lineHeight: 1.4 }}>{ach.desc}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}