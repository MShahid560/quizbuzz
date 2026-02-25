// src/components/GameRating.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const hostname = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export default function GameRating({ gameId, gameName }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ avg: 0, count: 0 });
  const [myRating, setMyRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [review, setReview] = useState('');
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Load rating stats
    axios.get(`${API_BASE}/ratings/${gameId}`)
      .then(res => {
        if (res.data.success) {
          setStats(res.data.stats);
          setReviews(res.data.recent || []);
        }
      }).catch(() => {});

    // Load my rating
    if (user?.uid) {
      axios.get(`${API_BASE}/ratings/${gameId}/${user.uid}`)
        .then(res => {
          if (res.data.success && res.data.rating) {
            setMyRating(res.data.rating.stars);
            setSubmitted(true);
          }
        }).catch(() => {});
    }
  }, [gameId, user]);

  const submitRating = async (stars) => {
    if (!user) return;
    setMyRating(stars);
    try {
      await axios.post(`${API_BASE}/ratings/submit`, {
        gameId, gameName,
        userId: user.uid,
        username: user.username,
        stars,
        review: review.trim() || null
      });
      setSubmitted(true);
      // Refresh stats
      const res = await axios.get(`${API_BASE}/ratings/${gameId}`);
      if (res.data.success) {
        setStats(res.data.stats);
        setReviews(res.data.recent || []);
      }
    } catch (err) {
      console.error('Rating error:', err);
    }
  };

  const displayStars = hovered || myRating;

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Stars display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
        flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1,2,3,4,5].map(star => (
            <button key={star}
              onMouseEnter={() => !submitted && setHovered(star)}
              onMouseLeave={() => !submitted && setHovered(0)}
              onClick={() => !submitted && submitRating(star)}
              style={{ background: 'none', border: 'none',
                cursor: submitted ? 'default' : 'pointer',
                fontSize: '1.5rem', padding: '2px',
                transition: 'transform 0.1s',
                transform: (hovered >= star || myRating >= star)
                  ? 'scale(1.15)' : 'scale(1)',
                filter: (displayStars >= star)
                  ? 'none' : 'grayscale(1) opacity(0.3)' }}>
              ⭐
            </button>
          ))}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)',
          fontSize: '0.82rem' }}>
          {stats.count > 0
            ? `${stats.avg.toFixed(1)} / 5 (${stats.count} ratings)`
            : 'No ratings yet'}
        </div>

        {reviews.length > 0 && (
          <button onClick={() => setShowReviews(!showReviews)}
            style={{ background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)', padding: '4px 12px',
              borderRadius: '50px', cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: "'Fredoka One', cursive" }}>
            {showReviews ? 'Hide' : 'Show'} Reviews
          </button>
        )}
      </div>

      {/* Write review */}
      {user && !submitted && myRating > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
          <input value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Leave a review (optional)..."
            maxLength={150}
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', padding: '8px 12px', borderRadius: '10px',
              fontFamily: "'Nunito', sans-serif", fontSize: '0.88rem',
              outline: 'none' }}/>
          <button onClick={() => submitRating(myRating)} style={{
            background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            border: 'none', color: '#fff', padding: '8px 16px',
            borderRadius: '10px', cursor: 'pointer',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '0.85rem' }}>Submit</button>
        </div>
      )}

      {submitted && (
        <div style={{ fontSize: '0.78rem', color: '#06D6A0',
          marginTop: '6px' }}>
          ✅ Thanks for rating!
        </div>
      )}

      {/* Reviews list */}
      {showReviews && reviews.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex',
          flexDirection: 'column', gap: '8px' }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px', padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center',
                gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700,
                  fontSize: '0.85rem' }}>{r.username}</span>
                <span style={{ fontSize: '0.8rem' }}>
                  {'⭐'.repeat(r.stars)}
                </span>
              </div>
              {r.review && (
                <div style={{ fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.55)' }}>{r.review}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}