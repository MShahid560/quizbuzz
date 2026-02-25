import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

// Using country codes that should display flag emojis properly
const FLAGS = [
  // Asia
  { flag: '🇵🇰', country: 'Pakistan', code: 'PK', options: ['India', 'Pakistan', 'Bangladesh', 'Afghanistan'] },
  { flag: '🇮🇳', country: 'India', code: 'IN', options: ['India', 'Nepal', 'Sri Lanka', 'Bangladesh'] },
  { flag: '🇨🇳', country: 'China', code: 'CN', options: ['China', 'Taiwan', 'Mongolia', 'Japan'] },
  { flag: '🇯🇵', country: 'Japan', code: 'JP', options: ['China', 'South Korea', 'Japan', 'Vietnam'] },
  { flag: '🇰🇷', country: 'South Korea', code: 'KR', options: ['North Korea', 'South Korea', 'Japan', 'China'] },
  { flag: '🇮🇩', country: 'Indonesia', code: 'ID', options: ['Indonesia', 'Malaysia', 'Philippines', 'Thailand'] },
  { flag: '🇹🇭', country: 'Thailand', code: 'TH', options: ['Thailand', 'Vietnam', 'Cambodia', 'Myanmar'] },
  { flag: '🇻🇳', country: 'Vietnam', code: 'VN', options: ['Vietnam', 'Cambodia', 'Laos', 'Thailand'] },
  { flag: '🇵🇭', country: 'Philippines', code: 'PH', options: ['Philippines', 'Indonesia', 'Malaysia', 'Thailand'] },
  { flag: '🇲🇾', country: 'Malaysia', code: 'MY', options: ['Malaysia', 'Singapore', 'Indonesia', 'Thailand'] },
  { flag: '🇸🇬', country: 'Singapore', code: 'SG', options: ['Singapore', 'Malaysia', 'Indonesia', 'Brunei'] },
  { flag: '🇱🇰', country: 'Sri Lanka', code: 'LK', options: ['India', 'Sri Lanka', 'Maldives', 'Bangladesh'] },
  { flag: '🇳🇵', country: 'Nepal', code: 'NP', options: ['Nepal', 'India', 'Bhutan', 'Bangladesh'] },
  { flag: '🇧🇩', country: 'Bangladesh', code: 'BD', options: ['Bangladesh', 'India', 'Pakistan', 'Myanmar'] },
  { flag: '🇦🇫', country: 'Afghanistan', code: 'AF', options: ['Afghanistan', 'Pakistan', 'Iran', 'Tajikistan'] },
  { flag: '🇮🇷', country: 'Iran', code: 'IR', options: ['Iran', 'Iraq', 'Afghanistan', 'Pakistan'] },
  { flag: '🇮🇶', country: 'Iraq', code: 'IQ', options: ['Iraq', 'Iran', 'Syria', 'Kuwait'] },
  { flag: '🇸🇦', country: 'Saudi Arabia', code: 'SA', options: ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait'] },
  { flag: '🇦🇪', country: 'UAE', code: 'AE', options: ['Bahrain', 'UAE', 'Qatar', 'Oman'] },
  { flag: '🇶🇦', country: 'Qatar', code: 'QA', options: ['Qatar', 'UAE', 'Bahrain', 'Kuwait'] },
  { flag: '🇰🇼', country: 'Kuwait', code: 'KW', options: ['Kuwait', 'Iraq', 'Saudi Arabia', 'Bahrain'] },
  { flag: '🇴🇲', country: 'Oman', code: 'OM', options: ['Oman', 'UAE', 'Yemen', 'Saudi Arabia'] },
  { flag: '🇾🇪', country: 'Yemen', code: 'YE', options: ['Yemen', 'Oman', 'Saudi Arabia', 'Jordan'] },
  { flag: '🇯🇴', country: 'Jordan', code: 'JO', options: ['Jordan', 'Syria', 'Iraq', 'Saudi Arabia'] },
  { flag: '🇱🇧', country: 'Lebanon', code: 'LB', options: ['Lebanon', 'Syria', 'Jordan', 'Israel'] },
  { flag: '🇮🇱', country: 'Israel', code: 'IL', options: ['Israel', 'Jordan', 'Lebanon', 'Egypt'] },
  { flag: '🇹🇷', country: 'Turkey', code: 'TR', options: ['Turkey', 'Greece', 'Iran', 'Egypt'] },
  
  // Europe
  { flag: '🇬🇧', country: 'United Kingdom', code: 'GB', options: ['Ireland', 'United Kingdom', 'France', 'Germany'] },
  { flag: '🇫🇷', country: 'France', code: 'FR', options: ['France', 'Italy', 'Spain', 'Belgium'] },
  { flag: '🇩🇪', country: 'Germany', code: 'DE', options: ['Austria', 'Germany', 'Switzerland', 'Netherlands'] },
  { flag: '🇮🇹', country: 'Italy', code: 'IT', options: ['Italy', 'France', 'Spain', 'Greece'] },
  { flag: '🇪🇸', country: 'Spain', code: 'ES', options: ['Spain', 'Portugal', 'France', 'Italy'] },
  { flag: '🇵🇹', country: 'Portugal', code: 'PT', options: ['Portugal', 'Spain', 'France', 'Italy'] },
  { flag: '🇳🇱', country: 'Netherlands', code: 'NL', options: ['Netherlands', 'Belgium', 'Germany', 'France'] },
  { flag: '🇧🇪', country: 'Belgium', code: 'BE', options: ['Belgium', 'Netherlands', 'France', 'Germany'] },
  { flag: '🇨🇭', country: 'Switzerland', code: 'CH', options: ['Switzerland', 'Austria', 'Germany', 'France'] },
  { flag: '🇦🇹', country: 'Austria', code: 'AT', options: ['Austria', 'Germany', 'Switzerland', 'Hungary'] },
  { flag: '🇸🇪', country: 'Sweden', code: 'SE', options: ['Sweden', 'Norway', 'Finland', 'Denmark'] },
  { flag: '🇳🇴', country: 'Norway', code: 'NO', options: ['Norway', 'Sweden', 'Finland', 'Denmark'] },
  { flag: '🇩🇰', country: 'Denmark', code: 'DK', options: ['Denmark', 'Sweden', 'Norway', 'Iceland'] },
  { flag: '🇫🇮', country: 'Finland', code: 'FI', options: ['Finland', 'Sweden', 'Norway', 'Russia'] },
  { flag: '🇮🇸', country: 'Iceland', code: 'IS', options: ['Iceland', 'Norway', 'Denmark', 'Ireland'] },
  { flag: '🇮🇪', country: 'Ireland', code: 'IE', options: ['Ireland', 'United Kingdom', 'France', 'Iceland'] },
  { flag: '🇵🇱', country: 'Poland', code: 'PL', options: ['Poland', 'Germany', 'Czech Republic', 'Ukraine'] },
  { flag: '🇨🇿', country: 'Czech Republic', code: 'CZ', options: ['Czech Republic', 'Slovakia', 'Poland', 'Austria'] },
  { flag: '🇸🇰', country: 'Slovakia', code: 'SK', options: ['Slovakia', 'Czech Republic', 'Hungary', 'Poland'] },
  { flag: '🇭🇺', country: 'Hungary', code: 'HU', options: ['Hungary', 'Austria', 'Slovakia', 'Romania'] },
  { flag: '🇷🇴', country: 'Romania', code: 'RO', options: ['Romania', 'Hungary', 'Bulgaria', 'Moldova'] },
  { flag: '🇧🇬', country: 'Bulgaria', code: 'BG', options: ['Bulgaria', 'Romania', 'Greece', 'Serbia'] },
  { flag: '🇬🇷', country: 'Greece', code: 'GR', options: ['Greece', 'Turkey', 'Bulgaria', 'Albania'] },
  { flag: '🇷🇸', country: 'Serbia', code: 'RS', options: ['Serbia', 'Croatia', 'Bosnia', 'Montenegro'] },
  { flag: '🇭🇷', country: 'Croatia', code: 'HR', options: ['Croatia', 'Serbia', 'Slovenia', 'Bosnia'] },
  { flag: '🇺🇦', country: 'Ukraine', code: 'UA', options: ['Ukraine', 'Russia', 'Poland', 'Romania'] },
  { flag: '🇷🇺', country: 'Russia', code: 'RU', options: ['Russia', 'Ukraine', 'Belarus', 'Poland'] },
  
  // Americas
  { flag: '🇺🇸', country: 'United States', code: 'US', options: ['Canada', 'Australia', 'United States', 'UK'] },
  { flag: '🇨🇦', country: 'Canada', code: 'CA', options: ['Canada', 'USA', 'Mexico', 'Greenland'] },
  { flag: '🇲🇽', country: 'Mexico', code: 'MX', options: ['Mexico', 'Colombia', 'Venezuela', 'Peru'] },
  { flag: '🇧🇷', country: 'Brazil', code: 'BR', options: ['Argentina', 'Brazil', 'Colombia', 'Chile'] },
  { flag: '🇦🇷', country: 'Argentina', code: 'AR', options: ['Argentina', 'Brazil', 'Chile', 'Uruguay'] },
  { flag: '🇨🇱', country: 'Chile', code: 'CL', options: ['Chile', 'Argentina', 'Peru', 'Bolivia'] },
  { flag: '🇨🇴', country: 'Colombia', code: 'CO', options: ['Colombia', 'Venezuela', 'Ecuador', 'Peru'] },
  { flag: '🇻🇪', country: 'Venezuela', code: 'VE', options: ['Venezuela', 'Colombia', 'Brazil', 'Ecuador'] },
  { flag: '🇵🇪', country: 'Peru', code: 'PE', options: ['Peru', 'Ecuador', 'Bolivia', 'Chile'] },
  { flag: '🇪🇨', country: 'Ecuador', code: 'EC', options: ['Ecuador', 'Peru', 'Colombia', 'Venezuela'] },
  { flag: '🇧🇴', country: 'Bolivia', code: 'BO', options: ['Bolivia', 'Peru', 'Chile', 'Argentina'] },
  { flag: '🇵🇾', country: 'Paraguay', code: 'PY', options: ['Paraguay', 'Argentina', 'Brazil', 'Bolivia'] },
  { flag: '🇺🇾', country: 'Uruguay', code: 'UY', options: ['Uruguay', 'Argentina', 'Brazil', 'Paraguay'] },
  
  // Africa
  { flag: '🇿🇦', country: 'South Africa', code: 'ZA', options: ['Zimbabwe', 'South Africa', 'Zambia', 'Mozambique'] },
  { flag: '🇪🇬', country: 'Egypt', code: 'EG', options: ['Egypt', 'Libya', 'Sudan', 'Morocco'] },
  { flag: '🇲🇦', country: 'Morocco', code: 'MA', options: ['Morocco', 'Algeria', 'Tunisia', 'Libya'] },
  { flag: '🇩🇿', country: 'Algeria', code: 'DZ', options: ['Algeria', 'Morocco', 'Tunisia', 'Libya'] },
  { flag: '🇹🇳', country: 'Tunisia', code: 'TN', options: ['Tunisia', 'Algeria', 'Libya', 'Morocco'] },
  { flag: '🇱🇾', country: 'Libya', code: 'LY', options: ['Libya', 'Egypt', 'Tunisia', 'Algeria'] },
  { flag: '🇸🇩', country: 'Sudan', code: 'SD', options: ['Sudan', 'Egypt', 'Ethiopia', 'Chad'] },
  { flag: '🇪🇹', country: 'Ethiopia', code: 'ET', options: ['Ethiopia', 'Kenya', 'Sudan', 'Somalia'] },
  { flag: '🇰🇪', country: 'Kenya', code: 'KE', options: ['Kenya', 'Tanzania', 'Uganda', 'Ethiopia'] },
  { flag: '🇹🇿', country: 'Tanzania', code: 'TZ', options: ['Tanzania', 'Kenya', 'Uganda', 'Mozambique'] },
  { flag: '🇺🇬', country: 'Uganda', code: 'UG', options: ['Uganda', 'Kenya', 'Tanzania', 'Rwanda'] },
  { flag: '🇳🇬', country: 'Nigeria', code: 'NG', options: ['Ghana', 'Nigeria', 'Kenya', 'Ethiopia'] },
  { flag: '🇬🇭', country: 'Ghana', code: 'GH', options: ['Ghana', 'Nigeria', 'Ivory Coast', 'Togo'] },
  
  // Oceania
  { flag: '🇦🇺', country: 'Australia', code: 'AU', options: ['New Zealand', 'Australia', 'Fiji', 'Papua New Guinea'] },
  { flag: '🇳🇿', country: 'New Zealand', code: 'NZ', options: ['New Zealand', 'Australia', 'Fiji', 'Samoa'] },
  { flag: '🇫🇯', country: 'Fiji', code: 'FJ', options: ['Fiji', 'Samoa', 'Tonga', 'Papua New Guinea'] },
  { flag: '🇵🇬', country: 'Papua New Guinea', code: 'PG', options: ['Papua New Guinea', 'Indonesia', 'Australia', 'Fiji'] },
];

export default function FlagQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Moved inside the component
  const [shuffled] = useState([...FLAGS].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [status, setStatus] = useState('playing');

  const nextQ = useCallback(() => {
    if (current + 1 >= shuffled.length) {
      setStatus('finished'); playSound('complete');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTimeLeft(10);
    }
  }, [current, shuffled.length]);

  useEffect(() => {
    if (status !== 'playing' || selected !== null) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setSelected(-1);
          playSound('wrong');
          setTimeout(nextQ, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status, selected, nextQ]);

  const handleAnswer = (country) => {
    if (selected !== null) return;
    setSelected(country);
    if (country === shuffled[current].country) {
      const pts = timeLeft * 20;
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    setTimeout(nextQ, 1200);
  };

  if (status === 'finished') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🌍</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', marginBottom: '8px' }}>Quiz Complete!</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '3rem', color: '#FFD60A', marginBottom: '8px' }}>
        ⭐ {score}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)',
        marginBottom: '24px' }}>
        {correct}/{shuffled.length} flags correct!
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => window.location.reload()} style={{
          flex: 1, background: 'linear-gradient(135deg, #06D6A0, #00B4FF)',
          border: 'none', color: '#0D0D1A', padding: '14px',
          borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>🔄 Play Again</button>
        <button onClick={() => navigate('/games')} style={{
          flex: 1, background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
          padding: '14px', borderRadius: '14px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>🎮 All Games</button>
      </div>
    </div>
  );

  const q = shuffled[current];
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Back</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>🏳️ Flag Quiz</div>
       <div style={{ fontFamily: "'Fredoka One', cursive",
  color: '#FFD60A' }}>⭐ {score}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between',
        marginBottom: '8px' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          {current + 1}/{shuffled.length}
        </span>
        <span style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.8rem',
          color: timeLeft <= 4 ? '#FF4757' : '#FFD60A' }}>{timeLeft}s</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50px',
        height: '6px', marginBottom: '28px' }}>
        <div style={{ background: '#06D6A0', height: '6px', borderRadius: '50px',
          width: `${(timeLeft / 10) * 100}%`, transition: 'width 1s linear' }}/>
      </div>

      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '40px', textAlign: 'center', marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '8rem', lineHeight: 1 }}>{q.flag}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)',
          marginTop: '12px', fontSize: '0.85rem' }}>
          Which country is this?
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {q.options.map((opt, i) => {
          const isCorrect = opt === q.country;
          const isSelected = opt === selected;
          let bg = 'rgba(255,255,255,0.06)';
          let border = 'rgba(255,255,255,0.1)';
          if (selected !== null) {
            if (isCorrect) { bg = 'rgba(6,214,160,0.2)'; border = '#06D6A0'; }
            else if (isSelected) { bg = 'rgba(255,71,87,0.2)'; border = '#FF4757'; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(opt)}
              disabled={selected !== null}
              style={{ background: bg, border: `2px solid ${border}`,
                color: '#fff', padding: '16px', borderRadius: '14px',
                fontFamily: "'Fredoka One', cursive", fontSize: '1rem',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.2s' }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}