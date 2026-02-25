// src/components/ThemeToggle.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ style = {} }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}
      title={`Switch to ${theme.name === 'dark' ? 'light' : 'dark'} mode`}
      style={{ background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50px', padding: '6px 14px',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', gap: '6px',
        transition: 'all 0.2s', fontSize: '0.85rem',
        color: '#fff', ...style }}>
      <span style={{ fontSize: '1rem' }}>
        {theme.name === 'dark' ? '☀️' : '🌙'}
      </span>
      <span style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.7)' }}>
        {theme.name === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}