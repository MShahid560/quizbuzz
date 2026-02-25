import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(22,33,62,0.95)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '40px 24px 24px',
      marginTop: '60px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Top Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', gap: '32px', marginBottom: '32px' }}>

          {/* Brand */}
          <div style={{ maxWidth: '260px' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #FFD60A, #FF6B35, #FF3D9A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '10px' }}>
              Quiz Buzz 🐝
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
              lineHeight: 1.6 }}>
              The #1 AI-powered quiz platform. Test your knowledge, challenge friends, and climb the leaderboard!
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              color: '#FFD60A', marginBottom: '12px', fontSize: '1rem' }}>
              Quick Links
            </div>
            {[
              { to: '/games', label: '🎮 Games' },
              { to: '/', label: '🏠 Home' },
              { to: '/leaderboard', label: '🏆 Leaderboard' },
              { to: '/history', label: '📊 Quiz History' },
              { to: '/profile', label: '👤 Profile' },
            ].map(link => (
              <div key={link.to} style={{ marginBottom: '8px' }}>
                <Link to={link.to} style={{ color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none', fontSize: '0.88rem',
                  fontWeight: 600 }}>
                  {link.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              color: '#FFD60A', marginBottom: '12px', fontSize: '1rem' }}>
              Legal
            </div>
            {[
              { to: '/legal', label: '🔒 Privacy Policy' },
              { to: '/legal', label: '📋 Terms of Service' },
              { to: '/legal', label: '🐝 About Us' },
            ].map((link, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <Link to={link.to} style={{ color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
                  {link.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              color: '#FFD60A', marginBottom: '12px', fontSize: '1rem' }}>
              Get In Touch
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)',
              fontSize: '0.88rem', lineHeight: 2 }}>
              📧 admin@quizbuzz.com<br/>
              🌐 quizbuzz.com<br/>
              📱 Available on Web & Mobile
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '20px', display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            © 2026 Quiz Buzz 🐝 All rights reserved
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/legal" style={{ color: 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link to="/legal" style={{ color: 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}