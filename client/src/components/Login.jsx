import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', formData);
      const { user, token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      onLogin(user);
    } catch (error) {
      setError(error.response?.data?.error || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 התחברות</h2>
        <p className="auth-subtitle">התחבר כדי להשתתף במשחק</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">שם משתמש או אימייל:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="הכנס שם משתמש או אימייל"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">סיסמה:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="הכנס סיסמה"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>אין לך חשבון?</p>
          <button 
            onClick={onSwitchToRegister}
            className="auth-link"
          >
            הירשם עכשיו
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
