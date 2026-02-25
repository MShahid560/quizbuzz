const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.post('/submit', async (req, res) => {
  const { gameId, gameName, userId, username, stars, review } = req.body;
  try {
    const existing = await db.collection('gameRatings')
      .where('gameId', '==', gameId)
      .where('userId', '==', userId).get();
    if (!existing.empty) {
      await existing.docs[0].ref.update({
        stars, review: review || null, updatedAt: new Date()
      });
    } else {
      await db.collection('gameRatings').add({
        gameId, gameName, userId, username,
        stars, review: review || null, createdAt: new Date()
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:gameId', async (req, res) => {
  try {
    const snapshot = await db.collection('gameRatings')
      .where('gameId', '==', req.params.gameId).get();
    const ratings = snapshot.docs.map(d => d.data());
    const count = ratings.length;
    const avg = count > 0
      ? ratings.reduce((s, r) => s + r.stars, 0) / count : 0;
    const recent = ratings
      .filter(r => r.review)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5);
    res.json({ success: true,
      stats: { avg: Math.round(avg * 10) / 10, count }, recent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:gameId/:uid', async (req, res) => {
  try {
    const snapshot = await db.collection('gameRatings')
      .where('gameId', '==', req.params.gameId)
      .where('userId', '==', req.params.uid).get();
    const rating = snapshot.empty ? null : snapshot.docs[0].data();
    res.json({ success: true, rating });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;