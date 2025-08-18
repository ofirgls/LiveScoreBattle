import React, { useState } from 'react';

const PredictionForm = ({ match, onSubmit, currentUser }) => {
  const [formData, setFormData] = useState({
    homeScore: '',
    awayScore: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await onSubmit({
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
    <div className="prediction-modal-overlay">
      <div className="prediction-modal">
        <div className="prediction-modal-header">
          <h3>ניחוש תוצאה - {match.homeTeam} vs {match.awayTeam}</h3>
          <button type="button" onClick={onClose} className="close-btn">✕</button>
        </div>
        
        {currentUser && (
          <div className="user-info-prediction">
            <p>מנחש: <strong>{currentUser.username}</strong></p>
          </div>
        )}
        
        {isMatchActive ? (
          <div className="match-active-message">
            <p>❌ לא ניתן לנחש על משחק זה - המשחק {match.status === 'FINISHED' ? 'הסתיים' : 'בשידור חי'}</p>
          </div>
        ) : (
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
      )}
      </div>
    </div>
  );
};

export default PredictionForm;
