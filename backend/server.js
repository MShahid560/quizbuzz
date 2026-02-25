const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import firebase once at the top
const { db } = require('./config/firebase');

const questionsRoute = require('./routes/questions');
const authRoute = require('./routes/auth');
const scoresRoute = require('./routes/scores');
const challengeRoutes = require('./routes/challenges');
const achievementRoutes = require('./routes/achievements');
const ratingRoutes = require('./routes/ratings');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// Routes
app.use('/api/questions', questionsRoute);
app.use('/api/auth', authRoute);
app.use('/api/scores', scoresRoute);
app.use('/api/challenges', challengeRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/', (req, res) => {
  res.json({ status: '🐝 Quiz Buzz API running!' });
});

// ==========================================
// SOCKET.IO — Real-time multiplayer
// ==========================================

const onlineUsers = new Map();
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('user_online', (userData) => {
    onlineUsers.set(socket.id, {
      socketId: socket.id,
      uid: userData.uid,
      username: userData.username,
      photo: userData.photo || null,
      avatar: userData.avatar || null,
      level: userData.level || 1,
      status: 'online'
    });
    console.log(`✅ ${userData.username} is online`);
    io.emit('online_users', Array.from(onlineUsers.values()));
  });

  socket.on('get_online_users', () => {
    socket.emit('online_users', Array.from(onlineUsers.values()));
  });

  socket.on('send_challenge', ({ toSocketId, fromUser, category, difficulty }) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    console.log(`⚔️ Challenge: ${fromUser.username} → ${toSocketId}`);
    io.to(toSocketId).emit('challenge_received', {
      roomId, fromUser, category, difficulty
    });
  });

  socket.on('accept_challenge', ({ roomId, toSocketId, acceptingUser, category, difficulty }) => {
    activeRooms.set(roomId, {
      roomId, players: [], category, difficulty,
      questions: [], scores: {}, started: false
    });
    socket.join(roomId);
    io.to(toSocketId).emit('challenge_accepted', { roomId, acceptingUser });
    console.log(`✅ Challenge accepted! Room: ${roomId}`);
  });

  socket.on('join_room', async ({ roomId, user, category, difficulty }) => {
    try {
      socket.join(roomId);

      const room = activeRooms.get(roomId) || {
        roomId, players: [], category, difficulty,
        questions: [], scores: {}, started: false
      };

      const exists = room.players.find(p => p.uid === user.uid);
      if (!exists) {
        room.players.push({ ...user, socketId: socket.id, score: 0, answers: [] });
        room.scores[user.uid] = 0;
      }

      activeRooms.set(roomId, room);
      io.to(roomId).emit('player_joined', { players: room.players });

      if (room.players.length === 2 && !room.started) {
        room.started = true;
        
        const snapshot = await db.collection('questions')
          .where('category', '==', category).get();

        let questions = snapshot.docs.map(doc => ({
          id: doc.id, ...doc.data()
        }));
        questions = questions.sort(() => Math.random() - 0.5).slice(0, 10);
        room.questions = questions;
        activeRooms.set(roomId, room);

        console.log(`🎮 Game starting in room ${roomId}!`);
        io.to(roomId).emit('game_start', {
          questions, players: room.players, roomId
        });
      }

      console.log(`👥 Room ${roomId}: ${room.players.length} players`);
    } catch (err) {
      console.log('Error in join_room:', err.message);
      socket.emit('room_error', { message: 'Failed to join room' });
    }
  });

  socket.on('submit_answer', ({ roomId, uid, questionIndex, correct, score }) => {
    const room = activeRooms.get(roomId);
    if (!room) return;
    room.scores[uid] = score;
    activeRooms.set(roomId, room);
    io.to(roomId).emit('score_update', { scores: room.scores });
  });

  socket.on('game_finished', ({ roomId, uid, finalScore }) => {
    const room = activeRooms.get(roomId);
    if (!room) return;
    
    room.scores[uid] = finalScore;
    const finished = Object.keys(room.scores).filter(
      id => room.scores[id] !== undefined
    );
    
    if (finished.length === 2) {
      const scores = room.scores;
      const playerIds = Object.keys(scores);
      const winner = scores[playerIds[0]] > scores[playerIds[1]]
        ? playerIds[0] : playerIds[1];
      
      io.to(roomId).emit('game_over', { scores, winner });
      activeRooms.delete(roomId);
      console.log(`🏆 Game over in room ${roomId}!`);
    }
  });

  socket.on('decline_challenge', ({ toSocketId, username }) => {
    io.to(toSocketId).emit('challenge_declined', { username });
  });

  socket.on('send_friend_request', async ({ fromUid, toUid, fromUsername }) => {
    try {
      await db.collection('friendRequests').add({
        fromUid, toUid, fromUsername,
        status: 'pending', createdAt: new Date()
      });
      
      const toUser = Array.from(onlineUsers.values()).find(u => u.uid === toUid);
      if (toUser) {
        io.to(toUser.socketId).emit('friend_request_received', { fromUid, fromUsername });
      }
      socket.emit('friend_request_sent', { success: true });
    } catch (err) {
      console.log('Friend request error:', err.message);
      socket.emit('friend_request_sent', { success: false });
    }
  });

  socket.on('accept_friend_request', async ({ fromUid, toUid }) => {
    try {
      await db.collection('friends').add({
        user1: fromUid, user2: toUid, createdAt: new Date()
      });
      
      const reqSnapshot = await db.collection('friendRequests')
        .where('fromUid', '==', fromUid)
        .where('toUid', '==', toUid).get();
      
      reqSnapshot.docs.forEach(doc => doc.ref.update({ status: 'accepted' }));
      
      socket.emit('friend_added', { success: true, friendUid: fromUid });
      
      const fromUser = Array.from(onlineUsers.values()).find(u => u.uid === fromUid);
      if (fromUser) {
        io.to(fromUser.socketId).emit('friend_added', { success: true, friendUid: toUid });
      }
    } catch (err) {
      console.log('Friend accept error:', err.message);
      socket.emit('friend_added', { success: false });
    }
  });

  socket.on('send_message', async ({ roomId, fromUser, message, isFriend }) => {
    const msgData = {
      roomId,
      fromUid: fromUser.uid,
      fromUsername: fromUser.username,
      fromPhoto: fromUser.photo || null,
      message, isFriend,
      timestamp: new Date().toISOString()
    };
    io.to(roomId).emit('new_message', msgData);
  });

  socket.on('get_friends', async ({ uid }) => {
    try {
      const snap1 = await db.collection('friends').where('user1', '==', uid).get();
      const snap2 = await db.collection('friends').where('user2', '==', uid).get();
      
      const friendUids = [
        ...snap1.docs.map(d => d.data().user2),
        ...snap2.docs.map(d => d.data().user1)
      ];
      
      socket.emit('friends_list', { friendUids });
    } catch (err) {
      console.log('Get friends error:', err.message);
      socket.emit('friends_list', { friendUids: [] });
    }
  });

  socket.on('get_friend_requests', async ({ uid }) => {
    try {
      const snapshot = await db.collection('friendRequests')
        .where('toUid', '==', uid)
        .where('status', '==', 'pending').get();
      
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      socket.emit('friend_requests_list', { requests });
    } catch (err) {
      console.log('Get friend requests error:', err.message);
      socket.emit('friend_requests_list', { requests: [] });
    }
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      console.log(`❌ ${user.username} went offline`);
      onlineUsers.delete(socket.id);
      
      // Remove user from any active rooms
      activeRooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          delete room.scores[user.uid];
          
          if (room.players.length === 0) {
            activeRooms.delete(roomId);
          } else {
            activeRooms.set(roomId, room);
            io.to(roomId).emit('player_left', { players: room.players });
          }
        }
      });
      
      io.emit('online_users', Array.from(onlineUsers.values()));
    }
  });
});

