const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.post('/unlock', async (req, res) => {
  const { userId, username, achievementId } = req.body;
  try {
    const existing = await db.collection('achievements')
      .where('userId', '==', userId)
      .where('achievementId', '==', achievementId)
      .get();
    if (!existing.empty) {
      return res.json({ success: true, unlocked: false });
    }
    await db.collection('achievements').add({
      userId, username, achievementId, unlockedAt: new Date()
    });
    res.json({ success: true, unlocked: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:uid', async (req, res) => {
  try {
    const snapshot = await db.collection('achievements')
      .where('userId', '==', req.params.uid).get();
    const achievements = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data()
    }));
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;