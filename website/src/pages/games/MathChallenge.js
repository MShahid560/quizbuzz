import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '../../services/sounds';
import { useAuth } from '../../context/AuthContext';
import { saveGameScore } from '../../services/gameScores';

// Category definitions
const CATEGORIES = {
  PATTERNS: 'patterns',
  ALGEBRA: 'algebra',
  ADDITION: 'addition',
  SUBTRACTION: 'subtraction',
  MULTIPLICATION: 'multiplication',
  DIVISION: 'division',
  BODMAS: 'bodmas',
  RANDOM: 'random'
};

const DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Predefined question banks (100+ questions per category)
const QUESTION_BANKS = {
  patterns: {
    easy: [
      { question: "What's the next number? 2, 4, 6, 8, ?", answer: 10 },
      { question: "Complete the pattern: 5, 10, 15, 20, ?", answer: 25 },
      { question: "Next number: 1, 3, 5, 7, ?", answer: 9 },
      { question: "Find the next: 10, 20, 30, 40, ?", answer: 50 },
      { question: "Pattern: 3, 6, 9, 12, ?", answer: 15 },
      { question: "What comes next? 7, 14, 21, 28, ?", answer: 35 },
      { question: "Complete: 4, 8, 12, 16, ?", answer: 20 },
      { question: "Next in sequence: 6, 12, 18, 24, ?", answer: 30 },
      { question: "Pattern: 9, 18, 27, 36, ?", answer: 45 },
      { question: "Find the next: 11, 22, 33, 44, ?", answer: 55 },
      { question: "Sequence: 2, 4, 8, 16, ?", answer: 32 },
      { question: "What's next? 1, 4, 9, 16, ?", answer: 25 },
      { question: "Pattern: 3, 9, 27, ?", answer: 81 },
      { question: "Complete: 5, 25, 125, ?", answer: 625 },
      { question: "Next: 2, 6, 18, 54, ?", answer: 162 },
      { question: "Sequence: 10, 9, 8, 7, ?", answer: 6 },
      { question: "Pattern: 20, 18, 16, 14, ?", answer: 12 },
      { question: "Find next: 30, 27, 24, 21, ?", answer: 18 },
      { question: "What's next? 50, 45, 40, 35, ?", answer: 30 },
      { question: "Complete: 100, 90, 80, 70, ?", answer: 60 }
    ],
    medium: [
      { question: "Pattern: 2, 5, 2, 5, 2, ?", answer: 5 },
      { question: "Sequence: 3, 6, 12, 24, ?", answer: 48 },
      { question: "Find next: 100, 90, 80, 70, ?", answer: 60 },
      { question: "What's next? 1, 4, 9, 16, 25, ?", answer: 36 },
      { question: "Pattern: 2, 4, 8, 16, 32, ?", answer: 64 },
      { question: "Complete: 5, 7, 10, 14, 19, ?", answer: 25 },
      { question: "Next: 3, 8, 15, 24, 35, ?", answer: 48 },
      { question: "Sequence: 1, 1, 2, 3, 5, 8, ?", answer: 13 },
      { question: "Pattern: 2, 3, 5, 7, 11, ?", answer: 13 },
      { question: "Find next: 4, 9, 16, 25, 36, ?", answer: 49 }
    ],
    hard: [
      { question: "Complete the pattern: 2, 6, 12, 20, 30, ?", answer: 42 },
      { question: "Next in sequence: 3, 8, 15, 24, 35, ?", answer: 48 },
      { question: "Pattern: 1, 4, 10, 22, 46, ?", answer: 94 },
      { question: "Find next: 5, 14, 41, 122, ?", answer: 365 },
      { question: "Sequence: 7, 26, 63, 124, ?", answer: 215 },
      { question: "What's next? 2, 12, 36, 80, ?", answer: 150 },
      { question: "Pattern: 4, 18, 48, 100, ?", answer: 180 },
      { question: "Complete: 6, 24, 60, 120, ?", answer: 210 },
      { question: "Next: 8, 40, 120, 280, ?", answer: 560 },
      { question: "Sequence: 9, 54, 162, 324, ?", answer: 486 }
    ]
  },
  
  algebra: {
    easy: [
      { question: "If x + 5 = 12, what is x?", answer: 7 },
      { question: "Solve: x - 3 = 7", answer: 10 },
      { question: "Find x: 2x = 14", answer: 7 },
      { question: "If x + 8 = 15, find x", answer: 7 },
      { question: "Solve: x - 4 = 9", answer: 13 },
      { question: "Find x: 3x = 21", answer: 7 },
      { question: "If x + 12 = 20, what is x?", answer: 8 },
      { question: "Solve: x - 7 = 8", answer: 15 },
      { question: "Find x: 4x = 32", answer: 8 },
      { question: "If x + 15 = 25, find x", answer: 10 },
      { question: "Solve: x - 9 = 11", answer: 20 },
      { question: "Find x: 5x = 45", answer: 9 },
      { question: "If x + 6 = 18, what is x?", answer: 12 },
      { question: "Solve: x - 2 = 14", answer: 16 },
      { question: "Find x: 6x = 54", answer: 9 },
      { question: "If x + 14 = 23, find x", answer: 9 },
      { question: "Solve: x - 5 = 12", answer: 17 },
      { question: "Find x: 7x = 63", answer: 9 },
      { question: "If x + 9 = 21, what is x?", answer: 12 },
      { question: "Solve: x - 8 = 13", answer: 21 }
    ],
    medium: [
      { question: "Solve: 2x + 3 = 15", answer: 6 },
      { question: "Find x: 3x - 5 = 16", answer: 7 },
      { question: "If 4x + 7 = 31, what is x?", answer: 6 },
      { question: "Solve: 5x - 8 = 27", answer: 7 },
      { question: "Find x: 2x + 9 = 25", answer: 8 },
      { question: "If 3x + 4 = 22, find x", answer: 6 },
      { question: "Solve: 4x - 6 = 26", answer: 8 },
      { question: "Find x: 5x + 3 = 38", answer: 7 },
      { question: "If 2x - 7 = 15, what is x?", answer: 11 },
      { question: "Solve: 3x + 8 = 29", answer: 7 }
    ],
    hard: [
      { question: "Solve: 2(x + 3) = 18", answer: 6 },
      { question: "Find x: 3(2x - 4) = 30", answer: 7 },
      { question: "If 4(3x + 2) = 56, what is x?", answer: 4 },
      { question: "Solve: 5(2x - 1) = 45", answer: 5 },
      { question: "Find x: 2(3x + 4) = 38", answer: 5 },
      { question: "If 3(4x - 2) = 54, find x", answer: 5 },
      { question: "Solve: 4(2x + 5) = 52", answer: 4 },
      { question: "Find x: 5(3x - 2) = 65", answer: 5 },
      { question: "If 2(5x + 3) = 46, what is x?", answer: 4 },
      { question: "Solve: 3(4x + 1) = 51", answer: 4 }
    ]
  },

  addition: {
    easy: [
      { question: "5 + 3 = ?", answer: 8 },
      { question: "7 + 4 = ?", answer: 11 },
      { question: "12 + 8 = ?", answer: 20 },
      { question: "15 + 6 = ?", answer: 21 },
      { question: "23 + 7 = ?", answer: 30 },
      { question: "14 + 9 = ?", answer: 23 },
      { question: "18 + 5 = ?", answer: 23 },
      { question: "21 + 8 = ?", answer: 29 },
      { question: "16 + 7 = ?", answer: 23 },
      { question: "25 + 4 = ?", answer: 29 },
      { question: "32 + 8 = ?", answer: 40 },
      { question: "27 + 6 = ?", answer: 33 },
      { question: "19 + 11 = ?", answer: 30 },
      { question: "24 + 9 = ?", answer: 33 },
      { question: "31 + 7 = ?", answer: 38 },
      { question: "28 + 12 = ?", answer: 40 },
      { question: "33 + 8 = ?", answer: 41 },
      { question: "26 + 14 = ?", answer: 40 },
      { question: "37 + 5 = ?", answer: 42 },
      { question: "29 + 13 = ?", answer: 42 }
    ],
    medium: [
      { question: "45 + 38 = ?", answer: 83 },
      { question: "57 + 46 = ?", answer: 103 },
      { question: "63 + 59 = ?", answer: 122 },
      { question: "74 + 48 = ?", answer: 122 },
      { question: "86 + 57 = ?", answer: 143 },
      { question: "92 + 68 = ?", answer: 160 },
      { question: "105 + 87 = ?", answer: 192 },
      { question: "114 + 76 = ?", answer: 190 },
      { question: "123 + 98 = ?", answer: 221 },
      { question: "135 + 86 = ?", answer: 221 }
    ],
    hard: [
      { question: "156 + 243 = ?", answer: 399 },
      { question: "278 + 195 = ?", answer: 473 },
      { question: "367 + 284 = ?", answer: 651 },
      { question: "425 + 378 = ?", answer: 803 },
      { question: "512 + 499 = ?", answer: 1011 },
      { question: "634 + 527 = ?", answer: 1161 },
      { question: "743 + 658 = ?", answer: 1401 },
      { question: "825 + 746 = ?", answer: 1571 },
      { question: "934 + 827 = ?", answer: 1761 },
      { question: "1056 + 984 = ?", answer: 2040 }
    ]
  },

  subtraction: {
    easy: [
      { question: "9 - 4 = ?", answer: 5 },
      { question: "15 - 7 = ?", answer: 8 },
      { question: "20 - 8 = ?", answer: 12 },
      { question: "18 - 9 = ?", answer: 9 },
      { question: "25 - 6 = ?", answer: 19 },
      { question: "30 - 12 = ?", answer: 18 },
      { question: "22 - 7 = ?", answer: 15 },
      { question: "28 - 14 = ?", answer: 14 },
      { question: "33 - 8 = ?", answer: 25 },
      { question: "40 - 15 = ?", answer: 25 },
      { question: "27 - 9 = ?", answer: 18 },
      { question: "35 - 18 = ?", answer: 17 },
      { question: "42 - 7 = ?", answer: 35 },
      { question: "38 - 19 = ?", answer: 19 },
      { question: "45 - 27 = ?", answer: 18 },
      { question: "50 - 23 = ?", answer: 27 },
      { question: "29 - 14 = ?", answer: 15 },
      { question: "48 - 29 = ?", answer: 19 },
      { question: "55 - 37 = ?", answer: 18 },
      { question: "60 - 42 = ?", answer: 18 }
    ],
    medium: [
      { question: "83 - 47 = ?", answer: 36 },
      { question: "95 - 58 = ?", answer: 37 },
      { question: "102 - 67 = ?", answer: 35 },
      { question: "114 - 85 = ?", answer: 29 },
      { question: "126 - 78 = ?", answer: 48 },
      { question: "137 - 89 = ?", answer: 48 },
      { question: "145 - 97 = ?", answer: 48 },
      { question: "158 - 106 = ?", answer: 52 },
      { question: "163 - 124 = ?", answer: 39 },
      { question: "175 - 138 = ?", answer: 37 }
    ],
    hard: [
      { question: "324 - 187 = ?", answer: 137 },
      { question: "456 - 289 = ?", answer: 167 },
      { question: "512 - 347 = ?", answer: 165 },
      { question: "634 - 478 = ?", answer: 156 },
      { question: "745 - 568 = ?", answer: 177 },
      { question: "823 - 697 = ?", answer: 126 },
      { question: "934 - 788 = ?", answer: 146 },
      { question: "1056 - 879 = ?", answer: 177 },
      { question: "1145 - 968 = ?", answer: 177 },
      { question: "1234 - 987 = ?", answer: 247 }
    ]
  },

  multiplication: {
    easy: [
      { question: "3 × 4 = ?", answer: 12 },
      { question: "5 × 6 = ?", answer: 30 },
      { question: "7 × 3 = ?", answer: 21 },
      { question: "8 × 4 = ?", answer: 32 },
      { question: "9 × 5 = ?", answer: 45 },
      { question: "6 × 7 = ?", answer: 42 },
      { question: "4 × 8 = ?", answer: 32 },
      { question: "7 × 7 = ?", answer: 49 },
      { question: "8 × 8 = ?", answer: 64 },
      { question: "9 × 9 = ?", answer: 81 },
      { question: "5 × 8 = ?", answer: 40 },
      { question: "6 × 9 = ?", answer: 54 },
      { question: "4 × 7 = ?", answer: 28 },
      { question: "3 × 9 = ?", answer: 27 },
      { question: "8 × 6 = ?", answer: 48 },
      { question: "7 × 5 = ?", answer: 35 },
      { question: "9 × 7 = ?", answer: 63 },
      { question: "6 × 8 = ?", answer: 48 },
      { question: "5 × 9 = ?", answer: 45 },
      { question: "8 × 7 = ?", answer: 56 }
    ],
    medium: [
      { question: "12 × 8 = ?", answer: 96 },
      { question: "15 × 7 = ?", answer: 105 },
      { question: "18 × 6 = ?", answer: 108 },
      { question: "14 × 9 = ?", answer: 126 },
      { question: "17 × 8 = ?", answer: 136 },
      { question: "19 × 7 = ?", answer: 133 },
      { question: "23 × 6 = ?", answer: 138 },
      { question: "25 × 8 = ?", answer: 200 },
      { question: "28 × 7 = ?", answer: 196 },
      { question: "32 × 9 = ?", answer: 288 }
    ],
    hard: [
      { question: "23 × 17 = ?", answer: 391 },
      { question: "34 × 26 = ?", answer: 884 },
      { question: "45 × 38 = ?", answer: 1710 },
      { question: "52 × 47 = ?", answer: 2444 },
      { question: "63 × 54 = ?", answer: 3402 },
      { question: "74 × 63 = ?", answer: 4662 },
      { question: "85 × 72 = ?", answer: 6120 },
      { question: "96 × 81 = ?", answer: 7776 },
      { question: "107 × 93 = ?", answer: 9951 },
      { question: "118 × 104 = ?", answer: 12272 }
    ]
  },

  division: {
    easy: [
      { question: "12 ÷ 3 = ?", answer: 4 },
      { question: "20 ÷ 4 = ?", answer: 5 },
      { question: "30 ÷ 5 = ?", answer: 6 },
      { question: "42 ÷ 6 = ?", answer: 7 },
      { question: "56 ÷ 7 = ?", answer: 8 },
      { question: "72 ÷ 8 = ?", answer: 9 },
      { question: "81 ÷ 9 = ?", answer: 9 },
      { question: "24 ÷ 4 = ?", answer: 6 },
      { question: "35 ÷ 5 = ?", answer: 7 },
      { question: "48 ÷ 6 = ?", answer: 8 },
      { question: "63 ÷ 7 = ?", answer: 9 },
      { question: "32 ÷ 4 = ?", answer: 8 },
      { question: "45 ÷ 5 = ?", answer: 9 },
      { question: "54 ÷ 6 = ?", answer: 9 },
      { question: "28 ÷ 4 = ?", answer: 7 },
      { question: "36 ÷ 6 = ?", answer: 6 },
      { question: "49 ÷ 7 = ?", answer: 7 },
      { question: "64 ÷ 8 = ?", answer: 8 },
      { question: "25 ÷ 5 = ?", answer: 5 },
      { question: "18 ÷ 3 = ?", answer: 6 }
    ],
    medium: [
      { question: "96 ÷ 8 = ?", answer: 12 },
      { question: "108 ÷ 9 = ?", answer: 12 },
      { question: "120 ÷ 12 = ?", answer: 10 },
      { question: "132 ÷ 11 = ?", answer: 12 },
      { question: "144 ÷ 12 = ?", answer: 12 },
      { question: "156 ÷ 13 = ?", answer: 12 },
      { question: "168 ÷ 14 = ?", answer: 12 },
      { question: "180 ÷ 15 = ?", answer: 12 },
      { question: "192 ÷ 16 = ?", answer: 12 },
      { question: "200 ÷ 20 = ?", answer: 10 }
    ],
    hard: [
      { question: "234 ÷ 13 = ?", answer: 18 },
      { question: "342 ÷ 18 = ?", answer: 19 },
      { question: "456 ÷ 24 = ?", answer: 19 },
      { question: "525 ÷ 25 = ?", answer: 21 },
      { question: "648 ÷ 27 = ?", answer: 24 },
      { question: "756 ÷ 28 = ?", answer: 27 },
      { question: "864 ÷ 32 = ?", answer: 27 },
      { question: "975 ÷ 39 = ?", answer: 25 },
      { question: "1056 ÷ 33 = ?", answer: 32 },
      { question: "1152 ÷ 48 = ?", answer: 24 }
    ]
  },

  bodmas: {
    easy: [
      { question: "3 + 4 × 2 = ?", answer: 11 },
      { question: "10 - 2 × 3 = ?", answer: 4 },
      { question: "5 × 2 + 6 = ?", answer: 16 },
      { question: "8 + 6 ÷ 2 = ?", answer: 11 },
      { question: "12 ÷ 3 × 2 = ?", answer: 8 },
      { question: "7 - 2 × 2 = ?", answer: 3 },
      { question: "4 × 3 - 5 = ?", answer: 7 },
      { question: "9 + 8 ÷ 4 = ?", answer: 11 },
      { question: "15 ÷ 5 + 3 = ?", answer: 6 },
      { question: "6 × 2 - 4 = ?", answer: 8 },
      { question: "20 - 4 × 3 = ?", answer: 8 },
      { question: "14 + 6 ÷ 2 = ?", answer: 17 },
      { question: "18 ÷ 3 × 3 = ?", answer: 18 },
      { question: "5 × 4 - 6 = ?", answer: 14 },
      { question: "12 + 8 ÷ 4 = ?", answer: 14 },
      { question: "24 ÷ 6 × 2 = ?", answer: 8 },
      { question: "9 × 2 - 7 = ?", answer: 11 },
      { question: "16 + 4 ÷ 2 = ?", answer: 18 },
      { question: "30 ÷ 5 × 3 = ?", answer: 18 },
      { question: "7 × 3 - 8 = ?", answer: 13 }
    ],
    medium: [
      { question: "(4 + 3) × 2 = ?", answer: 14 },
      { question: "8 × (5 - 2) = ?", answer: 24 },
      { question: "(12 + 4) ÷ 2 = ?", answer: 8 },
      { question: "15 ÷ (3 + 2) = ?", answer: 3 },
      { question: "(7 - 2) × 4 = ?", answer: 20 },
      { question: "24 ÷ (4 × 2) = ?", answer: 3 },
      { question: "(9 + 3) × 2 - 4 = ?", answer: 20 },
      { question: "16 ÷ 4 + 3 × 2 = ?", answer: 10 },
      { question: "(8 + 4) ÷ 3 × 2 = ?", answer: 8 },
      { question: "25 - (4 × 3) + 2 = ?", answer: 15 }
    ],
    hard: [
      { question: "8 × (4 + 3) - 12 ÷ 3 = ?", answer: 52 },
      { question: "(15 + 5) ÷ 4 × 3 + 2 = ?", answer: 17 },
      { question: "24 ÷ 3 × 2 + (8 - 4) = ?", answer: 20 },
      { question: "(9 × 3) - (16 ÷ 4) + 5 = ?", answer: 28 },
      { question: "7 × (8 - 3) + 18 ÷ 6 = ?", answer: 38 },
      { question: "(12 + 8) ÷ 5 × 4 - 3 = ?", answer: 13 },
      { question: "45 ÷ 9 × 3 + (6 × 2) = ?", answer: 27 },
      { question: "(8 × 7) - (36 ÷ 6) + 4 = ?", answer: 54 },
      { question: "15 × 2 - (24 ÷ 3) + 7 = ?", answer: 29 },
      { question: "(10 + 5) × 3 - 45 ÷ 9 = ?", answer: 40 }
    ]
  }
};