// ==========================================
// ARCADE API PROXY
// ==========================================

app.get('/api/arcade/games', async (req, res) => {
  const category = req.query.category || '';
  
  try {
    // Try FreeToGame API first
    let url = 'https://www.freetogame.com/api/games?platform=browser';
    if (category && category !== '') {
      url += `&category=${category}`;
    }

    console.log('🎮 Fetching FreeToGame:', url);
    
    // Use global fetch (available in Node.js 18+)
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Got', data.length, 'games from FreeToGame');

    // Normalize to our format
    const games = data.slice(0, 50).map(g => ({
      title: g.title,
      thumb: g.thumbnail,
      url: g.game_url,
      category: g.genre,
      description: g.short_description,
      platform: g.platform,
      id: g.id
    }));

    res.json({ success: true, games });
  } catch (err) {
    console.log('❌ FreeToGame error:', err.message);
    // Fallback to curated embeddable HTML5 games
    res.json({ success: true, games: getEmbeddableGames() });
  }
});

// Curated embeddable HTML5 games (always works as fallback)
function getEmbeddableGames() {
  return [
    // 🧠 Educational
    { title: 'GeoGuessr (Free)', category: 'Geography',
      thumb: 'https://www.geoguessr.com/images/og.jpg',
      url: 'https://www.geoguessr.com/',
      description: 'Guess where in the world you are from Street View!' },
    { title: 'Seterra Geography', category: 'Geography',
      thumb: 'https://www.geoguessr.com/images/og.jpg',
      url: 'https://www.seterra.com/en/vgp/3003',
      description: 'Learn world capitals and countries!' },
    { title: 'Mathler', category: 'Math',
      thumb: 'https://www.mathler.com/og.png',
      url: 'https://www.mathler.com/',
      description: 'Wordle but for Math equations!' },
    { title: 'Typeracer', category: 'Typing',
      thumb: 'https://typeracer.com/favicon.ico',
      url: 'https://play.typeracer.com/',
      description: 'Race others by typing fast!' },
    { title: 'Sporcle Quizzes', category: 'Trivia',
      thumb: 'https://sporcle.com/favicon.ico',
      url: 'https://www.sporcle.com/',
      description: 'Thousands of free trivia quizzes!' },
    { title: '10 Fast Fingers', category: 'Typing',
      thumb: 'https://10fastfingers.com/favicon.ico',
      url: 'https://10fastfingers.com/typing-test/english',
      description: 'Test your typing speed!' },
    { title: 'Chess.com', category: 'Strategy',
      thumb: 'https://www.chess.com/favicon.ico',
      url: 'https://www.chess.com/play/computer',
      description: 'Play chess vs computer!' },
    { title: 'Wordle', category: 'Word',
      thumb: 'https://www.nytimes.com/games/wordle/images/NYT-Wordle-Icon.png',
      url: 'https://www.nytimes.com/games/wordle/index.html',
      description: 'Guess the 5-letter word in 6 tries!' },
    { title: 'Kahoot!', category: 'Quiz',
      thumb: 'https://kahoot.com/favicon.ico',
      url: 'https://kahoot.it/',
      description: 'Join a live quiz challenge!' },
    { title: 'Quizlet', category: 'Study',
      thumb: 'https://quizlet.com/favicon.ico',
      url: 'https://quizlet.com/',
      description: 'Flashcards and study games!' },

    // 🎮 3D & Action (browser-based)
    { title: 'Krunker.io', category: '3D Shooter',
      thumb: 'https://krunker.io/img/logo.png',
      url: 'https://krunker.io/',
      description: 'Fast 3D browser FPS shooter!' },
    { title: 'Shell Shockers', category: '3D Shooter',
      thumb: 'https://shellshock.io/img/logo.png',
      url: 'https://shellshock.io/',
      description: '3D egg shooter multiplayer!' },
    { title: 'Voxiom.io', category: '3D',
      thumb: 'https://voxiom.io/favicon.ico',
      url: 'https://voxiom.io/',
      description: 'Minecraft-style 3D battle game!' },
    { title: 'Sketchful.io', category: 'Drawing',
      thumb: 'https://sketchful.io/favicon.ico',
      url: 'https://sketchful.io/',
      description: 'Draw and guess with friends!' },
    { title: 'Gartic Phone', category: 'Drawing',
      thumb: 'https://garticphone.com/images/og.png',
      url: 'https://garticphone.com/',
      description: 'Telephone game with drawings!' },
    { title: 'Slither.io', category: 'Arcade',
      thumb: 'https://slither.io/favicon.ico',
      url: 'https://slither.io/',
      description: 'Grow your snake, eat others!' },
    { title: 'Agar.io', category: 'Arcade',
      thumb: 'https://agar.io/favicon.ico',
      url: 'https://agar.io/',
      description: 'Eat cells and grow bigger!' },
    { title: 'Diep.io', category: 'Arcade',
      thumb: 'https://diep.io/favicon.ico',
      url: 'https://diep.io/',
      description: 'Tank battle arena game!' },
    { title: 'Paper.io 2', category: 'Arcade',
      thumb: 'https://paper-io.com/favicon.ico',
      url: 'https://paper-io.com/',
      description: 'Capture territory with your paper!' },
    { title: 'Lordz.io', category: 'Strategy',
      thumb: 'https://www.lordz.io/favicon.ico',
      url: 'https://www.lordz.io/',
      description: 'Build your medieval army!' },
    { title: 'Wormate.io', category: 'Arcade',
      thumb: 'https://wormate.io/favicon.ico',
      url: 'https://wormate.io/',
      description: 'Eat sweets and grow your worm!' },
    { title: 'Skribbl.io', category: 'Drawing',
      thumb: 'https://skribbl.io/img/logo.gif',
      url: 'https://skribbl.io/',
      description: 'Draw and guess words with friends!' },
    { title: 'Surviv.io', category: '3D Shooter',
      thumb: 'https://surviv.io/favicon.ico',
      url: 'https://surviv.io/',
      description: '2D battle royale!' },
    { title: 'Moomoo.io', category: 'Strategy',
      thumb: 'https://moomoo.io/favicon.ico',
      url: 'https://moomoo.io/',
      description: 'Build base and survive!' },
  ];
}
// ==========================================
// SEO ROUTES
// ==========================================

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://quizbuzz.app';
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/games', priority: '0.9', changefreq: 'daily' },
    { url: '/quiz', priority: '0.9', changefreq: 'daily' },
    { url: '/daily', priority: '0.8', changefreq: 'daily' },
    { url: '/leaderboard', priority: '0.7', changefreq: 'hourly' },
    { url: '/games/hub', priority: '0.7', changefreq: 'daily' },
    { url: '/achievements', priority: '0.6', changefreq: 'weekly' },
  ];
  
  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: https://quizbuzz.app/sitemap.xml\nDisallow: /admin\nDisallow: /api/\n');
});

// ==========================================
// START SERVER
// ==========================================

server.listen(PORT, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let networkIP = 'localhost';

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        networkIP = net.address;
      }
    }
  }

  console.log(`🚀 Quiz Buzz server running!`);
  console.log(`🌐 Local:   http://localhost:${PORT}`);
  console.log(`📱 Network: http://${networkIP}:${PORT}`);
  console.log(`📱 Open this on your phone: http://${networkIP}:3000`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection:', err.message);
});