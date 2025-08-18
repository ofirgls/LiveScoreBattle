require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Prediction = require('./models/Prediction');
const User = require('./models/User');
const footballApi = require('./services/footballApi');
const scoringService = require('./services/scoringService');
const autoScoringService = require('./services/autoScoringService');
const matchEventListener = require('./services/matchEventListener');
const authService = require('./services/authService');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://your-app-name.onrender.com", "http://localhost:5173"]
      : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/matches/live', async (req, res) => {
  try {
    const matches = await footballApi.getLiveMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live matches' });
  }
});

app.get('/api/matches/upcoming', async (req, res) => {
  try {
    const matches = await footballApi.getUpcomingMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming matches' });
  }
});

// Get all matches grouped by competition
app.get('/api/matches/all', async (req, res) => {
  try {
    const matches = await footballApi.getAllMatches();
    
    // Group matches by competition
    const matchesByCompetition = matches.reduce((acc, match) => {
      const competition = match.competition;
      if (!acc[competition]) {
        acc[competition] = [];
      }
      acc[competition].push(match);
      return acc;
    }, {});
    
    // Sort competitions by number of matches
    const sortedCompetitions = Object.entries(matchesByCompetition)
      .sort(([,a], [,b]) => b.length - a.length)
      .reduce((acc, [competition, matches]) => {
        acc[competition] = matches.sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
        return acc;
      }, {});
    
    res.json(sortedCompetitions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get competitions
app.get('/api/competitions', async (req, res) => {
  try {
    const competitions = await footballApi.getCompetitions();
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

app.get('/api/predictions/:matchId', async (req, res) => {
  try {
    const predictions = await Prediction.find({ matchId: req.params.matchId })
      .sort({ createdAt: -1 });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

app.post('/api/predictions', authenticateToken, async (req, res) => {
  try {
    const { matchId, homeScore, awayScore, matchInfo } = req.body;
    const user = req.user.username; // Get username from authenticated user
    
    // Validate input
    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if match is active (live, in play, finished, or paused)
    const activeStatuses = ['LIVE', 'IN_PLAY', 'FINISHED', 'PAUSED'];
    if (matchInfo && activeStatuses.includes(matchInfo.status)) {
      return res.status(400).json({ 
        error: `לא ניתן לנחש על משחק ${matchInfo.status === 'FINISHED' ? 'שהסתיים' : 'בשידור חי'}` 
      });
    }

    // Check if user already predicted this match
    const existingPrediction = await Prediction.findOne({ user, matchId });
    if (existingPrediction) {
      return res.status(400).json({ error: 'כבר ניחשת את המשחק הזה' });
    }

    // Create new prediction
    const prediction = new Prediction({
      user,
      matchId,
      homeScore,
      awayScore,
      matchInfo
    });

    await prediction.save();

    // Emit to all connected clients
    io.emit('newPrediction', prediction);

    res.status(201).json(prediction);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'כבר ניחשת את המשחק הזה' });
    }
    res.status(500).json({ error: 'שגיאה בשליחת הניחוש' });
  }
});

// Leaderboard endpoints
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const leaderboard = await scoringService.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/api/users/:username/stats', async (req, res) => {
  try {
    const stats = await scoringService.getUserStats(req.params.username);
    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

app.get('/api/users/:username/predictions', async (req, res) => {
  try {
    const predictions = await Prediction.find({ user: req.params.username })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user predictions' });
  }
});

// Admin endpoint to score a match (for testing)
app.post('/api/matches/:matchId/score', async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body;
    const matchId = parseInt(req.params.matchId);
    
    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: 'Missing homeScore or awayScore' });
    }

    const scoredCount = await scoringService.scoreMatch(matchId, homeScore, awayScore);
    
    // Emit leaderboard update
    const leaderboard = await scoringService.getLeaderboard();
    io.emit('leaderboardUpdate', leaderboard);
    
    res.json({ 
      message: `Match scored successfully. ${scoredCount} predictions processed.`,
      scoredCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to score match' });
  }
});

// Get match event listener status
app.get('/api/system/status', async (req, res) => {
  try {
    const eventListenerStatus = matchEventListener.getStatus();
    const autoScoringStatus = autoScoringService.getStatus();
    
    res.json({
      eventListener: eventListenerStatus,
      autoScoring: autoScoringStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

// Force manual check for match status changes
app.post('/api/system/force-check', async (req, res) => {
  try {
    await matchEventListener.forceCheck();
    res.json({ message: 'Manual check completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform manual check' });
  }
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'כל השדות נדרשים' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'הסיסמה חייבת להיות לפחות 6 תווים' });
    }

    const result = await authService.register({ username, email, password });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'שם משתמש וסיסמה נדרשים' });
    }

    const result = await authService.login({ username, password });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinMatch', (matchId) => {
    socket.join(`match-${matchId}`);
    console.log(`User ${socket.id} joined match ${matchId}`);
  });

  socket.on('leaveMatch', (matchId) => {
    socket.leave(`match-${matchId}`);
    console.log(`User ${socket.id} left match ${matchId}`);
  });

      socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Send initial leaderboard
    socket.on('getLeaderboard', async () => {
      try {
        const leaderboard = await scoringService.getLeaderboard();
        socket.emit('leaderboardUpdate', leaderboard);
      } catch (error) {
        console.error('Error sending leaderboard:', error);
      }
    });
});

// Update live matches every 30 seconds
setInterval(async () => {
  try {
    const liveMatches = await footballApi.getLiveMatches();
    io.emit('liveMatchesUpdate', liveMatches);
    
    // Also update all matches to include demo match status changes
    const allMatches = await footballApi.getAllMatches();
    io.emit('allMatchesUpdate', allMatches);
  } catch (error) {
    console.error('Error updating live matches:', error);
  }
}, 30000);

// Serve static files from the React build (must be after all API routes)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB connected: ${mongoose.connection.host}`);
  
  // Start automatic scoring service
  autoScoringService.start();
  
  // Start smart match event listener
  matchEventListener.start();
});
