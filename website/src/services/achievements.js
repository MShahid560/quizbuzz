// src/services/achievements.js
import axios from 'axios';

const hostname = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const ACHIEVEMENTS = [
  // Games
  { id: 'first_game',     icon: '🎮', title: 'First Game!',
    desc: 'Play your first game',               xp: 50,  color: '#06D6A0' },
  { id: 'game_10',        icon: '🕹️', title: 'Gamer',
    desc: 'Play 10 games',                      xp: 100, color: '#7B2FFF' },
  { id: 'game_50',        icon: '🏆', title: 'Game Master',
    desc: 'Play 50 games',                      xp: 300, color: '#FFD60A' },
  { id: 'all_games',      icon: '🌟', title: 'Explorer',
    desc: 'Try all 10 quiz games',              xp: 500, color: '#FF3D9A' },

  // Scores
  { id: 'score_1000',     icon: '⭐', title: 'Star Player',
    desc: 'Score 1000 points in one game',      xp: 150, color: '#FFD60A' },
  { id: 'score_5000',     icon: '💫', title: 'Legend',
    desc: 'Score 5000 points in one game',      xp: 400, color: '#FF6B35' },

  // Streaks
  { id: 'streak_3',       icon: '🔥', title: 'On Fire',
    desc: '3 correct answers in a row',         xp: 75,  color: '#FF6B35' },
  { id: 'streak_10',      icon: '🌋', title: 'Unstoppable',
    desc: '10 correct answers in a row',        xp: 200, color: '#FF4757' },

  // Daily
  { id: 'daily_first',    icon: '📅', title: 'Daily Player',
    desc: 'Complete your first daily challenge',xp: 100, color: '#06D6A0' },
  { id: 'daily_7',        icon: '📆', title: 'Week Warrior',
    desc: '7 day streak on daily challenge',    xp: 350, color: '#00B4FF' },
  { id: 'daily_30',       icon: '🗓️', title: 'Monthly Master',
    desc: '30 day streak',                      xp: 1000,color: '#7B2FFF' },

  // Social
  { id: 'first_friend',   icon: '👫', title: 'Social Bee',
    desc: 'Add your first friend',              xp: 100, color: '#FF3D9A' },
  { id: 'first_challenge',icon: '⚔️', title: 'Challenger',
    desc: 'Challenge a friend',                 xp: 150, color: '#FF4757' },

  // Quiz
  { id: 'perfect_quiz',   icon: '💯', title: 'Perfect Score',
    desc: 'Get 100% on a quiz',                 xp: 250, color: '#06D6A0' },
  { id: 'survival_10',    icon: '💀', title: 'Survivor',
    desc: 'Survive 10 questions in Survival',   xp: 200, color: '#2C3E50' },
  { id: 'speed_ace',      icon: '⚡', title: 'Speed Ace',
    desc: 'Complete Speed Round with 80%+',     xp: 175, color: '#FFD60A' },

  // Kids
  { id: 'kids_all',       icon: '🧒', title: 'Kids Champion',
    desc: 'Play all 7 kids games',              xp: 300, color: '#FF6B35' },

  // Level
  { id: 'level_5',        icon: '🎖️', title: 'Level 5',
    desc: 'Reach level 5',                      xp: 0,   color: '#7B2FFF' },
  { id: 'level_10',       icon: '🏅', title: 'Level 10',
    desc: 'Reach level 10',                     xp: 0,   color: '#FFD60A' },
  { id: 'level_25',       icon: '👑', title: 'Level 25',
    desc: 'Reach level 25',                     xp: 0,   color: '#FF3D9A' },
];

export const checkAchievement = async (user, achievementId) => {
  if (!user?.uid) return false;
  try {
    const res = await axios.post(`${API_BASE}/achievements/unlock`, {
      userId: user.uid,
      username: user.username,
      achievementId
    });
    return res.data.unlocked || false;
  } catch (err) {
    return false;
  }
};

export const getUserAchievements = async (uid) => {
  try {
    const res = await axios.get(`${API_BASE}/achievements/${uid}`);
    return res.data.achievements || [];
  } catch (err) {
    return [];
  }
};