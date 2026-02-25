// src/components/AchievementToast.js
import React, { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from '../services/achievements';

let toastQueue = [];
let setToastFn = null;

export const showAchievement = (achievementId) => {
  const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!ach) return;
  toastQueue.push(ach);
  if (setToastFn) setToastFn([...toastQueue]);
};

export default function AchievementToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setToastFn = setToasts;
    return () => { setToastFn = null; };
  }, []);

  const dismiss = (id) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    setToasts([...toastQueue]);
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        if (toasts.length > 0) dismiss(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: '80px', right: '16px',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      gap: '10px', pointerEvents: 'none' }}>
      {toasts.map((ach, i) => (
        <div key={ach.id}
          style={{ background: '#16213E',
            border: `2px solid ${ach.color}`,
            borderRadius: '16px', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: `0 8px 32px ${ach.color}44`,
            animation: 'slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            pointerEvents: 'all', maxWidth: '300px',
            cursor: 'pointer' }}
          onClick={() => dismiss(ach.id)}>

          {/* Glow icon */}
          <div style={{ width: '48px', height: '48px',
            borderRadius: '12px', flexShrink: 0,
            background: `${ach.color}22`,
            border: `1px solid ${ach.color}55`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.8rem' }}>
            {ach.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800,
              color: ach.color, textTransform: 'uppercase',
              letterSpacing: '1px', marginBottom: '2px' }}>
              🏆 Achievement Unlocked!
            </div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1rem' }}>{ach.title}</div>
            <div style={{ fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.5)' }}>{ach.desc}</div>
            {ach.xp > 0 && (
              <div style={{ fontSize: '0.72rem', color: '#FFD60A',
                fontWeight: 800, marginTop: '2px' }}>
                +{ach.xp} XP
              </div>
            )}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}