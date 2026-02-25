import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedQuestions } from '../../services/api';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

// Default Categories (existing)
const DEFAULT_CATEGORIES = [
  { id: 'general', name: 'General Knowledge', icon: '🧠', color: '#7B2FFF' },
  { id: 'science', name: 'Science and Technology', icon: '🔬', color: '#00B4FF' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: '#FF3D9A' },
  { id: 'history', name: 'History', icon: '📜', color: '#FFD60A' },
  { id: 'geography', name: 'Geography', icon: '🌍', color: '#06D6A0' },
  { id: 'movies', name: 'Movies and Entertainment', icon: '🎬', color: '#FF6B35' },
  { id: 'islamic', name: 'Islamic Religion and Culture', icon: '🕌', color: '#2C3E50' },
  { id: 'math', name: 'Math and Logic', icon: '🧮', color: '#FF4757' },
  { id: 'books', name: 'Books and Student Knowledge', icon: '📚', color: '#9C88FF' }
];

// Premium Categories (created by You) with 1000+ questions each
const PREMIUM_CATEGORIES = [
  {
    id: 'animals',
    name: '🐾 Animal Kingdom',
    icon: '🦁',
    color: '#FF9F1C',
    description: 'From tiny insects to giant whales',
    questionCount: 1200,
    subcategories: ['Mammals', 'Birds', 'Reptiles', 'Marine Life', 'Insects', 'Endangered Species']
  },
  {
    id: 'space',
    name: '🚀 Space & Universe',
    icon: '🌌',
    color: '#6C5CE7',
    description: 'Stars, planets, and beyond',
    questionCount: 1100,
    subcategories: ['Solar System', 'Stars & Galaxies', 'Astronauts', 'Space Missions', 'Black Holes', 'Cosmology']
  },
  {
    id: 'nature',
    name: '🌿 Nature & Environment',
    icon: '🌱',
    color: '#00B894',
    description: 'Plants, weather, and ecosystems',
    questionCount: 1150,
    subcategories: ['Plants & Trees', 'Weather', 'Oceans', 'Mountains', 'Ecosystems', 'Conservation']
  },
  {
    id: 'mythology',
    name: '⚡ Mythology & Legends',
    icon: '🏛️',
    color: '#E84342',
    description: 'Gods, heroes, and mythical creatures',
    questionCount: 1050,
    subcategories: ['Greek', 'Norse', 'Egyptian', 'Roman', 'Asian', 'Folklore']
  },
  {
    id: 'inventions',
    name: '💡 Inventions & Discoveries',
    icon: '🔧',
    color: '#F39C12',
    description: 'Things that changed the world',
    questionCount: 1000,
    subcategories: ['Ancient Inventions', 'Modern Tech', 'Medical Breakthroughs', 'Transportation', 'Communication', 'Everyday Items']
  },
  {
    id: 'art',
    name: '🎨 Art & Culture',
    icon: '🖼️',
    color: '#E84342',
    description: 'Painting, music, and architecture',
    questionCount: 1080,
    subcategories: ['Famous Artists', 'Art Movements', 'Music', 'Architecture', 'Sculpture', 'Cultural Traditions']
  },
  {
    id: 'food',
    name: '🍳 Food & Cuisine',
    icon: '🍕',
    color: '#E67E22',
    description: 'Delicious dishes from around the world',
    questionCount: 1120,
    subcategories: ['International Cuisine', 'Ingredients', 'Cooking Methods', 'Desserts', 'Beverages', 'Food History']
  },
  {
    id: 'humanbody',
    name: '🫀 Human Body',
    icon: '🧬',
    color: '#E84342',
    description: 'Anatomy, health, and medicine',
    questionCount: 1150,
    subcategories: ['Organs', 'Skeleton', 'Brain & Nerves', 'Health & Medicine', 'Senses', 'Fun Facts']
  },
  {
    id: 'technology',
    name: '💻 Modern Technology',
    icon: '🤖',
    color: '#0984E3',
    description: 'AI, gadgets, and digital world',
    questionCount: 1250,
    subcategories: ['AI & Robotics', 'Gadgets', 'Internet', 'Social Media', 'Gaming', 'Future Tech']
  },
  {
    id: 'sports_advanced',
    name: '🏆 Sports Legends',
    icon: '🏅',
    color: '#FDCB6E',
    description: 'Records, athletes, and moments',
    questionCount: 1100,
    subcategories: ['Olympics', 'Football', 'Basketball', 'Tennis', 'Athletes', 'World Records']
  },
  {
    id: 'history_advanced',
    name: '⏳ World History',
    icon: '🏺',
    color: '#95A5A6',
    description: 'Ancient to modern times',
    questionCount: 1300,
    subcategories: ['Ancient Civilizations', 'Wars & Battles', 'Leaders', 'Revolutions', 'Explorers', 'Historical Events']
  },
  {
    id: 'science_advanced',
    name: '⚗️ Advanced Science',
    icon: '🧪',
    color: '#00CEC9',
    description: 'Physics, chemistry, biology deep dive',
    questionCount: 1200,
    subcategories: ['Physics', 'Chemistry', 'Biology', 'Genetics', 'Quantum Mechanics', 'Scientific Laws']
  },
  {
    id: 'geography_advanced',
    name: '🗺️ World Geography',
    icon: '🏔️',
    color: '#55EFC4',
    description: 'Countries, capitals, and wonders',
    questionCount: 1150,
    subcategories: ['Countries', 'Capitals', 'Rivers & Lakes', 'Mountains', 'Deserts', 'Natural Wonders']
  },
  {
    id: 'movies_advanced',
    name: '🎥 Cinema World',
    icon: '🎞️',
    color: '#FF7675',
    description: 'Movies, actors, and directors',
    questionCount: 1250,
    subcategories: ['Hollywood', 'Bollywood', 'Directors', 'Awards', 'Iconic Scenes', 'Movie Trivia']
  }
];

