import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = ({ socket }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    
    // Listen for leaderboard updates
    if (socket) {
      socket.on('leaderboardUpdate', (data) => {
        setLeaderboard(data);
      });
    }

    return () => {
      if (socket) {
        socket.off('leaderboardUpdate');
      }
    };
  }, [socket]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leaderboard');
      setLeaderboard(response.data);
      setError(null);
    } catch (err) {
      setError('שגיאה בטעינת טבלת הדירוג');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#ffd700';
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return '#667eea';
    }
  };

  if (loading) {
    return (
      <div className="leaderboard">
        <div className="leaderboard-header">
          <h3>🏆 טבלת הדירוג</h3>
          <button className="refresh-btn" onClick={fetchLeaderboard}>
            🔄 רענן
          </button>
        </div>
        <div className="loading">טוען טבלת דירוג...</div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3>🏆 טבלת הדירוג</h3>
        <div className="leaderboard-controls">
          <button 
            className="toggle-btn" 
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? '👁️ הסתר טבלה' : '📊 הצג טבלה'}
          </button>
          {isVisible && (
            <button className="refresh-btn" onClick={fetchLeaderboard}>
              🔄 רענן
            </button>
          )}
        </div>
      </div>

      {isVisible && (
        <>
          {error && <div className="error">{error}</div>}

          {leaderboard.length === 0 ? (
            <div className="no-leaderboard">
              עדיין אין משתתפים בטבלת הדירוג
            </div>
          ) : (
            <div className="leaderboard-table">
              <div className="leaderboard-row header">
                <div className="rank">דירוג</div>
                <div className="username">שם משתמש</div>
                <div className="score">ניקוד</div>
                <div className="stats">סטטיסטיקות</div>
                <div className="last-active">פעילות אחרונה</div>
              </div>
              
              {leaderboard.map((user) => (
                <div 
                  key={user.username} 
                  className="leaderboard-row"
                  style={{ borderLeftColor: getRankColor(user.rank) }}
                >
                  <div className="rank">
                    <span className="rank-icon">{getRankIcon(user.rank)}</span>
                    {user.rank > 3 && <span className="rank-number">#{user.rank}</span>}
                  </div>
                  <div className="username">{user.username}</div>
                  <div className="score">
                    <span className="score-value">{user.totalScore}</span>
                    <span className="score-label">נקודות</span>
                  </div>
                  <div className="stats">
                    <div className="stat-item">
                      <span className="stat-label">📊 ניחושים:</span>
                      <span className="stat-value">{user.totalPredictions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">✅ נכונים:</span>
                      <span className="stat-value">{user.correctPredictions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">🎯 דיוק:</span>
                      <span className="stat-value">{user.accuracy}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">🎯 מדויקים:</span>
                      <span className="stat-value">{user.exactScorePredictions}</span>
                    </div>
                  </div>
                  <div className="last-active">
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>⏰</span>
                    <br />
                    {formatDate(user.lastActive)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
