// src/services/recommendations.js

const STORAGE_KEY = 'quizbuzz_play_history';

// Track when user plays a game
export const trackGamePlay = (gameId, category) => {
  const history = getPlayHistory();
  const existing = history.find(h => h.gameId === gameId);
  if (existing) {
    existing.count++;
    existing.lastPlayed = Date.now();
    existing.category = category || existing.category;
  } else {
    history.push({ gameId, category: category || 'general',
      count: 1, lastPlayed: Date.now() });
  }
  // Keep only last 50 entries
  const trimmed = history
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
    .slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

export const getPlayHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

// Get favourite category based on play history
export const getFavouriteCategory = () => {
  const history = getPlayHistory();
  const catCounts = {};
  history.forEach(h => {
    catCounts[h.category] = (catCounts[h.category] || 0) + h.count;
  });
  const sorted = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
};

// Get recommended FreeToGame games based on play history
export const getRecommendedCategory = () => {
  const fav = getFavouriteCategory();
  const categoryMap = {
    'Puzzle': 'puzzle',
    'Word': 'puzzle',
    'Logic': 'puzzle',
    'Math': 'puzzle',
    'Memory': 'card',
    'Quiz': 'strategy',
    'Geography': 'strategy',
    'Typing': 'racing',
    'Hard': 'shooter',
    'Kids': null,
    'general': null
  };
  return categoryMap[fav] || null;
};

// Score-based: get games user hasn't played yet
export const getUnplayedGames = (allGameIds) => {
  const history = getPlayHistory();
  const played = new Set(history.map(h => h.gameId));
  return allGameIds.filter(id => !played.has(id));
};

// Get trending — most played this week globally
export const getTrendingGames = async (apiBase) => {
  try {
    const axios = (await import('axios')).default;
    const res = await axios.get(`${apiBase}/scores/trending-games`);
    return res.data.trending || [];
  } catch {
    return [];
  }
};