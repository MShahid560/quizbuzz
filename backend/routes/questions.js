const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5000',
    'X-Title': 'Quiz Buzz App',
  }
});

const SYSTEM_PROMPT = `You are QuizBuzz AI, an expert quiz question generator.
Your ONLY job is to generate multiple choice quiz questions.
Always respond with ONLY a valid JSON array — no markdown, no backticks, no explanation.
Each question must follow this exact format:
{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}
Rules:
- Always provide exactly 4 options
- "correct" is the zero-based index (0=A, 1=B, 2=C, 3=D)
- All questions must be factually accurate
- Include a short explanation for the correct answer`;

// ==========================================
// GET /api/questions/categories
// ==========================================
router.get('/categories', async (req, res) => {
  const { db } = require('../config/firebase');
  const defaultCategories = [
    { id: 1, name: 'General Knowledge', icon: '🌍', custom: false },
    { id: 2, name: 'Science and Technology', icon: '🔬', custom: false },
    { id: 3, name: 'Sports', icon: '⚽', custom: false },
    { id: 4, name: 'History', icon: '📜', custom: false },
    { id: 5, name: 'Geography', icon: '🗺️', custom: false },
    { id: 6, name: 'Movies and Entertainment', icon: '🎬', custom: false },
    { id: 7, name: 'Islamic Religion and Culture', icon: '🕌', custom: false },
    { id: 8, name: 'Math and Logic', icon: '🧮', custom: false },
    { id: 9, name: 'Books and Student Knowledge', icon: '📚', custom: false },
  ];
  try {
    const snapshot = await db.collection('categories').get();
    const customCategories = snapshot.docs.map((doc, i) => ({
      id: 100 + i, name: doc.data().name,
      icon: doc.data().icon || '📝', custom: true, docId: doc.id
    }));
    res.json({ success: true, categories: [...defaultCategories, ...customCategories] });
  } catch (err) {
    res.json({ success: true, categories: defaultCategories });
  }
});

