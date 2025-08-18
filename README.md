# 🏆 LiveScore Battle - משחק ניחוש תוצאות כדורגל

משחק ניחוש תוצאות כדורגל בזמן אמת בין חברים, עם עדכונים חיים ותחרותיות!

## ✨ תכונות

- **משחקים חיים**: צפייה במשחקים שמתקיימים כרגע
- **ניחוש תוצאות**: שליחת ניחושים למשחקים מתוכננים
- **עדכונים בזמן אמת**: קבלת עדכונים על ניחושים חדשים מ-Socket.IO
- **ממשק מודרני**: עיצוב יפה ומותאם למובייל
- **API כדורגל**: שימוש ב-API חיצוני לקבלת נתוני משחקים

## 🛠️ טכנולוגיות

### Backend
- **Node.js** עם Express
- **Socket.IO** לתקשורת בזמן אמת
- **MongoDB** עם Mongoose
- **Axios** לקריאות API

### Frontend
- **React** עם Vite
- **Socket.IO Client** לחיבור בזמן אמת
- **Axios** לקריאות HTTP
- **CSS מודרני** עם Glassmorphism

## 📦 התקנה והפעלה

### דרישות מקדימות
- Node.js (גרסה 16 ומעלה)
- MongoDB (מותקן ומרוץ)
- API Key מ-[football-data.org](https://www.football-data.org/)

### שלב 1: התקנת תלויות
```bash
# התקנת כל התלויות (שורש + server + client)
npm run install-all
```

### שלב 2: הגדרת משתני סביבה
```bash
# העתק את קובץ הדוגמה
cp server/env.example server/.env

# ערוך את הקובץ עם הפרטים שלך
nano server/.env
```

תוכן קובץ `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/livescore-battle
API_KEY=your_football_api_key_here
API_BASE_URL=https://api.football-data.org/v2
```

### שלב 3: הפעלת הפרויקט
```bash
# הפעלת השרת והקליינט במקביל
npm run dev
```

או בנפרד:
```bash
# הפעלת השרת בלבד
npm run server

# הפעלת הקליינט בלבד (בטרמינל אחר)
npm run client
```

## 🌐 גישה לאפליקציה

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📋 API Endpoints

### משחקים
- `GET /api/matches/live` - משחקים חיים
- `GET /api/matches/upcoming` - משחקים מתוכננים

### ניחושים
- `GET /api/predictions/:matchId` - ניחושים למשחק ספציפי
- `POST /api/predictions` - יצירת ניחוש חדש

### Socket.IO Events
- `newPrediction` - ניחוש חדש נשלח
- `liveMatchesUpdate` - עדכון משחקים חיים
- `joinMatch` - הצטרפות לחדר משחק
- `leaveMatch` - עזיבת חדר משחק

## 🎮 איך לשחק

1. **בחר משחק**: לחץ על כרטיס משחק מהרשימה
2. **הכנס פרטים**: מלא את שמך והתוצאה הצפויה
3. **שלח ניחוש**: לחץ על "שלח ניחוש"
4. **צפה בניחושים**: ראה את כל הניחושים של המשתתפים בזמן אמת

## 🔧 פיתוח

### מבנה הפרויקט
```
LiveScoreBattle/
├── server/                 # Backend
│   ├── models/            # MongoDB models
│   ├── services/          # API services
│   ├── server.js          # Main server file
│   └── package.json
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
└── package.json           # Root package.json
```

### פקודות שימושיות
```bash
# התקנת תלויות
npm run install-all

# הפעלה בפיתוח
npm run dev

# בניית הפרונט
npm run build

# הפעלה בפרודקשן
npm start
```

## 🚀 פרודקשן

### בניית הפרונט
```bash
npm run build
```

### הפעלת השרת בפרודקשן
```bash
npm start
```

## 🔒 אבטחה

- **CORS** מוגדר לפרונט-אנד
- **Validation** של קלט המשתמש
- **MongoDB** עם אינדקסים ייחודיים
- **Environment Variables** לנתונים רגישים

## 🐛 פתרון בעיות

### MongoDB לא מתחבר
- ודא ש-MongoDB רץ: `mongod`
- בדוק את ה-MONGO_URI בקובץ .env

### API לא עובד
- בדוק שה-API_KEY נכון
- ודא שה-API_BASE_URL נכון
- הפרויקט ישתמש בנתוני Mock אם ה-API לא זמין

### Socket.IO לא מתחבר
- ודא שהשרת רץ על פורט 5000
- בדוק את הגדרות CORS

## 📝 רישיון

MIT License - חופשי לשימוש ולשינוי

## 🤝 תרומה

תרומות יתקבלו בברכה! אנא צור Pull Request או דווח על באגים ב-Issues.

---

**בהצלחה במשחק! ⚽🎯**
# LiveScoreBattle
