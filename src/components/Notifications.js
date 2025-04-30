import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    // Subscribe to Firestore notifications
    const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(newNotifications);
        // Show the latest notification
        if (newNotifications.length > 0 && !currentNotification) {
          setCurrentNotification(newNotifications[0]);
        }
      },
      (error) => {
        console.error('Error fetching notifications:', error);
      }
    );
    return () => unsubscribe();
  }, [currentNotification]);

  const handleClose = (id) => {
    setCurrentNotification(null);
    // Move to next notification if available
    const remaining = notifications.filter((n) => n.id !== id);
    setNotifications(remaining);
    if (remaining.length > 0) {
      setCurrentNotification(remaining[0]);
    }
  };

  return (
    <>
      {currentNotification && (
        <Snackbar
          open={!!currentNotification}
          autoHideDuration={6000}
          onClose={() => handleClose(currentNotification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleClose(currentNotification.id)}
            severity="info"
            sx={{ bgcolor: '#1b5e20', color: '#ffffff', '& .MuiAlert-icon': { color: '#ffffff' } }}
          >
            {currentNotification.message || 'Sample notification'}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default Notifications;