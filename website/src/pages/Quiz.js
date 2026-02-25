import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSavedQuestions } from '../services/api';
import { playSound, isSoundEnabled, toggleSound } from '../services/sounds';

export default function Quiz() {
  const { category: rawCategory } = useParams();
  const category = decodeURIComponent(rawCategory);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerAnim, setAnswerAnim] = useState('');
  const [scoreAnim, setScoreAnim] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [questionAnim, setQuestionAnim] = useState('animate-slide-right');
  const difficulty = localStorage.getItem('quizbuzz_difficulty') || 'Easy';
  const letters = ['A', 'B', 'C', 'D'];
  const COLORS = ['#7B2FFF', '#FF3D9A', '#00B4FF', '#06D6A0'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('📚 Loading quiz for:', category, difficulty);

        const seen = JSON.parse(
          sessionStorage.getItem(`seen_${category}`) || '[]'
        );

        const res = await getSavedQuestions(
          category, difficulty, 10, seen.join(',')
        );

        console.log('📦 Response:', res.data);

        if (res.data.success && res.data.questions?.length > 0) {
          setQuestions(res.data.questions);
          if (res.data.questionIds) {
            const newSeen = [...seen, ...res.data.questionIds].slice(-50);
            sessionStorage.setItem(
              `seen_${category}`, JSON.stringify(newSeen)
            );
          }
        } else {
          setError(
            `No questions for "${category}" yet!\nGo to Admin panel and generate some first.`
          );
        }
      } catch (err) {
        console.error('❌ Quiz load error:', err);
        setError('Failed to load questions: ' + err.message);
      }
      setLoading(false);
    };
    load();
  }, [category, difficulty]);

  const nextQuestion = useCallback(() => {
    if (current + 1 >= questions.length) {
      navigate('/results', {
        state: { score, correct, wrong,
          total: questions.length, category, difficulty }
      });
    } else {
      setQuestionAnim('');
      setTimeout(() => {
        setCurrent(c => c + 1);
        setSelected(null);
        setTimeLeft(15);
        setAnswerAnim('');
        setQuestionAnim('animate-slide-right');
      }, 50);
    }
  }, [current, questions.length, score, correct,
      wrong, category, difficulty, navigate]);

  useEffect(() => {
    if (loading || selected !== null || questions.length === 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 4 && prev > 1) playSound('urgentTick');
        else if (prev > 4) playSound('tick');
        if (prev <= 1) {
          clearInterval(t);
          setSelected(-1);
          setAnswerAnim('animate-wrong');
          playSound('wrong');
          setWrong(w => w + 1);
          setTimeout(nextQuestion, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading, selected, nextQuestion, questions.length]);

  const handleAnswer = (idx) => {
    if (selected !== null || loading) return;
    setSelected(idx);
    const isCorrect = idx === parseInt(questions[current].correct);

    if (isCorrect) {
      const pts = Math.max(100, Math.round(100 + (timeLeft / 15) * 100));
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      setAnswerAnim('animate-correct');
      setScoreAnim(true);
      setTimeout(() => setScoreAnim(false), 300);
      setFloatingPoints(`+${pts}`);
      setTimeout(() => setFloatingPoints(null), 1000);
      playSound('correct');
    } else {
      setWrong(w => w + 1);
      setAnswerAnim('animate-wrong');
      playSound('wrong');
    }
    setTimeout(nextQuestion, 1800);
  };

  const toggleSoundHandler = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    playSound('click');
  };

  // LOADING
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px',
        animation: 'spin 1s linear infinite',
        display: 'inline-block' }}>🐝</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '1.5rem', color: '#FFD60A' }}>
        Loading {category}...
      </div>
    </div>
  );

  // ERROR
  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
      <div style={{ color: '#FF4757', marginBottom: '12px',
        fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem' }}>
        Oops!
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px',
        whiteSpace: 'pre-line', lineHeight: 1.8 }}>
        {error}
      </div>
      <div style={{ display: 'flex', gap: '12px',
        justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/admin')} style={{
          background: 'linear-gradient(135deg, #FFD60A, #FF6B35)',
          border: 'none', color: '#0D0D1A', padding: '12px 24px',
          borderRadius: '50px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer'
        }}>👑 Go to Admin</button>
        <button onClick={() => navigate('/')} style={{
          background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
          border: 'none', color: '#fff', padding: '12px 24px',
          borderRadius: '50px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer'
        }}>🏠 Go Home</button>
      </div>
    </div>
  );

  if (!questions.length) return null;
  const q = questions[current];
  if (!q) return null;

  const timerPct = (timeLeft / 15) * 100;
  const timerColor = timeLeft <= 5 ? '#FF4757'
    : timeLeft <= 10 ? '#FFD60A' : '#06D6A0';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px' }}>

        {/* Category */}
        <div style={{ background: 'rgba(123,47,255,0.2)',
          border: '1px solid #7B2FFF', borderRadius: '50px',
          padding: '6px 14px', fontSize: '0.8rem',
          fontWeight: 700, maxWidth: '160px',
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' }}>
          {category}
        </div>

        {/* Score with animation */}
        <div style={{ position: 'relative' }}>
          <div className={scoreAnim ? 'animate-score-pop' : ''}
            style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.5rem', color: '#FFD60A' }}>
            ⭐ {score}
          </div>
          {floatingPoints && (
            <div className="animate-float-up" style={{
              position: 'absolute', top: '-10px', right: '0',
              color: '#06D6A0', fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem', pointerEvents: 'none',
              whiteSpace: 'nowrap', zIndex: 100
            }}>
              {floatingPoints}
            </div>
          )}
        </div>

        {/* Sound Toggle */}
        <button onClick={toggleSoundHandler} style={{
          background: soundOn
            ? 'rgba(6,214,160,0.2)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${soundOn
            ? '#06D6A0' : 'rgba(255,255,255,0.2)'}`,
          borderRadius: '50px', padding: '6px 14px',
          cursor: 'pointer', fontSize: '1rem',
          color: soundOn ? '#06D6A0' : 'rgba(255,255,255,0.4)'
        }}>
          {soundOn ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ background: 'rgba(255,255,255,0.08)',
        borderRadius: '50px', height: '6px', marginBottom: '8px' }}>
        <div style={{
          background: 'linear-gradient(90deg, #7B2FFF, #FF3D9A)',
          height: '6px', borderRadius: '50px',
          width: `${((current + 1) / questions.length) * 100}%`,
          transition: 'width 0.3s ease'
        }}/>
      </div>

      {/* Question Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        marginBottom: '16px', fontSize: '0.82rem',
        color: 'rgba(255,255,255,0.4)' }}>
        <span>Question {current + 1} of {questions.length}</span>
        <span style={{ color: '#06D6A0' }}>✅ {correct} correct</span>
      </div>

      {/* Timer */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.4)' }}>Time Left</span>
          <span className={timeLeft <= 5 ? 'animate-timer-urgent' : ''}
            style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '1.8rem', color: timerColor,
              display: 'inline-block' }}>
            {timeLeft}s
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)',
          borderRadius: '50px', height: '8px' }}>
          <div style={{
            background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`,
            height: '8px', borderRadius: '50px',
            width: `${timerPct}%`,
            transition: 'width 1s linear, background 0.3s ease'
          }}/>
        </div>
      </div>

      {/* Question Card */}
      <div className={questionAnim}
        style={{ background: '#16213E', borderRadius: '20px',
          padding: '28px 24px', marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center', minHeight: '100px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem',
          lineHeight: 1.6 }}>
          {q.question}
        </div>
      </div>

      {/* Answer Options */}
      <div className={answerAnim}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt, i) => {
          const isCorrectAnswer = i === parseInt(q.correct);
          const isSelected = i === selected;
          let bg = 'rgba(255,255,255,0.04)';
          let border = 'rgba(255,255,255,0.1)';
          let textColor = '#fff';

          if (selected !== null) {
            if (isCorrectAnswer) {
              bg = 'rgba(6,214,160,0.2)';
              border = '#06D6A0';
              textColor = '#06D6A0';
            } else if (isSelected && !isCorrectAnswer) {
              bg = 'rgba(255,71,87,0.2)';
              border = '#FF4757';
              textColor = '#FF4757';
            }
          }

          return (
            <button key={i} onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              style={{ background: bg,
                border: `2px solid ${border}`,
                color: textColor, padding: '16px 20px',
                borderRadius: '14px',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                fontSize: '1rem', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '12px',
                transition: 'all 0.25s ease' }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: selected !== null
                  ? (isCorrectAnswer ? '#06D6A0'
                    : isSelected ? '#FF4757' : COLORS[i])
                  : COLORS[i],
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                fontFamily: "'Fredoka One', cursive",
                fontSize: '0.9rem', color: '#fff',
                transition: 'background 0.3s ease' }}>
                {selected !== null
                  ? (isCorrectAnswer ? '✓'
                    : isSelected ? '✗' : letters[i])
                  : letters[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selected !== null && q.explanation && (
        <div className="animate-fade-up" style={{
          marginTop: '16px', padding: '14px',
          background: 'rgba(6,214,160,0.08)', borderRadius: '14px',
          border: '1px solid rgba(6,214,160,0.25)',
          color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem',
          lineHeight: 1.6 }}>
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}