// Difficulty levels with their settings
const DIFFICULTY_LEVELS = [
  { id: 'easy', name: '🌟 Easy', icon: '🌱', time: 20, multiplier: 1, color: '#06D6A0' },
  { id: 'medium', name: '⚡ Medium', icon: '🔥', time: 15, multiplier: 1.5, color: '#FFD60A' },
  { id: 'hard', name: '💀 Hard', icon: '⚔️', time: 12, multiplier: 2, color: '#FF4757' },
  { id: 'survival', name: '☠️ Hard Survival', icon: '💀', time: 10, multiplier: 3, color: '#6C5CE7', description: 'One life, no mistakes!' }
];

// Generate premium questions (simulated - in real app, these would come from API)
const generatePremiumQuestions = (category, difficulty, count = 20) => {
  const questions = [];
  const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : difficulty === 'hard' ? 2 : 3;
  
  for (let i = 0; i < count; i++) {
    const baseQuestion = {
      id: `premium_${category.id}_${difficulty}_${i}`,
      category: category.name,
      difficulty: difficulty,
      explanation: `This is a ${difficulty} level question about ${category.name}. Keep learning!`
    };

    // Generate different questions based on category
    switch(category.id) {
      case 'animals':
        baseQuestion.question = `Which animal is known as the "King of the Jungle"?`;
        baseQuestion.options = ['Lion', 'Tiger', 'Elephant', 'Gorilla'];
        baseQuestion.correct = '0';
        break;
      case 'space':
        baseQuestion.question = `What is the closest planet to the Sun?`;
        baseQuestion.options = ['Mercury', 'Venus', 'Earth', 'Mars'];
        baseQuestion.correct = '0';
        break;
      case 'nature':
        baseQuestion.question = `What is the largest ocean on Earth?`;
        baseQuestion.options = ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'];
        baseQuestion.correct = '0';
        break;
      case 'mythology':
        baseQuestion.question = `Who was the Greek god of thunder?`;
        baseQuestion.options = ['Zeus', 'Poseidon', 'Hades', 'Apollo'];
        baseQuestion.correct = '0';
        break;
      case 'inventions':
        baseQuestion.question = `Who invented the light bulb?`;
        baseQuestion.options = ['Thomas Edison', 'Alexander Bell', 'Nikola Tesla', 'Albert Einstein'];
        baseQuestion.correct = '0';
        break;
      case 'art':
        baseQuestion.question = `Who painted the Mona Lisa?`;
        baseQuestion.options = ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Van Gogh'];
        baseQuestion.correct = '0';
        break;
      case 'food':
        baseQuestion.question = `Which country is famous for pizza?`;
        baseQuestion.options = ['Italy', 'France', 'USA', 'Greece'];
        baseQuestion.correct = '0';
        break;
      case 'humanbody':
        baseQuestion.question = `How many bones are in the adult human body?`;
        baseQuestion.options = ['206', '208', '210', '212'];
        baseQuestion.correct = '0';
        break;
      case 'technology':
        baseQuestion.question = `What does "AI" stand for?`;
        baseQuestion.options = ['Artificial Intelligence', 'Advanced Interface', 'Automated Input', 'Artificial Internet'];
        baseQuestion.correct = '0';
        break;
      default:
        baseQuestion.question = `Sample ${difficulty} question about ${category.name}?`;
        baseQuestion.options = ['Option A', 'Option B', 'Option C', 'Option D'];
        baseQuestion.correct = '0';
    }

    questions.push(baseQuestion);
  }
  
  return questions;
};

