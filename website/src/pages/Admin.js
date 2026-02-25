import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const hostname = window.location.hostname;
const API = (hostname === 'localhost' || hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : `http://${hostname}:5000/api`;

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    category: 'General Knowledge', question: '',
    optionA: '', optionB: '', optionC: '', optionD: '',
    correct: '0', explanation: ''
  });
  const [jsonText, setJsonText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('General Knowledge');
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📝' });

  const ICONS = ['📝','🎯','💡','🔥','⚡','🌟','🎮','🏆','🎪','🔮','🌍','🎨'];

  // Load all categories
  useEffect(() => {
    axios.get(`${API}/questions/categories`)
      .then(res => setCategories(res.data.categories))
      .catch(console.error);
  }, []);

  const allCategoryNames = categories.map(c => c.name);

  if (!user || !user.isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem', 
          marginBottom: '16px' }}>Admin Only!</div>
        <button onClick={() => navigate('/')} style={{
          background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
          border: 'none', color: '#fff', padding: '12px 28px',
          borderRadius: '50px', fontFamily: "'Fredoka One', cursive",
          fontSize: '1rem', cursor: 'pointer'
        }}>Go Home</button>
      </div>
    );
  }

  const handleSingleSubmit = async () => {
    if (!form.question || !form.optionA || !form.optionB || 
        !form.optionC || !form.optionD) {
      setError('Please fill in all fields!'); return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/questions/save`, {
        category: form.category,
        questions: [{
          question: form.question,
          options: [form.optionA, form.optionB, form.optionC, form.optionD],
          correct: parseInt(form.correct),
          explanation: form.explanation
        }]
      });
      setSuccess('✅ Question saved!');
      setForm({ ...form, question: '', optionA: '', optionB: '', 
        optionC: '', optionD: '', explanation: '' });
    } catch (err) {
      setError('Failed to save. Try again!');
    }
    setLoading(false);
  };

  const handleBulkSubmit = async () => {
    setError(''); setSuccess('');
    try {
      const questions = JSON.parse(jsonText);
      if (!Array.isArray(questions)) { 
        setError('Must be a JSON array!'); return; 
      }
      setLoading(true);
      await axios.post(`${API}/questions/save`, {
        category: bulkCategory, questions
      });
      setSuccess(`✅ ${questions.length} questions saved!`);
      setJsonText('');
    } catch (err) {
      setError('Invalid JSON format!');
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) { 
      setError('Category name is required!'); return; 
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/questions/add-category`, newCategory);
      setSuccess(`✅ Category "${newCategory.name}" added!`);
      setNewCategory({ name: '', icon: '📝' });
      // Reload categories
      const res = await axios.get(`${API}/questions/categories`);
      setCategories(res.data.categories);
    } catch (err) {
      setError('Failed to add category!');
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (docId, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await axios.delete(`${API}/questions/delete-category/${docId}`);
      setSuccess(`✅ Category "${name}" deleted!`);
      const res = await axios.get(`${API}/questions/categories`);
      setCategories(res.data.categories);
    } catch (err) {
      setError('Failed to delete category!');
    }
  };

  const inputStyle = {
    width: '100%', background: '#1A2744',
    border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff',
    padding: '12px 16px', borderRadius: '12px',
    fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem',
    marginBottom: '12px', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 800,
    color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
    letterSpacing: '1px', marginBottom: '6px',
  };

  const TABS = [
    { id: 'upload', label: '📝 Add Question' },
    { id: 'bulk', label: '📦 Bulk Upload' },
    { id: 'categories', label: '🗂️ Categories' },
    { id: 'format', label: '📋 JSON Format' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', 
        gap: '16px', marginBottom: '30px' }}>
        <div style={{ fontSize: '3rem' }}>👑</div>
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem' }}>
            Admin Panel
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Welcome, {user.username}!
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px',
        flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, minWidth: '120px', padding: '12px', borderRadius: '14px',
            border: `2px solid ${tab===t.id ? '#7B2FFF' : 'rgba(255,255,255,0.1)'}`,
            background: tab===t.id ? 'rgba(123,47,255,0.2)' : 'transparent',
            color: tab===t.id ? '#fff' : 'rgba(255,255,255,0.4)',
            fontFamily: "'Nunito', sans-serif", fontWeight: 800,
            fontSize: '0.82rem', cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {error && (
        <div style={{ color: '#FF4757', background: 'rgba(255,71,87,0.1)',
          border: '1px solid #FF4757', borderRadius: '12px',
          padding: '12px 16px', marginBottom: '16px' }}>{error}</div>
      )}
      {success && (
        <div style={{ color: '#06D6A0', background: 'rgba(6,214,160,0.1)',
          border: '1px solid #06D6A0', borderRadius: '12px',
          padding: '12px 16px', marginBottom: '16px' }}>{success}</div>
      )}

      {/* SINGLE QUESTION */}
      {tab === 'upload' && (
        <div style={{ background: '#16213E', borderRadius: '20px', 
          padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={labelStyle}>Category</label>
          <select value={form.category} 
            onChange={e => setForm({...form, category: e.target.value})}
            style={inputStyle}>
            {allCategoryNames.map(c => 
              <option key={c} value={c}>{c}</option>
            )}
          </select>

          <label style={labelStyle}>Question</label>
          <textarea value={form.question} 
            onChange={e => setForm({...form, question: e.target.value})}
            placeholder="Enter your question here..."
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}/>

          <div style={{ display: 'grid', 
            gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['A','B','C','D'].map(letter => (
              <div key={letter}>
                <label style={labelStyle}>Option {letter}</label>
                <input type="text"
                  value={form[`option${letter}`]}
                  onChange={e => setForm({...form, 
                    [`option${letter}`]: e.target.value})}
                  placeholder={`Option ${letter}`} style={inputStyle}/>
              </div>
            ))}
          </div>

          <label style={labelStyle}>Correct Answer</label>
          <select value={form.correct} 
            onChange={e => setForm({...form, correct: e.target.value})}
            style={inputStyle}>
            <option value="0">A — {form.optionA || 'Option A'}</option>
            <option value="1">B — {form.optionB || 'Option B'}</option>
            <option value="2">C — {form.optionC || 'Option C'}</option>
            <option value="3">D — {form.optionD || 'Option D'}</option>
          </select>

          <label style={labelStyle}>Explanation (optional)</label>
          <input type="text" value={form.explanation}
            onChange={e => setForm({...form, explanation: e.target.value})}
            placeholder="Why is this answer correct?" style={inputStyle}/>

          <button onClick={handleSingleSubmit} disabled={loading} style={{
            width: '100%', 
            background: 'linear-gradient(135deg, #7B2FFF, #FF3D9A)',
            border: 'none', color: '#fff', padding: '15px', 
            borderRadius: '14px', fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.1rem', cursor: 'pointer',
          }}>
            {loading ? '⏳ Saving...' : '💾 Save Question'}
          </button>
        </div>
      )}

      {/* BULK UPLOAD */}
      {tab === 'bulk' && (
        <div style={{ background: '#16213E', borderRadius: '20px', 
          padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={labelStyle}>Category</label>
          <select value={bulkCategory} 
            onChange={e => setBulkCategory(e.target.value)}
            style={inputStyle}>
            {allCategoryNames.map(c => 
              <option key={c} value={c}>{c}</option>
            )}
          </select>

          <label style={labelStyle}>Paste JSON Array</label>
          <textarea value={jsonText} 
            onChange={e => setJsonText(e.target.value)}
            placeholder={`[\n  {\n    "question": "What is 2+2?",\n    "options": ["3","4","5","6"],\n    "correct": 1,\n    "explanation": "2+2=4"\n  }\n]`}
            style={{ ...inputStyle, minHeight: '280px', 
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.8rem', resize: 'vertical' }}/>

          <button onClick={handleBulkSubmit} disabled={loading} style={{
            width: '100%', 
            background: 'linear-gradient(135deg, #FFD60A, #FF6B35)',
            border: 'none', color: '#0D0D1A', padding: '15px', 
            borderRadius: '14px', fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.1rem', cursor: 'pointer',
          }}>
            {loading ? '⏳ Uploading...' : '📦 Upload All Questions'}
          </button>
        </div>
      )}

      {/* MANAGE CATEGORIES */}
      {tab === 'categories' && (
        <div style={{ background: '#16213E', borderRadius: '20px', 
          padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          
          <div style={{ fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.3rem', marginBottom: '20px' }}>
            ➕ Add New Category
          </div>

          <label style={labelStyle}>Category Name</label>
          <input type="text" value={newCategory.name}
            onChange={e => setNewCategory({...newCategory, name: e.target.value})}
            placeholder="e.g. Pakistani Culture, Cooking, Science Fiction..."
            style={inputStyle}/>

          <label style={labelStyle}>Choose Icon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', 
            gap: '8px', marginBottom: '16px' }}>
            {ICONS.map(icon => (
              <button key={icon} onClick={() => setNewCategory({...newCategory, icon})}
                style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  border: `2px solid ${newCategory.icon === icon ? '#7B2FFF' : 'rgba(255,255,255,0.1)'}`,
                  background: newCategory.icon === icon ? 'rgba(123,47,255,0.2)' : 'transparent',
                  fontSize: '1.4rem', cursor: 'pointer'
                }}>{icon}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', 
            borderRadius: '12px', padding: '12px 16px',
            marginBottom: '16px', fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.6)' }}>
            Preview: {newCategory.icon} {newCategory.name || 'Category Name'}
          </div>

          <button onClick={handleAddCategory} disabled={loading} style={{
            width: '100%', 
            background: 'linear-gradient(135deg, #06D6A0, #00B4FF)',
            border: 'none', color: '#0D0D1A', padding: '14px', 
            borderRadius: '14px', fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.1rem', cursor: 'pointer', marginBottom: '24px'
          }}>
            {loading ? '⏳ Adding...' : '➕ Add Category'}
          </button>

          {/* Existing Custom Categories */}
          <div style={{ fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.1rem', marginBottom: '14px' }}>
            🗂️ Custom Categories
          </div>

          {categories.filter(c => c.custom).length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', 
              textAlign: 'center', padding: '20px' }}>
              No custom categories yet!
            </div>
          ) : (
            categories.filter(c => c.custom).map(cat => (
              <div key={cat.docId} style={{ 
                display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                padding: '12px 16px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>
                  {cat.icon}
                </span>
                <span style={{ flex: 1, fontWeight: 700 }}>{cat.name}</span>
                <button onClick={() => handleDeleteCategory(cat.docId, cat.name)}
                  style={{ background: 'rgba(255,71,87,0.2)',
                    border: '1px solid #FF4757', color: '#FF4757',
                    padding: '6px 12px', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                  🗑️ Delete
                </button>
              </div>
            ))
          )}

          {/* Default Categories List */}
          <div style={{ fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.1rem', margin: '20px 0 14px' }}>
            📋 Default Categories
          </div>
          {categories.filter(c => !c.custom).map(cat => (
            <div key={cat.id} style={{ 
              display: 'flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
              padding: '10px 16px', marginBottom: '6px',
              border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '1.3rem', marginRight: '12px' }}>
                {cat.icon}
              </span>
              <span style={{ flex: 1, color: 'rgba(255,255,255,0.7)' }}>
                {cat.name}
              </span>
              <span style={{ fontSize: '0.75rem', 
                color: 'rgba(255,255,255,0.3)' }}>Default</span>
            </div>
          ))}
        </div>
      )}

      {/* JSON FORMAT */}
      {tab === 'format' && (
        <div style={{ background: '#16213E', borderRadius: '20px', 
          padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", 
            fontSize: '1.3rem', marginBottom: '16px' }}>
            📋 Required JSON Format
          </div>
          <pre style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', 
            padding: '20px', fontFamily: "'Fira Code', monospace", 
            fontSize: '0.8rem', color: '#06D6A0',
            overflow: 'auto', lineHeight: 1.8 }}>
{`[
  {
    "question": "Your question here?",
    "options": [
      "Option A",
      "Option B", 
      "Option C",
      "Option D"
    ],
    "correct": 1,
    "explanation": "Why this is correct"
  }
]`}
          </pre>
          <div style={{ marginTop: '16px', padding: '16px', 
            background: 'rgba(255,214,10,0.08)',
            border: '1px solid rgba(255,214,10,0.3)', 
            borderRadius: '12px' }}>
            <div style={{ fontWeight: 800, color: '#FFD60A', marginBottom: '8px' }}>
              ⚠️ Rules:
            </div>
            <div style={{ fontSize: '0.85rem', 
              color: 'rgba(255,255,255,0.6)', lineHeight: 2 }}>
              • "correct" = index: 0=A, 1=B, 2=C, 3=D<br/>
              • Always exactly 4 options<br/>
              • "explanation" is optional
            </div>
          </div>
        </div>
      )}
    </div>
  );
}