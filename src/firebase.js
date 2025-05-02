import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqfEJfCk4IDL3Jd78euzRinZ_bs0iml0U",
  authDomain: "cricket-score-app-64a06.firebaseapp.com",
  projectId: "cricket-score-app-64a06",
  storageBucket: "cricket-score-app-64a06.firebasestorage.app",
  messagingSenderId: "368281391053",
  appId: "1:368281391053:web:2063d9a5f0496bdc37be84",
  measurementId: "G-KC1ZCTE27L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Create Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Add scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;