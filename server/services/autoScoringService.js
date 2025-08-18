const Prediction = require('../models/Prediction');
const User = require('../models/User');
const footballApi = require('./footballApi');

class AutoScoringService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
  }

  // Start automatic scoring service
  start() {
    if (this.isRunning) {
      console.log('Auto scoring service is already running');
      return;
    }

    console.log('🚀 Starting automatic scoring service...');
    this.isRunning = true;

    // Note: This service is now controlled by the MatchEventListener
    // No need for interval checks here
  }

  // Stop automatic scoring service
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Automatic scoring service stopped');
  }

  // Check for match status changes and score newly finished matches
  async checkForMatchEndings() {
    try {
      // Get all matches from API
      const matches = await footballApi.getLiveMatches();
      const finishedMatches = matches.filter(match => match.status === 'FINISHED');
      
      // Check each finished match
      for (const match of finishedMatches) {
        await this.scoreMatchIfNotScored(match);
      }

    } catch (error) {
      console.error('❌ Error checking for match endings:', error);
    }
  }

  // Check for finished matches and score them (legacy method)
  async checkAndScoreFinishedMatches() {
    try {
      console.log('🔍 Checking for finished matches...');
      
      // Get all matches from API
      const matches = await footballApi.getLiveMatches();
      const finishedMatches = matches.filter(match => match.status === 'FINISHED');
      
      console.log(`Found ${finishedMatches.length} finished matches`);

      for (const match of finishedMatches) {
        await this.scoreMatchIfNotScored(match);
      }

    } catch (error) {
      console.error('❌ Error in automatic scoring check:', error);
    }
  }

  // Score a match if it hasn't been scored yet
  async scoreMatchIfNotScored(match) {
    try {
      // Check if this match has already been scored
      const existingPredictions = await Prediction.find({ 
        matchId: match.id,
        isScored: true 
      });

      if (existingPredictions.length > 0) {
        return; // Already scored, no need to log
      }

      // Check if there are any predictions for this match
      const predictions = await Prediction.find({ 
        matchId: match.id,
        isScored: false 
      });

      if (predictions.length === 0) {
        return; // No predictions, no need to log
      }

      console.log(`🎯 משחק הסתיים! ניקוד אוטומטי למשחק ${match.id}: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`);

      // Score all predictions for this match
      let scoredCount = 0;
      for (const prediction of predictions) {
        const points = this.calculatePoints(
          prediction.homeScore,
          prediction.awayScore,
          match.homeScore,
          match.awayScore
        );

        // Update prediction
        prediction.points = points;
        prediction.isExactScore = this.isExactScore(
          prediction.homeScore,
          prediction.awayScore,
          match.homeScore,
          match.awayScore
        );
        prediction.isCorrectResult = this.isCorrectResult(
          prediction.homeScore,
          prediction.awayScore,
          match.homeScore,
          match.awayScore
        );
        prediction.actualHomeScore = match.homeScore;
        prediction.actualAwayScore = match.awayScore;
        prediction.isScored = true;

        await prediction.save();

        // Update user statistics
        await this.updateUserStats(prediction.user, points, prediction.isExactScore, prediction.isCorrectResult);
        
        scoredCount++;
      }

      console.log(`✅ ניקוד הושלם! ${scoredCount} ניחושים קיבלו נקודות למשחק ${match.id}`);

    } catch (error) {
      console.error(`❌ שגיאה בניקוד משחק ${match.id}:`, error);
    }
  }

  // Calculate points for a prediction
  calculatePoints(predHome, predAway, actualHome, actualAway) {
    if (predHome === actualHome && predAway === actualAway) {
      return 10; // Exact score
    } else if (this.isCorrectResult(predHome, predAway, actualHome, actualAway)) {
      return 3; // Correct result
    } else {
      return 0; // Wrong prediction
    }
  }

  // Check if prediction has exact score
  isExactScore(predHome, predAway, actualHome, actualAway) {
    return predHome === actualHome && predAway === actualAway;
  }

  // Check if prediction has correct result (win/draw/loss)
  isCorrectResult(predHome, predAway, actualHome, actualAway) {
    const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
    const actualResult = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw';
    return predResult === actualResult;
  }

  // Update user statistics
  async updateUserStats(username, points, isExactScore, isCorrectResult) {
    try {
      let user = await User.findOne({ username });
      
      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          username,
          totalScore: 0,
          totalPredictions: 0,
          correctPredictions: 0,
          exactScorePredictions: 0
        });
      }

      // Update statistics
      user.totalScore += points;
      user.totalPredictions += 1;
      user.lastActive = new Date();

      if (isExactScore) {
        user.exactScorePredictions += 1;
        user.correctPredictions += 1;
      } else if (isCorrectResult) {
        user.correctPredictions += 1;
      }

      await user.save();
      
      // Log only significant updates (points > 0)
      if (points > 0) {
        console.log(`📊 ${username} קיבל ${points} נקודות! (${isExactScore ? 'תוצאה מדויקת' : 'תוצאה נכונה'})`);
      }

    } catch (error) {
      console.error(`❌ Error updating stats for ${username}:`, error);
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheckTime
    };
  }
}

module.exports = new AutoScoringService();
