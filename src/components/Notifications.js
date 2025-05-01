import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

const Notifications = () => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          setNotification({ open: true, message: data.message, severity: data.severity });
        }
      });
    }, (error) => {
      console.error('Error fetching notifications:', error);
    });
    return () => unsubscribe();
  }, []);

  const handleClose = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notifications;