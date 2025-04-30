import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const LiveStreaming = ({ matchId }) => {
  const [streamStatus, setStreamStatus] = useState('Loading...');

  useEffect(() => {
    const streamRef = doc(db, 'streams', matchId);
    const unsubscribe = onSnapshot(streamRef, (doc) => {
      if (doc.exists()) {
        setStreamStatus(doc.data().status);
      } else {
        setStreamStatus('Offline');
      }
    }, (error) => {
      console.error('Error checking stream:', error);
      setStreamStatus('Offline');
    });
    return () => unsubscribe();
  }, [matchId]);

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <CardContent>
        <Typography variant="h2" color="primary" align="center" gutterBottom>
          Live Stream
        </Typography>
        <Typography variant="h6" color={streamStatus === 'Live' ? 'error' : 'textSecondary'} align="center" sx={{ mb: 2 }}>
          Status: {streamStatus}
        </Typography>
        <Box
          sx={{
            bgcolor: '#000',
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography>
            {streamStatus === 'Live'
              ? 'Video Player Placeholder (Integrate RTMP/DASH with Video.js)'
              : 'Stream Offline'}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" align="center">
          Watch live matches with real-time commentary.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default LiveStreaming;