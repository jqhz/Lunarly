# Lunarly - Dream Journal & AI Analysis

A beautiful, dark-themed web app for logging dreams and getting AI-powered insights using Google's Gemini. Built with React, Vite, TailwindCSS, and Firebase.

## Features

- 🌙 **Dream Journal**: Record and organize your dreams with a clean, distraction-free interface
- 🔮 **AI Analysis**: Get thoughtful insights into your dreams using Google's Gemini AI
- 📊 **Statistics**: Track your dream patterns and analysis usage
- 🔒 **Privacy-First**: Your dreams are private and secure
- 📱 **Responsive**: Works beautifully on desktop and mobile
- 🌙 **Dark Theme**: Easy on the eyes for late-night dream recording

## Tech Stack

- **Frontend**: React 19 + Vite + SWC
- **Styling**: TailwindCSS 4
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Firestore
- **AI**: Google Gemini (via Cloud Functions)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Firebase Hosting

## Quick Start

### Prerequisites

- Node.js 18+ 
- Firebase account
- Google Gemini API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Lunarly
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Google Sign-In
3. Create a Firestore database
4. Get your Firebase config values

### 3. Environment Variables

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

Required environment variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API Key (for Cloud Functions)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Firestore Security Rules

Deploy the security rules to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

### 5. Cloud Functions Setup

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize functions: `firebase init functions`
4. Set environment variable: `firebase functions:config:set gemini.api_key="your_gemini_api_key"`
5. Deploy functions: `firebase deploy --only functions`

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## Project Structure

```
Lunarly/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React context providers
│   ├── firebase/           # Firebase configuration
│   ├── lib/                # Utility functions
│   ├── routes/             # Page components
│   ├── styles/             # Global styles
│   └── test/               # Test files
├── functions/              # Firebase Cloud Functions
├── public/                 # Static assets
└── firestore.rules         # Firestore security rules
```

## Key Components

### Authentication
- **AuthContext**: Manages user authentication state
- **Google Sign-In**: Secure authentication with Firebase

### Dream Management
- **DreamEditor**: Modal for adding/editing dreams
- **DreamList**: Displays all user dreams
- **DreamCard**: Individual dream entry display

### AI Analysis
- **AnalysisView**: Displays dream analysis results
- **Cloud Function**: Server-side Gemini integration

## Data Model

### Users Collection
```javascript
/users/{uid}:
  displayName: string
  email: string
  photoURL: string
  createdAt: timestamp
  stats: {
    totalDreams: number
    analysesUsed: number
  }
```

### Dreams Collection
```javascript
/users/{uid}/dreams/{dreamId}:
  title: string
  body: string
  date: timestamp
  createdAt: timestamp
  updatedAt: timestamp
  analysisId: string | null
```

### Analyses Collection
```javascript
/users/{uid}/analyses/{analysisId}:
  dreamId: string
  promptSent: string
  geminiResponse: string
  insights: {
    summary: string
    themes: Array<{symbol: string, interpretation: string}>
    moodTags: string[]
    takeaway: string[]
  }
  createdAt: timestamp
  modelVersion: string
```

## Testing

Run tests with Vitest:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## Deployment

### Firebase Hosting

1. Build the project: `npm run build`
2. Deploy: `firebase deploy --only hosting`

### Environment Variables for Production

Set production environment variables in Firebase:

```bash
firebase functions:config:set gemini.api_key="your_production_gemini_key"
```

## Privacy & Security

- **Data Privacy**: All dreams are private and only accessible to the user
- **Authentication**: Secure Google Sign-In via Firebase
- **Encryption**: Data encrypted in transit and at rest
- **No Data Sharing**: We never share your personal information
- **Data Control**: Export or delete your data at any time

## Cost Considerations

- **Firebase**: Free tier includes generous limits
- **Gemini API**: Pay-per-use pricing, typically very low cost per analysis
- **Hosting**: Free tier available

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the Firebase documentation
- Review the Gemini API documentation
- Open an issue in this repository

---

**Note**: This app is for personal reflection and insight only. Dream analysis is not medical or clinical advice. If you have concerns about your mental health, please consult with a qualified healthcare professional.
