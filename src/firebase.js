import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "notFallingforThat",
  authDomain: "cricket-score-app-64a06.firebaseapp.com",
  projectId: "cricket-score-app-64a06",
  storageBucket: "cricket-score-app-64a06.firebasestorage.app",
  messagingSenderId: "368281391053",
  appId: "1:368281391053:web:2063d9a5f0496bdc37be84",
  measurementId: "G-KC1ZCTE27L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, analytics, auth, googleProvider, db };