// Helper function to get random question from bank
const getRandomQuestion = (difficulty, category) => {
  const bank = QUESTION_BANKS[category]?.[difficulty] || QUESTION_BANKS.addition.easy;
  const randomIndex = Math.floor(Math.random() * bank.length);
  return { ...bank[randomIndex] }; // Create a copy to avoid reference issues
};

// Generate question based on category and difficulty
const generateQuestion = (difficulty, category) => {
  if (category === CATEGORIES.RANDOM) {
    // For random, pick any category except random itself
    const categories = Object.values(CATEGORIES).filter(c => c !== CATEGORIES.RANDOM);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return getRandomQuestion(difficulty, randomCategory);
  }
  return getRandomQuestion(difficulty, category);
};

// Helper function to create question object with options
const createQuestionObject = (question, answer) => {
  // Generate wrong options
  const wrong = new Set();
  while (wrong.size < 3) {
    const offset = Math.floor(Math.random() * 11) - 5; // -5 to +5
    const w = answer + offset;
    // Ensure wrong answer is positive and not equal to correct answer
    if (w !== answer && w > 0 && w < 10000) wrong.add(w);
  }

  // If we couldn't generate enough wrong options, add some defaults
  while (wrong.size < 3) {
    const defaultWrong = answer + wrong.size + 1;
    if (defaultWrong !== answer && defaultWrong > 0) wrong.add(defaultWrong);
  }

  const options = [...wrong, answer]
    .sort(() => Math.random() - 0.5);
  const correctIdx = options.indexOf(answer);

  return { question, answer, options, correctIdx };
};

