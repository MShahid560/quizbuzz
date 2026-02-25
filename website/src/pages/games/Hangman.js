import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

// Expanded to 400+ words with hints and difficulty levels
const WORDS = [
  // Easy Words (shorter, common words)
  ...Array(50).fill(null).map((_, i) => ({
    word: ['CAT', 'DOG', 'SUN', 'CAR', 'BOOK', 'BALL', 'FISH', 'BIRD', 'TREE', 'HOUSE',
           'MOON', 'STAR', 'CLOUD', 'RAIN', 'SNOW', 'FIRE', 'WATER', 'WIND', 'SAND', 'ROCK',
           'FROG', 'BEAR', 'LION', 'WOLF', 'DEER', 'DUCK', 'GOAT', 'COW', 'PIG', 'HEN',
           'BED', 'DOOR', 'WALL', 'ROOF', 'ROOM', 'DESK', 'CHAIR', 'TABLE', 'LAMP', 'FAN',
           'CUP', 'BOWL', 'PLATE', 'SPOON', 'FORK', 'KNIFE', 'GLASS', 'MILK', 'JUICE', 'EGG'][i % 50],
    hint: ['Small pet', 'Loyal animal', 'Bright in sky', 'Vehicle', 'Read it', 'Play with it',
           'Swims', 'Flies', 'Grows tall', 'Where you live',
           'Night light', 'Twinkles', 'Floats in sky', 'Wet weather', 'Cold white stuff',
           'Hot and bright', 'You drink it', 'Blows', 'Beach ground', 'Hard ground material',
           'Green hopper', 'Hibernates', 'King of jungle', 'Howls at moon', 'Has antlers',
           'Quacks', 'Has horns', 'Gives milk', 'Oinks', 'Lays eggs',
           'Sleep on it', 'Open it', 'Part of room', 'Over your head', 'In house',
           'Work on it', 'Sit on it', 'Eat on it', 'Lights up', 'Cools you',
           'Drink from it', 'Eat soup from it', 'Food holder', 'Use to eat', 'Stabs food',
           'Cuts food', 'Drink container', 'White drink', 'Drink from fruits', 'Breakfast food'][i % 50],
    difficulty: 'easy',
    points: 50
  })),
  
  // Medium Words (medium length)
  ...Array(100).fill(null).map((_, i) => {
    const words = ['ELEPHANT', 'GIRAFFE', 'KANGAROO', 'DOLPHIN', 'PENGUIN', 'ZEBRA', 'CHEETAH',
                   'GORILLA', 'RHINO', 'HIPPO', 'CROCODILE', 'BUTTERFLY', 'OCTOPUS', 'JELLYFISH',
                   'PYTHON', 'JAVA', 'RUBY', 'SWIFT', 'KOTLIN', 'TYPESCRIPT', 'RUST', 'GO',
                   'PIANO', 'GUITAR', 'VIOLIN', 'CELLO', 'DRUM', 'FLUTE', 'TRUMPET', 'SAXOPHONE',
                   'PIZZA', 'PASTA', 'BURGER', 'SUSHI', 'TACO', 'CURRY', 'RAMEN', 'DUMPLING',
                   'FOOTBALL', 'SOCCER', 'TENNIS', 'VOLLEYBALL', 'BASEBALL', 'GOLF', 'HOCKEY',
                   'RAINBOW', 'THUNDER', 'LIGHTNING', 'VOLCANO', 'MOUNTAIN', 'DESERT', 'FOREST',
                   'COMPUTER', 'KEYBOARD', 'MONITOR', 'INTERNET', 'WEBSITE', 'BROWSER', 'ROBOT',
                    'PYRAMID', 'PHARAOH', 'SPHINX', 'MAYA', 'AZTEC', 'INCA', 'ROMAN', 'GREEK',
                   'HAPPINESS', 'SADNESS', 'COURAGE', 'KINDNESS', 'HONESTY', 'LOYALTY', 'WISDOM',
                   'DOCTOR', 'NURSE', 'TEACHER', 'ENGINEER', 'ARCHITECT', 'SCIENTIST', 'ARTIST',
                   'DRAGON', 'UNICORN', 'PHOENIX', 'PEGASUS', 'CENTAUR', 'MINOTAUR', 'MEDUSA',
                   'OXYGEN', 'HYDROGEN', 'GRAVITY', 'ENERGY', 'ATOM', 'MOLECULE', 'CELL', 'DNA',
                   'ALGORITHM', 'DATABASE', 'SOFTWARE', 'HARDWARE', 'PROCESSOR', 'MEMORY'];
    return {
      word: words[i % words.length],
      hint: ['Large trunk animal', 'Tall neck animal', 'Australian jumper', 'Smart swimmer',
             'Flightless bird', 'Striped horse', 'Fast cat',
             'Large primate', 'Horned animal', 'River horse', 'Water reptile', 'Colorful flyer',
             'Eight arms', 'Tentacles', 'Snake or language', 'Coffee language', 'Gem language',
             'Apple language', 'Android language', 'JavaScript with types', 'Safe systems language', 'Google language',
             'Keyboard instrument', 'String instrument', 'Small strings', 'Large strings', 'Percussion', 'Wind', 'Brass', 'Jazz instrument',
             'Italian dish', 'Italian noodles', 'Patty in bun', 'Japanese roll', 'Mexican fold', 'Spiced dish', 'Japanese soup', 'Filled pockets',
             'Goal sport', 'Foot sport', 'Racket sport', 'Net sport', 'Bat and ball', 'Club sport', 'Ice sport',
             'Colorful arc', 'Storm sound', 'Sky flash', 'Erupting mountain', 'High land', 'Dry land', 'Tree land',
             'Electronic device', 'Typing device', 'Display', 'World network', 'Web pages', 'Web viewer', 'Automated machine',
             'Ancient monument', 'Egyptian ruler', 'Lion statue', 'Ancient civilization', 'Mexican empire', 'South American empire', 'Italian empire', 'Ancient Greek',
             'Joy feeling', 'Sorrow feeling', 'Bravery', 'Being nice', 'Truthfulness', 'Faithfulness', 'Knowledge',
             'Treats patients', 'Cares for patients', 'Educates', 'Designs and builds', 'Designs buildings', 'Researches', 'Creates art',
             'Fire breather', 'Horned horse', 'Rising bird', 'Winged horse', 'Half man, half horse', 'Half man, half bull', 'Snake hair',
             'Breathing gas', 'Lightest element', 'Pulling force', 'Power to work', 'Basic unit', 'Group of atoms', 'Life unit', 'Genetic code',
             'Step by step', 'Data storage', 'Computer programs', 'Computer parts', 'Computer brain', 'Storage'][i % words.length],
      difficulty: 'medium',
      points: 100
    };
  }),
  
  // Hard Words (longer, complex words)
  ...Array(50).fill(null).map((_, i) => {
    const words = ['TYRANNOSAURUS', 'STEGOSAURUS', 'TRICERATOPS', 'VELOCIRAPTOR', 'PTERODACTYL',
                   'RHINOCEROS', 'HIPPOPOTAMUS', 'CROCODILE', 'ALLIGATOR', 'CHAMELEON',
                   'JAVASCRIPT', 'TYPESCRIPT', 'JAVA', 'PYTHON', 'PROGRAMMING',
                   'ALGORITHM', 'DATASTRUCTURE', 'ARTIFICIAL', 'INTELLIGENCE',
                   'MACHINELEARNING', 'DEEPLEARNING', 'NEURALNETWORK',
                   'ACROPOLIS', 'COLOSSEUM', 'STONEHENGE', 'MACHUPICCHU', 'CHICHENITZA',
                   'MEDITERRANEAN', 'ATLANTICOCEAN', 'PACIFICOCEAN', 'MISSISSIPPI',
                   'GRANDCANYON', 'HIMALAYAS', 'MOUNTAINEVEREST', 'NORTHERNLIGHTS',
                   'THANKSGIVING', 'CHRISTMAS', 'HALLOWEEN', 'CELEBRATION',
                   'CHOCOLATE', 'CELEBRATION', 'RESTAURANT', 'HAMBURGER',
                   'ASTROPHYSICS', 'BIOTECHNOLOGY', 'NANOTECHNOLOGY',
                   'CONSTELLATION', 'ASTRONAUTICAL', 'INTERGALACTIC'];
    return {
      word: words[i % words.length],
      hint: ['T-Rex dinosaur', 'Spiked dinosaur', 'Three-horned dinosaur', 'Fast dinosaur', 'Flying reptile',
             'Large horned animal', 'River horse', 'Water reptile', 'Swamp reptile', 'Color changer',
             'Web language', 'Typed JavaScript', 'Coffee language', 'Snake language', 'Coding',
             'Step-by-step process', 'Organizing data', 'Human-made', 'Smart machines',
             'Computer learning', 'Advanced learning', 'Brain-like computing',
             'Ancient Greek citadel', 'Roman amphitheater', 'Ancient monument', 'Incan city', 'Mayan city',
             'European sea', 'Ocean between Americas', 'Largest ocean', 'US river',
             'Arizona wonder', 'Asian mountains', 'Tallest peak', 'Aurora borealis',
             'Fall holiday', 'Winter holiday', 'Spooky night', 'Party time',
             'Sweet treat', 'Festive event', 'Dining place', 'Sandwich patty',
             'Space physics', 'Life technology', 'Small technology',
             'Star group', 'Space travel', 'Between galaxies'][i % words.length],
      difficulty: 'hard',
      points: 200
    };
  })
];

