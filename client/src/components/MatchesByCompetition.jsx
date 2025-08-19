import React from 'react';
import MatchCard from './MatchCard';

const MatchesByCompetition = ({ 
  matchesByCompetition, 
  selectedMatch, 
  onSelectMatch, 
  onViewPredictions,
  selectedCompetition, 
  onSelectCompetition,
  selectedStatus,
  onSelectStatus
}) => {
  const competitions = Object.keys(matchesByCompetition);
  
  const getCompetitionIcon = (competition) => {
    const icons = {
      'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Primera Division': '🇪🇸',
      'Bundesliga': '🇩🇪',
      'Serie A': '🇮🇹',
      'Ligue 1': '🇫🇷',
      'UEFA Champions League': '🏆',
      'UEFA Europa League': '🏆',
      'Primeira Liga': '🇵🇹',
      'Eredivisie': '🇳🇱',
      'Championship': '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    };
    return icons[competition] || '⚽';
  };

  const getCompetitionColor = (competition) => {
    const colors = {
      'Premier League': '#3D195B',
      'Primera Division': '#FF6B35',
      'Bundesliga': '#D20515',
      'Serie A': '#008FD7',
      'Ligue 1': '#091C3E',
      'UEFA Champions League': '#FFD700',
      'UEFA Europa League': '#FF6B35',
      'Primeira Liga': '#006F42',
      'Eredivisie': '#FF6B35',
      'Championship': '#3D195B'
    };
    return colors[competition] || '#667eea';
  };

  const filterMatchesByStatus = (matches, status) => {
    if (status === 'all') return matches;
    
    return matches.filter(match => {
      switch (status) {
        case 'live':
          return match.status === 'LIVE' || match.status === 'IN_PLAY';
        case 'finished':
          return match.status === 'FINISHED' || match.status === 'PAUSED';
        case 'upcoming':
          return match.status === 'SCHEDULED' || match.status === 'TIMED';
        default:
          return true;
      }
    });
  };

  const filteredMatches = selectedCompetition === 'all' 
    ? matchesByCompetition 
    : { [selectedCompetition]: matchesByCompetition[selectedCompetition] || [] };

  // Apply status filter to all competitions
  const statusFilteredMatches = {};
  Object.entries(filteredMatches).forEach(([competition, matches]) => {
    const filtered = filterMatchesByStatus(matches, selectedStatus);
    if (filtered.length > 0) {
      statusFilteredMatches[competition] = filtered;
    }
  });

  return (
    <div className="matches-by-competition">
      {/* Status Filter */}
      <div className="status-filter">
        <h3>📊 סנן לפי סטטוס:</h3>
        <div className="status-buttons">
          <button
            className={`status-btn ${selectedStatus === 'all' ? 'active' : ''}`}
            onClick={() => onSelectStatus('all')}
          >
            🌍 כל המשחקים
          </button>
          <button
            className={`status-btn ${selectedStatus === 'live' ? 'active' : ''}`}
            onClick={() => onSelectStatus('live')}
          >
            🔴 שידור חי
          </button>
          <button
            className={`status-btn ${selectedStatus === 'upcoming' ? 'active' : ''}`}
            onClick={() => onSelectStatus('upcoming')}
          >
            ⏰ עתידיים
          </button>
          <button
            className={`status-btn ${selectedStatus === 'finished' ? 'active' : ''}`}
            onClick={() => onSelectStatus('finished')}
          >
            ✅ הסתיימו
          </button>
        </div>
      </div>

      {/* Competition Filter */}
      <div className="competition-filter">
        <h3>🏆 בחר ליגה:</h3>
        <div className="competition-buttons">
          <button
            className={`competition-btn ${selectedCompetition === 'all' ? 'active' : ''}`}
            onClick={() => onSelectCompetition('all')}
          >
            🌍 כל הליגות
          </button>
          {competitions.map(competition => (
            <button
              key={competition}
              className={`competition-btn ${selectedCompetition === competition ? 'active' : ''}`}
              onClick={() => onSelectCompetition(competition)}
              style={{
                borderLeftColor: getCompetitionColor(competition)
              }}
            >
              {getCompetitionIcon(competition)} {competition}
            </button>
          ))}
        </div>
      </div>

      {/* Matches by Competition */}
      {Object.entries(statusFilteredMatches).map(([competition, matches]) => (
        <div key={competition} className="competition-section">
          <div 
            className="competition-header"
            style={{ borderLeftColor: getCompetitionColor(competition) }}
          >
            <h3>
              {getCompetitionIcon(competition)} {competition}
            </h3>
            <span className="match-count">{matches.length} משחקים</span>
          </div>
          
          <div className="matches-grid">
            {matches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                isSelected={selectedMatch?.id === match.id}
                onSelect={() => onSelectMatch(match)}
                onViewPredictions={onViewPredictions}
              />
            ))}
          </div>
        </div>
      ))}

      {Object.keys(statusFilteredMatches).length === 0 && (
        <div className="no-matches">
          <p>אין משחקים זמינים עם הסינון הנוכחי</p>
        </div>
      )}
    </div>
  );
};

export default MatchesByCompetition;
