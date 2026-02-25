import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDailyChallenge, getDailyStatus, completeDailyChallenge } from '../services/api';

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [status, setStatus] = useState('loading');
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const letters = ['A', 'B', 'C', 'D'];
  const COLORS = ['#7B2FFF', '#FF3D9A', '#00B4FF', '#06D6A0'];

  useEffect(() => {
    const load = async () => {
      try {
        if (user) {
          const statusRes = await getDailyStatus(user.uid);
          if (statusRes.data.completed) {
            setStreak(statusRes.data.streak || 0);
            setStatus('already_done');
            return;
          }
          setStreak(statusRes.data.streak || 0);
        }

        const res = await getDailyChallenge();
        if (res.data.success) {
          setQuestions(res.data.questions);
          setCategory(res.data.category);
          setDate(res.data.date);
          setStatus('ready');
        } else {
          setErrorMsg(res.data.error || 'Unknown error');
          setStatus('error');
        }
      } catch (err) {
        console.error('Daily challenge error:', err);
        setErrorMsg(err.message || 'Network error');
        setStatus('error');
      }
    };
    load();
  }, [user]);

  const finishQuiz = useCallback(async (finalScore, finalCorrect) => {
    setStatus('finished');
    if (user) {
      try {
        const res = await completeDailyChallenge({
          uid: user.uid,
          score: finalScore,
          correct: finalCorrect,
          wrong: questions.length - finalCorrect
        });
        if (res.data.success) {
          setResult(res.data);
          setStreak(res.data.newStreak);
          login({ ...user, xp: res.data.newXP, level: res.data.newLevel });
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [user, questions.length, login]);

  const nextQuestion = useCallback(() => {
    if (current + 1 >= questions.length) {
      finishQuiz(score, correct);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTimeLeft(15);
    }
  }, [current, questions.length, score, correct, finishQuiz]);

  useEffect(() => {
    if (status !== 'playing' || selected !== null) return;
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
    setTimeout(nextQuestion, 1500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric'
    });
  };

  // LOADING
  if (status === 'loading') return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '1.5rem', color: '#FFD60A' }}>
        Loading Daily Challenge...
      </div>
    </div>
  );

  // ERROR
  if (status === 'error') return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
      <div style={{ color: '#FF4757', marginBottom: '12px', 
        fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem' }}>
        Failed to load!
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem',
        marginBottom: '20px', background: '#16213E', padding: '12px',
        borderRadius: '12px', maxWidth: '400px', margin: '0 auto 20px' }}>
        {errorMsg}
      </div>
      <button onClick={() => navigate('/')} style={{
        background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
        border: 'none', color: '#fff', padding: '12px 28px',
        borderRadius: '50px', fontFamily: "'Fredoka One', cursive",
        fontSize: '1rem', cursor: 'pointer'
      }}>🏠 Go Home</button>
    </div>
  );

  // ALREADY DONE
  if (status === 'already_done') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2rem', marginBottom: '12px' }}>
        Already Done!
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
        You've completed today's challenge. Come back tomorrow!
      </div>
      <div style={{ background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔥</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2.5rem', color: '#0D0D1A' }}>
          {streak} Day Streak!
        </div>
        <div style={{ color: '#0D0D1A', fontWeight: 700, opacity: 0.7 }}>
          Keep it up! Come back tomorrow!
        </div>
      </div>
      <div style={{ background: '#16213E', borderRadius: '16px',
        padding: '16px', marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          Next challenge resets at midnight 🌙
        </div>
      </div>
      <button onClick={() => navigate('/')} style={{
        width: '100%', background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
        border: 'none', color: '#fff', padding: '16px', borderRadius: '16px',
        fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem', cursor: 'pointer'
      }}>🏠 Back to Home</button>
    </div>
  );

  // READY SCREEN
  if (status === 'ready') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎯</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2rem', color: '#0D0D1A', marginBottom: '4px' }}>
          Daily Challenge
        </div>
        <div style={{ color: '#0D0D1A', fontWeight: 700, opacity: 0.8 }}>
          {formatDate(date)}
        </div>
      </div>

      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '24px', marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around',
          marginBottom: '16px' }}>
          {[
            { icon: '📚', label: 'Category', value: category },
            { icon: '❓', label: 'Questions', value: '10' },
            { icon: '⏱️', label: 'Per Question', value: '15s' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                {item.icon}
              </div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '0.95rem', color: '#FFD60A' }}>
                {item.value}
              </div>
              <div style={{ fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.4)' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {streak > 0 && (
          <div style={{ background: 'rgba(255,107,53,0.2)',
            border: '1px solid #FF6B35', borderRadius: '12px',
            padding: '10px', marginBottom: '12px' }}>
            <span style={{ color: '#FF6B35', fontWeight: 800 }}>
              🔥 Current Streak: {streak} days!
            </span>
          </div>
        )}

        <div style={{ background: 'rgba(123,47,255,0.15)',
          border: '1px solid rgba(123,47,255,0.4)',
          borderRadius: '12px', padding: '10px',
          color: '#a06fff', fontWeight: 700, fontSize: '0.88rem' }}>
          ⚡ Bonus XP: {50 + ((streak + 1) * 10)} XP for completing today!
        </div>
      </div>

      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem',
        marginBottom: '24px', lineHeight: 1.8 }}>
        ⚠️ You only get ONE attempt per day!<br/>
        Everyone plays the same questions today.
      </div>

      {user ? (
        <button onClick={() => setStatus('playing')} style={{
          width: '100%',
          background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
          border: 'none', color: '#0D0D1A', padding: '18px',
          borderRadius: '16px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1.4rem', cursor: 'pointer'
        }}>🎯 Start Challenge!</button>
      ) : (
        <div>
          <div style={{ color: 'rgba(255,255,255,0.5)',
            marginBottom: '12px', fontSize: '0.88rem' }}>
            Sign in to save your streak & earn bonus XP!
          </div>
          <button onClick={() => setStatus('playing')} style={{
            width: '100%', background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            border: 'none', color: '#fff', padding: '16px', borderRadius: '16px',
            fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem',
            cursor: 'pointer', marginBottom: '10px'
          }}>🎯 Play as Guest</button>
          <button onClick={() => navigate('/profile')} style={{
            width: '100%', background: 'rgba(255,214,10,0.15)',
            border: '1px solid #FFD60A', color: '#FFD60A', padding: '14px',
            borderRadius: '16px', fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', cursor: 'pointer'
          }}>🔐 Sign In for Bonus XP</button>
        </div>
      )}
    </div>
  );

  // FINISHED SCREEN
  if (status === 'finished') {
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    let emoji, title;
    if (pct >= 90) { emoji = '🏆'; title = 'Outstanding!'; }
    else if (pct >= 70) { emoji = '🎉'; title = 'Great Job!'; }
    else if (pct >= 50) { emoji = '👍'; title = 'Good Effort!'; }
    else { emoji = '💪'; title = 'Keep Practicing!'; }

    return (
      <div style={{ maxWidth: '500px', margin: '0 auto',
        padding: '40px 20px', textAlign: 'center' }}>
        {result?.newLevel > (user?.level || 1) && (
          <div style={{ background: 'linear-gradient(135deg, #FFD60A, #FF6B35)',
            borderRadius: '20px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.5rem', color: '#0D0D1A' }}>
              🎊 LEVEL UP! → Level {result.newLevel}
            </div>
          </div>
        )}

        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>{emoji}</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2.2rem', marginBottom: '8px' }}>{title}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
          Daily Challenge • {category}
        </div>

        <div style={{ background: '#16213E', borderRadius: '20px',
          padding: '24px', marginBottom: '16px',
          border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '3.5rem', color: '#06D6A0' }}>
            {correct}/{total}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>
            Questions Correct
          </div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '1.8rem', color: '#FFD60A' }}>
            ⭐ {score} pts
          </div>
          {result?.bonusXP && (
            <div style={{ marginTop: '12px', padding: '10px',
              background: 'rgba(255,107,53,0.2)',
              borderRadius: '12px', border: '1px solid #FF6B35' }}>
              <div style={{ color: '#FF6B35', fontWeight: 800 }}>
                🔥 +{result.bonusXP} Bonus XP!
              </div>
              <div style={{ color: '#FFD60A', fontSize: '0.85rem',
                fontWeight: 700, marginTop: '4px' }}>
                {result.newStreak} Day Streak! 🔥
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {[
            ['✅', 'Correct', correct, '#06D6A0'],
            ['❌', 'Wrong', total - correct, '#FF4757'],
            ['📊', 'Score %', pct + '%', '#00B4FF']
          ].map(([icon, label, val, color]) => (
            <div key={label} style={{ flex: 1, background: '#16213E',
              borderRadius: '14px', padding: '14px',
              border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '1.3rem' }}>{icon}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.3rem', color }}>{val}</div>
              <div style={{ fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
          marginBottom: '20px' }}>
          🌙 Come back tomorrow for a new challenge!
        </div>

        <button onClick={() => navigate('/')} style={{
          width: '100%', background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
          border: 'none', color: '#fff', padding: '16px', borderRadius: '16px',
          fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem', cursor: 'pointer'
        }}>🏠 Back to Home</button>
      </div>
    );
  }

  // PLAYING SCREEN
  if (!questions.length || current >= questions.length) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <div style={{ fontFamily: "'Fredoka One', cursive", color: '#FFD60A' }}>
        Loading...
      </div>
    </div>
  );

  const q = questions[current];
  if (!q) return null;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 20px' }}>

      <div style={{ background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
        borderRadius: '16px', padding: '10px 20px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#0D0D1A', fontSize: '1rem' }}>
          🎯 Daily Challenge
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#0D0D1A', fontSize: '0.85rem' }}>
          {category}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
          Question {current + 1}/{questions.length}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem',
          color: timeLeft <= 5 ? '#FF4757' : '#FFD60A' }}>
          {timeLeft}s
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A', fontSize: '1rem' }}>
          ⭐ {score}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px', height: '6px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(90deg, #FF6B35, #FFD60A)',
          height: '6px', borderRadius: '50px',
          width: `${((current + 1) / questions.length) * 100}%` }}/>
      </div>

      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '24px', marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.5 }}>
          {q.question}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt, i) => {
          let bg = '#16213E';
          let border = 'rgba(255,255,255,0.1)';
          if (selected !== null) {
            if (i === parseInt(q.correct)) {
              bg = 'rgba(6,214,160,0.2)'; border = '#06D6A0';
            } else if (i === selected) {
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
              <span style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: COLORS[i], display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                fontFamily: "'Fredoka One', cursive" }}>
                {letters[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && q.explanation && (
        <div style={{ marginTop: '14px', padding: '14px',
          background: 'rgba(6,214,160,0.1)', borderRadius: '14px',
          border: '1px solid rgba(6,214,160,0.3)',
          color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}