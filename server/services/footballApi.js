const axios = require('axios');

class FootballApiService {
  constructor() {
    this.apiKey = process.env.API_KEY;
    this.baseUrl = process.env.API_BASE_URL || 'https://api.football-data.org/v4';
    this.freeApiUrl = 'https://api.football-data.org/v4';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Auth-Token': this.apiKey
      }
    });
    
    // Track last log time to avoid spam
    this.lastLogTime = {
      live: 0,
      upcoming: 0,
      all: 0
    };
    this.logInterval = 30000; // 30 seconds between logs
  }

  async getLiveMatches() {
    try {
      // Get all matches and filter for live ones
      const response = await axios.get('https://api.football-data.org/v4/matches', {
        headers: {
          'X-Auth-Token': '1ec51693e261492cb31f2ae3146781b3'
        }
      });
      
      if (response.data && response.data.matches && response.data.matches.length > 0) {
        const liveMatches = response.data.matches.filter(match => 
          match.status === 'LIVE' || match.status === 'IN_PLAY'
        );
        
        if (liveMatches.length > 0) {
          console.log(`✅ Successfully fetched ${liveMatches.length} live matches from football-data.org`);
          console.log(`📊 Sample match: ${liveMatches[0].homeTeam.name} vs ${liveMatches[0].awayTeam.name} (${liveMatches[0].status})`);
          return this.formatMatches(liveMatches);
        }
      }
      
      // Only log if enough time has passed since last log
      const now = Date.now();
      if (now - this.lastLogTime.live > this.logInterval) {
        console.log('⚠️ No live matches available from football-data.org');
        this.lastLogTime.live = now;
      }
      return [];
    } catch (error) {
      console.error('Error fetching live matches:', error.message);
      return [];
    }
  }

  async getUpcomingMatches() {
    try {
      // Get all matches and filter for upcoming ones
      const response = await axios.get('https://api.football-data.org/v4/matches', {
        headers: {
          'X-Auth-Token': '1ec51693e261492cb31f2ae3146781b3'
        }
      });
      
      if (response.data && response.data.matches && response.data.matches.length > 0) {
        const upcomingMatches = response.data.matches.filter(match => 
          match.status === 'SCHEDULED' || match.status === 'TIMED'
        );
        
        if (upcomingMatches.length > 0) {
          console.log(`✅ Successfully fetched ${upcomingMatches.length} upcoming matches from football-data.org`);
          console.log(`📊 Sample match: ${upcomingMatches[0].homeTeam.name} vs ${upcomingMatches[0].awayTeam.name} (${upcomingMatches[0].status})`);
          return this.formatMatches(upcomingMatches);
        }
      }
      
      // Only log if enough time has passed since last log
      const now = Date.now();
      if (now - this.lastLogTime.upcoming > this.logInterval) {
        console.log('⚠️ No upcoming matches available from football-data.org');
        this.lastLogTime.upcoming = now;
      }
      return [];
    } catch (error) {
      console.error('Error fetching upcoming matches:', error.message);
      return [];
    }
  }

  async getAllMatches() {
    try {
      // Get matches from football-data.org v4 API with auth token - exactly like Postman
      const response = await axios.get('https://api.football-data.org/v4/matches', {
        headers: {
          'X-Auth-Token': '1ec51693e261492cb31f2ae3146781b3'
        }
      });
      
      if (response.data && response.data.matches && response.data.matches.length > 0) {
        console.log(`✅ Successfully fetched ${response.data.matches.length} matches from football-data.org`);
        console.log(`📊 Sample match: ${response.data.matches[0].homeTeam.name} vs ${response.data.matches[0].awayTeam.name} (${response.data.matches[0].status})`);
        return this.formatMatches(response.data.matches);
      }
      
      // Only log if enough time has passed since last log
      const now = Date.now();
      if (now - this.lastLogTime.all > this.logInterval) {
        console.log('⚠️ No matches available from football-data.org');
        this.lastLogTime.all = now;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all matches:', error.message);
      return [];
    }
  }

  async getCompetitions() {
    try {
      const response = await axios.get('https://api.football-data.org/v4/competitions', {
        headers: {
          'X-Auth-Token': '1ec51693e261492cb31f2ae3146781b3'
        },
        params: { limit: 50 }
      });
      return response.data.competitions;
    } catch (error) {
      console.error('Error fetching competitions:', error.message);
      return [];
    }
  }



  formatMatches(matches) {
    return matches.map(match => {
      // Get current score based on match status
      let homeScore = 0;
      let awayScore = 0;
      
      if (match.status === 'FINISHED' || match.status === 'PAUSED' || match.status === 'IN_PLAY') {
        // For finished, paused, or live matches, use fullTime score
        homeScore = match.score.fullTime?.home || 0;
        awayScore = match.score.fullTime?.away || 0;
      } else if (match.status === 'LIVE') {
        // For live matches, use fullTime score if available, otherwise 0
        homeScore = match.score.fullTime?.home || 0;
        awayScore = match.score.fullTime?.away || 0;
      }
      
      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        competition: match.competition.name,
        competitionId: match.competition.id,
        status: match.status,
        homeScore: homeScore,
        awayScore: awayScore,
        matchDate: match.utcDate,
        minute: match.minute || 0,
        finalScore: (match.status === 'FINISHED' || match.status === 'PAUSED') ? {
          home: homeScore,
          away: awayScore
        } : null
      };
    });
  }




}

module.exports = new FootballApiService();
