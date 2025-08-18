import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import MatchCard from './components/MatchCard';
import PredictionForm from './components/PredictionForm';
import PredictionsList from './components/PredictionsList';
import Leaderboard from './components/Leaderboard';
import ScoringInfo from './components/ScoringInfo';
import Login from './components/Login';
import Register from './components/Register';
import MatchesByCompetition from './components/MatchesByCompetition';
import UserProfile from './components/UserProfile';


const socket = io('http://localhost:5001');

function App() {
  const [matches, setMatches] = useState([]);
  const [matchesByCompetition, setMatchesByCompetition] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState('login'); // 'login' or 'register'
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showProfile, setShowProfile] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [showPredictionsList, setShowPredictionsList] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    fetchMatches();
    
    // Socket.IO event listeners
    socket.on('newPrediction', (prediction) => {
      if (selectedMatch && prediction.matchId === selectedMatch.id) {
        setPredictions(prev => {
          // Check if prediction already exists to avoid duplicates
          const exists = prev.some(p => p.id === prediction.id);
          if (!exists) {
            return [prediction, ...prev];
          }
          return prev;
        });
      }
    });

    socket.on('liveMatchesUpdate', (updatedMatches) => {
      setMatches(updatedMatches);
    });

    return () => {
      socket.off('newPrediction');
      socket.off('liveMatchesUpdate');
    };
  }, []); // Remove selectedMatch dependency

  // Separate useEffect for handling new predictions
  useEffect(() => {
    socket.on('newPrediction', (prediction) => {
      if (selectedMatch && prediction.matchId === selectedMatch.id) {
        setPredictions(prev => {
          // Check if prediction already exists to avoid duplicates
          const exists = prev.some(p => p.id === prediction.id);
          if (!exists) {
            return [prediction, ...prev];
          }
          return prev;
        });
      }
    });

    return () => {
      socket.off('newPrediction');
    };
  }, [selectedMatch]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const [liveResponse, upcomingResponse, allMatchesResponse] = await Promise.all([
        axios.get('/api/matches/live'),
        axios.get('/api/matches/upcoming'),
        axios.get('/api/matches/all')
      ]);
      
      const allMatches = [...liveResponse.data, ...upcomingResponse.data];
      setMatches(allMatches);
      setMatchesByCompetition(allMatchesResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = async (match) => {
    setSelectedMatch(match);
    setMessage(null);
    
    try {
      const response = await axios.get(`/api/predictions/${match.id}`);
      setPredictions(response.data);
      
      // Join the match room for real-time updates
      socket.emit('joinMatch', match.id);
      
      // Show prediction form modal
      setShowPredictionForm(true);
    } catch (err) {
      console.error('Error fetching predictions:', err);
    }
  };

  const handlePredictionSubmit = async (predictionData) => {
    if (!user) {
      setMessage({ type: 'error', text: 'עליך להתחבר כדי לשלוח ניחוש' });
      return;
    }

    try {
      const response = await axios.post('/api/predictions', {
        ...predictionData,
        matchId: selectedMatch.id,
        matchInfo: {
          homeTeam: selectedMatch.homeTeam,
          awayTeam: selectedMatch.awayTeam,
          competition: selectedMatch.competition,
          matchDate: selectedMatch.matchDate,
          status: selectedMatch.status
        }
      });
      
      setMessage({ type: 'success', text: 'ניחוש נשלח בהצלחה!' });
      // Don't add prediction manually - let Socket.IO handle it
      // Refresh predictions list if it's open
      if (showPredictionsList && selectedMatch) {
        handleRefreshPredictions();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage({ type: 'error', text: 'עליך להתחבר כדי לשלוח ניחוש' });
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.error || 'שגיאה בשליחת הניחוש' 
        });
      }
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth('login');
    setMessage({ type: 'success', text: 'התחברת בהצלחה!' });
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setShowAuth('login');
    setMessage({ type: 'success', text: 'נרשמת בהצלחה!' });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setMessage({ type: 'success', text: 'התנתקת בהצלחה' });
  };

  const handleRefreshPredictions = async () => {
    if (selectedMatch) {
      try {
        const response = await axios.get(`/api/predictions/${selectedMatch.id}`);
        setPredictions(response.data);
      } catch (err) {
        console.error('Error refreshing predictions:', err);
      }
    }
  };

  const handleViewPredictions = async (match) => {
    try {
      const response = await axios.get(`/api/predictions/${match.id}`);
      setPredictions(response.data);
      setSelectedMatch(match);
      setShowPredictionsList(true);
      
      // Join the match room for real-time updates
      socket.emit('joinMatch', match.id);
    } catch (err) {
      console.error('Error fetching predictions:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">טוען משחקים...</div>
      </div>
    );
  }

  // Show authentication if user is not logged in
  if (!user) {
    return (
      <div className="container">
        <div className="header">
          <h1>🏆 LiveScore Battle</h1>
          <p>ניחוש תוצאות כדורגל בזמן אמת בין חברים</p>
        </div>

        {showAuth === 'login' ? (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setShowAuth('register')}
          />
        ) : (
          <Register 
            onRegister={handleRegister}
            onSwitchToLogin={() => setShowAuth('login')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>🏆 LiveScore Battle</h1>
            <p>ניחוש תוצאות כדורגל בזמן אמת בין חברים</p>
          </div>
          <div className="user-info">
            <span className="user-greeting">שלום, {user.username}!</span>
            <div className="user-buttons">
              <button onClick={() => setShowProfile(true)} className="profile-btn">👤 פרופיל</button>
              <button onClick={handleLogout} className="logout-btn">התנתק</button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {message && (
        <div className={message.type}>
          {message.text}
        </div>
      )}

      <ScoringInfo />
      
      <Leaderboard socket={socket} />

      <MatchesByCompetition
        matchesByCompetition={matchesByCompetition}
        selectedMatch={selectedMatch}
        onSelectMatch={handleMatchSelect}
        onViewPredictions={handleViewPredictions}
        selectedCompetition={selectedCompetition}
        onSelectCompetition={setSelectedCompetition}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      {showPredictionForm && selectedMatch && (
        <PredictionForm
          match={selectedMatch}
          onSubmit={handlePredictionSubmit}
          currentUser={user}
          onClose={() => setShowPredictionForm(false)}
        />
      )}
      
      {showPredictionsList && selectedMatch && (
        <PredictionsList
          predictions={predictions}
          onRefresh={handleRefreshPredictions}
          match={selectedMatch}
          onClose={() => setShowPredictionsList(false)}
          currentUser={user}
          onSubmitPrediction={handlePredictionSubmit}
        />
      )}

      {showProfile && (
        <UserProfile 
          user={user} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </div>
  );
}

export default App;
