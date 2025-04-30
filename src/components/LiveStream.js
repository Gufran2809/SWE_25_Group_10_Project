import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const LiveStream = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Live Stream
      </Typography>
      <Box sx={{ bgcolor: '#000', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="white">Placeholder for live stream player</Typography>
      </Box>
      <Typography color="textSecondary" sx={{ mt: 2 }}>
        Placeholder for viewer statistics and commentary.
      </Typography>
    </Container>
  );
};

export default LiveStream;