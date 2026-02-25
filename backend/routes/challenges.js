const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// POST /api/challenges/send
router.post('/send', async (req, res) => {
  const { fromUid, fromUsername, toUsername, game, gameIcon } = req.body;
  console.log('⚔️ Challenge from', fromUsername, 'to', toUsername);
  try {
    // Find target user
    const snapshot = await db.collection('users')
      .where('username', '==', toUsername).get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        success: false, error: 'User not found!' 
      });
    }

    const toUser = snapshot.docs[0].data();

    // Save challenge
    await db.collection('challenges').add({
      fromUid,
      fromUsername,
      toUid: toUser.uid,
      toUsername,
      game,
      gameIcon: gameIcon || '🎮',
      status: 'pending',
      createdAt: new Date()
    });

    // Save notification for target user
    await db.collection('notifications').add({
      toUid: toUser.uid,
      fromUsername,
      type: 'game_challenge',
      game,
      gameIcon: gameIcon || '🎮',
      message: `${fromUsername} challenged you to ${gameIcon} ${game}!`,
      read: false,
      createdAt: new Date()
    });

    console.log('✅ Challenge sent!');
    res.json({ success: true, message: '⚔️ Challenge sent!' });
  } catch (err) {
    console.log('❌ Challenge error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/challenges/received/:uid
router.get('/received/:uid', async (req, res) => {
  try {
    const snapshot = await db.collection('challenges')
      .where('toUid', '==', req.params.uid)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const challenges = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));

    res.json({ success: true, challenges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;