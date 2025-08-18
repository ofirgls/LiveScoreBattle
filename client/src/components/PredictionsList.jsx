import React, { useState } from 'react';

const PredictionsList = ({ predictions, onRefresh, match, onClose, currentUser, onSubmitPrediction }) => {
  const [formData, setFormData] = useState({
    homeScore: '',
    awayScore: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('עליך להתחבר כדי לשלוח ניחוש');
      return;
    }

    if (formData.homeScore === '' || formData.awayScore === '') {
      alert('אנא הכנס תוצאה לשני הקבוצות');
      return;
    }

    const homeScore = parseInt(formData.homeScore);
    const awayScore = parseInt(formData.awayScore);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      alert('אנא הכנס מספרים חיוביים בלבד');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmitPrediction({
        homeScore,
        awayScore
      });
      
      // Reset form
      setFormData({
        homeScore: '',
        awayScore: ''
      });
    } catch (error) {
      console.error('Error submitting prediction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if match is live or finished
  const isMatchActive = match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'FINISHED' || match.status === 'PAUSED';

  return (
    <div className="predictions-modal-overlay">
      <div className="predictions-modal">
        <div className="predictions-modal-header">
          <h3 className="predictions-title">
            ניחושים - {match.homeTeam} vs {match.awayTeam}
          </h3>
          <div className="predictions-header-buttons">
            <button 
              className="refresh-btn"
              onClick={onRefresh}
            >
              🔄 רענן
            </button>
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
        </div>

        <div className="predictions-content">
          {/* Prediction Form Section */}
          {!isMatchActive && currentUser && (
            <div className="prediction-form-section">
              <h4>🎯 שלח ניחוש</h4>
              <div className="user-info-prediction">
                <p>מנחש: <strong>{currentUser.username}</strong></p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>תוצאה צפויה:</label>
                  <div className="teams-labels">
                    <span className="team-label">{match.homeTeam}</span>
                    <span className="team-label">{match.awayTeam}</span>
                  </div>
                  <div className="form-row">
                    <input
                      type="number"
                      name="homeScore"
                      value={formData.homeScore}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="score-input"
                      required
                    />
                    <input
                      type="number"
                      name="awayScore"
                      value={formData.awayScore}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="score-input"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שולח...' : 'שלח ניחוש'}
                </button>
              </form>
            </div>
          )}

          {isMatchActive && (
            <div className="match-active-message">
              <p>❌ לא ניתן לנחש על משחק זה - המשחק {match.status === 'FINISHED' ? 'הסתיים' : 'בשידור חי'}</p>
            </div>
          )}

          {/* Predictions List Section */}
          <div className="predictions-list-section">
            <h4>👥 ניחושים של משתמשים</h4>
            {predictions.length === 0 ? (
              <div className="no-predictions">
                עדיין אין ניחושים למשחק זה. היה הראשון!
              </div>
            ) : (
              <div className="predictions-items">
                {predictions.map((prediction, index) => (
                  <div key={prediction._id || index} className="prediction-item">
                    <div>
                      <span className="prediction-user">{prediction.user}</span>
                      <div className="prediction-time">
                        {formatTime(prediction.createdAt)}
                      </div>
                    </div>
                    <div className="prediction-score">
                      {prediction.homeScore} - {prediction.awayScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsList;