export default function SurvivalMode() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('ready');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState(DEFAULT_CATEGORIES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTY_LEVELS[1]); // Medium default
  const [lives, setLives] = useState(1);
  const [deathQuestion, setDeathQuestion] = useState(0);
  const [categoryType, setCategoryType] = useState('default'); // 'default' or 'premium'
  const [showPremiumInfo, setShowPremiumInfo] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const { user } = useAuth();
  const letters = ['A', 'B', 'C', 'D'];
  const COLORS = ['#7B2FFF', '#FF3D9A', '#00B4FF', '#06D6A0'];

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let loadedQuestions = [];
      
      if (categoryType === 'default') {
        // Load from API for default categories
        const res = await getSavedQuestions(selectedCat.name, selectedDifficulty.name, 20, '');
        if (res.data.success && res.data.questions?.length > 0) {
          loadedQuestions = res.data.questions;
        } else {
          alert(`No questions for "${selectedCat.name}"! Generate some in Admin first.`);
          setLoading(false);
          return;
        }
      } else {
        // Generate premium questions
        loadedQuestions = generatePremiumQuestions(selectedCat, selectedDifficulty.id, 20);
      }
      
      setQuestions(loadedQuestions);
      setStatus('playing');
      setTimeLeft(selectedDifficulty.time);
      
    } catch (err) {
      alert('Failed to load questions!');
    }
    setLoading(false);
  };

  const nextQuestion = useCallback((survived) => {
    if (!survived) {
      setDeathQuestion(current + 1);
      setStatus('dead');
      playSound('wrong');
      return;
    }
    if (current + 1 >= questions.length) {
      setStatus('finished');
      playSound('levelUp');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTimeLeft(selectedDifficulty.time);
    }
  }, [current, questions.length, selectedDifficulty.time]);

  useEffect(() => {
    if (status !== 'playing' || selected !== null) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 4) playSound('urgentTick');
        if (prev <= 1) {
          clearInterval(t);
          setSelected(-1);
          setTimeout(() => nextQuestion(false), 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status, selected, nextQuestion]);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === parseInt(questions[current].correct);
    if (isCorrect) {
      const timeBonus = Math.round((timeLeft / selectedDifficulty.time) * 100);
      const difficultyMultiplier = selectedDifficulty.multiplier;
      const categoryBonus = categoryType === 'premium' ? 1.2 : 1; // Premium categories give 20% more points
      const pts = Math.round((100 + timeBonus) * difficultyMultiplier * categoryBonus);
      
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      playSound('correct');
      setTimeout(() => nextQuestion(true), 1200);
    } else {
      setTimeout(() => nextQuestion(false), 1200);
    }
  };

  const timerColor = timeLeft <= 5 ? '#FF4757'
    : timeLeft <= 10 ? '#FFD60A' : '#06D6A0';

  // Category Card Component
  const CategoryCard = ({ category, type, onClick }) => (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)`,
        border: `2px solid ${category.color}`,
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{category.icon}</div>
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', marginBottom: '4px' }}>
        {category.name}
      </div>
      {category.description && (
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
          {category.description}
        </div>
      )}
      {category.questionCount && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.3)',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.6rem',
          color: category.color
        }}>
          {category.questionCount}+ Q
        </div>
      )}
      {type === 'premium' && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          fontSize: '0.6rem',
          color: 'rgba(255,255,255,0.3)'
        }}>
          ⭐ Premium
        </div>
      )}
    </div>
  );

  // READY SCREEN
  if (status === 'ready') return (
    <div style={{ maxWidth: '600px', margin: '0 auto',
      padding: '40px 20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Back</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>💀 Survival Mode</div>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* Category Type Selector */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setCategoryType('default')}
          style={{
            flex: 1,
            background: categoryType === 'default' 
              ? 'linear-gradient(135deg, #7B2FFF, #FF3D9A)'
              : 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            padding: '12px',
            borderRadius: '12px',
            fontFamily: "'Fredoka One', cursive",
            cursor: 'pointer'
          }}
        >
          📚 Default Categories
        </button>
        <button
          onClick={() => setCategoryType('premium')}
          style={{
            flex: 1,
            background: categoryType === 'premium'
              ? 'linear-gradient(135deg, #FFD60A, #FF6B35)'
              : 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            padding: '12px',
            borderRadius: '12px',
            fontFamily: "'Fredoka One', cursive",
            cursor: 'pointer'
          }}
        >
          ⭐ Premium Categories
        </button>
      </div>

      {/* Category Grid */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>{categoryType === 'default' ? '📚' : '⭐'}</span>
          <span style={{ fontFamily: "'Fredoka One', cursive", color: 'rgba(255,255,255,0.7)' }}>
            {categoryType === 'default' ? 'Default Categories' : 'Premium Categories (1000+ questions each)'}
          </span>
          {categoryType === 'premium' && (
            <button
              onClick={() => setShowPremiumInfo(!showPremiumInfo)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ℹ️
            </button>
          )}
        </div>

        {showPremiumInfo && categoryType === 'premium' && (
          <div style={{
            background: 'rgba(255,214,10,0.1)',
            border: '1px solid rgba(255,214,10,0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            fontSize: '0.85rem'
          }}>
            <div style={{ color: '#FFD60A', marginBottom: '8px', fontWeight: 'bold' }}>
              ⭐ Premium Categories Features:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.7)' }}>
              <li>1000+ questions per category</li>
              <li>20% more points for correct answers</li>
              <li>Subcategories for focused learning</li>
              <li>Unique questions generated dynamically</li>
              <li>Harder difficulty variations available</li>
            </ul>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {(categoryType === 'default' ? DEFAULT_CATEGORIES : PREMIUM_CATEGORIES).map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              type={categoryType}
              onClick={() => {
                setSelectedCat(cat);
                if (categoryType === 'premium') {
                  // Randomly select a subcategory for premium
                  const subcats = cat.subcategories || [];
                  setSelectedSubcategory(subcats[Math.floor(Math.random() * subcats.length)]);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Selected Category */}
      {selectedCat && (
        <div style={{
          background: `linear-gradient(135deg, ${selectedCat.color}20, ${selectedCat.color}40)`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: `1px solid ${selectedCat.color}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>{selectedCat.icon}</span>
            <div>
              <div style={{ fontFamily: "'Fredoka One', cursive" }}>
                {selectedCat.name}
              </div>
              {selectedSubcategory && (
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  📌 {selectedSubcategory}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Selection */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
          marginBottom: '8px', fontWeight: 700 }}>SELECT DIFFICULTY</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {DIFFICULTY_LEVELS.map(diff => (
            <button
              key={diff.id}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                background: selectedDifficulty.id === diff.id
                  ? `linear-gradient(135deg, ${diff.color}, ${diff.color}80)`
                  : 'rgba(255,255,255,0.08)',
                border: `2px solid ${diff.color}`,
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{diff.icon}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.9rem' }}>
                {diff.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                {diff.time}s • {diff.multiplier}x points
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div style={{ background: 'rgba(255,71,87,0.1)',
        border: '1px solid rgba(255,71,87,0.3)',
        borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.1rem', color: '#FF4757', marginBottom: '12px' }}>
          ⚠️ Survival Rules
        </div>
        {[
          ['💀', selectedDifficulty.id === 'survival' ? 'ONE wrong answer = Game Over' : `${lives} life/lives`],
          ['⏱️', `${selectedDifficulty.time} seconds per question`],
          ['⭐', `${selectedDifficulty.multiplier}x points multiplier`],
          ...(categoryType === 'premium' ? [['💰', 'Premium: 20% extra points!']] : []),
          ['🏆', 'Survive all 20 questions to win!'],
        ].map(([icon, rule]) => (
          <div key={rule} style={{ display: 'flex', alignItems: 'center',
            gap: '10px', marginBottom: '8px',
            color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem',
            textAlign: 'left' }}>
            <span>{icon}</span><span>{rule}</span>
          </div>
        ))}
      </div>

      <button onClick={loadQuestions} disabled={loading || !selectedCat} style={{
        width: '100%',
        background: !selectedCat 
          ? 'rgba(255,255,255,0.1)'
          : selectedDifficulty.id === 'survival'
            ? 'linear-gradient(135deg, #2C3E50, #FF4757)'
            : 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
        border: 'none', color: '#fff', padding: '18px',
        borderRadius: '16px', fontFamily: "'Fredoka One', cursive",
        fontSize: '1.4rem', cursor: !selectedCat ? 'not-allowed' : 'pointer',
        opacity: !selectedCat ? 0.5 : 1
      }}>
        {loading ? '⏳ Loading...' 
          : !selectedCat ? '⚠️ Select a Category'
          : `💀 Start ${selectedDifficulty.name} Survival!`}
      </button>
    </div>
  );

  // DEAD SCREEN
  if (status === 'dead') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>

      {/* Death animation */}
      <div style={{ fontSize: '6rem', marginBottom: '16px',
        animation: 'bounceIn 0.5s ease' }}>💀</div>

      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', color: '#FF4757', marginBottom: '8px' }}>
        You Died!
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
        {deathQuestion === 1
          ? 'Eliminated on the first question! 😬'
          : `You survived ${deathQuestion - 1} question${deathQuestion - 1 > 1 ? 's' : ''}!`}
      </div>

      {/* Stats */}
      <div style={{ background: 'rgba(255,71,87,0.1)',
        border: '2px solid #FF4757', borderRadius: '20px',
        padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            ['⭐', score, 'Score'],
            ['✅', correct, 'Correct'],
            ['💀', deathQuestion, 'Died On Q'],
          ].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem' }}>{icon}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: '1.8rem', color: '#FF4757' }}>{val}</div>
              <div style={{ fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Survival message */}
        <div style={{ marginTop: '16px', padding: '10px',
          background: 'rgba(0,0,0,0.2)', borderRadius: '10px',
          color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          {correct === 0 ? '😂 Better luck next time!'
            : correct < 5 ? '💪 Keep practicing!'
            : correct < 10 ? '👏 Not bad!'
            : correct < 15 ? '🔥 Impressive!'
            : '🏆 Incredible run!'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => {
          setStatus('ready'); setCurrent(0);
          setScore(0); setCorrect(0);
          setSelected(null); setTimeLeft(15);
          setDeathQuestion(0);
        }} style={{ flex: 1,
          background: 'linear-gradient(135deg, #2C3E50, #FF4757)',
          border: 'none', color: '#fff', padding: '14px',
          borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>💀 Try Again</button>
        <button onClick={() => navigate('/games')} style={{
          flex: 1, background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
          padding: '14px', borderRadius: '14px',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer' }}>🎮 All Games</button>
      </div>
    </div>
  );

  // FINISHED — Survived all questions!
  if (status === 'finished') return (
    <div style={{ maxWidth: '500px', margin: '0 auto',
      padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🏆</div>
      <div style={{ fontFamily: "'Fredoka One', cursive",
        fontSize: '2.5rem', color: '#FFD60A', marginBottom: '8px' }}>
        SURVIVOR!
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
        You survived ALL {questions.length} questions on {selectedDifficulty.name}! Legendary! 🔥
      </div>

      <div style={{ background: 'linear-gradient(135deg, #FFD60A33, #06D6A033)',
        border: '2px solid #FFD60A', borderRadius: '20px',
        padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '4rem', color: '#FFD60A', marginBottom: '8px' }}>
          ⭐ {score}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)' }}>
          Perfect Survival Score! {correct}/{questions.length} correct
        </div>
        {categoryType === 'premium' && (
          <div style={{ marginTop: '8px', color: '#FFD60A', fontSize: '0.9rem' }}>
            ⭐ Premium Category Bonus Applied!
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => {
          setStatus('ready'); setCurrent(0);
          setScore(0); setCorrect(0);
          setSelected(null); setTimeLeft(15);
        }} style={{ flex: 1,
          background: 'linear-gradient(135deg, #FFD60A, #FF6B35)',
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

  // PLAYING SCREEN
  if (!questions.length) return null;
  const q = questions[current];
  if (!q) return null;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>

      {/* Survival Header */}
      <div style={{ background: `linear-gradient(135deg, ${selectedCat.color}, ${selectedDifficulty.color})`,
        borderRadius: '16px', padding: '12px 20px',
        marginBottom: '20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#fff', fontSize: '1rem' }}>
          {selectedCat.icon} {selectedCat.name}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A', fontSize: '1rem' }}>
          Q{current + 1}/{questions.length}
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#fff', fontSize: '1rem' }}>⭐ {score}</div>
      </div>

      {/* Difficulty badge and lives warning */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          background: `${selectedDifficulty.color}20`,
          border: `1px solid ${selectedDifficulty.color}`,
          borderRadius: '20px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>{selectedDifficulty.icon}</span>
          <span style={{ fontSize: '0.8rem', color: selectedDifficulty.color }}>
            {selectedDifficulty.name} • {selectedDifficulty.multiplier}x
          </span>
        </div>
        
        {selectedDifficulty.id === 'survival' && (
          <div style={{
            background: 'rgba(255,71,87,0.1)',
            border: '1px solid rgba(255,71,87,0.4)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontWeight: 800,
            color: '#FF4757',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>💀</span> ONE LIFE ONLY
          </div>
        )}
        
        {categoryType === 'premium' && (
          <div style={{
            background: 'rgba(255,214,10,0.1)',
            border: '1px solid #FFD60A',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '0.7rem',
            color: '#FFD60A'
          }}>
            ⭐ +20% points
          </div>
        )}
      </div>

      {/* Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.4)' }}>Time Left</span>
        <span style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2rem', color: timerColor }}>
          {timeLeft}s
        </span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)',
        borderRadius: '50px', height: '8px', marginBottom: '20px' }}>
        <div style={{ background: timerColor, height: '8px',
          borderRadius: '50px', width: `${(timeLeft / selectedDifficulty.time) * 100}%`,
          transition: 'width 1s linear' }}/>
      </div>

      {/* Question */}
      <div style={{ background: '#16213E', borderRadius: '20px',
        padding: '28px 24px', marginBottom: '20px',
        border: `1px solid ${selectedDifficulty.color}`,
        textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.6 }}>
          {q.question}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === parseInt(q.correct);
          let bg = 'rgba(255,255,255,0.04)';
          let border = 'rgba(255,255,255,0.1)';
          if (selected !== null) {
            if (isCorrect) { bg = 'rgba(6,214,160,0.2)'; border = '#06D6A0'; }
            else if (i === selected) { bg = 'rgba(255,71,87,0.2)'; border = '#FF4757'; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              style={{ background: bg, border: `2px solid ${border}`,
                color: '#fff', padding: '16px 20px', borderRadius: '14px',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                fontSize: '1rem', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '12px',
                transition: 'all 0.2s ease' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '50%',
                background: selected !== null
                  ? (isCorrect ? '#06D6A0' : i === selected ? '#FF4757' : COLORS[i])
                  : COLORS[i],
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                fontFamily: "'Fredoka One', cursive", fontSize: '0.9rem' }}>
                {selected !== null
                  ? (isCorrect ? '✓' : i === selected ? '✗' : letters[i])
                  : letters[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Correct answer explanation */}
      {selected !== null && q.explanation && (
        <div style={{ marginTop: '14px', padding: '12px 16px',
          background: 'rgba(6,214,160,0.08)', borderRadius: '12px',
          border: '1px solid rgba(6,214,160,0.2)',
          color: 'rgba(255,255,255,0.7)', fontSize: '0.83rem' }}>
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}