export default function MathChallenge() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Moved inside the component
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.EASY);
  const [category, setCategory] = useState(CATEGORIES.ADDITION);
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('playing');
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const TOTAL = 10;

  const nextRound = useCallback(() => {
    if (round >= TOTAL) {
      setStatus('finished');
      playSound('complete');
    } else {
      setRound(r => r + 1);
      const newQuestion = generateQuestion(difficulty, category);
      const questionObj = createQuestionObject(newQuestion.question, newQuestion.answer);
      setCurrentQuestion(questionObj);
      setSelected(null);
      setTimeLeft(10);
      setFeedback('');
    }
  }, [round, difficulty, category, TOTAL]);

  useEffect(() => {
    if (status !== 'playing' || selected !== null || !currentQuestion) return;
    
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setFeedback('⏰ Too slow!');
          setStreak(0);
          setSelected(-1);
          playSound('wrong');
          setTimeout(nextRound, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(t);
  }, [status, selected, nextRound, currentQuestion]);

  const handleAnswer = (idx) => {
    if (selected !== null || !currentQuestion) return;
    
    setSelected(idx);
    
    if (idx === currentQuestion.correctIdx) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const pts = Math.round((timeLeft * 10) + (newStreak > 2 ? 50 : 0));
      setScore(s => s + pts);
      setFeedback(newStreak >= 3
        ? `🔥 ${newStreak}x Streak! +${pts}`
        : `✅ Correct! +${pts}`);
      playSound('correct');
    } else {
      setStreak(0);
      setFeedback(`❌ Wrong! Answer: ${currentQuestion.answer}`);
      playSound('wrong');
    }
    
    setTimeout(nextRound, 1200);
  };

  const startGame = () => {
    setGameStarted(true);
    const newQuestion = generateQuestion(difficulty, category);
    const questionObj = createQuestionObject(newQuestion.question, newQuestion.answer);
    setCurrentQuestion(questionObj);
    setRound(1);
    setScore(0);
    setTimeLeft(10);
    setSelected(null);
    setStatus('playing');
    setStreak(0);
    setFeedback('');
  };

  const timerColor = timeLeft <= 3 ? '#FF4757'
    : timeLeft <= 6 ? '#FFD60A' : '#06D6A0';

  // Category Selection Screen
  if (!gameStarted) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
        <button onClick={() => navigate('/games')} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
          marginBottom: '20px'
        }}>← Back to Games</button>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🧮</div>
          <div style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: '2.5rem', marginBottom: '8px' }}>Math Challenge</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Choose your difficulty and category
          </p>
        </div>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontFamily: "'Fredoka One', cursive",
            marginBottom: '15px', color: '#FFD60A' }}>Select Difficulty</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {Object.values(DIFFICULTIES).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  flex: 1,
                  padding: '15px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: difficulty === d ? '#FFD60A' : 'rgba(255,255,255,0.1)',
                  background: difficulty === d ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.05)',
                  color: difficulty === d ? '#FFD60A' : '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontFamily: "'Fredoka One', cursive",
            marginBottom: '15px', color: '#FFD60A' }}>Select Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '10px' }}>
            {Object.values(CATEGORIES).map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: category === c ? '#FFD60A' : 'rgba(255,255,255,0.1)',
                  background: category === c ? 'rgba(255,214,10,0.1)' : 'rgba(255,255,255,0.05)',
                  color: category === c ? '#FFD60A' : '#fff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {c === 'bodmas' ? 'BODMAS' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startGame}
          style={{
            width: '100%',
            padding: '20px',
            background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
            border: 'none',
            borderRadius: '16px',
            color: '#0D0D1A',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.5rem',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🚀 Start Challenge
        </button>
      </div>
    );
  }

  // Game Finished Screen
  if (status === 'finished') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto',
        padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🧮</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '2.5rem', marginBottom: '8px' }}>{category} Master!</div>
        <div style={{ fontSize: '1rem', color: '#FFD60A', marginBottom: '8px',
          textTransform: 'capitalize' }}>{difficulty} Mode</div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '3.5rem', color: '#FFD60A',
          marginBottom: '24px' }}>⭐ {score}</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => {
            setGameStarted(false);
            setRound(1);
            setScore(0);
            setStatus('playing');
          }} style={{ flex: 1,
            background: 'linear-gradient(135deg, #FF6B35, #FFD60A)',
            border: 'none', color: '#0D0D1A', padding: '14px',
            borderRadius: '14px', fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', cursor: 'pointer' }}>🔄 New Game</button>
          <button onClick={() => navigate('/games')} style={{
            flex: 1, background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            padding: '14px', borderRadius: '14px',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1rem', cursor: 'pointer' }}>🎮 All Games</button>
        </div>
      </div>
    );
  }

  // Game Play Screen
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => setGameStarted(false)} style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>← Change</button>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: '1.5rem' }}>
          <span style={{ color: '#FFD60A', marginRight: '8px' }}>
            {category === 'bodmas' ? 'BODMAS' : category}
          </span>
          <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>
            ({difficulty})
          </span>
        </div>
        <div style={{ fontFamily: "'Fredoka One', cursive",
          color: '#FFD60A' }}>⭐ {score}</div>
      </div>

      {currentQuestion && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
              Round {round}/{TOTAL}
              {streak >= 2 && (
                <span style={{ marginLeft: '8px', color: '#FF6B35',
                  fontWeight: 800 }}>🔥 {streak}x</span>
              )}
            </span>
            <span style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: '2rem', color: timerColor }}>{timeLeft}s</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)',
            borderRadius: '50px', height: '6px', marginBottom: '28px' }}>
            <div style={{ background: timerColor, height: '6px',
              borderRadius: '50px', width: `${(timeLeft / 10) * 100}%`,
              transition: 'width 1s linear' }}/>
          </div>

          <div style={{ background: '#16213E', borderRadius: '20px',
            padding: '40px', textAlign: 'center', marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: difficulty === DIFFICULTIES.HARD ? '2rem' : '3rem',
              color: '#FFD60A' }}>
              {currentQuestion.question}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '12px' }}>
            {currentQuestion.options.map((opt, i) => {
              let bg = 'rgba(255,255,255,0.06)';
              let border = 'rgba(255,255,255,0.1)';
              if (selected !== null) {
                if (i === currentQuestion.correctIdx) {
                  bg = 'rgba(6,214,160,0.2)'; border = '#06D6A0';
                } else if (i === selected) {
                  bg = 'rgba(255,71,87,0.2)'; border = '#FF4757';
                }
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  style={{ background: bg, border: `2px solid ${border}`,
                    color: '#fff', padding: '20px', borderRadius: '14px',
                    fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem',
                    cursor: selected !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s' }}>
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div style={{ textAlign: 'center', marginTop: '16px',
              fontWeight: 800, fontSize: '1rem',
              color: feedback.includes('✅') || feedback.includes('🔥')
                ? '#06D6A0' : '#FF4757' }}>
              {feedback}
            </div>
          )}
        </>
      )}
    </div>
  );
}