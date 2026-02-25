import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { signUp, signIn, signInWithGoogle, logOut } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const hostname = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AVATARS = [
  '🐯','🦁','🐺','🦊','🐼','🐨','🦄','🐲','🦅','🦋',
  '🐬','🦈','🐸','🦉','🐙','🎭','👑','🔥','⚡','🌟',
  '🎮','🏆','💎','🚀','🌈','🎯','🦸','🧙','🐉','🦖'
];

const ADMIN_EMAIL = 'admin@quizbuzz.com';

const styles = {
  container: { maxWidth: '440px', margin: '0 auto', padding: '40px 20px' },
  title: { fontFamily: "'Fredoka One', cursive", fontSize: '2.2rem',
    textAlign: 'center', marginBottom: '8px' },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.5)',
    marginBottom: '30px', fontSize: '0.9rem' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: (active) => ({
    flex: 1, padding: '12px', borderRadius: '14px',
    border: `2px solid ${active ? '#7B2FFF' : 'rgba(255,255,255,0.1)'}`,
    background: active ? 'rgba(123,47,255,0.2)' : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
    fontFamily: "'Fredoka One', cursive", fontSize: '1rem',
    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
  }),
  label: {
    display: 'block', fontSize: '0.75rem', fontWeight: 800,
    color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
    letterSpacing: '1px', marginBottom: '8px',
  },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
    padding: '14px 16px', borderRadius: '14px',
    fontFamily: "'Nunito', sans-serif", fontSize: '1rem',
    outline: 'none', marginBottom: '16px',
  },
  btn: (c1, c2, textColor = '#fff') => ({
    width: '100%',
    background: `linear-gradient(135deg, ${c1}, ${c2})`,
    border: 'none', color: textColor, padding: '16px',
    borderRadius: '16px', fontFamily: "'Fredoka One', cursive",
    fontSize: '1.2rem', cursor: 'pointer', marginTop: '8px',
  }),
  error: {
    color: '#FF4757', background: 'rgba(255,71,87,0.1)',
    border: '1px solid rgba(255,71,87,0.3)',
    borderRadius: '12px', padding: '12px 16px',
    marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center'
  },
  success: {
    color: '#06D6A0', background: 'rgba(6,214,160,0.1)',
    border: '1px solid rgba(6,214,160,0.3)',
    borderRadius: '12px', padding: '12px 16px',
    marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center'
  },
};

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [signupForm, setSignupForm] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Load XP & stats from Firebase
  useEffect(() => {
    if (user?.uid) {
      setSelectedAvatar(user.avatar || null);
      axios.get(`${API_BASE}/auth/profile/${user.uid}`)
        .then(res => {
          if (res.data.success) {
            setProfileData(res.data.profile);
            if (res.data.profile.avatar) {
              setSelectedAvatar(res.data.profile.avatar);
            }
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const xp = profileData?.xp || user?.xp || 0;
  const level = profileData?.level || user?.level || 1;
  const totalGames = profileData?.totalGames || 0;
  const xpProgress = xp % 100;
  

 const saveAvatar = async (avatar) => {
  setSelectedAvatar(avatar);
  setShowAvatarPicker(false);
  try {
    await axios.post(`${API_BASE}/auth/update-avatar`, {
      uid: user.uid,
      avatar: avatar,
      photo: null  // clear photo override when using emoji
    });
    login({ ...user, avatar });
  } catch (err) {
    console.error('❌ Avatar save error:', err);
  }
};

// Save Google photo to Firebase so everyone can see it
const saveGooglePhoto = async () => {
  setSelectedAvatar(null);
  setShowAvatarPicker(false);
  try {
    await axios.post(`${API_BASE}/auth/update-avatar`, {
      uid: user.uid,
      avatar: null,
      photo: user.photo  // save Google photo URL to Firebase
    });
    login({ ...user, avatar: null });
  } catch (err) {
    console.error(err);
  }
};

  // ===== GOOGLE LOGIN =====
  const handleGoogleLogin = async () => {
    setError(''); setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      await axios.post(`${API_BASE}/auth/register`, {
        uid: firebaseUser.uid,
        username: firebaseUser.displayName || 'Player',
        email: firebaseUser.email,
      }).catch(() => {});
      login({
        uid: firebaseUser.uid,
        username: firebaseUser.displayName || 'Player',
        email: firebaseUser.email,
        photo: firebaseUser.photoURL,
        isAdmin: firebaseUser.email === ADMIN_EMAIL
      });
      setSuccess('✅ Signed in with Google!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError('Google sign in failed. Try again!');
    }
    setLoading(false);
  };

  // ===== SIGN UP =====
  const handleSignup = async () => {
    setError(''); setSuccess('');
    if (!signupForm.username || !signupForm.email || !signupForm.password) {
      setError('Please fill in all fields!'); return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match!'); return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters!'); return;
    }
    setLoading(true);
    try {
      const firebaseUser = await signUp(
        signupForm.username, signupForm.email, signupForm.password
      );
      await axios.post(`${API_BASE}/auth/register`, {
        uid: firebaseUser.uid,
        username: signupForm.username,
        email: signupForm.email,
      });
      login({
        uid: firebaseUser.uid,
        username: signupForm.username,
        email: signupForm.email,
        isAdmin: signupForm.email === ADMIN_EMAIL
      });
      setSuccess('🎉 Account created successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered! Please sign in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password too weak! Use at least 6 characters.');
      } else {
        setError(err.message || 'Something went wrong. Try again!');
      }
    }
    setLoading(false);
  };

  // ===== SIGN IN =====
  const handleLogin = async () => {
    setError(''); setSuccess('');
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields!'); return;
    }
    setLoading(true);
    try {
      const firebaseUser = await signIn(loginForm.email, loginForm.password);
      login({
        uid: firebaseUser.uid,
        username: firebaseUser.displayName || loginForm.email.split('@')[0],
        email: firebaseUser.email,
        isAdmin: firebaseUser.email === ADMIN_EMAIL
      });
      setSuccess('✅ Welcome back!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password!');
      } else {
        setError(err.message || 'Login failed. Try again!');
      }
    }
    setLoading(false);
  };

  const GoogleButton = () => (
    <>
      <button onClick={handleGoogleLogin} disabled={loading} style={{
        width: '100%', background: '#ffffff',
        border: 'none', color: '#1A1A2E', padding: '14px',
        borderRadius: '14px', fontFamily: "'Nunito', sans-serif",
        fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
        marginBottom: '16px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: '10px'
      }}>
        <img src="https://www.google.com/favicon.ico"
          width="20" height="20" alt="Google" />
        Continue with Google
      </button>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)',
        marginBottom: '16px', fontSize: '0.85rem' }}>
        ─── or ───
      </div>
    </>
  );

  // ===== LOGGED IN VIEW =====
  if (user) return (
    <div style={styles.container}>
      <div style={{ background: '#16213E', borderRadius: '24px',
        padding: '30px', textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>

        {/* Profile Photo / Avatar */}
        <div style={{ position: 'relative', display: 'inline-block',
          marginBottom: '12px' }}>
          {user.photo && !selectedAvatar ? (
            <img src={user.photo} alt="profile"
              referrerPolicy="no-referrer"
              style={{ width: '90px', height: '90px', borderRadius: '50%',
                border: '3px solid #FFD60A', display: 'block' }}/>
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%',
              border: '3px solid #FFD60A', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', background: 'rgba(123,47,255,0.2)' }}>
              {selectedAvatar || (user.isAdmin ? '👑' : '👤')}
            </div>
          )}
          {/* Edit Button */}
          <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} style={{
            position: 'absolute', bottom: '0', right: '0',
            background: '#7B2FFF', border: '2px solid #0D0D1A',
            borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '0.8rem', padding: '0'
          }}>✏️</button>
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div style={{ background: '#0D0D1A', borderRadius: '16px',
            padding: '16px', marginBottom: '16px',
            border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)',
              marginBottom: '10px', fontWeight: 700 }}>
              Choose your avatar:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px',
              justifyContent: 'center' }}>
              {AVATARS.map(av => (
                <button key={av} onClick={() => saveAvatar(av)} style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  border: `2px solid ${selectedAvatar === av
                    ? '#FFD60A' : 'rgba(255,255,255,0.1)'}`,
                  background: selectedAvatar === av
                    ? 'rgba(255,214,10,0.2)' : 'rgba(255,255,255,0.05)',
                  fontSize: '1.5rem', cursor: 'pointer'
                }}>{av}</button>
              ))}
            </div>
            {user.photo && (
  <button onClick={saveGooglePhoto} style={{
    marginTop: '10px', width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.7)', padding: '8px',
    borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem',
    display: 'flex', alignItems: 'center', 
    justifyContent: 'center', gap: '8px'
  }}>
    <img src={user.photo} referrerPolicy="no-referrer"
      style={{ width: '24px', height: '24px', borderRadius: '50%' }}
      alt="google"/>
    Use my Google photo (visible to everyone)
  </button>
)}
          </div>
        )}

        {/* Name & Email */}
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.8rem', marginBottom: '4px' }}>
          {user.username}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)',
          marginBottom: '12px', fontSize: '0.9rem' }}>
          {user.email}
        </div>

        {user.isAdmin && (
          <div style={{ background: 'rgba(255,214,10,0.2)',
            border: '1px solid #FFD60A', color: '#FFD60A',
            padding: '4px 14px', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 800,
            display: 'inline-block', marginBottom: '16px' }}>
            👑 ADMIN
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '10px',
          justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(123,47,255,0.2)',
            border: '1px solid #7B2FFF', borderRadius: '12px',
            padding: '10px 16px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.5rem', color: '#7B2FFF' }}>{level}</div>
            <div style={{ fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.5)' }}>LEVEL</div>
          </div>
          <div style={{ background: 'rgba(255,214,10,0.15)',
            border: '1px solid #FFD60A', borderRadius: '12px',
            padding: '10px 16px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.5rem', color: '#FFD60A' }}>{xp}</div>
            <div style={{ fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.5)' }}>TOTAL XP</div>
          </div>
          <div style={{ background: 'rgba(6,214,160,0.15)',
            border: '1px solid #06D6A0', borderRadius: '12px',
            padding: '10px 16px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.5rem', color: '#06D6A0' }}>{totalGames}</div>
            <div style={{ fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.5)' }}>GAMES</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
            marginBottom: '6px' }}>
            <span>⚡ Level {level}</span>
            <span>{xpProgress}/100 XP → Level {level + 1}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)',
            borderRadius: '50px', height: '10px' }}>
            <div style={{
              background: 'linear-gradient(90deg, #7B2FFF, #FF3D9A)',
              height: '10px', borderRadius: '50px',
              width: `${xpProgress}%`, transition: 'width 0.8s ease',
              minWidth: xpProgress > 0 ? '10px' : '0px'
            }}/>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {user.isAdmin && (
        <button onClick={() => navigate('/admin')}
          style={{...styles.btn('#FFD60A','#FF6B35','#0D0D1A'),
            marginBottom: '12px'}}>
          👑 Admin Panel
        </button>
      )}

      <button onClick={() => navigate('/leaderboard')}
        style={{...styles.btn('#7B2FFF','#FF3D9A'), marginBottom: '12px'}}>
        🏆 Leaderboard
      </button>

      <button onClick={() => navigate('/history')}
        style={{...styles.btn('#FF6B35','#FFD60A','#0D0D1A'),
          marginBottom: '12px'}}>
        📊 Quiz History
      </button>

      <button onClick={() => navigate('/daily')}
        style={{...styles.btn('#06D6A0','#00B4FF','#0D0D1A'),
          marginBottom: '12px'}}>
        🎯 Daily Challenge
      </button>

      <button onClick={() => navigate('/')}
        style={{...styles.btn('#FF3D9A','#7B2FFF'),
          marginBottom: '12px'}}>
        🎮 Play Quiz
      </button>

      <button onClick={async () => {
        await logOut(); logout(); navigate('/');
      }} style={{
        width: '100%', background: 'rgba(255,71,87,0.15)',
        border: '2px solid #FF4757', color: '#FF4757',
        padding: '14px', borderRadius: '16px',
        fontFamily: "'Fredoka One', cursive", fontSize: '1rem',
        cursor: 'pointer', marginTop: '4px'
      }}>
        🚪 Sign Out
      </button>
    </div>
  );

  // ===== AUTH FORM =====
  return (
    <div style={styles.container}>
      <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '12px' }}>🐝</div>
      <div style={styles.title}>Quiz Buzz</div>
      <div style={styles.subtitle}>Join to unlock all features!</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px',
        marginBottom: '24px', justifyContent: 'center' }}>
        {['🤝 Challenge Friends','🏆 Leaderboard',
          '📈 Track Progress','⭐ Earn XP'].map(f => (
          <span key={f} style={{ background: 'rgba(255,255,255,0.07)',
            borderRadius: '50px', padding: '6px 12px',
            fontSize: '0.75rem', fontWeight: 700 }}>{f}</span>
        ))}
      </div>

      <div style={styles.tabs}>
        <button style={styles.tab(tab === 'login')}
          onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
          🔐 Sign In
        </button>
        <button style={styles.tab(tab === 'signup')}
          onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>
          ✨ Sign Up
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <GoogleButton />

      {/* SIGN IN */}
      {tab === 'login' && (
        <>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email"
            placeholder="your@email.com"
            value={loginForm.email}
            onChange={e => setLoginForm({...loginForm, email: e.target.value})}/>

          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password"
            placeholder="Your password"
            value={loginForm.password}
            onChange={e => setLoginForm({...loginForm, password: e.target.value})}/>

          <button style={styles.btn('#7B2FFF','#FF3D9A')}
            onClick={handleLogin} disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px',
            fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
            No account yet?{' '}
            <span style={{ color: '#00B4FF', cursor: 'pointer', fontWeight: 700 }}
              onClick={() => setTab('signup')}>Sign Up →</span>
          </div>
        </>
      )}

      {/* SIGN UP */}
      {tab === 'signup' && (
        <>
          <label style={styles.label}>Username</label>
          <input style={styles.input} type="text"
            placeholder="Your username"
            value={signupForm.username}
            onChange={e => setSignupForm({...signupForm, username: e.target.value})}/>

          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email"
            placeholder="your@email.com"
            value={signupForm.email}
            onChange={e => setSignupForm({...signupForm, email: e.target.value})}/>

          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password"
            placeholder="Min 6 characters"
            value={signupForm.password}
            onChange={e => setSignupForm({...signupForm, password: e.target.value})}/>

          <label style={styles.label}>Confirm Password</label>
          <input style={styles.input} type="password"
            placeholder="Repeat password"
            value={signupForm.confirmPassword}
            onChange={e => setSignupForm({...signupForm,
              confirmPassword: e.target.value})}/>

          <button style={styles.btn('#7B2FFF','#FF3D9A')}
            onClick={handleSignup} disabled={loading}>
            {loading ? '⏳ Creating...' : '🚀 Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px',
            fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <span style={{ color: '#00B4FF', cursor: 'pointer', fontWeight: 700 }}
              onClick={() => setTab('login')}>Sign In →</span>
          </div>
        </>
      )}
    </div>
  );
}