import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

// Expanded to 500+ words with categories
const WORD_CATEGORIES = {
  ANIMALS: {
    icon: '🐾',
    color: '#06D6A0',
    words: [
      { word: 'ELEPHANT', hint: 'Large animal with a trunk' },
      { word: 'GIRAFFE', hint: 'Tall animal with long neck' },
      { word: 'KANGAROO', hint: 'Australian animal that jumps' },
      { word: 'DOLPHIN', hint: 'Intelligent sea creature' },
      { word: 'PENGUIN', hint: 'Flightless bird that swims' },
      { word: 'ZEBRA', hint: 'Striped African animal' },
      { word: 'CHEETAH', hint: 'Fastest land animal' },
      { word: 'GORILLA', hint: 'Large primate from Africa' },
      { word: 'RHINOCEROS', hint: 'Large animal with horn on nose' },
      { word: 'HIPPOPOTAMUS', hint: 'Large river animal' },
      { word: 'CROCODILE', hint: 'Reptile with long snout' },
      { word: 'BUTTERFLY', hint: 'Colorful flying insect' },
      { word: 'SCORPION', hint: 'Venomous arachnid with tail' },
      { word: 'OCTOPUS', hint: 'Sea creature with eight arms' },
      { word: 'JELLYFISH', hint: 'Transparent sea creature with tentacles' },
      { word: 'TIGER', hint: 'Striped big cat' },
      { word: 'LION', hint: 'King of the jungle' },
      { word: 'LEOPARD', hint: 'Spotted big cat' },
      { word: 'PANDA', hint: 'Black and white bear from China' },
      { word: 'KOALA', hint: 'Australian tree-dwelling marsupial' },
      { word: 'SLOTH', hint: 'Slow-moving tree animal' },
      { word: 'OTTER', hint: 'Playful water mammal' },
      { word: 'BEAVER', hint: 'Dam-building rodent' },
      { word: 'RACCOON', hint: 'Masked nocturnal animal' },
      { word: 'SQUIRREL', hint: 'Bushy-tailed nut collector' },
      { word: 'HEDGEHOG', hint: 'Spiny nocturnal mammal' },
      { word: 'ARMADILLO', hint: 'Burrowing mammal with shell' },
      { word: 'PORCUPINE', hint: 'Rodent with quills' },
      { word: 'PLATYPUS', hint: 'Egg-laying mammal with bill' },
      { word: 'WOMBAT', hint: 'Australian burrowing marsupial' }
    ]
  },
  
  PROGRAMMING: {
    icon: '💻',
    color: '#7B2FFF',
    words: [
      { word: 'PYTHON', hint: 'A programming language or snake' },
      { word: 'JAVASCRIPT', hint: 'Web programming language' },
      { word: 'REACT', hint: 'JavaScript library for UI' },
      { word: 'ALGORITHM', hint: 'Step-by-step problem solving process' },
      { word: 'DATABASE', hint: 'Structured collection of data' },
      { word: 'FUNCTION', hint: 'Reusable block of code' },
      { word: 'VARIABLE', hint: 'Storage for data values' },
      { word: 'COMPUTER', hint: 'Electronic device for processing data' },
      { word: 'KEYBOARD', hint: 'Input device with keys' },
      { word: 'MONITOR', hint: 'Display screen for computer' },
      { word: 'INTERNET', hint: 'Global network of computers' },
      { word: 'WEBSITE', hint: 'Collection of web pages' },
      { word: 'JAVA', hint: 'Object-oriented programming language' },
      { word: 'RUBY', hint: 'Dynamic programming language' },
      { word: 'SWIFT', hint: 'Apple\'s programming language' },
      { word: 'KOTLIN', hint: 'Modern Android development language' },
      { word: 'TYPESCRIPT', hint: 'Typed JavaScript superset' },
      { word: 'RUST', hint: 'Systems programming language' },
      { word: 'GOLANG', hint: 'Language created by Google' }
    ]
  },
  
  GEOGRAPHY: {
    icon: '🌍',
    color: '#00B4FF',
    words: [
      { word: 'PLANET', hint: 'Orbits around a star' },
      { word: 'MOUNTAIN', hint: 'Large natural elevation' },
      { word: 'OCEAN', hint: 'Vast body of salt water' },
      { word: 'DESERT', hint: 'Dry, barren land' },
      { word: 'FOREST', hint: 'Large area with trees' },
      { word: 'ISLAND', hint: 'Land surrounded by water' },
      { word: 'VOLCANO', hint: 'Mountain that erupts' },
      { word: 'EARTHQUAKE', hint: 'Shaking of the ground' },
      { word: 'CONTINENT', hint: 'Large landmass' },
      { word: 'COUNTRY', hint: 'Nation with borders' },
      { word: 'CAPITAL', hint: 'City where government is located' },
      { word: 'CANADA', hint: 'Country north of USA' },
      { word: 'BRAZIL', hint: 'Largest country in South America' },
      { word: 'JAPAN', hint: 'Island nation in East Asia' },
      { word: 'CHINA', hint: 'Most populous country' },
      { word: 'INDIA', hint: 'Country with Taj Mahal' },
      { word: 'ITALY', hint: 'Boot-shaped European country' },
      { word: 'FRANCE', hint: 'Country with Eiffel Tower' },
      { word: 'SPAIN', hint: 'European country known for flamenco' },
      { word: 'GERMANY', hint: 'European country with Berlin Wall' },
      { word: 'MEXICO', hint: 'Country south of USA' },
      { word: 'EGYPT', hint: 'Country with pyramids' }
    ]
  },
  
  SCIENCE: {
    icon: '🔬',
    color: '#FF6B35',
    words: [
      { word: 'SCIENCE', hint: 'Study of the natural world' },
      { word: 'OXYGEN', hint: 'Gas we breathe' },
      { word: 'GRAVITY', hint: 'Force that pulls things down' },
      { word: 'ELECTRON', hint: 'Negatively charged particle' },
      { word: 'MOLECULE', hint: 'Group of atoms bonded together' },
      { word: 'TELESCOPE', hint: 'Tool for viewing distant objects' },
      { word: 'MICROSCOPE', hint: 'Tool for viewing tiny objects' },
      { word: 'CHEMISTRY', hint: 'Study of substances and reactions' },
      { word: 'PHYSICS', hint: 'Study of matter and energy' },
      { word: 'BIOLOGY', hint: 'Study of living things' },
      { word: 'ASTRONOMY', hint: 'Study of celestial objects' },
      { word: 'ATOM', hint: 'Basic unit of matter' },
      { word: 'CELL', hint: 'Basic unit of life' },
      { word: 'DNA', hint: 'Genetic blueprint' },
      { word: 'PROTON', hint: 'Positively charged particle' },
      { word: 'NEUTRON', hint: 'Neutral particle in nucleus' }
    ]
  },
  
  SPACE: {
    icon: '🚀',
    color: '#9D4EDD',
    words: [
      { word: 'METEOR', hint: 'Space rock entering atmosphere' },
      { word: 'COMET', hint: 'Icy body with tail' },
      { word: 'ASTEROID', hint: 'Small rocky body in space' },
      { word: 'GALAXY', hint: 'System of stars' },
      { word: 'UNIVERSE', hint: 'All existing matter and space' },
      { word: 'SATELLITE', hint: 'Object orbiting a planet' },
      { word: 'ASTRONAUT', hint: 'Space traveler' },
      { word: 'TELESCOPE', hint: 'Tool for viewing stars' },
      { word: 'MARS', hint: 'Red planet' },
      { word: 'VENUS', hint: 'Hottest planet' },
      { word: 'JUPITER', hint: 'Largest planet' },
      { word: 'SATURN', hint: 'Planet with rings' },
      { word: 'NEPTUNE', hint: 'Blue ice giant' },
      { word: 'URANUS', hint: 'Sideways spinning planet' }
    ]
  },
  
  FOOD: {
    icon: '🍔',
    color: '#FF8C42',
    words: [
      { word: 'CHOCOLATE', hint: 'Sweet treat from cocoa' },
      { word: 'VEGETABLE', hint: 'Edible plant' },
      { word: 'RESTAURANT', hint: 'Place to eat meals' },
      { word: 'BREAKFAST', hint: 'First meal of the day' },
      { word: 'SANDWICH', hint: 'Food between bread slices' },
      { word: 'SPAGHETTI', hint: 'Long thin pasta' },
      { word: 'HAMBURGER', hint: 'Patty in a bun' },
      { word: 'PIZZA', hint: 'Italian dish with toppings' },
      { word: 'BANANA', hint: 'Yellow curved fruit' },
      { word: 'ORANGE', hint: 'Citrus fruit' },
      { word: 'APPLE', hint: 'Fruit that keeps doctor away' },
      { word: 'MANGO', hint: 'King of fruits' },
      { word: 'GRAPES', hint: 'Fruit used for wine' },
      { word: 'CHERRY', hint: 'Small red fruit with pit' },
      { word: 'PEACH', hint: 'Fuzzy fruit' }
    ]
  },
  
  SPORTS: {
    icon: '⚽',
    color: '#FF4757',
    words: [
      { word: 'FOOTBALL', hint: 'Sport with goalposts' },
      { word: 'BASKETBALL', hint: 'Game with hoops' },
      { word: 'TENNIS', hint: 'Sport with rackets' },
      { word: 'SWIMMING', hint: 'Moving through water' },
      { word: 'GYMNASTICS', hint: 'Sport with flips and routines' },
      { word: 'VOLLEYBALL', hint: 'Game hitting over net' },
      { word: 'BASEBALL', hint: 'Game with bat and ball' },
      { word: 'SOCCER', hint: 'Game played with feet' },
      { word: 'HOCKEY', hint: 'Sport played on ice' },
      { word: 'GOLF', hint: 'Sport with clubs and holes' },
      { word: 'BOXING', hint: 'Fighting sport with gloves' },
      { word: 'WRESTLING', hint: 'Combat sport with pins' }
    ]
  },
  
  MUSIC: {
    icon: '🎵',
    color: '#E0A458',
    words: [
      { word: 'PIANO', hint: 'Keyboard instrument' },
      { word: 'GUITAR', hint: 'Stringed instrument' },
      { word: 'VIOLIN', hint: 'Small string instrument' },
      { word: 'DRUM', hint: 'Percussion instrument' },
      { word: 'ORCHESTRA', hint: 'Large musical ensemble' },
      { word: 'SYMPHONY', hint: 'Long musical composition' },
      { word: 'MELODY', hint: 'Sequence of musical notes' },
      { word: 'RHYTHM', hint: 'Pattern of beats' },
      { word: 'FLUTE', hint: 'Wind instrument' },
      { word: 'TRUMPET', hint: 'Brass instrument' },
      { word: 'SAXOPHONE', hint: 'Jazz instrument' }
    ]
  },
  
  HISTORY: {
    icon: '🏛️',
    color: '#A67B5B',
    words: [
      { word: 'HISTORY', hint: 'Study of past events' },
      { word: 'PYRAMID', hint: 'Ancient Egyptian structure' },
      { word: 'KINGDOM', hint: 'Land ruled by a king' },
      { word: 'EMPIRE', hint: 'Group of territories under one ruler' },
      { word: 'CIVILIZATION', hint: 'Advanced human society' },
      { word: 'PHARAOH', hint: 'Ancient Egyptian ruler' },
      { word: 'GLADIATOR', hint: 'Roman fighter' },
      { word: 'KNIGHT', hint: 'Medieval warrior' },
      { word: 'VIKING', hint: 'Norse seafarer' },
      { word: 'SAMURAI', hint: 'Japanese warrior' },
      { word: 'ROMAN', hint: 'Ancient Italian civilization' },
      { word: 'GREEK', hint: 'Ancient Mediterranean civilization' }
    ]
  }
};

