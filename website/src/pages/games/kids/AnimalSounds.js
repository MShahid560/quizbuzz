import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../../services/sounds';

// Enhanced animal database with categories
const ANIMALS_DB = {
  'Farm Animals': [
    { animal: '🐶', name: 'Dog', sound: 'woof', emoji: '🐕', fact: 'Dogs bark to communicate!' },
    { animal: '🐱', name: 'Cat', sound: 'meow', emoji: '🐈', fact: 'Cats purr when happy!' },
    { animal: '🐮', name: 'Cow', sound: 'moo', emoji: '🐄', fact: 'Cows have best friends!' },
    { animal: '🐷', name: 'Pig', sound: 'oink', emoji: '🐖', fact: 'Pigs are very smart!' },
    { animal: '🐔', name: 'Chicken', sound: 'cluck', emoji: '🐓', fact: 'Chickens have great memories!' },
    { animal: '🐑', name: 'Sheep', sound: 'baa', emoji: '🐏', fact: 'Sheep have rectangular pupils!' },
    { animal: '🐐', name: 'Goat', sound: 'maa', emoji: '🐐', fact: 'Goats have accents!' },
    { animal: '🦃', name: 'Turkey', sound: 'gobble', emoji: '🦃', fact: 'Turkeys can blush!' },
    { animal: '🐴', name: 'Horse', sound: 'neigh', emoji: '🐎', fact: 'Horses can sleep standing up!' },
    { animal: '🦆', name: 'Duck', sound: 'quack', emoji: '🦆', fact: 'Duck quacks don\'t echo!' },
  ],
  'Wild Animals': [
    { animal: '🦁', name: 'Lion', sound: 'roar', emoji: '🦁', fact: 'Lions sleep 20 hours a day!' },
    { animal: '🐯', name: 'Tiger', sound: 'growl', emoji: '🐯', fact: 'Tiger stripes are unique!' },
    { animal: '🐘', name: 'Elephant', sound: 'trumpet', emoji: '🐘', fact: 'Elephants never forget!' },
    { animal: '🦒', name: 'Giraffe', sound: 'hum', emoji: '🦒', fact: 'Giraffes hum at night!' },
    { animal: '🦓', name: 'Zebra', sound: 'bark', emoji: '🦓', fact: 'Zebras stripes confuse flies!' },
    { animal: '🦏', name: 'Rhino', sound: 'snort', emoji: '🦏', fact: 'Rhinos have thick skin!' },
    { animal: '🐆', name: 'Leopard', sound: 'growl', emoji: '🐆', fact: 'Leopards are great climbers!' },
    { animal: '🐊', name: 'Crocodile', sound: 'hiss', emoji: '🐊', fact: 'Crocodiles have been around for 200M years!' },
    { animal: '🐍', name: 'Snake', sound: 'hiss', emoji: '🐍', fact: 'Snakes smell with their tongue!' },
    { animal: '🦍', name: 'Gorilla', sound: 'grunt', emoji: '🦍', fact: 'Gorillas share 98% DNA with humans!' },
  ],
  'Birds': [
    { animal: '🦉', name: 'Owl', sound: 'hoo', emoji: '🦉', fact: 'Owls can rotate head 270°!' },
    { animal: '🦅', name: 'Eagle', sound: 'screech', emoji: '🦅', fact: 'Eagles have 20/4 vision!' },
    { animal: '🦜', name: 'Parrot', sound: 'squawk', emoji: '🦜', fact: 'Parrots can mimic human speech!' },
    { animal: '🐧', name: 'Penguin', sound: 'honk', emoji: '🐧', fact: 'Penguins propose with pebbles!' },
    { animal: '🦢', name: 'Swan', sound: 'whistle', emoji: '🦢', fact: 'Swans mate for life!' },
    { animal: '🦩', name: 'Flamingo', sound: 'grunt', emoji: '🦩', fact: 'Flamingos are pink from shrimp!' },
    { animal: '🐦', name: 'Sparrow', sound: 'chirp', emoji: '🐦', fact: 'Sparrows learn songs from parents!' },
    { animal: '🕊️', name: 'Dove', sound: 'coo', emoji: '🕊️', fact: 'Doves symbolize peace!' },
    { animal: '🐓', name: 'Rooster', sound: 'cock-a-doodle-doo', emoji: '🐓', fact: 'Roosters crow at dawn!' },
    { animal: '🦚', name: 'Peacock', sound: 'scream', emoji: '🦚', fact: 'Peacocks tails have eyespots!' },
  ],
  'Sea Animals': [
    { animal: '🐬', name: 'Dolphin', sound: 'click', emoji: '🐬', fact: 'Dolphins have names for each other!' },
    { animal: '🐋', name: 'Whale', sound: 'song', emoji: '🐋', fact: 'Whales sing complex songs!' },
    { animal: '🦭', name: 'Seal', sound: 'bark', emoji: '🦭', fact: 'Seals can hold breath for 2 hours!' },
    { animal: '🦈', name: 'Shark', sound: 'silent', emoji: '🦈', fact: 'Sharks never run out of teeth!' },
    { animal: '🐙', name: 'Octopus', sound: 'silent', emoji: '🐙', fact: 'Octopus have three hearts!' },
    { animal: '🦀', name: 'Crab', sound: 'click', emoji: '🦀', fact: 'Crabs walk sideways!' },
    { animal: '🐠', name: 'Fish', sound: 'bubble', emoji: '🐠', fact: 'Fish communicate with bubbles!' },
    { animal: '🐡', name: 'Pufferfish', sound: 'puff', emoji: '🐡', fact: 'Pufferfish inflate when scared!' },
    { animal: '🦑', name: 'Squid', sound: 'splash', emoji: '🦑', fact: 'Squid have three hearts!' },
    { animal: '🐢', name: 'Turtle', sound: 'hiss', emoji: '🐢', fact: 'Turtles can live over 100 years!' },
  ],
  'Insects': [
    { animal: '🐝', name: 'Bee', sound: 'buzz', emoji: '🐝', fact: 'Bees do a waggle dance!' },
    { animal: '🦋', name: 'Butterfly', sound: 'flutter', emoji: '🦋', fact: 'Butterflies taste with feet!' },
    { animal: '🐞', name: 'Ladybug', sound: 'click', emoji: '🐞', fact: 'Ladybugs smell with feet!' },
    { animal: '🦟', name: 'Mosquito', sound: 'buzz', emoji: '🦟', fact: 'Only female mosquitoes bite!' },
    { animal: '🦗', name: 'Cricket', sound: 'chirp', emoji: '🦗', fact: 'Crickets hear with knees!' },
    { animal: '🐜', name: 'Ant', sound: 'click', emoji: '🐜', fact: 'Ants can carry 50x their weight!' },
    { animal: '🕷️', name: 'Spider', sound: 'silent', emoji: '🕷️', fact: 'Spiders have blue blood!' },
    { animal: '🦂', name: 'Scorpion', sound: 'hiss', emoji: '🦂', fact: 'Scorpions glow in UV light!' },
    { animal: '🐛', name: 'Caterpillar', sound: 'munch', emoji: '🐛', fact: 'Caterpillars increase size 1000x!' },
    { animal: '🪰', name: 'Fly', sound: 'buzz', emoji: '🪰', fact: 'Flies taste with their feet!' },
  ]
};

