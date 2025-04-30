import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const ComparePlayers = () => {
  const { id } = useParams();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Compare Players
      </Typography>
      <Typography color="textSecondary">
        Placeholder for comparing player {id} with another player.
      </Typography>
    </Container>
  );
};

export default ComparePlayers;