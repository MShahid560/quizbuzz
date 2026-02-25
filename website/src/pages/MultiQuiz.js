import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import socket from '../services/socket';

export default function MultiQuiz() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const category = state?.category || 'General Knowledge';
  const difficulty = state?.difficulty || 'Easy';
  const opponent = state?.opponent;

  const [status, setStatus] = useState('waiting'); // waiting, playing, finished
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [winner, setWinner] = useState(null);
  const letters = ['A', 'B', 'C', 'D'];
  const COLORS = ['#7B2FFF', '#FF3D9A', '#00B4FF', '#06D6A0'];

  useEffect(() => {
    if (!user) { navigate('/'); return; }

    // Join room
    socket.emit('join_room', {
      roomId, user: {
        uid: user.uid,
        username: user.username,
        photo: user.photo,
        socketId: socket.id
      },
      category, difficulty
    });

    socket.on('player_joined', ({ players }) => {
      setPlayers(players);
    });

    socket.on('game_start', ({ questions, players }) => {
      setQuestions(questions);
      setPlayers(players);
      setStatus('playing');
    });

    socket.on('score_update', ({ scores }) => {
      setScores(scores);
    });

    socket.on('game_over', ({ scores, winner }) => {
      setScores(scores);
      setWinner(winner);
      setStatus('finished');
    });

    return () => {
      socket.off('player_joined');
      socket.off('game_start');
      socket.off('score_update');
      socket.off('game_over');
    };
  }, [roomId, user]);

  const nextQuestion = useCallback(() => {
    if (current + 1 >= questions.length) {
      socket.emit('game_finished', { roomId, uid: user.uid, finalScore: score });
      setStatus('finished');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTimeLeft(15);
    }
  }, [current, questions.length, roomId, user, score]);

 useEffect(() => {
    if (status !== 'playing' || selected !== null || !questions.length) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); nextQuestion(); return 15; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status, selected, nextQuestion]);

  const handleAnswer = (idx) => {
    if (selected !== null || status !== 'playing') return;
    setSelected(idx);
    let newScore = score;
    let newCorrect = correct;
    if (idx === parseInt(questions[current].correct)) {
      newScore = score + Math.max(100, Math.round(100 + (timeLeft / 15) * 100));
      newCorrect = correct + 1;
      setScore(newScore);
      setCorrect(newCorrect);
    }
    socket.emit('submit_answer', {
      roomId, uid: user.uid,
      questionIndex: current,
      correct: idx === parseInt(questions[current].correct),
      score: newScore
    });
    setTimeout(nextQuestion, 1500);
  };

  const getOpponent = () => players.find(p => p.uid !== user?.uid);
  const getMyScore = () => scores[user?.uid] || score;
  const getOpponentScore = () => {
    const opp = getOpponent();
    return opp ? scores[opp.uid] || 0 : 0;
  };

  // WAITING SCREEN
  if (status === 'waiting') return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚔️</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2rem', color: '#FFD60A', marginBottom: '12px' }}>
        Battle Room
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
        {category} • {difficulty}
      </div>

      {/* Players */}
      <div style={{ display: 'flex', justifyContent: 'center',
        gap: '30px', marginBottom: '30px' }}>
        {/* You */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%',
            background: '#7B2FFF', margin: '0 auto 8px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem',
            border: '3px solid #06D6A0' }}>
            {user?.photo ? (
              <img src={user.photo} referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', 
                  borderRadius: '50%' }} alt="you"/>
            ) : '👤'}
          </div>
          <div style={{ fontWeight: 800 }}>{user?.username}</div>
          <div style={{ color: '#06D6A0', fontSize: '0.8rem' }}>● Ready</div>
        </div>

        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2rem', color: '#FF4757',
          display: 'flex', alignItems: 'center' }}>VS</div>

        {/* Opponent */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%',
            background: '#FF3D9A', margin: '0 auto 8px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem',
            border: `3px solid ${getOpponent() ? '#06D6A0' : 'rgba(255,255,255,0.2)'}` }}>
            {getOpponent()?.photo ? (
              <img src={getOpponent().photo} referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', 
                  borderRadius: '50%' }} alt="opponent"/>
            ) : '👤'}
          </div>
          <div style={{ fontWeight: 800 }}>
            {getOpponent()?.username || opponent?.username || '???'}
          </div>
          <div style={{ 
            color: getOpponent() ? '#06D6A0' : 'rgba(255,255,255,0.4)',
            fontSize: '0.8rem' }}>
            {getOpponent() ? '● Ready' : '⏳ Joining...'}
          </div>
        </div>
      </div>

      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
        {players.length < 2 ? 
          '⏳ Waiting for opponent to join...' : 
          '🎮 Starting game...'}
      </div>

      {/* Room ID to share */}
      <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px', padding: '12px',
        color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
        Room: {roomId}
      </div>
    </div>
  );

  // FINISHED SCREEN
  if (status === 'finished') {
    const myScore = getMyScore();
    const oppScore = getOpponentScore();
    const iWon = winner === user?.uid;
    const isDraw = myScore === oppScore;

    return (
      <div style={{ maxWidth: '500px', margin: '0 auto',
        padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
          {isDraw ? '🤝' : iWon ? '🏆' : '😅'}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2.5rem', marginBottom: '24px',
          color: isDraw ? '#FFD60A' : iWon ? '#06D6A0' : '#FF4757' }}>
          {isDraw ? "It's a Draw!" : iWon ? 'You Won!' : 'You Lost!'}
        </div>

        {/* Score Comparison */}
        <div style={{ display: 'flex', gap: '16px',
          marginBottom: '28px' }}>
          <div style={{ flex: 1, background: '#16213E',
            borderRadius: '16px', padding: '20px',
            border: `2px solid ${iWon || isDraw ? '#06D6A0' : 'rgba(255,255,255,0.1)'}` }}>
            <div style={{ fontSize: '1rem', marginBottom: '8px' }}>
              {user?.photo ? (
                <img src={user.photo} referrerPolicy="no-referrer"
                  style={{ width: '40px', height: '40px', 
                    borderRadius: '50%' }} alt="you"/>
              ) : '👤'}
            </div>
            <div style={{ fontWeight: 800 }}>{user?.username}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '2rem', color: '#FFD60A' }}>
              ⭐ {myScore}
            </div>
            <div style={{ fontSize: '0.8rem', 
              color: 'rgba(255,255,255,0.5)' }}>
              {correct}/{questions.length} correct
            </div>
          </div>

          <div style={{ flex: 1, background: '#16213E',
            borderRadius: '16px', padding: '20px',
            border: `2px solid ${!iWon || isDraw ? '#FF4757' : 'rgba(255,255,255,0.1)'}` }}>
            <div style={{ fontSize: '1rem', marginBottom: '8px' }}>👤</div>
            <div style={{ fontWeight: 800 }}>
              {getOpponent()?.username || 'Opponent'}
            </div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '2rem', color: '#FFD60A' }}>
              ⭐ {oppScore}
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/')} style={{
          width: '100%', background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
          border: 'none', color: '#fff', padding: '16px', borderRadius: '16px',
          fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem',
          cursor: 'pointer', marginBottom: '12px'
        }}>🏠 Back to Home</button>
      </div>
    );
  }

  // PLAYING SCREEN
  // PLAYING SCREEN
  if (!questions.length || current >= questions.length) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
      <div style={{ fontFamily: "'Fredoka One', cursive", 
        fontSize: '1.5rem', color: '#FFD60A' }}>
        Loading questions...
      </div>
    </div>
  );

  const q = questions[current];
  if (!q) return null;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>

      {/* Live Scores */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: '#16213E', borderRadius: '14px',
          padding: '12px 16px', border: '2px solid #7B2FFF',
          display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center' }}>
          <span style={{ fontWeight: 800 }}>👤 {user?.username}</span>
          <span style={{ fontFamily: "'Fredoka One', cursive",
            color: '#FFD60A' }}>⭐ {getMyScore()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center',
          fontFamily: "'Fredoka One', cursive", color: '#FF4757' }}>
          VS
        </div>
        <div style={{ flex: 1, background: '#16213E', borderRadius: '14px',
          padding: '12px 16px', border: '2px solid #FF3D9A',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center' }}>
          <span style={{ fontWeight: 800 }}>
            👤 {getOpponent()?.username || 'Opponent'}
          </span>
          <span style={{ fontFamily: "'Fredoka One', cursive",
            color: '#FFD60A' }}>⭐ {getOpponentScore()}</span>
        </div>
      </div>

      {/* Progress & Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
          Question {current + 1}/{questions.length}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2rem',
          color: timeLeft <= 5 ? '#FF4757' : '#FFD60A' }}>
          {timeLeft}s
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px', height: '6px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(90deg, #7B2FFF, #FF3D9A)',
          height: '6px', borderRadius: '50px',
          width: `${((current + 1) / questions.length) * 100}%` }}/>
      </div>

      {/* Question */}
      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '24px', marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.5 }}>
          {q.question}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt, i) => {
          let bg = '#16213E';
          let border = 'rgba(255,255,255,0.1)';
          if (selected !== null) {
            if (i === parseInt(q.correct)) {
              bg = 'rgba(6,214,160,0.2)'; border = '#06D6A0';
            } else if (i === selected && i !== parseInt(q.correct)) {
              bg = 'rgba(255,71,87,0.2)'; border = '#FF4757';
            }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              style={{ background: bg, border: `2px solid ${border}`,
                color: '#fff', padding: '16px 20px', borderRadius: '14px',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                fontSize: '1rem', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '30px', height: '30px',
                borderRadius: '50%', background: COLORS[i],
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                fontFamily: "'Fredoka One', cursive" }}>
                {letters[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}