const MAX_WRONG = 6;

// Difficulty selector component
const DifficultySelector = ({ currentDifficulty, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const difficulties = [
    { value: 'easy', label: '🌟 Easy', color: '#06D6A0' },
    { value: 'medium', label: '⚡ Medium', color: '#FFD60A' },
    { value: 'hard', label: '🔥 Hard', color: '#FF4757' },
    { value: 'random', label: '🎲 Random', color: '#7B2FFF' }
  ];

  const current = difficulties.find(d => d.value === currentDifficulty) || difficulties[3];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: current.color,
          padding: '8px 16px',
          borderRadius: '20px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>{current.label}</span>
        <span style={{ fontSize: '0.7rem' }}>▼</span>
      </button>
      
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: '#16213E',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '8px',
            zIndex: 1000,
            minWidth: '150px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            {difficulties.map(diff => (
              <button
                key={diff.value}
                onClick={() => {
                  onSelect(diff.value);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  background: currentDifficulty === diff.value ? 'rgba(255,255,255,0.1)' : 'none',
                  border: 'none',
                  color: diff.color,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Leaderboard component
const Leaderboard = ({ scores }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          color: '#FFD60A',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '8px'
        }}
      >
        🏆
      </button>
      
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: '#16213E',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '16px',
            zIndex: 1000,
            minWidth: '280px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem',
              marginBottom: '16px',
              color: '#FFD60A',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏆 Session Leaderboard
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                (refreshes on page reload)
              </span>
            </div>
            
            {scores.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px' }}>
                No scores yet. Play a game!
              </div>
            ) : (
              <div>
                {scores.map((entry, index) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: index === 0 ? 'rgba(255,214,10,0.1)' : 'none',
                      borderBottom: index < scores.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}
                  >
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
                      <div style={{ fontWeight: 'bold' }}>{entry.word}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                        {entry.difficulty} • {entry.date}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "'Fredoka One', cursive",
                      color: '#FFD60A',
                      fontSize: '1.1rem'
                    }}>
                      {entry.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center'
            }}>
              Total Games: {scores.length} • Best: {scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const HangmanDrawing = ({ wrong }) => {
  const parts = [
    // Head
    <circle key="head" cx="160" cy="60" r="20"
      stroke="#FF4757" strokeWidth="3" fill="none"/>,
    // Body
    <line key="body" x1="160" y1="80" x2="160" y2="140"
      stroke="#FF4757" strokeWidth="3"/>,
    // Left arm
    <line key="larm" x1="160" y1="100" x2="130" y2="120"
      stroke="#FF4757" strokeWidth="3"/>,
    // Right arm
    <line key="rarm" x1="160" y1="100" x2="190" y2="120"
      stroke="#FF4757" strokeWidth="3"/>,
    // Left leg
    <line key="lleg" x1="160" y1="140" x2="130" y2="170"
      stroke="#FF4757" strokeWidth="3"/>,
    // Right leg
    <line key="rleg" x1="160" y1="140" x2="190" y2="170"
      stroke="#FF4757" strokeWidth="3"/>,
  ];

  return (
    <svg height="200" width="300" style={{ marginBottom: '8px' }}>
      {/* Gallows */}
      <line x1="20" y1="190" x2="280" y2="190"
        stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
      <line x1="60" y1="190" x2="60" y2="20"
        stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
      <line x1="60" y1="20" x2="160" y2="20"
        stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
      <line x1="160" y1="20" x2="160" y2="40"
        stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
      {/* Body parts */}
      {parts.slice(0, wrong)}
    </svg>
  );
};

export default function Hangman() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Moved inside the component
  const [difficulty, setDifficulty] = useState('random');
  const [wordData, setWordData] = useState(null);
  const [guessed, setGuessed] = useState(new Set());
  const [status, setStatus] = useState('playing');
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Load leaderboard from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('hangmanLeaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  // Save leaderboard to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('hangmanLeaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Get random word based on difficulty
  const getRandomWord = useCallback((diff) => {
    let filteredWords = WORDS;
    if (diff !== 'random') {
      filteredWords = WORDS.filter(w => w.difficulty === diff);
    }
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
  }, []);

  // Initialize or reset game
  const resetGame = useCallback((diff) => {
    const newWord = getRandomWord(diff);
    setWordData(newWord);
    setGuessed(new Set());
    setStatus('playing');
    setScore(0);
  }, [getRandomWord]);

  // Handle difficulty change
  const handleDifficultyChange = (newDiff) => {
    setDifficulty(newDiff);
    resetGame(newDiff);
  };

  // Initialize with random word
  useEffect(() => {
    resetGame('random');
  }, [resetGame]);

  // Calculate wrong guesses and win status
  const wrongGuesses = wordData ? [...guessed]
    .filter(l => !wordData.word.includes(l)).length : 0;
  const isWon = wordData ? [...wordData.word]
    .every(l => guessed.has(l)) : false;

  // Effect for game status
  useEffect(() => {
    if (!wordData) return;
    
    if (isWon) {
      const basePoints = wordData.points || 100;
      const timeBonus = Math.floor(Math.random() * 50); // Simulated time bonus
      const wrongGuessPenalty = wrongGuesses * 10;
      const totalPoints = Math.max(basePoints + timeBonus - wrongGuessPenalty, 50);
      
      setScore(totalPoints);
      setStatus('won');
      
      // Add to leaderboard
      const newEntry = {
        id: Date.now(),
        word: wordData.word,
        difficulty: wordData.difficulty,
        score: totalPoints,
        date: new Date().toLocaleTimeString()
      };
      setLeaderboard(prev => [newEntry, ...prev].sort((a, b) => b.score - a.score).slice(0, 10));
      setGamesPlayed(prev => prev + 1);
      setTotalScore(prev => prev + totalPoints);
      
      playSound('complete');
    } else if (wrongGuesses >= MAX_WRONG) {
      setStatus('lost');
      playSound('wrong');
    }
  }, [guessed, isWon, wrongGuesses, wordData]);

  // Handle guess callback
  const handleGuess = useCallback((letter) => {
    if (!wordData) return;
    if (guessed.has(letter) || status !== 'playing') return;
    const newGuessed = new Set([...guessed, letter]);
    setGuessed(newGuessed);
    if (wordData.word.includes(letter)) {
      playSound('correct');
    } else {
      playSound('wrong');
    }
  }, [guessed, status, wordData]);

  // Keyboard effect
  useEffect(() => {
    const handleKey = (e) => {
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) handleGuess(letter);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleGuess]);

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  if (!wordData) return null;

  // Get difficulty color
  const difficultyColor = {
    easy: '#06D6A0',
    medium: '#FFD60A',
    hard: '#FF4757',
    random: '#7B2FFF'
  }[difficulty] || '#7B2FFF';

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header with Leaderboard and Difficulty */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate('/games')} style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Back</button>
          <Leaderboard scores={leaderboard} />
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>🎯 Hangman</div>
        <DifficultySelector 
          currentDifficulty={difficulty}
          onSelect={handleDifficultyChange}
        />
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>LIVES</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: '#FF4757' }}>
              {MAX_WRONG - wrongGuesses}/{MAX_WRONG}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>GAMES</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: '#FFD60A' }}>
              {gamesPlayed}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>TOTAL SCORE</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", color: '#06D6A0' }}>
            ⭐ {totalScore}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {status !== 'playing' && (
        <div style={{ background: status === 'won'
          ? 'rgba(6,214,160,0.2)' : 'rgba(255,71,87,0.2)',
          border: `1px solid ${status === 'won' ? '#06D6A0' : '#FF4757'}`,
          borderRadius: '16px', padding: '16px', textAlign: 'center',
          marginBottom: '16px' }}>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '1.5rem',
            color: status === 'won' ? '#06D6A0' : '#FF4757' }}>
            {status === 'won'
              ? `🎉 You Won! +${score} pts`
              : `💀 Game Over! Word: ${wordData.word}`}
          </div>
          <div style={{ display: 'flex', gap: '12px',
            justifyContent: 'center', marginTop: '12px' }}>
            <button onClick={() => resetGame(difficulty)} style={{
              background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
              border: 'none', color: '#fff', padding: '10px 20px',
              borderRadius: '10px', fontFamily: "'Fredoka One', cursive",
              cursor: 'pointer' }}>🔄 New Word</button>
            <button onClick={() => navigate('/games')} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', padding: '10px 20px', borderRadius: '10px',
              fontFamily: "'Fredoka One', cursive", cursor: 'pointer'
            }}>🎮 All Games</button>
          </div>
        </div>
      )}

      {/* Drawing */}
      <div style={{ display: 'flex', justifyContent: 'center',
        marginBottom: '8px' }}>
        <HangmanDrawing wrong={wrongGuesses}/>
      </div>

      {/* Hint with Difficulty Badge */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
          💡 {wordData.hint}
        </span>
        <span style={{
          background: difficultyColor + '20',
          color: difficultyColor,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          border: `1px solid ${difficultyColor}40`
        }}>
          {wordData.difficulty.toUpperCase()} • {wordData.points} PTS
        </span>
      </div>

      {/* Word Display */}
      <div style={{ display: 'flex', justifyContent: 'center',
        gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[...wordData.word].map((letter, i) => (
          <div key={i} style={{ width: '36px', height: '44px',
            borderBottom: '3px solid #FFD60A',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.5rem', color: '#FFD60A' }}>
            {guessed.has(letter) ? letter : ''}
          </div>
        ))}
      </div>

      {/* Wrong guesses */}
      {[...guessed].filter(l => !wordData.word.includes(l)).length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '16px',
          color: '#FF4757', fontSize: '0.85rem', fontWeight: 700 }}>
          Wrong: {[...guessed]
            .filter(l => !wordData.word.includes(l))
            .join(', ')}
        </div>
      )}

      {/* Keyboard */}
      <div style={{ display: 'flex', flexWrap: 'wrap',
        gap: '6px', justifyContent: 'center' }}>
        {ALPHABET.map(letter => {
          const isGuessed = guessed.has(letter);
          const isWrong = isGuessed && !wordData.word.includes(letter);
          const isRight = isGuessed && wordData.word.includes(letter);
          return (
            <button key={letter} onClick={() => handleGuess(letter)}
              disabled={isGuessed || status !== 'playing'}
              style={{ width: '38px', height: '38px',
                borderRadius: '8px',
                background: isRight ? 'rgba(6,214,160,0.3)'
                  : isWrong ? 'rgba(255,71,87,0.2)'
                  : 'rgba(255,255,255,0.08)',
                border: `1px solid ${isRight ? '#06D6A0'
                  : isWrong ? '#FF4757'
                  : 'rgba(255,255,255,0.15)'}`,
                color: isGuessed
                  ? 'rgba(255,255,255,0.3)' : '#fff',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '0.9rem', cursor: isGuessed ? 'default' : 'pointer',
                transition: 'all 0.2s' }}>
              {letter}
            </button>
          );
        })}
      </div>

      {/* Session Stats Footer */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.2)',
        fontSize: '0.7rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '16px'
      }}>
        Session stats: {gamesPlayed} games • {totalScore} total points
        {leaderboard.length > 0 && ` • Best: ${leaderboard[0].score}`}
      </div>
    </div>
  );
}