const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');
require('dotenv').config();

// Sample predictions data
const samplePredictions = [
  // Match 1: מכבי תל אביב vs הפועל תל אביב (FINISHED: 2-1)
  {
    user: 'עומר_המקצוען',
    matchId: '1',
    homeScore: 2,
    awayScore: 1,
    matchInfo: {
      homeTeam: 'מכבי תל אביב',
      awayTeam: 'הפועל תל אביב',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  },
  {
    user: 'מיכל_המתחרה',
    matchId: '1',
    homeScore: 1,
    awayScore: 0,
    matchInfo: {
      homeTeam: 'מכבי תל אביב',
      awayTeam: 'הפועל תל אביב',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  },
  {
    user: 'דוד_המנצח',
    matchId: '1',
    homeScore: 2,
    awayScore: 1,
    matchInfo: {
      homeTeam: 'מכבי תל אביב',
      awayTeam: 'הפועל תל אביב',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  },

  // Match 2: בית"ר ירושלים vs מכבי חיפה (FINISHED: 0-2)
  {
    user: 'תמר_המתמטיקאית',
    matchId: '2',
    homeScore: 0,
    awayScore: 2,
    matchInfo: {
      homeTeam: 'בית"ר ירושלים',
      awayTeam: 'מכבי חיפה',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  },
  {
    user: 'יוסי_הכדורגלן',
    matchId: '2',
    homeScore: 1,
    awayScore: 1,
    matchInfo: {
      homeTeam: 'בית"ר ירושלים',
      awayTeam: 'מכבי חיפה',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  },
  {
    user: 'שרה_המנחשה',
    matchId: '2',
    homeScore: 0,
    awayScore: 1,
    matchInfo: {
      homeTeam: 'בית"ר ירושלים',
      awayTeam: 'מכבי חיפה',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  },

  // Match 3: הפועל באר שבע vs מכבי נתניה (FINISHED: 3-0)
  {
    user: 'דניאל_המאמן',
    matchId: '3',
    homeScore: 3,
    awayScore: 0,
    matchInfo: {
      homeTeam: 'הפועל באר שבע',
      awayTeam: 'מכבי נתניה',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  },
  {
    user: 'רון_הסטטיסטיקאי',
    matchId: '3',
    homeScore: 2,
    awayScore: 0,
    matchInfo: {
      homeTeam: 'הפועל באר שבע',
      awayTeam: 'מכבי נתניה',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  },
  {
    user: 'ליאור_האוהד',
    matchId: '3',
    homeScore: 1,
    awayScore: 1,
    matchInfo: {
      homeTeam: 'הפועל באר שבע',
      awayTeam: 'מכבי נתניה',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  },

  // Match 4: הפועל חיפה vs מכבי פתח תקווה (LIVE: 1-1)
  {
    user: 'נועה_החדשה',
    matchId: '4',
    homeScore: 1,
    awayScore: 1,
    matchInfo: {
      homeTeam: 'הפועל חיפה',
      awayTeam: 'מכבי פתח תקווה',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() + 30 * 60 * 1000)
    }
  },
  {
    user: 'עומר_המקצוען',
    matchId: '4',
    homeScore: 2,
    awayScore: 0,
    matchInfo: {
      homeTeam: 'הפועל חיפה',
      awayTeam: 'מכבי פתח תקווה',
      competition: 'ליגת העל',
      matchDate: new Date(Date.now() + 30 * 60 * 1000)
    }
  }
];

async function addSamplePredictions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing predictions (optional - comment out if you want to keep existing predictions)
    await Prediction.deleteMany({});
    console.log('Cleared existing predictions');

    // Add sample predictions
    const predictions = await Prediction.insertMany(samplePredictions);
    console.log(`✅ Added ${predictions.length} sample predictions successfully!`);

    // Display the predictions by match
    console.log('\n📊 Sample Predictions Added:');
    console.log('==========================');
    
    const predictionsByMatch = {};
    predictions.forEach(pred => {
      if (!predictionsByMatch[pred.matchId]) {
        predictionsByMatch[pred.matchId] = [];
      }
      predictionsByMatch[pred.matchId].push(pred);
    });

    Object.keys(predictionsByMatch).forEach(matchId => {
      const matchPreds = predictionsByMatch[matchId];
      const firstPred = matchPreds[0];
      
      console.log(`\n🏟️ Match ${matchId}: ${firstPred.matchInfo.homeTeam} vs ${firstPred.matchInfo.awayTeam}`);
      console.log(`   Status: ${matchId <= 3 ? 'FINISHED' : 'LIVE/SCHEDULED'}`);
      console.log(`   Predictions: ${matchPreds.length}`);
      
      matchPreds.forEach(pred => {
        console.log(`   - ${pred.user}: ${pred.homeScore}-${pred.awayScore}`);
      });
    });

    console.log('\n🎉 Sample predictions have been added!');
    console.log('The automatic scoring service will process finished matches every 5 minutes.');

  } catch (error) {
    console.error('❌ Error adding sample predictions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSamplePredictions();
