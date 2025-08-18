import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = ({ user, onClose }) => {
  const [userStats, setUserStats] = useState(null);
  const [userPredictions, setUserPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [statsResponse, predictionsResponse] = await Promise.all([
          axios.get(`/api/users/${user.username}/stats`),
          axios.get(`/api/users/${user.username}/predictions`)
        ]);
        
        setUserStats(statsResponse.data);
        setUserPredictions(predictionsResponse.data);
      } catch (err) {
        setError('שגיאה בטעינת נתוני המשתמש');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchStatusText = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'מתוכנן';
      case 'TIMED':
        return 'מתוכנן';
      case 'LIVE':
        return 'בשידור חי';
      case 'IN_PLAY':
        return 'בשידור חי';
      case 'FINISHED':
        return 'הסתיים';
      case 'PAUSED':
        return 'מושהה';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="profile-overlay">
        <div className="profile-modal">
          <div className="loading">טוען פרופיל...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-overlay">
        <div className="profile-modal">
          <div className="error">{error}</div>
          <button onClick={onClose} className="close-btn">סגור</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>👤 פרופיל משתמש - {user.username}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="profile-content">
          {/* User Statistics */}
          <div className="profile-section">
            <h3>📊 סטטיסטיקות</h3>
            {userStats ? (
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{userStats.totalScore}</span>
                  <span className="stat-label">ניקוד כולל</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.totalPredictions}</span>
                  <span className="stat-label">ניחושים</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.correctResults}</span>
                  <span className="stat-label">תוצאות נכונות</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.exactScores}</span>
                  <span className="stat-label">תוצאות מדויקות</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {userStats.totalPredictions > 0 
                      ? Math.round((userStats.correctResults / userStats.totalPredictions) * 100)
                      : 0}%
                  </span>
                  <span className="stat-label">אחוז הצלחה</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.rank || 'N/A'}</span>
                  <span className="stat-label">דירוג</span>
                </div>
              </div>
            ) : (
              <p>אין נתונים זמינים</p>
            )}
          </div>

          {/* Upcoming Predictions */}
          <div className="profile-section">
            <h3>🎯 ניחושים עתידיים</h3>
            {userPredictions.length > 0 ? (
              <div className="predictions-list">
                {userPredictions
                  .filter(prediction => 
                    prediction.matchInfo?.status === 'SCHEDULED' || 
                    prediction.matchInfo?.status === 'TIMED'
                  )
                  .map((prediction, index) => (
                    <div key={prediction._id || prediction.id || `upcoming-${index}`} className="prediction-item">
                      <div className="prediction-match">
                        <div className="match-teams">
                          {prediction.matchInfo?.homeTeam} vs {prediction.matchInfo?.awayTeam}
                        </div>
                        <div className="match-competition">
                          {prediction.matchInfo?.competition}
                        </div>
                        <div className="match-date">
                          {prediction.matchInfo?.matchDate ? formatDate(prediction.matchInfo.matchDate) : 'תאריך לא ידוע'}
                        </div>
                      </div>
                      <div className="prediction-score">
                        <span className="predicted-score">
                          {prediction.homeScore} - {prediction.awayScore}
                        </span>
                        <span className="prediction-time">
                          {formatDate(prediction.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>אין ניחושים עתידיים</p>
            )}
          </div>

          {/* Recent Predictions */}
          <div className="profile-section">
            <h3>📝 ניחושים אחרונים</h3>
            {userPredictions.length > 0 ? (
              <div className="predictions-list">
                {userPredictions
                  .slice(0, 5) // Show only last 5 predictions
                  .map((prediction, index) => (
                    <div key={prediction._id || prediction.id || `recent-${index}`} className="prediction-item">
                      <div className="prediction-match">
                        <div className="match-teams">
                          {prediction.matchInfo?.homeTeam} vs {prediction.matchInfo?.awayTeam}
                        </div>
                        <div className="match-status">
                          {prediction.matchInfo?.status ? getMatchStatusText(prediction.matchInfo.status) : 'לא ידוע'}
                        </div>
                      </div>
                      <div className="prediction-score">
                        <span className="predicted-score">
                          {prediction.homeScore} - {prediction.awayScore}
                        </span>
                        {prediction.points !== undefined && (
                          <span className={`prediction-points ${prediction.points > 0 ? 'positive' : 'neutral'}`}>
                            {prediction.points} נקודות
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>אין ניחושים</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