// ==========================================
// POST /api/questions/add-category
// ==========================================
router.post('/add-category', async (req, res) => {
  const { name, icon } = req.body;
  const { db } = require('../config/firebase');
  if (!name) return res.status(400).json({ success: false, error: 'Category name is required!' });
  try {
    const ref = await db.collection('categories').add({
      name, icon: icon || '📝', createdAt: new Date()
    });
    res.json({ success: true, message: `✅ Category "${name}" added!`, id: ref.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// DELETE /api/questions/delete-category/:id
// ==========================================
router.delete('/delete-category/:id', async (req, res) => {
  const { db } = require('../config/firebase');
  try {
    await db.collection('categories').doc(req.params.id).delete();
    res.json({ success: true, message: '✅ Category deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// GET /api/questions/saved
// ==========================================
router.get('/saved', async (req, res) => {
  const { category = 'General Knowledge', difficulty = 'Easy', count = 10, exclude = '' } = req.query;
  const { db } = require('../config/firebase');
  try {
    const snapshot = await db.collection('questions')
      .where('category', '==', category).get();
    if (snapshot.empty) {
      return res.json({ success: false, count: 0, questions: [],
        message: 'No saved questions yet! Try AI Quiz instead.' });
    }
    let allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const excludeIds = exclude ? exclude.split(',').filter(Boolean) : [];
    if (excludeIds.length > 0) {
      const filtered = allDocs.filter(q => !excludeIds.includes(q.id));
      if (filtered.length >= parseInt(count)) allDocs = filtered;
    }
    const shuffled = allDocs.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, parseInt(count));
    res.json({ success: true, category, count: questions.length,
      source: 'firebase', questionIds: questions.map(q => q.id), questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// GET /api/questions/generate
// ==========================================
router.get('/generate', async (req, res) => {
  const { category = 'General Knowledge', difficulty = 'Easy', count = 10 } = req.query;
  const { db } = require('../config/firebase');
  try {
    const snapshot = await db.collection('questions')
      .where('category', '==', category).get();
    const existingQuestions = snapshot.docs.map(doc => doc.data().question);
    const existingList = existingQuestions.length > 0
      ? `\n\nDo NOT repeat these existing questions:\n${existingQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}`
      : '';
    console.log(`🤖 Generating ${count} NEW questions for "${category}"...`);
    console.log(`📋 ${existingQuestions.length} existing questions to avoid`);
    const completion = await client.chat.completions.create({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate exactly ${count} NEW multiple choice quiz questions about "${category}". Difficulty: ${difficulty}. Return ONLY a JSON array.${existingList}` }
      ],
      temperature: 0.9, max_tokens: 2048,
    });
    const raw = completion.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    let questions = JSON.parse(cleaned);
    const existingSet = new Set(existingQuestions.map(q => q.toLowerCase().trim()));
    questions = questions.filter(q => !existingSet.has(q.question.toLowerCase().trim()));
    if (questions.length === 0) {
      return res.json({ success: false, message: 'All questions already exist!' });
    }
    const batch = db.batch();
    questions.forEach(q => {
      const ref = db.collection('questions').doc();
      batch.set(ref, { ...q, category, difficulty, createdAt: new Date(), source: 'ai' });
    });
    await batch.commit();
    console.log(`💾 Saved ${questions.length} new unique questions!`);
    res.json({ success: true, category, difficulty, count: questions.length, source: 'ai', questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// POST /api/questions/save
// ==========================================
router.post('/save', async (req, res) => {
  const { category, questions } = req.body;
  const { db } = require('../config/firebase');
  try {
    const batch = db.batch();
    questions.forEach(q => {
      const ref = db.collection('questions').doc();
      batch.set(ref, { ...q, category, createdAt: new Date(), source: 'admin' });
    });
    await batch.commit();
    res.json({ success: true, message: `✅ ${questions.length} questions saved!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// GET /api/questions/daily-status/:uid
// ==========================================
router.get('/daily-status/:uid', async (req, res) => {
  const { db } = require('../config/firebase');
  try {
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await db.collection('dailyCompletions')
      .where('uid', '==', req.params.uid)
      .where('date', '==', today)
      .get();
    const userDoc = await db.collection('users').doc(req.params.uid).get();
    const userData = userDoc.data() || {};
    res.json({
      success: true,
      completed: !snapshot.empty,
      streak: userData.dailyStreak || 0,
      lastDailyDate: userData.lastDailyDate || null
    });
  } catch (err) {
    console.log('❌ Daily status error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// GET /api/questions/daily
// ==========================================
router.get('/daily', async (req, res) => {
  const { db } = require('../config/firebase');
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyDoc = await db.collection('dailyChallenges').doc(today).get();
    if (dailyDoc.exists) {
      return res.json({
        success: true, date: today,
        questions: dailyDoc.data().questions,
        category: dailyDoc.data().category,
        source: 'saved'
      });
    }
    const categories = [
      'General Knowledge', 'Science and Technology', 'Sports', 'History',
      'Geography', 'Movies and Entertainment', 'Islamic Religion and Culture',
      'Math and Logic', 'Books and Student Knowledge'
    ];
    const dayIndex = new Date().getDay();
    const category = categories[dayIndex % categories.length];
    console.log(`🎯 Generating daily challenge for: ${category}`);
    const snapshot = await db.collection('questions')
      .where('category', '==', category).get();
    let questions = [];
    if (!snapshot.empty) {
      questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      questions = questions.sort(() => Math.random() - 0.5).slice(0, 10);
      console.log(`✅ Using ${questions.length} saved questions`);
    }
    if (questions.length < 5) {
      console.log(`🤖 Not enough saved questions, using AI...`);
      try {
        const completion = await client.chat.completions.create({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Generate exactly 10 multiple choice quiz questions about "${category}". Difficulty: Medium. Return ONLY a JSON array.` }
          ],
          temperature: 0.8, max_tokens: 2048,
        });
        const raw = completion.choices[0].message.content;
        const cleaned = raw.replace(/```json|```/g, '').trim();
        questions = JSON.parse(cleaned);
        console.log(`✅ AI generated ${questions.length} questions`);
      } catch (aiErr) {
        console.log('❌ AI failed:', aiErr.message);
        return res.status(500).json({ success: false, error: 'Could not generate daily challenge!' });
      }
    }
    await db.collection('dailyChallenges').doc(today).set({
      date: today, category, questions, createdAt: new Date()
    });
    console.log(`💾 Daily challenge saved for ${today}`);
    res.json({ success: true, date: today, category, questions, source: 'generated' });
  } catch (err) {
    console.log('❌ Daily challenge error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// POST /api/questions/daily-complete
// ==========================================
router.post('/daily-complete', async (req, res) => {
  const { uid, score, correct, wrong } = req.body;
  const { db } = require('../config/firebase');
  try {
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.collection('dailyCompletions')
      .where('uid', '==', uid).where('date', '==', today).get();
    if (!existing.empty) {
      return res.json({ success: false, message: 'Already completed today!' });
    }
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};
    const lastDaily = userData.lastDailyDate || '';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    let newStreak = 1;
    if (lastDaily === yesterdayStr) {
      newStreak = (userData.dailyStreak || 0) + 1;
    }
    const bonusXP = 50 + (newStreak * 10);
    const newXP = (userData.xp || 0) + bonusXP;
    const newLevel = Math.floor(newXP / 100) + 1;
    await db.collection('dailyCompletions').add({
      uid, date: today, score, correct, wrong,
      streak: newStreak, bonusXP, completedAt: new Date()
    });
    await db.collection('users').doc(uid).update({
      dailyStreak: newStreak, lastDailyDate: today,
      xp: newXP, level: newLevel
    });
    res.json({ success: true, bonusXP, newStreak, newXP, newLevel,
      message: `🔥 ${newStreak} day streak!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;