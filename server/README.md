# LiveScore Battle - Server

שרת Backend למשחק ניחוש תוצאות כדורגל בזמן אמת.

## התקנה

```bash
npm install
```

## הגדרת משתני סביבה

צור קובץ `.env` בתיקיית השרת:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/livescore-battle
API_KEY=your_football_api_key_here
API_BASE_URL=https://api.football-data.org/v2
```

## הפעלה

```bash
# פיתוח
npm run dev

# פרודקשן
npm start
```

## API Endpoints

### משחקים
- `GET /api/matches/live` - משחקים חיים
- `GET /api/matches/upcoming` - משחקים מתוכננים

### ניחושים
- `GET /api/predictions/:matchId` - ניחושים למשחק ספציפי
- `POST /api/predictions` - יצירת ניחוש חדש

## Socket.IO Events

- `newPrediction` - ניחוש חדש נשלח
- `liveMatchesUpdate` - עדכון משחקים חיים
- `joinMatch` - הצטרפות לחדר משחק
- `leaveMatch` - עזיבת חדר משחק
