import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';

const QUICK_MESSAGES = [
  '👋 Hey!', '🔥 Good luck!', '😎 Ready?',
  '🏆 Let\'s go!', '😅 Close one!', '👏 Well played!',
  '🤝 GG!', '💪 Nice!', '😂 Haha!', '⚡ Fast!'
];

export default function OnlineUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('online');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [notification, setNotification] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General Knowledge');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isFriendChat, setIsFriendChat] = useState(false);
  const messagesEndRef = useRef(null);

  const CATEGORIES = [
    'General Knowledge', 'Science and Technology', 'Sports',
    'History', 'Geography', 'Movies and Entertainment',
    'Islamic Religion and Culture', 'Math and Logic',
    'Books and Student Knowledge'
  ];
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) return;
    if (!socket.connected) socket.connect();

    socket.emit('user_online', {
      uid: user.uid, username: user.username,
      photo: user.photo, level: user.level || 1
    });

    socket.emit('get_friends', { uid: user.uid });
    socket.emit('get_friend_requests', { uid: user.uid });

    socket.on('online_users', (users) => {
      setOnlineUsers(users.filter(u => u.uid !== user.uid));
    });

    socket.on('friends_list', ({ friendUids }) => {
      setFriends(friendUids);
    });

    socket.on('friend_requests_list', ({ requests }) => {
      setFriendRequests(requests);
    });

    socket.on('friend_request_received', ({ fromUid, fromUsername }) => {
      setNotification(`👋 ${fromUsername} sent you a friend request!`);
      setTimeout(() => setNotification(''), 4000);
      socket.emit('get_friend_requests', { uid: user.uid });
    });

    socket.on('friend_added', () => {
      socket.emit('get_friends', { uid: user.uid });
      setNotification('✅ Friend added!');
      setTimeout(() => setNotification(''), 3000);
    });

    socket.on('challenge_received', ({ roomId, fromUser, category, difficulty }) => {
      setChallenge({ roomId, fromUser, category, difficulty, type: 'incoming' });
      setNotification(`⚔️ ${fromUser.username} challenged you!`);
    });

    socket.on('challenge_accepted', ({ roomId, acceptingUser }) => {
      navigate(`/challenge/${roomId}`, {
        state: { category: selectedCategory, difficulty: selectedDifficulty, opponent: acceptingUser }
      });
    });

    socket.on('challenge_declined', ({ username }) => {
      setNotification(`❌ ${username} declined`);
      setTimeout(() => setNotification(''), 3000);
    });

    socket.on('new_message', (msgData) => {
      setMessages(prev => [...prev, msgData]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    socket.emit('get_online_users');

    return () => {
      socket.off('online_users');
      socket.off('friends_list');
      socket.off('friend_requests_list');
      socket.off('friend_request_received');
      socket.off('friend_added');
      socket.off('challenge_received');
      socket.off('challenge_accepted');
      socket.off('challenge_declined');
      socket.off('new_message');
    };
  }, [user]);

  const isFriend = (uid) => friends.includes(uid);

  const sendFriendRequest = (targetUser) => {
    socket.emit('send_friend_request', {
      fromUid: user.uid,
      toUid: targetUser.uid,
      fromUsername: user.username
    });
    setNotification(`👋 Friend request sent to ${targetUser.username}!`);
    setTimeout(() => setNotification(''), 3000);
  };

  const acceptFriendRequest = (req) => {
    socket.emit('accept_friend_request', {
      fromUid: req.fromUid,
      toUid: user.uid
    });
    setFriendRequests(prev => prev.filter(r => r.fromUid !== req.fromUid));
  };

  const sendChallenge = (targetUser) => {
    if (!user) { navigate('/profile'); return; }
    socket.emit('send_challenge', {
      toSocketId: targetUser.socketId,
      fromUser: { uid: user.uid, username: user.username, photo: user.photo, socketId: socket.id },
      category: selectedCategory, difficulty: selectedDifficulty
    });
    setNotification(`⚔️ Challenge sent to ${targetUser.username}!`);
    setTimeout(() => setNotification(''), 3000);
  };

  const openChat = (targetUser) => {
    const isF = isFriend(targetUser.uid);
    const roomId = [user.uid, targetUser.uid].sort().join('_chat_');
    setChatUser(targetUser);
    setChatRoomId(roomId);
    setIsFriendChat(isF);
    setMessages([]);
    setChatOpen(true);
    socket.emit('join_room', {
      roomId, user: { uid: user.uid, username: user.username },
      category: 'chat', difficulty: 'chat'
    });
  };

  const sendMessage = (msg = null) => {
    const text = msg || messageInput.trim();
    if (!text || !chatRoomId) return;
    socket.emit('send_message', {
      roomId: chatRoomId,
      fromUser: { uid: user.uid, username: user.username, photo: user.photo },
      message: text,
      isFriend: isFriendChat
    });
    setMessageInput('');
  };

  const acceptChallenge = () => {
    if (!challenge) return;
    socket.emit('accept_challenge', {
      roomId: challenge.roomId,
      toSocketId: challenge.fromUser.socketId,
      acceptingUser: { uid: user.uid, username: user.username, photo: user.photo, socketId: socket.id },
      category: challenge.category, difficulty: challenge.difficulty
    });
    navigate(`/challenge/${challenge.roomId}`, {
      state: { category: challenge.category, difficulty: challenge.difficulty, opponent: challenge.fromUser }
    });
    setChallenge(null);
  };

  const declineChallenge = () => {
    socket.emit('decline_challenge', { toSocketId: challenge.fromUser.socketId, username: user.username });
    setChallenge(null);
  };

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)} style={{
        position: 'fixed', top: '80px', left: '20px',
        background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
        border: 'none', borderRadius: '50px', padding: '12px 18px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
        zIndex: 999, boxShadow: '0 4px 20px rgba(123,47,255,0.4)',
        color: '#fff', fontFamily: "'Fredoka One', cursive", fontSize: '0.95rem'
      }}>
        🌐 <span>Online</span>
        {onlineUsers.length > 0 && (
          <span style={{ background: '#06D6A0', color: '#0D0D1A',
            borderRadius: '50px', padding: '2px 8px',
            fontSize: '0.75rem', fontWeight: 800 }}>
            {onlineUsers.length}
          </span>
        )}
        {friendRequests.length > 0 && (
          <span style={{ background: '#FF4757', color: '#fff',
            borderRadius: '50px', padding: '2px 8px',
            fontSize: '0.75rem', fontWeight: 800 }}>
            {friendRequests.length}
          </span>
        )}
      </button>

      {/* Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: '140px', left: '20px',
          background: '#16213E', border: '1px solid #7B2FFF',
          borderRadius: '14px', padding: '12px 18px', color: '#fff',
          fontWeight: 700, zIndex: 1000, maxWidth: '280px', fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {notification}
        </div>
      )}

      {/* Challenge Modal */}
      {challenge && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#16213E', borderRadius: '24px', padding: '32px',
            textAlign: 'center', border: '2px solid #7B2FFF', maxWidth: '360px', width: '90%' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚔️</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem', marginBottom: '8px' }}>
              Challenge!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
              <strong style={{ color: '#FFD60A' }}>{challenge.fromUser.username}</strong> wants to battle in{' '}
              <strong style={{ color: '#00B4FF' }}>{challenge.category}</strong>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={declineChallenge} style={{
                flex: 1, background: 'rgba(255,71,87,0.2)', border: '2px solid #FF4757',
                color: '#FF4757', padding: '14px', borderRadius: '14px',
                fontFamily: "'Fredoka One', cursive", fontSize: '1rem', cursor: 'pointer'
              }}>❌ Decline</button>
              <button onClick={acceptChallenge} style={{
                flex: 1, background: 'linear-gradient(135deg, #06D6A0, #00B4FF)',
                border: 'none', color: '#0D0D1A', padding: '14px', borderRadius: '14px',
                fontFamily: "'Fredoka One', cursive", fontSize: '1rem', cursor: 'pointer'
              }}>✅ Accept!</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {chatOpen && chatUser && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px',
          width: '320px', height: '460px', background: '#16213E',
          borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column', zIndex: 1001,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>

          {/* Chat Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: '10px' }}>
            {chatUser.photo ? (
              <img src={chatUser.photo} referrerPolicy="no-referrer"
                style={{ width: '36px', height: '36px', borderRadius: '50%',
                  border: '2px solid #06D6A0' }} alt={chatUser.username}/>
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%',
                background: '#7B2FFF', display: 'flex', alignItems: 'center',
                justifyContent: 'center' }}>👤</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                {chatUser.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: isFriendChat ? '#06D6A0' : '#FFD60A' }}>
                {isFriendChat ? '🤝 Friend' : '⚡ Quick messages only'}
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
              fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px',
            display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)',
                fontSize: '0.8rem', marginTop: '20px' }}>
                {isFriendChat ? '💬 Say something!' : '👇 Use quick messages below'}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: msg.fromUid === user.uid ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '75%', padding: '8px 12px', borderRadius: '14px',
                  background: msg.fromUid === user.uid
                    ? 'linear-gradient(135deg, #7B2FFF, #FF3D9A)'
                    : 'rgba(255,255,255,0.08)',
                  fontSize: '0.88rem', fontWeight: 600,
                  borderBottomRightRadius: msg.fromUid === user.uid ? '4px' : '14px',
                  borderBottomLeftRadius: msg.fromUid === user.uid ? '14px' : '4px',
                }}>
                  {msg.fromUid !== user.uid && (
                    <div style={{ fontSize: '0.7rem', color: '#FFD60A',
                      marginBottom: '3px', fontWeight: 800 }}>
                      {msg.fromUsername}
                    </div>
                  )}
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}/>
          </div>

          {/* Quick Messages for non-friends */}
          {!isFriendChat && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_MESSAGES.map(msg => (
                  <button key={msg} onClick={() => sendMessage(msg)} style={{
                    background: 'rgba(123,47,255,0.2)', border: '1px solid rgba(123,47,255,0.4)',
                    color: '#fff', padding: '5px 10px', borderRadius: '50px',
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700
                  }}>{msg}</button>
                ))}
              </div>
            </div>
          )}

          {/* Full Text Input for friends */}
          {isFriendChat && (
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', gap: '8px' }}>
              <input value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                  padding: '10px 14px', borderRadius: '50px',
                  fontFamily: "'Nunito', sans-serif", fontSize: '0.88rem', outline: 'none' }}/>
              <button onClick={() => sendMessage()} style={{
                background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
                border: 'none', color: '#fff', width: '38px', height: '38px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '1rem' }}>➤</button>
            </div>
          )}
        </div>
      )}

      {/* Online Users Panel */}
      {isOpen && (
        <div style={{ position: 'fixed', top: '140px', left: '20px',
          background: '#16213E', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          width: '310px', maxHeight: '70vh', overflowY: 'auto',
          zIndex: 998, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'online', label: `🌐 Online (${onlineUsers.length})` },
              { id: 'friends', label: `🤝 Friends (${friends.length})` },
              { id: 'requests', label: `📩 Requests ${friendRequests.length > 0 ? `(${friendRequests.length})` : ''}` },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                flex: 1, padding: '12px 6px', border: 'none', cursor: 'pointer',
                background: 'transparent', fontSize: '0.72rem', fontWeight: 800,
                color: activeTab === t.id ? '#FFD60A' : 'rgba(255,255,255,0.4)',
                borderBottom: `2px solid ${activeTab === t.id ? '#FFD60A' : 'transparent'}`
              }}>{t.label}</button>
            ))}
          </div>

          {/* Challenge Settings */}
          {activeTab === 'online' && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <select value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ width: '100%', background: '#0D0D1A',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                  padding: '8px 12px', borderRadius: '10px', marginBottom: '8px',
                  fontFamily: "'Nunito', sans-serif", fontSize: '0.82rem' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} onClick={() => setSelectedDifficulty(d)} style={{
                    flex: 1, padding: '6px', borderRadius: '8px',
                    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                    border: `1px solid ${selectedDifficulty === d ? '#FFD60A' : 'rgba(255,255,255,0.2)'}`,
                    background: selectedDifficulty === d ? 'rgba(255,214,10,0.2)' : 'transparent',
                    color: selectedDifficulty === d ? '#FFD60A' : 'rgba(255,255,255,0.5)'
                  }}>{d}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '10px' }}>

            {/* ONLINE TAB */}
            {activeTab === 'online' && (
              onlineUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px',
                  color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>😴</div>
                  No players online yet!
                </div>
              ) : onlineUsers.map(u => (
                <div key={u.socketId} style={{ display: 'flex', alignItems: 'center',
                  gap: '8px', padding: '10px 8px', borderRadius: '12px',
                  marginBottom: '6px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)' }}>
                  {u.photo ? (
                    <img src={u.photo} referrerPolicy="no-referrer"
                      style={{ width: '36px', height: '36px', borderRadius: '50%',
                        border: '2px solid #06D6A0' }} alt={u.username}/>
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%',
                      background: '#7B2FFF', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', border: '2px solid #06D6A0' }}>👤</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      {u.username}
                      {isFriend(u.uid) && (
                        <span style={{ marginLeft: '6px', fontSize: '0.7rem',
                          color: '#06D6A0' }}>🤝</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#06D6A0' }}>
                      ● Online • Lv.{u.level}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {/* Chat Button */}
                    <button onClick={() => openChat(u)} style={{
                      background: 'rgba(0,180,255,0.2)', border: '1px solid #00B4FF',
                      color: '#00B4FF', width: '30px', height: '30px',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      💬
                    </button>
                    {/* Add Friend Button */}
                    {!isFriend(u.uid) && (
                      <button onClick={() => sendFriendRequest(u)} style={{
                        background: 'rgba(6,214,160,0.2)', border: '1px solid #06D6A0',
                        color: '#06D6A0', width: '30px', height: '30px',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        ➕
                      </button>
                    )}
                    {/* Challenge Button */}
                    <button onClick={() => sendChallenge(u)} style={{
                      background: 'linear-gradient(135deg, #FF6B35, #FF3D9A)',
                      border: 'none', color: '#fff', width: '30px', height: '30px',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      ⚔️
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* FRIENDS TAB */}
            {activeTab === 'friends' && (
              friends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px',
                  color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤝</div>
                  No friends yet!<br/>Add friends from Online tab
                </div>
              ) : (
                friends.map(friendUid => {
                  const onlineFriend = onlineUsers.find(u => u.uid === friendUid);
                  return (
                    <div key={friendUid} style={{ display: 'flex', alignItems: 'center',
                      gap: '8px', padding: '10px 8px', borderRadius: '12px',
                      marginBottom: '6px', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%',
                        background: '#7B2FFF', display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${onlineFriend ? '#06D6A0' : 'rgba(255,255,255,0.2)'}` }}>
                        {onlineFriend?.photo ? (
                          <img src={onlineFriend.photo} referrerPolicy="no-referrer"
                            style={{ width: '100%', height: '100%', borderRadius: '50%' }} alt="friend"/>
                        ) : '👤'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                          {onlineFriend?.username || `Friend`}
                        </div>
                        <div style={{ fontSize: '0.7rem',
                          color: onlineFriend ? '#06D6A0' : 'rgba(255,255,255,0.3)' }}>
                          {onlineFriend ? '● Online' : '○ Offline'}
                        </div>
                      </div>
                      {onlineFriend && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => openChat(onlineFriend)} style={{
                            background: 'rgba(0,180,255,0.2)', border: '1px solid #00B4FF',
                            color: '#00B4FF', width: '30px', height: '30px',
                            borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            💬
                          </button>
                          <button onClick={() => sendChallenge(onlineFriend)} style={{
                            background: 'linear-gradient(135deg, #FF6B35, #FF3D9A)',
                            border: 'none', color: '#fff', width: '30px', height: '30px',
                            borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            ⚔️
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
              friendRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px',
                  color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📩</div>
                  No pending requests
                </div>
              ) : friendRequests.map(req => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center',
                  gap: '8px', padding: '12px', borderRadius: '12px',
                  marginBottom: '8px', background: 'rgba(123,47,255,0.1)',
                  border: '1px solid rgba(123,47,255,0.3)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%',
                    background: '#7B2FFF', display: 'flex', alignItems: 'center',
                    justifyContent: 'center' }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      {req.fromUsername}
                    </div>
                    <div style={{ fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.4)' }}>
                      wants to be your friend
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => acceptFriendRequest(req)} style={{
                      background: 'rgba(6,214,160,0.2)', border: '1px solid #06D6A0',
                      color: '#06D6A0', padding: '6px 10px',
                      borderRadius: '8px', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 700 }}>✅</button>
                    <button onClick={() => setFriendRequests(prev => prev.filter(r => r.id !== req.id))}
                      style={{ background: 'rgba(255,71,87,0.2)', border: '1px solid #FF4757',
                        color: '#FF4757', padding: '6px 10px',
                        borderRadius: '8px', cursor: 'pointer',
                        fontSize: '0.8rem', fontWeight: 700 }}>❌</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}