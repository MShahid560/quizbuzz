import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const GAMES = [
  { id: 'word-scramble',    name: 'Word Scramble',    icon: '🔤' },
  { id: 'memory-flip',      name: 'Memory Flip',      icon: '🃏' },
  { id: 'math-challenge',   name: 'Math Challenge',   icon: '🧮' },
  { id: 'hangman',          name: 'Hangman',          icon: '🎯' },
  { id: 'speed-round',      name: 'Speed Round',      icon: '⚡' },
  { id: 'survival',         name: 'Survival Mode',    icon: '💀' },
  { id: 'flag-quiz',        name: 'Flag Quiz',        icon: '🏳️' },
  { id: 'true-or-false',    name: 'True or False',    icon: '✅' },
  { id: 'number-sequence',  name: 'Number Sequence',  icon: '🔢' },
  { id: 'type-the-word',    name: 'Type The Word',    icon: '⌨️' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

export default function GamesLeaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('leaderboard');
  const [selectedGame, setSelectedGame] = useState('word-scramble');
  const [scores, setScores] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [challengeUser, setChallengeUser] = useState('');
  const [challengeGame, setChallengeGame] = useState('word-scramble');
  const [challengeSent, setChallengeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Load game scores
  useEffect(() => {
    if (tab !== 'leaderboard') return;
    setLoading(true);
    axios.get(`${API_BASE}/scores/game-leaderboard?game=${selectedGame}`)
      .then(res => {
        if (res.data.success) setScores(res.data.scores);
      })
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [selectedGame, tab]);

  // Load my stats
  useEffect(() => {
    if (tab !== 'stats' || !user) return;
    axios.get(`${API_BASE}/scores/game-stats/${user.uid}`)
      .then(res => {
        if (res.data.success) setMyStats(res.data.stats);
      })
      .catch(() => {});
  }, [tab, user]);

  // Load recent players
  useEffect(() => {
    if (tab !== 'recent') return;
    axios.get(`${API_BASE}/scores/recent-game-plays`)
      .then(res => {
        if (res.data.success) setRecentPlayers(res.data.players);
      })
      .catch(() => {});
  }, [tab]);

  // Load online users for challenge
  useEffect(() => {
    if (tab !== 'challenge') return;
    axios.get(`${API_BASE}/users/online`)
      .then(res => {
        if (res.data.success) {
          setOnlineUsers(res.data.users.filter(u => u.uid !== user?.uid));
        }
      })
      .catch(() => {});
  }, [tab, user]);

  const sendChallenge = async () => {
    if (!challengeUser || !user) return;
    try {
      await axios.post(`${API_BASE}/challenges/send`, {
        fromUid: user.uid,
        fromUsername: user.username,
        toUsername: challengeUser,
        game: challengeGame,
        gameIcon: GAMES.find(g => g.id === challengeGame)?.icon || '🎮'
      });
      setChallengeSent(true);
      setTimeout(() => setChallengeSent(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const getAvatar = (u) => u.avatar || u.photo || '👤';

  const tabs = [
    { id: 'leaderboard', icon: '🏆', label: 'Top Scores' },
    { id: 'stats',       icon: '📊', label: 'My Stats' },
    { id: 'recent',      icon: '🕐', label: 'Recent' },
    { id: 'challenge',   icon: '⚔️', label: 'Challenge' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center',
        gap: '16px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', padding: '8px 16px', borderRadius: '10px',
          cursor: 'pointer', fontFamily: "'Fredoka One', cursive" }}>
          ← Games
        </button>
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '2rem',
            background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent' }}>
            🎮 Games Hub
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)',
            fontSize: '0.82rem' }}>
            Leaderboards • Stats • Challenges
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px',
        overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', borderRadius: '50px', whiteSpace: 'nowrap',
            border: `2px solid ${tab === t.id
              ? '#7B2FFF' : 'rgba(255,255,255,0.1)'}`,
            background: tab === t.id
              ? 'rgba(123,47,255,0.2)' : 'transparent',
            color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '0.95rem', cursor: 'pointer',
            transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ===== LEADERBOARD TAB ===== */}
      {tab === 'leaderboard' && (
        <div>
          {/* Game Selector */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap',
            marginBottom: '20px' }}>
            {GAMES.map(g => (
              <button key={g.id} onClick={() => setSelectedGame(g.id)}
                style={{ padding: '8px 14px', borderRadius: '50px',
                  border: `1px solid ${selectedGame === g.id
                    ? '#FFD60A' : 'rgba(255,255,255,0.1)'}`,
                  background: selectedGame === g.id
                    ? 'rgba(255,214,10,0.15)' : 'rgba(255,255,255,0.04)',
                  color: selectedGame === g.id
                    ? '#FFD60A' : 'rgba(255,255,255,0.5)',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'all 0.2s' }}>
                {g.icon} {g.name}
              </button>
            ))}
          </div>

          {/* Scores */}
          <div style={{ background: '#16213E', borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Header */}
            <div style={{ padding: '16px 20px',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center' }}>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.1rem' }}>
                {GAMES.find(g => g.id === selectedGame)?.icon}{' '}
                {GAMES.find(g => g.id === selectedGame)?.name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem' }}>Top 10 Players</div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center',
                color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
            ) : scores.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                  🎮
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)',
                  fontFamily: "'Fredoka One', cursive" }}>
                  No scores yet! Be the first to play!
                </div>
                <button onClick={() => navigate(`/games/${selectedGame}`)}
                  style={{ marginTop: '12px',
                    background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
                    border: 'none', color: '#fff', padding: '10px 24px',
                    borderRadius: '50px',
                    fontFamily: "'Fredoka One', cursive",
                    cursor: 'pointer' }}>
                  Play Now →
                </button>
              </div>
            ) : (
              scores.map((s, i) => (
                <div key={i} style={{
                  padding: '14px 20px',
                  borderBottom: i < scores.length - 1
                    ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: s.userId === user?.uid
                    ? 'rgba(123,47,255,0.1)' : 'transparent' }}>

                  {/* Rank */}
                  <div style={{ width: '32px', textAlign: 'center',
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: i < 3 ? '1.3rem' : '1rem',
                    color: i < 3 ? '#FFD60A'
                      : 'rgba(255,255,255,0.3)' }}>
                    {i < 3 ? MEDAL[i] : `#${i + 1}`}
                  </div>

                  {/* Avatar */}
                  <div style={{ width: '36px', height: '36px',
                    borderRadius: '50%', background: 'rgba(123,47,255,0.2)',
                    border: '2px solid #7B2FFF',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.2rem',
                    flexShrink: 0 }}>
                    {s.avatar || s.photo
                      ? (s.avatar
                        ? s.avatar
                        : <img src={s.photo} alt=""
                            style={{ width: '100%', height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover' }}/>)
                      : '👤'}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem',
                      display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {s.username}
                      {s.userId === user?.uid && (
                        <span style={{ background: '#7B2FFF',
                          color: '#fff', fontSize: '0.6rem',
                          padding: '1px 6px', borderRadius: '50px',
                          fontWeight: 800 }}>YOU</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.35)' }}>
                      {new Date(s.playedAt?.seconds * 1000)
                        .toLocaleDateString()}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ fontFamily: "'Fredoka One', cursive",
                    fontSize: '1.2rem', color: '#FFD60A' }}>
                    ⭐ {s.score}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===== MY STATS TAB ===== */}
      {tab === 'stats' && (
        <div>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔐</div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.5rem', marginBottom: '8px' }}>
                Sign in to see your stats!
              </div>
              <button onClick={() => navigate('/profile')} style={{
                background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
                border: 'none', color: '#fff', padding: '12px 28px',
                borderRadius: '50px',
                fontFamily: "'Fredoka One', cursive",
                cursor: 'pointer' }}>Sign In →</button>
            </div>
          ) : myStats ? (
            <div>
              {/* Overall Stats */}
              <div style={{ display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px', marginBottom: '24px' }}>
                {[
                  ['🎮', myStats.totalGamesPlayed || 0, 'Games Played', '#7B2FFF'],
                  ['🏆', myStats.totalWins || 0, 'Best Games', '#FFD60A'],
                  ['⭐', myStats.totalScore || 0, 'Total Score', '#FF3D9A'],
                  ['🔥', myStats.bestStreak || 0, 'Best Streak', '#FF6B35'],
                ].map(([icon, val, label, color]) => (
                  <div key={label} style={{ background: '#16213E',
                    borderRadius: '16px', padding: '16px',
                    textAlign: 'center',
                    border: `1px solid ${color}44` }}>
                    <div style={{ fontSize: '1.8rem' }}>{icon}</div>
                    <div style={{ fontFamily: "'Fredoka One', cursive",
                      fontSize: '1.8rem', color }}>{val}</div>
                    <div style={{ fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Per-game stats */}
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.2rem', marginBottom: '14px',
                color: 'rgba(255,255,255,0.7)' }}>
                Best Score Per Game
              </div>
              <div style={{ display: 'flex', flexDirection: 'column',
                gap: '8px' }}>
                {GAMES.map(g => {
                  const gameStat = myStats.games?.[g.id];
                  return (
                    <div key={g.id} style={{ background: '#16213E',
                      borderRadius: '14px', padding: '14px 18px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '1.5rem' }}>{g.icon}</div>
                      <div style={{ flex: 1,
                        fontFamily: "'Fredoka One', cursive",
                        fontSize: '0.95rem' }}>{g.name}</div>
                      {gameStat ? (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Fredoka One', cursive",
                            color: '#FFD60A', fontSize: '1.1rem' }}>
                            ⭐ {gameStat.bestScore}
                          </div>
                          <div style={{ fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.3)' }}>
                            {gameStat.plays} plays
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'rgba(255,255,255,0.2)',
                          fontSize: '0.8rem' }}>Not played</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px',
              color: 'rgba(255,255,255,0.4)' }}>
              Loading your stats...
            </div>
          )}
        </div>
      )}

      {/* ===== RECENT PLAYERS TAB ===== */}
      {tab === 'recent' && (
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '1.1rem', marginBottom: '14px',
            color: 'rgba(255,255,255,0.6)' }}>
            🕐 Recent Game Activity
          </div>

          {recentPlayers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px',
              color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👥</div>
              No recent activity yet!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column',
              gap: '8px' }}>
              {recentPlayers.map((p, i) => (
                <div key={i} style={{ background: '#16213E',
                  borderRadius: '14px', padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  border: '1px solid rgba(255,255,255,0.06)' }}>

                  {/* Avatar */}
                  <div style={{ width: '40px', height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(123,47,255,0.2)',
                    border: '2px solid rgba(123,47,255,0.4)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.3rem',
                    flexShrink: 0 }}>
                    {p.avatar || '👤'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700,
                      fontSize: '0.95rem' }}>{p.username}</div>
                    <div style={{ fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.4)' }}>
                      played {GAMES.find(g => g.id === p.game)?.icon}{' '}
                      {GAMES.find(g => g.id === p.game)?.name || p.game}
                    </div>
                  </div>

                  {/* Score & Time */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Fredoka One', cursive",
                      color: '#FFD60A', fontSize: '1rem' }}>
                      ⭐ {p.score}
                    </div>
                    <div style={{ fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.3)' }}>
                      {p.timeAgo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== CHALLENGE TAB ===== */}
      {tab === 'challenge' && (
        <div>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔐</div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.5rem', marginBottom: '8px' }}>
                Sign in to challenge friends!
              </div>
              <button onClick={() => navigate('/profile')} style={{
                background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
                border: 'none', color: '#fff', padding: '12px 28px',
                borderRadius: '50px',
                fontFamily: "'Fredoka One', cursive",
                cursor: 'pointer' }}>Sign In →</button>
            </div>
          ) : (
            <div>
              {/* Send Challenge */}
              <div style={{ background: '#16213E', borderRadius: '20px',
                padding: '24px', marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: "'Fredoka One', cursive",
                  fontSize: '1.2rem', marginBottom: '16px' }}>
                  ⚔️ Challenge a Friend
                </div>

                {challengeSent && (
                  <div style={{ background: 'rgba(6,214,160,0.15)',
                    border: '1px solid #06D6A0', borderRadius: '12px',
                    padding: '12px', textAlign: 'center',
                    marginBottom: '16px', color: '#06D6A0',
                    fontWeight: 800 }}>
                    ✅ Challenge sent!
                  </div>
                )}

                {/* Game picker */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)', marginBottom: '8px',
                    fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px' }}>
                    Select Game
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap',
                    gap: '8px' }}>
                    {GAMES.slice(0, 6).map(g => (
                      <button key={g.id}
                        onClick={() => setChallengeGame(g.id)}
                        style={{ padding: '8px 12px', borderRadius: '10px',
                          border: `1px solid ${challengeGame === g.id
                            ? '#7B2FFF' : 'rgba(255,255,255,0.1)'}`,
                          background: challengeGame === g.id
                            ? 'rgba(123,47,255,0.2)' : 'transparent',
                          color: challengeGame === g.id
                            ? '#fff' : 'rgba(255,255,255,0.4)',
                          fontFamily: "'Fredoka One', cursive",
                          fontSize: '0.82rem', cursor: 'pointer' }}>
                          {g.icon} {g.name}
                        </button>
                    ))}
                  </div>
                </div>

                {/* Online users */}
                {onlineUsers.length > 0 ? (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.4)', marginBottom: '8px',
                      fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '1px' }}>
                      🟢 Online Now
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap',
                      gap: '8px' }}>
                      {onlineUsers.map(u => (
                        <button key={u.uid}
                          onClick={() => setChallengeUser(u.username)}
                          style={{ padding: '8px 14px', borderRadius: '50px',
                            border: `1px solid ${
                              challengeUser === u.username
                                ? '#06D6A0' : 'rgba(6,214,160,0.3)'}`,
                            background: challengeUser === u.username
                              ? 'rgba(6,214,160,0.2)' : 'transparent',
                            color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                            gap: '6px', fontFamily: "'Fredoka One', cursive",
                            fontSize: '0.85rem' }}>
                          <span style={{ width: '8px', height: '8px',
                            borderRadius: '50%', background: '#06D6A0',
                            flexShrink: 0 }}/>
                          {u.avatar || '👤'} {u.username}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.85rem', marginBottom: '14px' }}>
                    No friends online right now
                  </div>
                )}

                {/* Manual username input */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)', marginBottom: '8px',
                    fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px' }}>
                    Or Enter Username
                  </div>
                  <input value={challengeUser}
                    onChange={e => setChallengeUser(e.target.value)}
                    placeholder="Friend's username..."
                    style={{ width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', padding: '12px 16px',
                      borderRadius: '12px',
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: '1rem', outline: 'none',
                      boxSizing: 'border-box' }}/>
                </div>

                <button onClick={sendChallenge}
                  disabled={!challengeUser}
                  style={{ width: '100%',
                    background: challengeUser
                      ? 'linear-gradient(135deg, #7B2FFF, #FF3D9A)'
                      : 'rgba(255,255,255,0.1)',
                    border: 'none', color: '#fff', padding: '14px',
                    borderRadius: '14px',
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: '1.1rem',
                    cursor: challengeUser ? 'pointer' : 'default',
                    opacity: challengeUser ? 1 : 0.5 }}>
                  ⚔️ Send Challenge!
                </button>
              </div>

              {/* How it works */}
              <div style={{ background: 'rgba(123,47,255,0.1)',
                border: '1px solid rgba(123,47,255,0.3)',
                borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontFamily: "'Fredoka One', cursive",
                  marginBottom: '10px', color: '#7B2FFF' }}>
                  How it works
                </div>
                {['Pick a game you want to challenge them in',
                  'Select your friend from online list or type username',
                  'They get a notification in their chat',
                  'First to play wins the challenge!'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px',
                    marginBottom: '8px', fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ width: '20px', height: '20px',
                      borderRadius: '50%', background: '#7B2FFF',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.7rem',
                      flexShrink: 0, color: '#fff', fontWeight: 800 }}>
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}