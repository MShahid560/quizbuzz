import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../services/firebase';
import { isSoundEnabled, toggleSound } from '../services/sounds';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';

const hostname = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [challenges, setChallenges] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Check challenges every 15s
  useEffect(() => {
    if (!user?.uid) return;
    const checkChallenges = async () => {
      try {
        const res = await axios.get(`${API_BASE}/challenges/received/${user.uid}`);
        if (res.data.success) setChallenges(res.data.challenges);
      } catch (err) {}
    };
    checkChallenges();
    const interval = setInterval(checkChallenges, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = async () => {
    await logOut();
    logout();
    navigate('/');
  };

  const handleSoundToggle = () => {
    toggleSound();
    setSoundOn(isSoundEnabled());
  };

  const navLink = (to, label, active) => (
    <Link to={to} style={{
      color: location.pathname === to
        ? '#fff' : 'rgba(255,255,255,0.6)',
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: '0.88rem',
      padding: '6px 10px',
      borderRadius: '8px',
      background: location.pathname === to
        ? 'rgba(123,47,255,0.2)' : 'transparent',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }}>{label}</Link>
  );

  return (
    <>
      <nav style={{
        background: 'rgba(22,33,62,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 20px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 500,
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.6rem',
          background: 'linear-gradient(135deg, #FFD60A, #FF6B35, #FF3D9A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
          flexShrink: 0,
        }}>Quiz Buzz 🐝</Link>

        {/* ── Desktop Links ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '4px', flex: 1, justifyContent: 'center',
          // Hide on small screens
          '@media (max-width: 768px)': { display: 'none' }
        }}>
          {navLink('/', '🏠 Home')}
          <span
            onClick={() => {
              if (window.location.pathname === '/') {
                document.getElementById('categories')
                  ?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/#categories';
              }
            }}
            style={{
              color: 'rgba(255,255,255,0.6)', fontWeight: 700,
              fontSize: '0.88rem', padding: '6px 10px',
              borderRadius: '8px', cursor: 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>
            🧠 Quiz
          </span>
          {navLink('/games', '🎮 Games')}
          {navLink('/leaderboard', '🏆 Board')}
          {navLink('/daily', '🌟 Daily')}
          {user && navLink('/achievements', '🎖️ Achievements')}
          {user && navLink('/history', '📊 History')}
        </div>

        {/* ── Right Side ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', flexShrink: 0,
        }}>

          {/* Sound toggle */}
          <button onClick={handleSoundToggle} title="Toggle Sound"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', width: '34px', height: '34px',
              borderRadius: '50%', cursor: 'pointer',
              fontSize: '1rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
            {soundOn ? '🔊' : '🔇'}
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Challenge bell */}
          {challenges.length > 0 && (
            <div onClick={() => navigate('/games/hub')}
              title={`${challenges.length} challenge(s)!`}
              style={{ position: 'relative', cursor: 'pointer',
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,71,87,0.15)',
                border: '1px solid rgba(255,71,87,0.3)',
                borderRadius: '50%',
              }}>
              <span style={{ fontSize: '1rem' }}>⚔️</span>
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#FF4757', color: '#fff',
                borderRadius: '50%', width: '16px', height: '16px',
                fontSize: '0.6rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 800,
              }}>{challenges.length}</span>
            </div>
          )}

          {/* User / Sign In */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/profile" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                textDecoration: 'none', color: '#fff',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '4px 10px 4px 4px',
                borderRadius: '50px',
              }}>
                {user.photo ? (
                  <img src={user.photo} alt="profile"
                    referrerPolicy="no-referrer"
                    style={{ width: '28px', height: '28px',
                      borderRadius: '50%',
                      border: '2px solid #FFD60A',
                    }}/>
                ) : (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#7B2FFF,#FF3D9A)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.9rem',
                  }}>
                    {user.avatar || (user.isAdmin ? '👑' : '👤')}
                  </div>
                )}
                <span style={{ fontSize: '0.82rem', fontWeight: 700,
                  maxWidth: '80px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.username}
                </span>
              </Link>

              <button onClick={handleLogout} style={{
                background: 'rgba(255,71,87,0.15)',
                border: '1px solid rgba(255,71,87,0.3)',
                color: '#FF4757', padding: '6px 12px',
                borderRadius: '8px', cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800, fontSize: '0.78rem',
              }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/profile')} style={{
              background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
              border: 'none', color: '#fff', padding: '8px 18px',
              borderRadius: '50px', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800, fontSize: '0.85rem',
            }}>
              🔐 Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', width: '34px', height: '34px',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '1.1rem', display: 'none',
              alignItems: 'center', justifyContent: 'center',
              // Show only on mobile — handled via class below
            }}
            className="mobile-menu-btn">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0,
          background: 'rgba(13,13,26,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 499, padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {[
            ['/', '🏠 Home'],
            ['/quiz', '🧠 Quiz'],
            ['/games', '🎮 Games'],
            ['/leaderboard', '🏆 Leaderboard'],
            ['/daily', '🌟 Daily Challenge'],
            ...(user ? [
              ['/achievements', '🎖️ Achievements'],
              ['/history', '📊 History'],
              ['/profile', '👤 Profile'],
            ] : []),
          ].map(([to, label]) => (
            <Link key={to} to={to} style={{
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none', fontWeight: 700,
              padding: '12px 16px', borderRadius: '10px',
              fontSize: '1rem',
              background: location.pathname === to
                ? 'rgba(123,47,255,0.2)' : 'transparent',
              borderLeft: location.pathname === to
                ? '3px solid #7B2FFF' : '3px solid transparent',
            }}>{label}</Link>
          ))}
        </div>
      )}

      {/* Mobile CSS */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}