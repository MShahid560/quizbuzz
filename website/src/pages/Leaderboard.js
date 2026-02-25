import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const hostname = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const GAMES = [
  { id: 'word-scramble',   name: 'Word Scramble',   icon: '🔤' },
  { id: 'memory-flip',     name: 'Memory Flip',     icon: '🃏' },
  { id: 'math-challenge',  name: 'Math Challenge',  icon: '🧮' },
  { id: 'hangman',         name: 'Hangman',         icon: '🎯' },
  { id: 'speed-round',     name: 'Speed Round',     icon: '⚡' },
  { id: 'survival',        name: 'Survival Mode',   icon: '💀' },
  { id: 'flag-quiz',       name: 'Flag Quiz',       icon: '🏳️' },
  { id: 'true-or-false',   name: 'True or False',   icon: '✅' },
  { id: 'number-sequence', name: 'Number Sequence', icon: '🔢' },
  { id: 'type-the-word',   name: 'Type The Word',   icon: '⌨️' },
];

const MEDAL = ['🥇','🥈','🥉'];

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
  const [challengeError, setChallengeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [receivedChallenges, setReceivedChallenges] = useState([]);

  // Load leaderboard
  useEffect(() => {
    if (tab !== 'leaderboard') return;
    setLoading(true);
    axios.get(`${API_BASE}/scores/game-leaderboard?game=${selectedGame}`)
      .then(res => {
        if (res.data.success) setScores(res.data.scores);
        else setScores([]);
      })
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [selectedGame, tab]);

  // Load my stats
  useEffect(() => {
    if (tab !== 'stats' || !user?.uid) return;
    setStatsLoading(true);
    axios.get(`${API_BASE}/scores/game-stats/${user.uid}`)
      .then(res => {
        if (res.data.success) setMyStats(res.data.stats);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
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

  // Load received challenges
  useEffect(() => {
    if (!user?.uid) return;
    axios.get(`${API_BASE}/challenges/received/${user.uid}`)
      .then(res => {
        if (res.data.success) setReceivedChallenges(res.data.challenges);
      })
      .catch(() => {});
  }, [user, tab]);

  const sendChallenge = async () => {
    if (!challengeUser.trim() || !user) return;
    setChallengeError('');
    try {
      const game = GAMES.find(g => g.id === challengeGame);
      const res = await axios.post(`${API_BASE}/challenges/send`, {
        fromUid: user.uid,
        fromUsername: user.username,
        toUsername: challengeUser.trim(),
        game: challengeGame,
        gameIcon: game?.icon || '🎮',
        gameName: game?.name || challengeGame
      });
      if (res.data.success) {
        setChallengeSent(true);
        setChallengeUser('');
        setTimeout(() => setChallengeSent(false), 3000);
      } else {
        setChallengeError(res.data.error || 'Failed to send!');
      }
    } catch (err) {
      setChallengeError(
        err.response?.data?.error || 'User not found!'
      );
    }
  };

  const tabs = [
    { id: 'leaderboard', icon: '🏆', label: 'Top Scores' },
    { id: 'stats',       icon: '📊', label: 'My Stats' },
    { id: 'recent',      icon: '🕐', label: 'Recent' },
    { id: 'challenge',   icon: '⚔️', label: 'Challenge',
      badge: receivedChallenges.length },
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
      <div style={{ display: 'flex', gap: '8px',
        marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 20px', borderRadius: '50px',
              whiteSpace: 'nowrap', position: 'relative',
              border: `2px solid ${tab === t.id
                ? '#7B2FFF' : 'rgba(255,255,255,0.1)'}`,
              background: tab === t.id
                ? 'rgba(123,47,255,0.2)' : 'transparent',
              color: tab === t.id
                ? '#fff' : 'rgba(255,255,255,0.4)',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '0.95rem', cursor: 'pointer',
              transition: 'all 0.2s' }}>
            {t.icon} {t.label}
            {t.badge > 0 && (
              <span style={{ position: 'absolute', top: '-4px',
                right: '-4px', background: '#FF4757',
                color: '#fff', borderRadius: '50%',
                width: '18px', height: '18px',
                fontSize: '0.65rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 800 }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===== LEADERBOARD TAB ===== */}
      {tab === 'leaderboard' && (
        <div>
          <div style={{ display: 'flex', gap: '8px',
            flexWrap: 'wrap', marginBottom: '20px' }}>
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

          <div style={{ background: '#16213E', borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ padding: '16px 20px',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.1rem' }}>
                {GAMES.find(g => g.id === selectedGame)?.icon}{' '}
                {GAMES.find(g => g.id === selectedGame)?.name}
              </div>
              <button onClick={() => navigate(`/games/${selectedGame}`)}
                style={{ background: 'linear-gradient(135deg,#7B2FFF,#FF3D9A)',
                  border: 'none', color: '#fff', padding: '6px 16px',
                  borderRadius: '50px',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '0.8rem', cursor: 'pointer' }}>
                Play →
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center',
                color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '2rem',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block' }}>🐝</div>
              </div>
            ) : scores.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                  🎮
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)',
                  fontFamily: "'Fredoka One', cursive",
                  marginBottom: '12px' }}>
                  No scores yet! Be the first!
                </div>
                <button onClick={() =>
                  navigate(`/games/${selectedGame}`)} style={{
                  background: 'linear-gradient(135deg,#7B2FFF,#FF3D9A)',
                  border: 'none', color: '#fff', padding: '10px 24px',
                  borderRadius: '50px',
                  fontFamily: "'Fredoka One', cursive",
                  cursor: 'pointer' }}>
                  Play Now →
                </button>
              </div>
            ) : (
              scores.map((s, i) => (
                <div key={i} style={{ padding: '14px 20px',
                  borderBottom: i < scores.length - 1
                    ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: s.userId === user?.uid
                    ? 'rgba(123,47,255,0.1)' : 'transparent',
                  transition: 'background 0.2s' }}>

                  <div style={{ width: '32px', textAlign: 'center',
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: i < 3 ? '1.3rem' : '1rem',
                    color: i < 3 ? '#FFD60A'
                      : 'rgba(255,255,255,0.3)' }}>
                    {i < 3 ? MEDAL[i] : `#${i + 1}`}
                  </div>

                  <div style={{ width: '38px', height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(123,47,255,0.2)',
                    border: '2px solid rgba(123,47,255,0.4)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: s.avatar ? '1.3rem' : '0.9rem',
                    flexShrink: 0, overflow: 'hidden' }}>
                    {s.avatar
                      ? s.avatar
                      : s.photo
                      ? <img src={s.photo} alt=""
                          referrerPolicy="no-referrer"
                          style={{ width: '100%', height: '100%',
                            objectFit: 'cover' }}/>
                      : '👤'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex', alignItems: 'center',
                      gap: '6px' }}>
                      <span style={{ overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' }}>
                        {s.username}
                      </span>
                      {s.userId === user?.uid && (
                        <span style={{ background: '#7B2FFF',
                          color: '#fff', fontSize: '0.6rem',
                          padding: '1px 6px', borderRadius: '50px',
                          fontWeight: 800, flexShrink: 0 }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.3)' }}>
                      {s.playedAt?.seconds
                        ? new Date(s.playedAt.seconds * 1000)
                            .toLocaleDateString()
                        : 'Recently'}
                    </div>
                  </div>

                  <div style={{ fontFamily: "'Fredoka One', cursive",
                    fontSize: '1.2rem', color: '#FFD60A',
                    flexShrink: 0 }}>
                    ⭐ {s.score?.toLocaleString()}
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
                fontSize: '1.5rem', marginBottom: '16px' }}>
                Sign in to see your stats!
              </div>
              <button onClick={() => navigate('/profile')} style={{
                background: 'linear-gradient(135deg,#7B2FFF,#FF3D9A)',
                border: 'none', color: '#fff', padding: '12px 28px',
                borderRadius: '50px',
                fontFamily: "'Fredoka One', cursive",
                cursor: 'pointer' }}>Sign In →</button>
            </div>
          ) : statsLoading ? (
            <div style={{ textAlign: 'center', padding: '60px',
              color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize: '2rem',
                animation: 'spin 1s linear infinite',
                display: 'inline-block', marginBottom: '12px' }}>🐝</div>
              <div>Loading your stats...</div>
            </div>
          ) : myStats ? (
            <div>
              {/* Overall cards */}
              <div style={{ display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px', marginBottom: '24px' }}>
                {[['🎮', myStats.totalGamesPlayed || 0,
                    'Games Played', '#7B2FFF'],
                  ['⭐', (myStats.totalScore || 0).toLocaleString(),
                    'Total Score', '#FFD60A'],
                  ['🏆', myStats.uniqueGames || 0,
                    'Games Tried', '#FF3D9A'],
                  ['📅', myStats.recentPlays || 0,
                    'This Week', '#06D6A0'],
                ].map(([icon, val, label, color]) => (
                  <div key={label} style={{ background: '#16213E',
                    borderRadius: '16px', padding: '16px',
                    textAlign: 'center',
                    border: `1px solid ${color}44` }}>
                    <div style={{ fontSize: '1.8rem' }}>{icon}</div>
                    <div style={{ fontFamily: "'Fredoka One', cursive",
                      fontSize: '1.6rem', color }}>{val}</div>
                    <div style={{ fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.4)',
                      marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Per game best scores */}
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.1rem', marginBottom: '12px',
                color: 'rgba(255,255,255,0.6)' }}>
                🎯 Best Score Per Game
              </div>
              <div style={{ display: 'flex',
                flexDirection: 'column', gap: '8px' }}>
                {GAMES.map(g => {
                  const gs = myStats.games?.[g.id];
                  return (
                    <div key={g.id} style={{ background: '#16213E',
                      borderRadius: '14px', padding: '12px 18px',
                      display: 'flex', alignItems: 'center',
                      gap: '12px',
                      border: gs
                        ? '1px solid rgba(255,214,10,0.15)'
                        : '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '1.4rem' }}>{g.icon}</div>
                      <div style={{ flex: 1,
                        fontFamily: "'Fredoka One', cursive",
                        fontSize: '0.95rem' }}>{g.name}</div>
                      {gs ? (
                        <div style={{ display: 'flex',
                          alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily:
                              "'Fredoka One', cursive",
                              color: '#FFD60A', fontSize: '1.1rem' }}>
                              ⭐ {gs.bestScore?.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.68rem',
                              color: 'rgba(255,255,255,0.3)' }}>
                              best score
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily:
                              "'Fredoka One', cursive",
                              color: '#06D6A0', fontSize: '1.1rem' }}>
                              {gs.plays}x
                            </div>
                            <div style={{ fontSize: '0.68rem',
                              color: 'rgba(255,255,255,0.3)' }}>
                              played
                            </div>
                          </div>
                          <button onClick={() =>
                            navigate(`/games/${g.id}`)} style={{
                            background: 'rgba(123,47,255,0.2)',
                            border: '1px solid #7B2FFF',
                            color: '#fff', padding: '4px 12px',
                            borderRadius: '8px',
                            fontFamily: "'Fredoka One', cursive",
                            fontSize: '0.75rem', cursor: 'pointer' }}>
                            Play
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex',
                          alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'rgba(255,255,255,0.2)',
                            fontSize: '0.8rem' }}>Not played</span>
                          <button onClick={() =>
                            navigate(`/games/${g.id}`)} style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.5)',
                            padding: '4px 12px', borderRadius: '8px',
                            fontFamily: "'Fredoka One', cursive",
                            fontSize: '0.75rem', cursor: 'pointer' }}>
                            Try it!
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                🎮
              </div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '16px' }}>
                No game stats yet! Play some games first.
              </div>
              <button onClick={() => navigate('/games')} style={{
                background: 'linear-gradient(135deg,#7B2FFF,#FF3D9A)',
                border: 'none', color: '#fff', padding: '12px 28px',
                borderRadius: '50px',
                fontFamily: "'Fredoka One', cursive",
                cursor: 'pointer' }}>Play Games →</button>
            </div>
          )}
        </div>
      )}

      {/* ===== RECENT TAB ===== */}
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
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                👥
              </div>
              No recent activity yet!
            </div>
          ) : (
            <div style={{ display: 'flex',
              flexDirection: 'column', gap: '8px' }}>
              {recentPlayers.map((p, i) => (
                <div key={i} style={{ background: '#16213E',
                  borderRadius: '14px', padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '40px', height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(123,47,255,0.2)',
                    border: '2px solid rgba(123,47,255,0.4)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.3rem',
                    flexShrink: 0 }}>
                    {p.avatar || p.photo
                      ? (p.avatar || '👤') : '👤'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700,
                      fontSize: '0.95rem' }}>{p.username}</div>
                    <div style={{ fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.4)' }}>
                      {GAMES.find(g => g.id === p.game)?.icon}{' '}
                      {GAMES.find(g => g.id === p.game)?.name || p.game}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Fredoka One', cursive",
                      color: '#FFD60A', fontSize: '1rem' }}>
                      ⭐ {p.score?.toLocaleString()}
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
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                🔐
              </div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.5rem', marginBottom: '16px' }}>
                Sign in to challenge friends!
              </div>
              <button onClick={() => navigate('/profile')} style={{
                background: 'linear-gradient(135deg,#7B2FFF,#FF3D9A)',
                border: 'none', color: '#fff', padding: '12px 28px',
                borderRadius: '50px',
                fontFamily: "'Fredoka One', cursive",
                cursor: 'pointer' }}>Sign In →</button>
            </div>
          ) : (
            <div style={{ display: 'flex',
              flexDirection: 'column', gap: '16px' }}>

              {/* Received challenges */}
              {receivedChallenges.length > 0 && (
                <div style={{ background: 'rgba(255,71,87,0.1)',
                  border: '1px solid rgba(255,71,87,0.3)',
                  borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontFamily: "'Fredoka One', cursive",
                    fontSize: '1.1rem', color: '#FF4757',
                    marginBottom: '12px' }}>
                    ⚔️ Incoming Challenges!
                  </div>
                  {receivedChallenges.map((c, i) => (
                    <div key={i} style={{ display: 'flex',
                      alignItems: 'center', gap: '12px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>
                          {c.fromUsername}
                        </div>
                        <div style={{ fontSize: '0.8rem',
                          color: 'rgba(255,255,255,0.5)' }}>
                          challenged you to{' '}
                          {c.gameIcon} {c.gameName || c.game}
                        </div>
                      </div>
                      <button onClick={() =>
                        navigate(`/games/${c.game}`)} style={{
                        background:
                          'linear-gradient(135deg,#06D6A0,#00B4FF)',
                        border: 'none', color: '#0D0D1A',
                        padding: '8px 16px', borderRadius: '10px',
                        fontFamily: "'Fredoka One', cursive",
                        fontSize: '0.85rem', cursor: 'pointer' }}>
                        Accept! →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Send Challenge */}
              <div style={{ background: '#16213E', borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: "'Fredoka One', cursive",
                  fontSize: '1.2rem', marginBottom: '16px' }}>
                  ⚔️ Send a Challenge
                </div>

                {challengeSent && (
                  <div style={{ background: 'rgba(6,214,160,0.15)',
                    border: '1px solid #06D6A0', borderRadius: '12px',
                    padding: '12px', textAlign: 'center',
                    marginBottom: '16px', color: '#06D6A0',
                    fontFamily: "'Fredoka One', cursive" }}>
                    ✅ Challenge sent successfully!
                  </div>
                )}

                {challengeError && (
                  <div style={{ background: 'rgba(255,71,87,0.15)',
                    border: '1px solid #FF4757', borderRadius: '12px',
                    padding: '12px', textAlign: 'center',
                    marginBottom: '16px', color: '#FF4757',
                    fontFamily: "'Fredoka One', cursive" }}>
                    ❌ {challengeError}
                  </div>
                )}

                {/* Game picker */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '8px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '1px' }}>
                    1. Pick a Game
                  </div>
                  <div style={{ display: 'flex',
                    flexWrap: 'wrap', gap: '8px' }}>
                    {GAMES.map(g => (
                      <button key={g.id}
                        onClick={() => setChallengeGame(g.id)}
                        style={{ padding: '8px 12px',
                          borderRadius: '10px',
                          border: `1px solid ${
                            challengeGame === g.id
                              ? '#7B2FFF'
                              : 'rgba(255,255,255,0.1)'}`,
                          background: challengeGame === g.id
                            ? 'rgba(123,47,255,0.2)' : 'transparent',
                          color: challengeGame === g.id
                            ? '#fff' : 'rgba(255,255,255,0.4)',
                          fontFamily: "'Fredoka One', cursive",
                          fontSize: '0.82rem', cursor: 'pointer',
                          transition: 'all 0.2s' }}>
                          {g.icon} {g.name}
                        </button>
                    ))}
                  </div>
                </div>

                {/* Username input */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '8px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '1px' }}>
                    2. Enter Friend's Username
                  </div>
                  <input value={challengeUser}
                    onChange={e => {
                      setChallengeUser(e.target.value);
                      setChallengeError('');
                    }}
                    onKeyPress={e =>
                      e.key === 'Enter' && sendChallenge()}
                    placeholder="Type their username exactly..."
                    style={{ width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', padding: '12px 16px',
                      borderRadius: '12px',
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: '1rem', outline: 'none',
                      boxSizing: 'border-box' }}/>
                </div>

                {/* Preview */}
                {challengeUser && (
                  <div style={{ background: 'rgba(123,47,255,0.1)',
                    border: '1px solid rgba(123,47,255,0.3)',
                    borderRadius: '12px', padding: '12px',
                    marginBottom: '16px',
                    display: 'flex', alignItems: 'center',
                    gap: '10px', fontSize: '0.88rem',
                    color: 'rgba(255,255,255,0.7)' }}>
                    <span>⚔️</span>
                    <span>
                      <b style={{ color: '#fff' }}>{user.username}</b>
                      {' → '}
                      <b style={{ color: '#FFD60A' }}>{challengeUser}</b>
                      {' in '}
                      {GAMES.find(g => g.id === challengeGame)?.icon}
                      {' '}
                      <b>{GAMES.find(g => g.id === challengeGame)?.name}</b>
                    </span>
                  </div>
                )}

                <button onClick={sendChallenge}
                  disabled={!challengeUser.trim()}
                  style={{ width: '100%',
                    background: challengeUser.trim()
                      ? 'linear-gradient(135deg,#7B2FFF,#FF3D9A)'
                      : 'rgba(255,255,255,0.1)',
                    border: 'none', color: '#fff', padding: '14px',
                    borderRadius: '14px',
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: '1.1rem',
                    cursor: challengeUser.trim() ? 'pointer' : 'default',
                    opacity: challengeUser.trim() ? 1 : 0.5,
                    transition: 'all 0.2s' }}>
                  ⚔️ Send Challenge!
                </button>
              </div>

              {/* Info box */}
              <div style={{ background: 'rgba(123,47,255,0.08)',
                border: '1px solid rgba(123,47,255,0.2)',
                borderRadius: '14px', padding: '14px 18px' }}>
                <div style={{ fontFamily: "'Fredoka One', cursive",
                  color: '#7B2FFF', marginBottom: '8px' }}>
                  💡 How Challenges Work
                </div>
                {['Enter your friend\'s exact username',
                  'They see your challenge in their Games Hub',
                  'They click Accept and play the same game',
                  'Compare scores on the leaderboard!'
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex',
                    gap: '8px', marginBottom: '6px',
                    fontSize: '0.82rem',
                    color: 'rgba(255,255,255,0.55)' }}>
                    <span style={{ width: '18px', height: '18px',
                      borderRadius: '50%',
                      background: 'rgba(123,47,255,0.4)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem', flexShrink: 0,
                      fontWeight: 800 }}>{i + 1}</span>
                    {s}
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