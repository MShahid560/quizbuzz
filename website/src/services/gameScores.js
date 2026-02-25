import axios from 'axios';

const hostname = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const saveGameScore = async (user, game, score) => {
  if (!user?.uid || !score) return;
  try {
    console.log('💾 Saving game score:', game, score);
    await axios.post(`${API_BASE}/scores/save-game`, {
      userId: user.uid,
      username: user.username,
      avatar: user.avatar || null,
      photo: user.photo || null,
      game,
      score: Math.round(score),
      playedAt: new Date()
    });
    console.log('✅ Game score saved!');
  } catch (err) {
    console.error('❌ Failed to save game score:', err.message);
  }
};