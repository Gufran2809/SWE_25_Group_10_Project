import React from 'react';
import { Container, Typography, Box, Button, TextField } from '@mui/material';

const LiveStreamingManagement = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Live Streaming Management
      </Typography>
      <Box>
        <TextField label="Stream URL" fullWidth sx={{ mb: 2 }} />
        <TextField label="Stream Key" fullWidth sx={{ mb: 2 }} />
        <Button
          variant="contained"
          sx={{ mr: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
        >
          Start Stream
        </Button>
        <Button
          variant="contained"
          sx={{ mr: 2, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#f44336' } }}
        >
          Stop Stream
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
        >
          Test Stream
        </Button>
        <Typography color="textSecondary" sx={{ mt: 2 }}>
          Placeholder for stream configuration and viewer statistics.
        </Typography>
      </Box>
    </Container>
  );
};

export default LiveStreamingManagement;