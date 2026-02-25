const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { uid, username, email } = req.body;
  try {
    const existing = await db.collection('users').doc(uid).get();
    if (existing.exists) {
      return res.json({
        success: true,
        message: 'User already exists!',
        ...existing.data()
      });
    }
    await db.collection('users').doc(uid).set({
      uid, username, email,
      xp: 0, level: 1,
      totalGames: 0, totalCorrect: 0,
      avatar: null, photo: null,
      isAdmin: email === 'admin@quizbuzz.com',
      createdAt: new Date()
    });
    res.json({ success: true, message: '🎉 Profile saved!', uid, username, email });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/profile/:uid
router.get('/profile/:uid', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'User not found!' });
    }
    res.json({ success: true, profile: doc.data() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const snapshot = await db.collection('users')
      .where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ success: false, error: 'User not found!' });
    }
    const user = snapshot.docs[0].data();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/update-xp
router.post('/update-xp', async (req, res) => {
  const { uid, correct, difficulty } = req.body;
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    const multiplier = difficulty === 'Hard' ? 2 : difficulty === 'Medium' ? 1.5 : 1;
    const xpEarned = Math.round(correct * 10 * multiplier);
    const newXP = (userData.xp || 0) + xpEarned;
    const newLevel = Math.floor(newXP / 100) + 1;
    const oldLevel = userData.level || 1;
    const leveledUp = newLevel > oldLevel;
    const newTotalGames = (userData.totalGames || 0) + 1;
    const newTotalCorrect = (userData.totalCorrect || 0) + correct;

    await db.collection('users').doc(uid).update({
      xp: newXP, level: newLevel,
      totalGames: newTotalGames,
      totalCorrect: newTotalCorrect
    });

    res.json({
      success: true, xpEarned, newXP, newLevel,
      leveledUp, oldLevel,
      totalGames: newTotalGames,
      totalCorrect: newTotalCorrect
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/update-avatar  ← THIS WAS MISSING!
router.post('/update-avatar', async (req, res) => {
  const { uid, avatar, photo } = req.body;
  console.log('🎭 Updating avatar for:', uid, '→', avatar || photo);
  try {
    await db.collection('users').doc(uid).update({
      avatar: avatar || null,
      photo: photo || null
    });
    console.log('✅ Avatar saved successfully!');
    res.json({ success: true, message: '✅ Avatar updated!' });
  } catch (err) {
    console.log('❌ Avatar error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;