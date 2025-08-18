const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const { username, email, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error('שם משתמש כבר קיים במערכת');
        }
        if (existingUser.email === email) {
          throw new Error('אימייל כבר קיים במערכת');
        }
      }

      // Create new user
      const user = new User({
        username,
        email,
        password
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Return user data without password
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        totalScore: user.totalScore,
        totalPredictions: user.totalPredictions,
        correctPredictions: user.correctPredictions,
        exactScorePredictions: user.exactScorePredictions,
        createdAt: user.createdAt
      };

      return { user: userResponse, token };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const { username, password } = credentials;

      // Find user by username or email
      const user = await User.findOne({
        $or: [
          { username: username },
          { email: username }
        ]
      });

      if (!user) {
        throw new Error('שם משתמש או סיסמה שגויים');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('שם משתמש או סיסמה שגויים');
      }

      // Update last active
      user.lastActive = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Return user data without password
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        totalScore: user.totalScore,
        totalPredictions: user.totalPredictions,
        correctPredictions: user.correctPredictions,
        exactScorePredictions: user.exactScorePredictions,
        createdAt: user.createdAt
      };

      return { user: userResponse, token };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('משתמש לא נמצא');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
