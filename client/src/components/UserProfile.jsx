import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

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

    // Socket.IO connection for real-time updates
    const socket = io();
    
    socket.on('userProfileUpdated', (updatedUser) => {
      if (updatedUser.username === user?.username) {
        setUserStats(prevStats => ({
          ...prevStats,
          totalScore: updatedUser.totalScore,
          totalPredictions: updatedUser.totalPredictions,
          correctPredictions: updatedUser.correctPredictions,
          exactScorePredictions: updatedUser.exactScorePredictions
        }));
        
        // Also refresh predictions to update the counts
        fetchUserData();
      }
    });

    socket.on('predictionUpdated', (updatedPrediction) => {
      if (updatedPrediction.username === user?.username) {
        // Refresh predictions to get updated data
        fetchUserData();
      }
    });

    socket.on('matchScored', () => {
      // Refresh data when a match is scored
      fetchUserData();
    });

    socket.on('matchResultUpdated', () => {
      // Refresh data when match status changes
      fetchUserData();
    });

    socket.on('allMatchesUpdate', () => {
      // Refresh data when matches are updated
      fetchUserData();
    });

    return () => {
      socket.disconnect();
    };
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
      case 'TIMED':
        return 'מתוכנן';
      case 'LIVE':
      case 'IN_PLAY':
        return 'שידור חי';
      case 'FINISHED':
      case 'PAUSED':
        return 'הסתיים';
      default:
        return status;
    }
  };

  const getMatchStatus = (prediction) => {
    // If prediction has status in matchInfo, use it
    if (prediction.matchInfo?.status) {
      return prediction.matchInfo.status;
    }
    
    // If prediction is scored, it means the match is finished
    if (prediction.isScored) {
      return 'FINISHED';
    }
    
    // For old predictions without status, assume they are scheduled
    // unless they have a matchDate in the past
    if (prediction.matchInfo?.matchDate) {
      const matchDate = new Date(prediction.matchInfo.matchDate);
      const now = new Date();
      if (matchDate < now) {
        return 'FINISHED';
      }
    }
    
    return 'TIMED'; // Default to scheduled
  };

  const getPredictionAccuracy = (prediction) => {
    if (!prediction.isScored || prediction.actualHomeScore === null || prediction.actualAwayScore === null) {
      return null;
    }

    const homeDiff = Math.abs(prediction.homeScore - prediction.actualHomeScore);
    const awayDiff = Math.abs(prediction.awayScore - prediction.actualAwayScore);
    const totalDiff = homeDiff + awayDiff;

    if (totalDiff === 0) {
      return { text: '🎯 מדויק לחלוטין', color: '#2ed573' };
    } else if (totalDiff === 1) {
      return { text: '🔥 קרוב מאוד', color: '#ffa502' };
    } else if (totalDiff === 2) {
      return { text: '👍 קרוב', color: '#ffa502' };
    } else if (totalDiff <= 4) {
      return { text: '😐 לא רחוק', color: '#ffa502' };
    } else {
      return { text: '😅 רחוק', color: '#ff4757' };
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
                  <span className="stat-label">סה"כ ניחושים</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.correctPredictions}</span>
                  <span className="stat-label">תוצאות נכונות</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.exactScorePredictions}</span>
                  <span className="stat-label">תוצאות מדויקות</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {userStats.totalPredictions > 0 
                      ? Math.round((userStats.correctPredictions / userStats.totalPredictions) * 100)
                      : 0}%
                  </span>
                  <span className="stat-label">אחוז הצלחה</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {userPredictions.filter(p => {
                      const status = getMatchStatus(p);
                      return (status === 'SCHEDULED' || status === 'TIMED') && !p.isScored;
                    }).length}
                  </span>
                  <span className="stat-label">ניחושים עתידיים</span>
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
                  .filter(prediction => {
                    const status = getMatchStatus(prediction);
                    return (status === 'SCHEDULED' || status === 'TIMED') && !prediction.isScored;
                  })
                  .sort((a, b) => new Date(a.matchInfo?.matchDate || 0) - new Date(b.matchInfo?.matchDate || 0))
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
                          ניחוש: {prediction.homeScore} - {prediction.awayScore}
                        </span>
                        <span className="prediction-time">
                          ניחש ב: {formatDate(prediction.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>אין ניחושים עתידיים</p>
            )}
          </div>

          {/* Live Predictions */}
          <div className="profile-section">
            <h3>🔴 ניחושים על משחקים בשידור חי</h3>
            {userPredictions.length > 0 ? (
              <div className="predictions-list">
                {userPredictions
                  .filter(prediction => {
                    const status = getMatchStatus(prediction);
                    return (status === 'LIVE' || status === 'IN_PLAY') && !prediction.isScored;
                  })
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((prediction, index) => (
                    <div key={prediction._id || prediction.id || `live-${index}`} className="prediction-item">
                      <div className="prediction-match">
                        <div className="match-teams">
                          {prediction.matchInfo?.homeTeam} vs {prediction.matchInfo?.awayTeam}
                        </div>
                        <div className="match-competition">
                          {prediction.matchInfo?.competition}
                        </div>
                        <div className="match-status">
                          <span className="live-indicator">🔴 שידור חי</span>
                        </div>
                      </div>
                      <div className="prediction-score">
                        <span className="predicted-score">
                          ניחוש: {prediction.homeScore} - {prediction.awayScore}
                        </span>
                        <span className="prediction-time">
                          ניחש ב: {formatDate(prediction.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>אין ניחושים על משחקים בשידור חי</p>
            )}
          </div>

          {/* Recent Predictions */}
          <div className="profile-section">
            <h3>📝 ניחושים אחרונים</h3>
            {userPredictions.length > 0 ? (
              <div className="predictions-list">
                {userPredictions
                  .filter(prediction => {
                    const status = getMatchStatus(prediction);
                    return prediction.isScored || status === 'FINISHED' || status === 'PAUSED';
                  })
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 10) // Show last 10 predictions
                  .map((prediction, index) => (
                    <div key={prediction._id || prediction.id || `recent-${index}`} className="prediction-item">
                      <div className="prediction-match">
                        <div className="match-teams">
                          {prediction.matchInfo?.homeTeam} vs {prediction.matchInfo?.awayTeam}
                        </div>
                        <div className="match-status">
                          {getMatchStatusText(getMatchStatus(prediction))}
                        </div>
                      </div>
                      <div className="prediction-scores">
                        <div className="score-comparison">
                          <span className="predicted-score">
                            ניחוש: {prediction.homeScore} - {prediction.awayScore}
                          </span>
                          {prediction.isScored && prediction.actualHomeScore !== null && prediction.actualAwayScore !== null && (
                            <span className="actual-score">
                              תוצאה: {prediction.actualHomeScore} - {prediction.actualAwayScore}
                            </span>
                          )}
                        </div>
                        <div className="prediction-result">
                          {prediction.isScored ? (
                            <div className="result-details">
                              {prediction.points !== undefined && (
                                <span className={`prediction-points ${prediction.points > 0 ? 'positive' : 'neutral'}`}>
                                  {prediction.points} נקודות
                                </span>
                              )}
                              {prediction.isExactScore && (
                                <span className="result-badge exact">🎯 תוצאה מדויקת</span>
                              )}
                              {prediction.isCorrectResult && !prediction.isExactScore && (
                                <span className="result-badge correct">✅ תוצאה נכונה</span>
                              )}
                              {!prediction.isCorrectResult && (
                                <span className="result-badge wrong">❌ תוצאה שגויה</span>
                              )}
                              {getPredictionAccuracy(prediction) && (
                                <span 
                                  className="accuracy-badge"
                                  style={{ color: getPredictionAccuracy(prediction).color }}
                                >
                                  {getPredictionAccuracy(prediction).text}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="pending-result">⏳ ממתין לתוצאה</span>
                          )}
                        </div>
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
