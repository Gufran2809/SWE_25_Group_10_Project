import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const EndOfInnings = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        End of Innings
      </Typography>
      <Typography variant="h4">Match {id}: Team A - 150/5 (20 overs)</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>Batting: Placeholder</Typography>
        <Typography>Bowling: Placeholder</Typography>
        <Typography>Fall of Wickets: Placeholder</Typography>
      </Box>
      <Button
        variant="contained"
        onClick={() => navigate(`/scorer/match/${id}/end`)}
        sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
      >
        Finalize Innings
      </Button>
      <Typography color="textSecondary" sx={{ mt: 2 }}>
        Placeholder for innings statistics and adjustments.
      </Typography>
    </Container>
  );
};

export default EndOfInnings;