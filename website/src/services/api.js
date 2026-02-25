import axios from 'axios';

const getBaseURL = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return `http://${hostname}:5000/api`;
};

const API = axios.create({
  baseURL: getBaseURL()
});

export const getCategories = () => API.get('/questions/categories');
export const generateQuestions = (category, difficulty, count) => API.get(`/questions/generate?category=${category}&difficulty=${difficulty}&count=${count}`);
export const getSavedQuestions = (category, difficulty, count, exclude = '') => API.get(`/questions/saved?category=${category}&difficulty=${difficulty}&count=${count}&exclude=${exclude}`);
export const getLeaderboard = () => API.get('/scores/leaderboard');
export const saveScore = (data) => API.post('/scores/save', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = (uid) => API.get(`/auth/profile/${uid}`);
export const updateXP = (data) => API.post('/auth/update-xp', data);
export const getHistory = (uid) => API.get(`/scores/history/${uid}`);
export const getDailyChallenge = () =>
  API.get('/questions/daily');

export const completeDailyChallenge = (data) =>
  API.post('/questions/daily-complete', data);

export const getDailyStatus = (uid) =>
  API.get(`/questions/daily-status/${uid}`);
