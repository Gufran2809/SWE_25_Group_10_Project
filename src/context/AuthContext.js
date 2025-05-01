import React, { createContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          setUserRole(userDoc.exists() ? userDoc.data().role : 'Fan');
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('Fan');
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          role: 'Fan',
          createdAt: new Date(),
        });
        setUserRole('Fan');
      } else {
        setUserRole(userDoc.data().role);
      }
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};