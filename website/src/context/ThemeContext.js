// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  dark: {
    name: 'dark',
    bg: '#0D0D1A',
    bg2: '#16213E',
    bg3: '#1A1A2E',
    card: '#16213E',
    border: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.5)',
    textFaint: 'rgba(255,255,255,0.25)',
    navBg: 'rgba(13,13,26,0.95)',
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.15)',
    icon: '🌙',
    label: 'Dark Mode'
  },
  light: {
    name: 'light',
    bg: '#F0F2F8',
    bg2: '#FFFFFF',
    bg3: '#E8EAF2',
    card: '#FFFFFF',
    border: 'rgba(0,0,0,0.08)',
    text: '#1A1A2E',
    textMuted: 'rgba(0,0,0,0.55)',
    textFaint: 'rgba(0,0,0,0.3)',
    navBg: 'rgba(255,255,255,0.95)',
    inputBg: 'rgba(0,0,0,0.04)',
    inputBorder: 'rgba(0,0,0,0.15)',
    icon: '☀️',
    label: 'Light Mode'
  }
};

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() =>
    localStorage.getItem('quizbuzz_theme') || 'dark'
  );

  const theme = THEMES[themeName] || THEMES.dark;

  const toggleTheme = () => {
    const next = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(next);
    localStorage.setItem('quizbuzz_theme', next);
  };

  useEffect(() => {
    const html = document.documentElement;

    // KEY FIX: set data-theme on <html> element
    html.setAttribute('data-theme', themeName);

    // Set all CSS variables
    html.style.setProperty('--bg',           theme.bg);
    html.style.setProperty('--bg2',          theme.bg2);
    html.style.setProperty('--bg3',          theme.bg3);
    html.style.setProperty('--card',         theme.card);
    html.style.setProperty('--border',       theme.border);
    html.style.setProperty('--text',         theme.text);
    html.style.setProperty('--text-muted',   theme.textMuted);
    html.style.setProperty('--text-faint',   theme.textFaint);
    html.style.setProperty('--nav-bg',       theme.navBg);
    html.style.setProperty('--input-bg',     theme.inputBg);
    html.style.setProperty('--input-border', theme.inputBorder);
    html.style.setProperty('--select-bg',    theme.card);

    // Body + root fallback
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.transition = 'background 0.3s, color 0.3s';

    const root = document.getElementById('root');
    if (root) {
      root.style.background = theme.bg;
      root.style.transition = 'background 0.3s';
    }
  }, [themeName, theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}