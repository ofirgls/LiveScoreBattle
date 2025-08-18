import React from 'react';

const MatchCard = ({ match, isSelected, onSelect, onViewPredictions }) => {
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

  const getStatusText = (status) => {
    switch (status) {
      case 'LIVE':
        return 'בשידור חי';
      case 'SCHEDULED':
        return 'מתוכנן';
      case 'FINISHED':
        return 'הסתיים';
      case 'PAUSED':
        return 'מושהה';
      case 'IN_PLAY':
        return 'בשידור חי';
      default:
        return status;
    }
  };

  // Check if match is active (live, finished, paused)
  const isMatchActive = match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'FINISHED' || match.status === 'PAUSED';

  return (
    <div 
      className={`match-card ${isSelected ? 'selected' : ''}`}
      style={{ cursor: isMatchActive ? 'default' : 'pointer' }}
    >
      <div className="match-card-content" onClick={isMatchActive ? undefined : onSelect}>
      <div className="match-header">
        <span className="competition">{match.competition}</span>
        <span className={`status ${match.status.toLowerCase()}`}>
          {getStatusText(match.status)}
        </span>
      </div>

      <div className="teams">
        <div className="team-names">
          {match.homeTeam} vs {match.awayTeam}
        </div>
        
        {(match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'FINISHED' || match.status === 'PAUSED') && 
         match.homeScore !== null && match.awayScore !== null ? (
          <>
            <div className="score">
              {match.homeScore} - {match.awayScore}
            </div>
            {match.status === 'LIVE' || match.status === 'IN_PLAY' ? (
              match.minute && match.minute > 0 ? (
                <div className="minute">
                  דקה {match.minute}'
                </div>
              ) : null
            ) : (
              <div className="match-date">
                {formatDate(match.matchDate)}
              </div>
            )}
          </>
        ) : (
          <div className="match-date">
            {match.status === 'SCHEDULED' || match.status === 'TIMED' ? formatDate(match.matchDate) : ''}
          </div>
        )}
      </div>
    </div>
      
          {!(match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'FINISHED' || match.status === 'PAUSED') && (
        <div className="match-card-actions">
          <button 
            className="view-predictions-btn"
            onClick={(e) => {
              e.stopPropagation();
              onViewPredictions(match);
            }}
          >
            👥 ניחושים
          </button>
        </div>
      )}
  </div>
  );
};

export default MatchCard;