// Flatten words for all categories (for backward compatibility)
const ALL_WORDS = Object.values(WORD_CATEGORIES).flatMap(cat => cat.words);

// Function to get random words from selected categories
const getRandomWords = (categories, count = 10) => {
  let availableWords = [];
  
  if (categories.includes('ALL')) {
    availableWords = [...ALL_WORDS];
  } else {
    categories.forEach(cat => {
      if (WORD_CATEGORIES[cat]) {
        availableWords.push(...WORD_CATEGORIES[cat].words);
      }
    });
  }
  
  // Shuffle and take required count
  const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const scramble = (word) => {
  let arr = word.split('');
  // Ensure the scrambled word is different from original
  let result;
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    result = arr.join('');
  } while (result === word && word.length > 1);
  
  return result;
};

// Difficulty settings
const DIFFICULTIES = {
  EASY: { timer: 45, points: 100, hintPenalty: 10 },
  MEDIUM: { timer: 30, points: 150, hintPenalty: 20 },
  HARD: { timer: 20, points: 200, hintPenalty: 30 }
};

// Leaderboard Component
const Leaderboard = ({ scores, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#16213E',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px',
      padding: '24px',
      zIndex: 1000,
      width: '90%',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.8rem',
          color: '#FFD60A'
        }}>🏆 Word Masters</div>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }}>✕</button>
      </div>
      
      {scores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
          No scores yet. Start unscrambling!
        </div>
      ) : (
        <div>
          {scores.map((score, index) => (
            <div key={score.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: index === 0 ? 'rgba(255,214,10,0.1)' : index === 1 ? 'rgba(192,192,192,0.1)' : index === 2 ? 'rgba(205,127,50,0.1)' : 'none',
              borderRadius: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: index === 0 ? '#FFD60A' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Fredoka One', cursive",
                color: '#000'
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{score.playerName || 'Anonymous'}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                  {score.categories} • {score.difficulty} • {score.date}
                </div>
              </div>
              <div style={{
                fontFamily: "'Fredoka One', cursive",
                color: '#FFD60A',
                fontSize: '1.2rem'
              }}>
                {score.score}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.8rem'
      }}>
        Best Score: {scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0}
      </div>
    </div>
  );
};

export default function WordScramble() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Moved inside the component
  
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [selectedCategories, setSelectedCategories] = useState(['ALL']);
  const [questionCount, setQuestionCount] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionWords, setSessionWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTIES.MEDIUM.timer);
  const [status, setStatus] = useState('playing');
  const [feedback, setFeedback] = useState('');
  const [round, setRound] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wordScrambleLeaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
    
    // Load user stats
    const stats = localStorage.getItem('wordScrambleStats');
    if (stats) {
      const parsed = JSON.parse(stats);
      setGamesPlayed(parsed.gamesPlayed || 0);
      setTotalScore(parsed.totalScore || 0);
      setBestScore(parsed.bestScore || 0);
      setBestStreak(parsed.bestStreak || 0);
    }
  }, []);

  // Save leaderboard to localStorage
  useEffect(() => {
    if (leaderboard.length > 0) {
      localStorage.setItem('wordScrambleLeaderboard', JSON.stringify(leaderboard));
    }
  }, [leaderboard]);

  // Save user stats
  useEffect(() => {
    if (gamesPlayed > 0 || totalScore > 0) {
      localStorage.setItem('wordScrambleStats', JSON.stringify({
        gamesPlayed,
        totalScore,
        bestScore,
        bestStreak
      }));
    }
  }, [gamesPlayed, totalScore, bestScore, bestStreak]);

  const startGame = () => {
    const words = getRandomWords(selectedCategories, questionCount);
    setSessionWords(words);
    setGameStarted(true);
    setWordIndex(0);
    setRound(1);
    setScore(0);
    setStreak(0);
    setTimeLeft(DIFFICULTIES[difficulty].timer);
    setStatus('playing');
    setInput('');
    setFeedback('');
    setShowHint(false);
    setHintUsed(false);
  };

  const loadWord = useCallback((idx) => {
    if (sessionWords.length > 0 && idx < sessionWords.length) {
      const w = sessionWords[idx];
      setScrambled(scramble(w.word));
      setInput('');
      setTimeLeft(DIFFICULTIES[difficulty].timer);
      setFeedback('');
      setShowHint(false);
      setHintUsed(false);
    }
  }, [sessionWords, difficulty]);

  useEffect(() => {
    if (sessionWords.length > 0 && gameStarted) {
      loadWord(wordIndex);
    }
  }, [wordIndex, sessionWords, loadWord, gameStarted]);

  const nextWord = useCallback(() => {
    if (round >= sessionWords.length) {
      setStatus('finished');
      playSound('complete');
      
      // Update stats
      setGamesPlayed(prev => prev + 1);
      setTotalScore(prev => prev + score);
      if (score > bestScore) setBestScore(score);
      if (streak > bestStreak) setBestStreak(streak);
      
      // Save to leaderboard
      const categoryNames = selectedCategories.includes('ALL') 
        ? 'All Categories' 
        : selectedCategories.join(', ');
      
      const newEntry = {
        id: Date.now(),
        playerName: user?.displayName || user?.email || 'Anonymous',
        score,
        correct: round,
        total: sessionWords.length,
        categories: categoryNames,
        difficulty,
        streak,
        date: new Date().toLocaleDateString()
      };
      setLeaderboard(prev => [newEntry, ...prev].sort((a, b) => b.score - a.score).slice(0, 20));
      
      // Save game score to backend if user is logged in
      if (user) {
        saveGameScore(user, 'word-scramble', score);
      }
    } else {
      setRound(r => r + 1);
      setWordIndex(i => i + 1);
    }
  }, [round, sessionWords.length, score, streak, selectedCategories, difficulty, user, bestScore, bestStreak]);

  useEffect(() => {
    if (status !== 'playing' || !gameStarted) return;
    
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          const currentWord = sessionWords[wordIndex]?.word || 'UNKNOWN';
          setFeedback(`⏰ Time's up! The word was: ${currentWord}`);
          setStreak(0);
          playSound('wrong');
          setTimeout(nextWord, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(t);
  }, [status, wordIndex, nextWord, sessionWords, gameStarted]);

  const checkAnswer = () => {
    if (!gameStarted || status !== 'playing') return;
    
    const answer = input.trim().toUpperCase();
    const correct = sessionWords[wordIndex]?.word || '';
    
    if (answer === correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Calculate points
      const basePoints = DIFFICULTIES[difficulty].points;
      const timeBonus = Math.floor(timeLeft * 2);
      const streakBonus = newStreak > 2 ? 50 * (newStreak - 2) : 0;
      const hintPenalty = hintUsed ? DIFFICULTIES[difficulty].hintPenalty : 0;
      const roundPoints = basePoints + timeBonus + streakBonus - hintPenalty;
      
      setScore(s => s + roundPoints);
      
      // Appreciative feedback
      let appreciation = '';
      if (timeLeft > DIFFICULTIES[difficulty].timer * 0.8) {
        appreciation = '🌟 LIGHTNING FAST!';
      } else if (timeLeft > DIFFICULTIES[difficulty].timer * 0.5) {
        appreciation = '✨ GREAT SPEED!';
      } else if (newStreak > 3) {
        appreciation = `🔥 ${newStreak}x STREAK!`;
      } else {
        appreciation = '👍 WELL DONE!';
      }
      
      setFeedback(`✅ ${appreciation} +${roundPoints} points`);
      playSound('correct');
      setTimeout(nextWord, 1500);
    } else {
      setStreak(0);
      setFeedback('❌ Not quite right... Try again! 💪');
      playSound('wrong');
    }
  };

  const getHint = () => {
    setShowHint(true);
    setHintUsed(true);
    playSound('hint');
  };

  const toggleCategory = (category) => {
    if (category === 'ALL') {
      setSelectedCategories(['ALL']);
    } else {
      let newCategories;
      if (selectedCategories.includes('ALL')) {
        newCategories = [category];
      } else {
        if (selectedCategories.includes(category)) {
          newCategories = selectedCategories.filter(c => c !== category);
          if (newCategories.length === 0) newCategories = ['ALL'];
        } else {
          newCategories = [...selectedCategories, category];
        }
      }
      setSelectedCategories(newCategories);
    }
  };

  const timerColor = timeLeft <= 10 ? '#FF4757'
    : timeLeft <= 20 ? '#FFD60A' : '#06D6A0';

  // Game Setup Screen
  if (!gameStarted) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => navigate('/games')} style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer'
          }}>← Back to Games</button>
          <button onClick={() => setShowLeaderboard(true)} style={{
            background: 'none', border: 'none',
            color: '#FFD60A', fontSize: '1.5rem', cursor: 'pointer'
          }}>🏆</button>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🔤</div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '2.5rem', marginBottom: '8px' }}>Word Scramble</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Unscramble the words before time runs out!
          </p>
        </div>

        {/* Category Selection */}
        <div style={{ background: '#16213E', borderRadius: '20px',
          padding: '20px', marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
            marginBottom: '15px', fontWeight: 700 }}>
            📚 SELECT CATEGORIES
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => toggleCategory('ALL')}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: selectedCategories.includes('ALL') ? '#FFD60A' : 'rgba(255,255,255,0.1)',
                background: selectedCategories.includes('ALL') ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.05)',
                color: selectedCategories.includes('ALL') ? '#FFD60A' : '#fff',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              🎲 ALL CATEGORIES
            </button>
            {Object.entries(WORD_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => toggleCategory(key)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid',
                  borderColor: selectedCategories.includes(key) ? cat.color : 'rgba(255,255,255,0.1)',
                  background: selectedCategories.includes(key) ? `${cat.color}20` : 'rgba(255,255,255,0.05)',
                  color: selectedCategories.includes(key) ? cat.color : '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center'
                }}
              >
                <span>{cat.icon}</span>
                <span>{key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div style={{ background: '#16213E', borderRadius: '20px',
          padding: '20px', marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
            marginBottom: '15px', fontWeight: 700 }}>
            ⚡ SELECT DIFFICULTY
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {Object.entries(DIFFICULTIES).map(([key, diff]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid',
                  borderColor: difficulty === key ? '#FFD60A' : 'rgba(255,255,255,0.1)',
                  background: difficulty === key ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.05)',
                  color: difficulty === key ? '#FFD60A' : '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {key}
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                  {diff.timer}s
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div style={{ background: '#16213E', borderRadius: '20px',
          padding: '20px', marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
            marginBottom: '15px', fontWeight: 700 }}>
            ❓ NUMBER OF WORDS
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[5, 10, 15, 20].map(num => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: questionCount === num ? '#FFD60A' : 'rgba(255,255,255,0.1)',
                  background: questionCount === num ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.05)',
                  color: questionCount === num ? '#FFD60A' : '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Preview */}
        {gamesPlayed > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive",
              marginBottom: '15px', color: '#FFD60A' }}>📊 Your Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#06D6A0' }}>{gamesPlayed}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Games Played</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#FFD60A' }}>{totalScore}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total Score</div>
              </div>
              {bestScore > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#FF4757' }}>{bestScore}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Best Score</div>
                </div>
              )}
              {bestStreak > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#7B2FFF' }}>{bestStreak}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Best Streak</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '24px' }}>
          {[
            [`⚡ ${DIFFICULTIES[difficulty].timer}s timer`, '#FFD60A'],
            [`💰 ${DIFFICULTIES[difficulty].points}pts base`, '#06D6A0'],
            ['🎯 Time bonus', '#7B2FFF'],
            ['🔥 Streak bonus', '#FF4757']
          ].map(([label, color]) => (
            <div key={label} style={{
              background: `${color}20`,
              border: `1px solid ${color}40`,
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: color
            }}>
              {label}
            </div>
          ))}
        </div>

        <button
          onClick={startGame}
          style={{
            width: '100%',
            padding: '20px',
            background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            border: 'none',
            borderRadius: '16px',
            color: '#fff',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.4rem',
            cursor: 'pointer'
          }}
        >
          🚀 START GAME
        </button>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 999
            }} onClick={() => setShowLeaderboard(false)} />
            <Leaderboard scores={leaderboard} onClose={() => setShowLeaderboard(false)} />
          </>
        )}
      </div>
    );
  }

  // Game Finished Screen
  if (status === 'finished') {
    const accuracy = Math.round((round / sessionWords.length) * 100);
    
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto',
        padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>
          {score > bestScore ? '🏆' : '🎉'}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2.5rem', marginBottom: '8px' }}>Game Complete!</div>
        
        {/* Score Display */}
        <div style={{
          background: 'linear-gradient(135deg, #7B2FFF20, #FF3D9A20)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            Final Score
          </div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '4rem', color: '#FFD60A', lineHeight: 1 }}>
            ⭐ {score}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '24px' }}>
          {[
            ['✅', 'Correct', `${round}/${sessionWords.length}`],
            ['📊', 'Accuracy', `${accuracy}%`],
            ['🔥', 'Best Streak', streak],
            ['⚡', 'Difficulty', difficulty]
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: '#16213E',
              borderRadius: '14px', padding: '16px',
              border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.2rem', color: '#FFD60A' }}>{val}</div>
              <div style={{ fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => {
            setGameStarted(false);
            setWordIndex(0);
            setRound(1);
            setScore(0);
            setStreak(0);
          }} style={{ flex: 1,
            background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            border: 'none', color: '#fff', padding: '14px', borderRadius: '14px',
            fontFamily: "'Fredoka One', cursive", fontSize: '1rem', cursor: 'pointer'
          }}>🔄 Play Again</button>
          <button onClick={() => navigate('/games')} style={{
            flex: 1, background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', padding: '14px', borderRadius: '14px',
            fontFamily: "'Fredoka One', cursive", fontSize: '1rem', cursor: 'pointer'
          }}>🎮 All Games</button>
        </div>
      </div>
    );
  }

  // Game Play Screen
  if (!sessionWords.length || !sessionWords[wordIndex]) return null;

  const currentWord = sessionWords[wordIndex];
  const categoryInfo = Object.entries(WORD_CATEGORIES).find(([_, cat]) => 
    cat.words.some(w => w.word === currentWord.word)
  )?.[1] || { icon: '🔤', color: '#FFD60A' };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => setGameStarted(false)} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontSize: '0.9rem' }}>← Setup</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>🔤 Word Scramble</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A' }}>⭐ {score}</div>
      </div>

      {/* Round & Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            {round}/{sessionWords.length}
          </span>
          {streak > 1 && (
            <span style={{ color: '#FF6B35', fontWeight: 800 }}>
              🔥 {streak}x
            </span>
          )}
        </div>
        <span style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2rem', color: timerColor }}>
          {timeLeft}s
        </span>
      </div>

      {/* Timer bar */}
      <div style={{ background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px', height: '6px', marginBottom: '16px' }}>
        <div style={{ background: timerColor, height: '6px',
          borderRadius: '50px', width: `${(timeLeft / DIFFICULTIES[difficulty].timer) * 100}%`,
          transition: 'width 1s linear' }}/>
      </div>

      {/* Category Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <span style={{
          background: `${categoryInfo.color}20`,
          color: categoryInfo.color,
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>{categoryInfo.icon}</span>
          <span>{categoryInfo.icon === '🔤' ? 'Mixed' : Object.keys(WORD_CATEGORIES).find(
            key => WORD_CATEGORIES[key] === categoryInfo
          )}</span>
        </span>
      </div>

      {/* Scrambled Word */}
      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '32px', textAlign: 'center', marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: timeLeft <= 10 ? `0 0 20px ${timerColor}40` : 'none' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)',
          fontSize: '0.8rem', marginBottom: '12px', fontWeight: 700 }}>
          UNSCRAMBLE THIS WORD
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2.8rem', letterSpacing: '8px', color: '#FFD60A',
          marginBottom: '12px', wordBreak: 'break-all' }}>
          {scrambled}
        </div>
        {!showHint ? (
          <button onClick={getHint} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.6)', padding: '8px 16px',
            borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            💡 Need a hint? ({DIFFICULTIES[difficulty].hintPenalty} pts penalty)
          </button>
        ) : (
          <div style={{ color: categoryInfo.color, fontSize: '0.95rem' }}>
            💡 Hint: {currentWord.hint}
          </div>
        )}
      </div>

      {/* Input */}
      <input value={input}
        onChange={e => setInput(e.target.value.toUpperCase())}
        onKeyPress={e => e.key === 'Enter' && checkAnswer()}
        placeholder="Type your answer..."
        maxLength={20}
        autoFocus
        style={{ width: '100%', background: 'rgba(255,255,255,0.06)',
          border: '2px solid rgba(255,255,255,0.15)', color: '#fff',
          padding: '16px 20px', borderRadius: '14px', marginBottom: '12px',
          fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem',
          letterSpacing: '4px', textAlign: 'center', outline: 'none',
          boxSizing: 'border-box' }}/>

      {feedback && (
        <div style={{ textAlign: 'center', marginBottom: '12px',
          fontWeight: 800, fontSize: '1rem',
          color: feedback.includes('✅') ? '#06D6A0' : '#FF4757' }}>
          {feedback}
        </div>
      )}

      <button onClick={checkAnswer} style={{
        width: '100%', background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
        border: 'none', color: '#fff', padding: '16px', borderRadius: '14px',
        fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem', cursor: 'pointer',
        marginBottom: '12px'
      }}>✅ Submit Answer</button>

      {/* Progress Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '20px'
      }}>
        {sessionWords.map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i < wordIndex ? '#06D6A0' :
                         i === wordIndex ? '#FFD60A' :
                         'rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Session Info */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.2)',
        fontSize: '0.7rem'
      }}>
        {difficulty} • {selectedCategories.includes('ALL') ? 'All Categories' : `${selectedCategories.length} categories`}
      </div>
    </div>
  );
}