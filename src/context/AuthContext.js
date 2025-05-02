import React, { createContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async () => {
    try {
      // Use the imported googleProvider instead of creating new one
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the user document reference
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Prepare user data
      const userData = {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: 'Organizer', // Force role to Organizer
        updatedAt: new Date()
      };

      if (!userDoc.exists()) {
        userData.createdAt = new Date();
      }

      // Update or create user document
      await setDoc(userDocRef, userData, { merge: true });
      
      // Update local state
      setUser({ ...result.user, role: userData.role });
      return result;

    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, role: userDoc.data().role });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    login,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};