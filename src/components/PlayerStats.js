import React from 'react';
import { Container, Typography } from '@mui/material';
import PlayerProfiles from './PlayerProfiles';

const PlayerStats = () => {
  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h1" color="primary" gutterBottom>
        Player Stats
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        View detailed statistics for all players.
      </Typography>
      <PlayerProfiles />
    </Container>
  );
};

export default PlayerStats;