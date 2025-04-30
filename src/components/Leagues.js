import React from 'react';
import { Container, Typography } from '@mui/material';
import LeagueManagement from './LeagueManagement';

const Leagues = () => {
  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h1" color="primary" gutterBottom>
        Leagues
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Manage cricket leagues and tournaments.
      </Typography>
      <LeagueManagement />
    </Container>
  );
};

export default Leagues;