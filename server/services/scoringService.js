const User = require('../models/User');
const Prediction = require('../models/Prediction');

class ScoringService {
  // Calculate points for a prediction
  calculatePoints(predictedHome, predictedAway, actualHome, actualAway) {
    // Exact score: 10 points
    if (predictedHome === actualHome && predictedAway === actualAway) {
      return { points: 10, isExactScore: true, isCorrectResult: true };
    }
    
    // Correct result (win/draw/loss): 3 points
    const predictedResult = this.getResult(predictedHome, predictedAway);
    const actualResult = this.getResult(actualHome, actualAway);
    
    if (predictedResult === actualResult) {
      return { points: 3, isExactScore: false, isCorrectResult: true };
    }
    
    // Wrong prediction: 0 points
    return { points: 0, isExactScore: false, isCorrectResult: false };
  }

  getResult(homeScore, awayScore) {
    if (homeScore > awayScore) return 'home';
    if (awayScore > homeScore) return 'away';
    return 'draw';
  }

  // Score a match and update user statistics
  async scoreMatch(matchId, actualHomeScore, actualAwayScore) {
    try {
      // Get all predictions for this match
      const predictions = await Prediction.find({ matchId, isScored: false });
      
      for (const prediction of predictions) {
        // Calculate points
        const scoring = this.calculatePoints(
          prediction.homeScore,
          prediction.awayScore,
          actualHomeScore,
          actualAwayScore
        );

        // Update prediction with results
        prediction.points = scoring.points;
        prediction.isExactScore = scoring.isExactScore;
        prediction.isCorrectResult = scoring.isCorrectResult;
        prediction.actualHomeScore = actualHomeScore;
        prediction.actualAwayScore = actualAwayScore;
        prediction.isScored = true;
        
        await prediction.save();

        // Update user statistics
        await this.updateUserStats(prediction.user, scoring);
      }

      return predictions.length;
    } catch (error) {
      console.error('Error scoring match:', error);
      throw error;
    }
  }

  // Update user statistics
  async updateUserStats(username, scoring) {
    try {
      let user = await User.findOne({ username });
      
      if (!user) {
        // Create new user if doesn't exist
        user = new User({ username });
      }

      // Update statistics
      user.totalScore += scoring.points;
      user.totalPredictions += 1;
      
      if (scoring.isCorrectResult) {
        user.correctPredictions += 1;
      }
      
      if (scoring.isExactScore) {
        user.exactScorePredictions += 1;
      }
      
      user.lastActive = new Date();
      
      await user.save();
      
      return user;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 20) {
    try {
      const users = await User.find()
        .sort({ totalScore: -1, username: 1 })
        .limit(limit)
        .select('username totalScore totalPredictions correctPredictions exactScorePredictions lastActive');
      
      return users.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        totalScore: user.totalScore,
        totalPredictions: user.totalPredictions,
        correctPredictions: user.correctPredictions,
        exactScorePredictions: user.exactScorePredictions,
        accuracy: user.totalPredictions > 0 ? 
          Math.round((user.correctPredictions / user.totalPredictions) * 100) : 0,
        lastActive: user.lastActive
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(username) {
    try {
      const user = await User.findOne({ username });
      if (!user) return null;

      return {
        username: user.username,
        totalScore: user.totalScore,
        totalPredictions: user.totalPredictions,
        correctPredictions: user.correctPredictions,
        exactScorePredictions: user.exactScorePredictions,
        accuracy: user.totalPredictions > 0 ? 
          Math.round((user.correctPredictions / user.totalPredictions) * 100) : 0,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

module.exports = new ScoringService();
