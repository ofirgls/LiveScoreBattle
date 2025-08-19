const footballApi = require('./footballApi');
const autoScoringService = require('./autoScoringService');

class MatchEventListener {
  constructor() {
    this.isRunning = false;
    this.matchStatuses = new Map(); // Store current match statuses
    this.checkInterval = null;
    this.lastCheckTime = null;
  }

  // Start the event listener
  start() {
    if (this.isRunning) {
      console.log('Match event listener is already running');
      return;
    }

    console.log('🎧 Starting smart match event listener...');
    this.isRunning = true;

    // Initial check to populate current statuses
    this.initializeMatchStatuses();

    // Check every 2 minutes for new matches or status changes
    this.checkInterval = setInterval(async () => {
      await this.checkForStatusChanges();
    }, 2 * 60 * 1000); // 2 minutes
  }

  // Stop the event listener
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Match event listener stopped');
  }

  // Initialize match statuses on startup
  async initializeMatchStatuses() {
    try {
      console.log('🔍 Initializing match statuses...');
      const matches = await footballApi.getLiveMatches();
      
      matches.forEach(match => {
        this.matchStatuses.set(match.id, {
          status: match.status,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          lastUpdate: new Date()
        });
      });

      console.log(`📊 Initialized ${this.matchStatuses.size} match statuses`);
      this.lastCheckTime = new Date();

    } catch (error) {
      console.error('❌ Error initializing match statuses:', error);
    }
  }

  // Check for status changes in matches
  async checkForStatusChanges() {
    try {
      const matches = await footballApi.getLiveMatches();
      let statusChanges = 0;
      let finishedMatches = [];



      // Handle matches
      matches.forEach(match => {
        
        const currentStatus = this.matchStatuses.get(match.id);
        
        if (!currentStatus) {
          // New match found
          console.log(`🆕 New match detected: ${match.homeTeam} vs ${match.awayTeam} (${match.status})`);
          this.matchStatuses.set(match.id, {
            status: match.status,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            lastUpdate: new Date()
          });
          return;
        }

        // Check for status change
        if (currentStatus.status !== match.status) {
          console.log(`🔄 Status change detected for match ${match.id}: ${currentStatus.status} → ${match.status}`);
          
          if (match.status === 'FINISHED') {
            finishedMatches.push(match);
            console.log(`🏁 Match finished: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`);
          }
          
          statusChanges++;
        }

        // Update current status
        this.matchStatuses.set(match.id, {
          status: match.status,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          lastUpdate: new Date()
        });
      });

      // Process finished matches immediately
      if (finishedMatches.length > 0) {
        console.log(`🎯 Processing ${finishedMatches.length} finished matches...`);
        for (const match of finishedMatches) {
          console.log(`🏁 Scoring match: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`);
          await autoScoringService.scoreMatchIfNotScored(match);
        }
      }

      this.lastCheckTime = new Date();

      if (statusChanges > 0) {
        console.log(`📈 Processed ${statusChanges} status changes`);
      }

    } catch (error) {
      console.error('❌ Error checking for status changes:', error);
    }
  }

  // Get current status of all matches
  getMatchStatuses() {
    return Array.from(this.matchStatuses.entries()).map(([id, status]) => ({
      matchId: id,
      ...status
    }));
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      activeMatches: this.matchStatuses.size
    };
  }

  // Force check for status changes (for manual triggers)
  async forceCheck() {
    console.log('🔍 Manual status check triggered...');
    await this.checkForStatusChanges();
  }
}

module.exports = new MatchEventListener();
