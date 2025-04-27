import React from 'react';
import { Container, Typography } from '@mui/material';
import LiveStreaming from './LiveStreaming';

const LiveStream = () => {
  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h1" color="primary" gutterBottom>
        Live Stream
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Watch live matches with real-time commentary.
      </Typography>
      <LiveStreaming matchId={1} /> {/* Replace with dynamic matchId */}
    </Container>
  );
};

export default LiveStream;