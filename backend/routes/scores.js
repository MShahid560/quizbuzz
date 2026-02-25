const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// POST /api/scores/save
router.post('/save', async (req, res) => {
  const { userId, username, category, score, correct, wrong, timeTaken, difficulty } = req.body;
  console.log('💾 Saving score:', { userId, username, score, correct });
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required!' });
  }
  try {
    await db.collection('scores').add({
      userId, username, category,
      score: parseInt(score) || 0,
      correct: parseInt(correct) || 0,
      wrong: parseInt(wrong) || 0,
      timeTaken: parseInt(timeTaken) || 0,
      difficulty: difficulty || 'Easy',
      createdAt: new Date()
    });
    console.log('✅ Score saved for', username);
    res.json({ success: true, message: '🏆 Score saved!' });
  } catch (err) {
    console.log('❌ Score save failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scores/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const snapshot = await db.collection('scores')
      .orderBy('score', 'desc')
      .limit(50)
      .get();

    const bestScores = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const key = data.userId;
      if (!bestScores[key] || data.score > bestScores[key].score) {
        bestScores[key] = { ...data, createdAt: data.createdAt?.toDate() };
      }
    });

    const userIds = Object.keys(bestScores);
    const userProfiles = {};
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const userDoc = await db.collection('users').doc(uid).get();
          if (userDoc.exists) userProfiles[uid] = userDoc.data();
        } catch (err) {}
      })
    );

    const leaderboard = Object.values(bestScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item, index) => {
        const profile = userProfiles[item.userId] || {};
        return {
          rank: index + 1, ...item,
          avatar: profile.avatar || null,
          photo: profile.photo || item.photo || null,
        };
      });

    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scores/history/:uid
router.get('/history/:uid', async (req, res) => {
  try {
    const uid = req.params.uid.trim();
    const snapshot = await db.collection('scores')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scores/all (debug)
router.get('/all', async (req, res) => {
  try {
    const snapshot = await db.collection('scores').limit(5).get();
    const scores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, scores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/scores/update-avatar
router.post('/update-avatar', async (req, res) => {
  const { uid, avatar } = req.body;
  try {
    await db.collection('users').doc(uid).update({ avatar: avatar || null });
    res.json({ success: true, message: '✅ Avatar updated!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/scores/save-game
router.post('/save-game', async (req, res) => {
  const { userId, username, avatar, photo, game, score } = req.body;
  console.log('🎮 Saving game score:', { userId, username, game, score });
  try {
    await db.collection('gameScores').add({
      userId, username,
      avatar: avatar || null,
      photo: photo || null,
      game,
      score: parseInt(score) || 0,
      playedAt: new Date()
    });
    console.log('✅ Game score saved!');
    res.json({ success: true });
  } catch (err) {
    console.log('❌ Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scores/game-leaderboard?game=word-scramble
router.get('/game-leaderboard', async (req, res) => {
  const { game } = req.query;
  try {
    const snapshot = await db.collection('gameScores')
      .where('game', '==', game)
      .orderBy('score', 'desc')
      .limit(50)
      .get();

    const best = {};
    snapshot.docs.forEach(doc => {
      const d = { id: doc.id, ...doc.data() };
      if (!best[d.userId] || d.score > best[d.userId].score) {
        best[d.userId] = d;
      }
    });

    const scores = Object.values(best)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json({ success: true, scores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scores/game-stats/:uid
router.get('/game-stats/:uid', async (req, res) => {
  try {
    const snapshot = await db.collection('gameScores')
      .where('userId', '==', req.params.uid)
      .get();

    const games = {};
    let totalScore = 0;
    let totalGamesPlayed = 0;
    let recentPlays = 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    snapshot.docs.forEach(doc => {
      const d = doc.data();
      totalScore += d.score || 0;
      totalGamesPlayed++;
      const playedAt = d.playedAt?.toDate?.()?.getTime() || 0;
      if (playedAt > weekAgo) recentPlays++;
      if (!games[d.game]) games[d.game] = { bestScore: 0, plays: 0 };
      games[d.game].plays++;
      if ((d.score || 0) > games[d.game].bestScore) {
        games[d.game].bestScore = d.score || 0;
      }
    });

    res.json({
      success: true,
      stats: {
        totalScore,
        totalGamesPlayed,
        uniqueGames: Object.keys(games).length,
        recentPlays,
        games
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scores/recent-game-plays
router.get('/recent-game-plays', async (req, res) => {
  try {
    const snapshot = await db.collection('gameScores')
      .orderBy('playedAt', 'desc')
      .limit(20)
      .get();

    const players = snapshot.docs.map(doc => {
      const d = doc.data();
      const playedAt = d.playedAt?.toDate();
      const diffMs = Date.now() - (playedAt?.getTime() || 0);
      const diffMins = Math.floor(diffMs / 60000);
      const timeAgo = diffMins < 1 ? 'just now'
        : diffMins < 60 ? `${diffMins}m ago`
        : `${Math.floor(diffMins / 60)}h ago`;
      return { ...d, timeAgo };
    });

    res.json({ success: true, players });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scores/trending-games
router.get('/trending-games', async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const snapshot = await db.collection('gameScores')
      .where('playedAt', '>=', weekAgo)
      .get();

    const gameCounts = {};
    snapshot.docs.forEach(doc => {
      const d = doc.data();
      if (!gameCounts[d.game]) {
        gameCounts[d.game] = { game: d.game, count: 0, totalScore: 0 };
      }
      gameCounts[d.game].count++;
      gameCounts[d.game].totalScore += d.score || 0;
    });

    const trending = Object.values(gameCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(g => ({
        ...g,
        avgScore: Math.round(g.totalScore / g.count)
      }));

    res.json({ success: true, trending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;