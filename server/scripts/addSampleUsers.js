const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Sample users data
const sampleUsers = [
  {
    username: 'דוד_המנצח',
    totalScore: 87,
    totalPredictions: 15,
    correctPredictions: 12,
    exactScorePredictions: 3,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    username: 'שרה_המנחשה',
    totalScore: 76,
    totalPredictions: 18,
    correctPredictions: 14,
    exactScorePredictions: 2,
    lastActive: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    username: 'יוסי_הכדורגלן',
    totalScore: 65,
    totalPredictions: 12,
    correctPredictions: 10,
    exactScorePredictions: 1,
    lastActive: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  {
    username: 'מיכל_המתחרה',
    totalScore: 92,
    totalPredictions: 20,
    correctPredictions: 16,
    exactScorePredictions: 4,
    lastActive: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
  },
  {
    username: 'עומר_המקצוען',
    totalScore: 103,
    totalPredictions: 25,
    correctPredictions: 20,
    exactScorePredictions: 5,
    lastActive: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
  },
  {
    username: 'נועה_החדשה',
    totalScore: 34,
    totalPredictions: 8,
    correctPredictions: 6,
    exactScorePredictions: 0,
    lastActive: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
  },
  {
    username: 'דניאל_המאמן',
    totalScore: 78,
    totalPredictions: 16,
    correctPredictions: 13,
    exactScorePredictions: 2,
    lastActive: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
  },
  {
    username: 'ליאור_האוהד',
    totalScore: 45,
    totalPredictions: 10,
    correctPredictions: 8,
    exactScorePredictions: 1,
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
  },
  {
    username: 'תמר_המתמטיקאית',
    totalScore: 89,
    totalPredictions: 22,
    correctPredictions: 17,
    exactScorePredictions: 3,
    lastActive: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
  },
  {
    username: 'רון_הסטטיסטיקאי',
    totalScore: 71,
    totalPredictions: 14,
    correctPredictions: 11,
    exactScorePredictions: 2,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  }
];

async function addSampleUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Add sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Added ${users.length} sample users successfully!`);

    // Display the users
    console.log('\n📊 Sample Users Added:');
    console.log('=====================');
    
    const sortedUsers = users.sort((a, b) => b.totalScore - a.totalScore);
    sortedUsers.forEach((user, index) => {
      const accuracy = user.totalPredictions > 0 ? 
        Math.round((user.correctPredictions / user.totalPredictions) * 100) : 0;
      
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   ניקוד: ${user.totalScore} | ניחושים: ${user.totalPredictions} | דיוק: ${accuracy}%`);
      console.log(`   נכונים: ${user.correctPredictions} | מדויקים: ${user.exactScorePredictions}`);
      console.log('');
    });

    console.log('🎉 Sample users have been added to the database!');
    console.log('You can now view them in the leaderboard at http://localhost:5173');

  } catch (error) {
    console.error('❌ Error adding sample users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleUsers();
