# LiveScoreBattle

A real-time football score prediction game for friends, built with modern web technologies.

## 🏆 Features

### Core Functionality
- **Real-time Match Updates**: Live football matches from football-data.org API
- **Score Predictions**: Users can predict match outcomes
- **Live Leaderboard**: Real-time scoring and ranking system
- **User Authentication**: Secure login/registration system
- **User Profiles**: Personal statistics and prediction history

### Advanced Features
- **Smart Filtering**: Filter matches by status (Live, Upcoming, Finished) and leagues
- **Auto-scoring**: Automatic score calculation when matches end
- **Real-time Updates**: Socket.IO for live predictions and leaderboard updates
- **Mobile Responsive**: Optimized for all device sizes
- **Modern UI**: Glassmorphism design with smooth animations

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **Socket.IO Client** for real-time communication
- **Axios** for API requests
- **CSS3** with Glassmorphism design
- **Responsive Design** for mobile and desktop

### Backend
- **Node.js** with Express
- **Socket.IO** for real-time updates
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### External APIs
- **football-data.org** for live match data
- **Real-time scoring** system

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ofirgls/LiveScoreBattle.git
   cd LiveScoreBattle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` file in the `server` directory:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   API_KEY=your_football_data_api_key
   API_BASE_URL=https://api.football-data.org/v4
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server and frontend client concurrently.

## 🎮 How to Play

### Getting Started
1. **Register/Login**: Create an account or sign in
2. **Browse Matches**: View live, upcoming, and finished matches
3. **Make Predictions**: Predict scores for upcoming matches
4. **Track Progress**: Monitor your ranking on the leaderboard
5. **View Profile**: Check your statistics and prediction history

### Scoring System
- **Exact Score**: 3 points (correct home and away score)
- **Correct Result**: 1 point (win/loss/draw prediction)
- **Wrong Prediction**: 0 points

### Match Statuses
- **Live**: Currently playing matches
- **Upcoming**: Scheduled matches (can make predictions)
- **Finished**: Completed matches (scored automatically)

## 🏗️ Project Structure

```
LiveScoreBattle/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── index.css       # Global styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   ├── scripts/           # Database seeding
│   └── server.js          # Main server file
└── package.json           # Root package.json
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5001)
- `MONGO_URI`: MongoDB connection string
- `API_KEY`: football-data.org API key
- `JWT_SECRET`: Secret key for JWT tokens

### API Endpoints
- `GET /api/matches/live` - Live matches
- `GET /api/matches/upcoming` - Upcoming matches
- `GET /api/matches/all` - All matches by competition
- `POST /api/predictions` - Submit prediction
- `GET /api/predictions/:matchId` - Get predictions for match
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/leaderboard` - Leaderboard

## 🎨 Features in Detail

### Real-time Updates
- Live match scores update automatically
- New predictions appear instantly
- Leaderboard updates in real-time
- User notifications for score changes

### Smart Filtering
- Filter by match status (Live/Upcoming/Finished)
- Filter by competition/league
- Combined filtering (status + league)
- Dynamic match counts

### User Experience
- Modern glassmorphism design
- Smooth animations and transitions
- Mobile-first responsive design
- Intuitive navigation
- Real-time feedback

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- Input validation and sanitization

## 🚀 Deployment

### Local Development
```bash
npm run dev          # Start both client and server
npm run server       # Start server only
npm run client       # Start client only
```

### Production
1. Build the client: `cd client && npm run build`
2. Set up environment variables
3. Deploy to your preferred hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**LiveScoreBattle** - Where football predictions meet real-time competition! ⚽🏆
