import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { io } from 'socket.io-client';

const Notifications = () => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const socket = io('http://localhost:5001');

  useEffect(() => {
    socket.on('match-event', (data) => {
      setNotification({ open: true, message: data.message, severity: data.severity });
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const handleClose = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notifications;