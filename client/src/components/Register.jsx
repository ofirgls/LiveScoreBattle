import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return false;
    }
    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להיות לפחות 6 תווים');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('אנא הכנס אימייל תקין');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      const { user, token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      onRegister(user);
    } catch (error) {
      setError(error.response?.data?.error || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📝 הרשמה</h2>
        <p className="auth-subtitle">צור חשבון חדש כדי להשתתף במשחק</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">שם משתמש:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="הכנס שם משתמש"
              minLength="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">אימייל:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="הכנס אימייל"
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
              placeholder="הכנס סיסמה (לפחות 6 תווים)"
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">אימות סיסמה:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="הכנס סיסמה שוב"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'נרשם...' : 'הירשם'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>יש לך כבר חשבון?</p>
          <button 
            onClick={onSwitchToLogin}
            className="auth-link"
          >
            התחבר עכשיו
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