// Sound generator using Web Audio API
class AnimalSoundGenerator {
  constructor() {
    this.audioContext = null;
  }

  initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  generateSound(soundType) {
    const ctx = this.initAudio();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different sounds based on animal
    switch(soundType) {
      case 'woof': // Dog
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        break;
      
      case 'meow': // Cat
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        break;
      
      case 'moo': // Cow
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        break;
      
      case 'roar': // Lion
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        break;
      
      case 'quack': // Duck
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        break;
      
      case 'buzz': // Bee
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        // Add vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 30;
        lfoGain.gain.value = 20;
        lfo.connect(lfoGain).connect(oscillator.frequency);
        lfo.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        setTimeout(() => lfo.stop(), 500);
        break;
      
      case 'hoot': // Owl
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        break;
      
      case 'click': // Dolphin
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(8000, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        break;
      
      case 'chirp': // Cricket/Bird
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.02);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
        break;
      
      default: // Generic sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    }

    oscillator.start();
    oscillator.stop(ctx.currentTime + 1);
  }

  playAnimalSound(soundName) {
    try {
      this.generateSound(soundName);
    } catch (error) {
      console.log('Sound generation error:', error);
      // Fallback to original playSound if available
      playSound(soundName);
    }
  }
}

const soundGenerator = new AnimalSoundGenerator();

export default function AnimalSounds() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Farm Animals');
  const [roundAnimals, setRoundAnimals] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('playing');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  // Generate random 5 animals for the round
  const startNewRound = useCallback((category) => {
    const categoryAnimals = ANIMALS_DB[category] || ANIMALS_DB['Farm Animals'];
    // Randomly select 5 animals from category
    const shuffled = [...categoryAnimals].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5).map(animal => ({
      ...animal,
      options: generateOptions(animal, categoryAnimals)
    }));
    setRoundAnimals(selected);
    setCurrent(0);
    setScore(0);
    setCorrect(0);
    setSelected(null);
    setStatus('playing');
    setGameStarted(true);
  }, []);

  // Generate options (1 correct + 3 distractors from same category)
  const generateOptions = (correctAnimal, categoryAnimals) => {
    const others = categoryAnimals
      .filter(a => a.name !== correctAnimal.name)
      .map(a => a.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    return [correctAnimal.name, ...others].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    // Auto-start with default category
    startNewRound('Farm Animals');
  }, [startNewRound]);

  const nextQ = useCallback(() => {
    if (current + 1 >= roundAnimals.length) {
      setStatus('finished');
      soundGenerator.playAnimalSound('complete');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  }, [current, roundAnimals.length]);

  const handleAnswer = (opt) => {
    if (selected || !roundAnimals[current]) return;
    setSelected(opt);
    
    if (opt === roundAnimals[current].name) {
      setScore(s => s + 100);
      setCorrect(c => c + 1);
    }
    
    // Play the animal sound
    soundGenerator.playAnimalSound(roundAnimals[current].sound);
    
    setTimeout(nextQ, 1500);
  };

  const playAnimalSound = () => {
    if (roundAnimals[current]) {
      soundGenerator.playAnimalSound(roundAnimals[current].sound);
    }
  };

  if (!gameStarted) {
    return (
      <div style={styles.container}>
        <div style={styles.categorySelect}>
          <h2 style={styles.title}>Choose a Category</h2>
          <div style={styles.categoryGrid}>
            {Object.keys(ANIMALS_DB).map(category => (
              <button
                key={category}
                onClick={() => startNewRound(category)}
                style={styles.categoryButton}
              >
                <span style={styles.categoryEmoji}>
                  {category === 'Farm Animals' ? '🚜' :
                   category === 'Wild Animals' ? '🦁' :
                   category === 'Birds' ? '🦜' :
                   category === 'Sea Animals' ? '🐬' : '🐝'}
                </span>
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div style={styles.container}>
        <div style={styles.finishedCard}>
          <div style={styles.finishedEmoji}>🏆</div>
          <div style={styles.finishedTitle}>
            {correct >= 4 ? 'Amazing!' : correct >= 3 ? 'Good Job!' : 'Keep Trying!'}
          </div>
          <div style={styles.finishedScore}>⭐ {score}</div>
          <div style={styles.finishedStats}>
            {correct}/{roundAnimals.length} correct!
          </div>
          <div style={styles.finishedButtons}>
            <button 
              onClick={() => startNewRound(selectedCategory)}
              style={styles.playAgainButton}
            >
              🔄 Play Again
            </button>
            <button 
              onClick={() => setGameStarted(false)}
              style={styles.allGamesButton}
            >
              🎮 Choose Category
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roundAnimals[current]) return null;

  const q = roundAnimals[current];

  return (
    <div style={styles.gameContainer}>
      {/* Sidebar */}
      <div style={{
        ...styles.sidebar,
        width: sidebarOpen ? '280px' : '60px'
      }}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={styles.sidebarToggle}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        
        {sidebarOpen && (
          <>
            <div style={styles.sidebarHeader}>
              <span style={styles.sidebarIcon}>🐾</span>
              <span>Categories</span>
            </div>
            
            <div style={styles.categoryList}>
              {Object.keys(ANIMALS_DB).map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    startNewRound(category);
                  }}
                  style={{
                    ...styles.categoryItem,
                    background: category === selectedCategory 
                      ? 'linear-gradient(135deg, #06D6A0, #00B4FF)'
                      : 'rgba(255,255,255,0.06)',
                    borderColor: category === selectedCategory 
                      ? '#06D6A0' 
                      : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <span style={styles.categoryIcon}>
                    {category === 'Farm Animals' ? '🚜' :
                     category === 'Wild Animals' ? '🦁' :
                     category === 'Birds' ? '🦜' :
                     category === 'Sea Animals' ? '🐬' : '🐝'}
                  </span>
                  <span>{category}</span>
                </button>
              ))}
            </div>

            <div style={styles.sidebarStats}>
              <div style={styles.statItem}>
                <span>⭐ Score</span>
                <span>{score}</span>
              </div>
              <div style={styles.statItem}>
                <span>✅ Correct</span>
                <span>{correct}/{roundAnimals.length}</span>
              </div>
              <div style={styles.statItem}>
                <span>🎯 Progress</span>
                <span>{current + 1}/{roundAnimals.length}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Game Area */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <button 
            onClick={() => setGameStarted(false)}
            style={styles.backButton}
          >
            ← Categories
          </button>
          <div style={styles.headerTitle}>🐾 Animal Sounds</div>
          <div style={styles.headerScore}>⭐ {score}</div>
        </div>

        <div style={styles.questionCard}>
          <div style={styles.animalEmoji}>{q.animal}</div>
          
          <button 
            onClick={playAnimalSound}
            style={styles.soundButton}
          >
            🔊 Play Sound
          </button>
          
          <div style={styles.soundText}>"{q.sound}!"</div>
          <div style={styles.questionText}>
            Which animal makes this sound?
          </div>
          {q.fact && (
            <div style={styles.factText}>✨ Did you know? {q.fact}</div>
          )}
        </div>

        <div style={styles.optionsGrid}>
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.name;
            const isSelected = opt === selected;
            
            let buttonStyle = {...styles.optionButton};
            
            if (selected) {
              if (isCorrect) {
                buttonStyle = {...buttonStyle, ...styles.correctOption};
              } else if (isSelected) {
                buttonStyle = {...buttonStyle, ...styles.wrongOption};
              }
            }
            
            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={!!selected}
                style={buttonStyle}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0D0D1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  gameContainer: {
    minHeight: '100vh',
    background: '#0D0D1A',
    display: 'flex',
    color: '#fff'
  },
  sidebar: {
    background: 'rgba(255,255,255,0.03)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    padding: '20px 10px',
    transition: 'width 0.3s',
    overflow: 'hidden',
    position: 'relative',
    height: '100vh'
  },
  sidebarToggle: {
    position: 'absolute',
    right: '10px',
    top: '20px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    width: '30px',
    height: '30px',
    borderRadius: '15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sidebarHeader: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '1.5rem',
    marginBottom: '30px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sidebarIcon: {
    fontSize: '2rem'
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '30px'
  },
  categoryItem: {
    padding: '12px',
    border: '1px solid',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontFamily: "'Fredoka One', cursive",
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s'
  },
  categoryIcon: {
    fontSize: '1.2rem'
  },
  sidebarStats: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '15px'
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    color: 'rgba(255,255,255,0.8)'
  },
  mainContent: {
    flex: 1,
    padding: '30px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  headerTitle: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '1.8rem'
  },
  headerScore: {
    fontFamily: "'Fredoka One', cursive",
    color: '#FFD60A',
    fontSize: '1.5rem'
  },
  questionCard: {
    background: 'linear-gradient(135deg, #06D6A022, #00B4FF22)',
    border: '1px solid rgba(6,214,160,0.3)',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    marginBottom: '30px'
  },
  animalEmoji: {
    fontSize: '6rem',
    marginBottom: '20px'
  },
  soundButton: {
    background: 'linear-gradient(135deg, #06D6A0, #00B4FF)',
    border: 'none',
    color: '#0D0D1A',
    padding: '12px 24px',
    borderRadius: '30px',
    fontFamily: "'Fredoka One', cursive",
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  soundText: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '2.5rem',
    color: '#FFD60A',
    marginBottom: '10px'
  },
  questionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '1.1rem',
    marginBottom: '15px'
  },
  factText: {
    background: 'rgba(255,255,255,0.1)',
    padding: '12px',
    borderRadius: '30px',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  optionButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '2px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '20px',
    borderRadius: '14px',
    fontFamily: "'Fredoka One', cursive",
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  correctOption: {
    background: 'rgba(6,214,160,0.2)',
    border: '2px solid #06D6A0'
  },
  wrongOption: {
    background: 'rgba(255,71,87,0.2)',
    border: '2px solid #FF4757'
  },
  categorySelect: {
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center'
  },
  title: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '2.5rem',
    color: '#fff',
    marginBottom: '40px'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  categoryButton: {
    background: 'linear-gradient(135deg, #06D6A022, #00B4FF22)',
    border: '1px solid rgba(6,214,160,0.3)',
    borderRadius: '16px',
    padding: '30px 20px',
    color: '#fff',
    fontFamily: "'Fredoka One', cursive",
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    transition: 'transform 0.2s'
  },
  categoryEmoji: {
    fontSize: '3rem'
  },
  finishedCard: {
    maxWidth: '500px',
    width: '100%',
    background: 'linear-gradient(135deg, #06D6A022, #00B4FF22)',
    border: '1px solid rgba(6,214,160,0.3)',
    borderRadius: '30px',
    padding: '60px 20px',
    textAlign: 'center'
  },
  finishedEmoji: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  finishedTitle: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '2.8rem',
    color: '#fff',
    marginBottom: '10px'
  },
  finishedScore: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '3.5rem',
    color: '#FFD60A',
    marginBottom: '10px'
  },
  finishedStats: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1.2rem',
    marginBottom: '30px'
  },
  finishedButtons: {
    display: 'flex',
    gap: '12px'
  },
  playAgainButton: {
    flex: 1,
    background: 'linear-gradient(135deg, #06D6A0, #00B4FF)',
    border: 'none',
    color: '#0D0D1A',
    padding: '16px',
    borderRadius: '14px',
    fontFamily: "'Fredoka One', cursive",
    fontSize: '1.1rem',
    cursor: 'pointer'
  },
  allGamesButton: {
    flex: 1,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '16px',
    borderRadius: '14px',
    fontFamily: "'Fredoka One', cursive",
    fontSize: '1.1rem',
    cursor: 'pointer'
  }
};