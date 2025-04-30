import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Button, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const PerBallManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentary, setCommentary] = useState('');

  const handleAction = (action) => {
    console.log(`Action: ${action}`);
    // Implement scoring logic
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Per-Ball Management
      </Typography>
      <Typography variant="h4">Match {id}: Team A vs Team B</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>Current Score: 100/2 (10 overs)</Typography>
        <Typography>Batsmen: Player 1 (50*), Player 2 (20)</Typography>
        <Typography>Bowler: Player 3 (0/20)</Typography>
      </Box>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {[0, 1, 2, 3, 4, 6].map((run) => (
          <Grid item key={run}>
            <Button
              variant="contained"
              onClick={() => handleAction(`${run} runs`)}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
            >
              {run}
            </Button>
          </Grid>
        ))}
        <Grid item>
          <Button
            variant="contained"
            onClick={() => handleAction('Wicket')}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#f44336' } }}
          >
            Wicket
          </Button>
        </Grid>
        {['Wide', 'No-ball', 'Bye', 'Leg-bye'].map((extra) => (
          <Grid item key={extra}>
            <Button
              variant="contained"
              onClick={() => handleAction(extra)}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
            >
              {extra}
            </Button>
          </Grid>
        ))}
      </Grid>
      <TextField
        label="Ball Commentary"
        value={commentary}
        onChange={(e) => setCommentary(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
      />
      <Button
        variant="contained"
        onClick={() => navigate(`/scorer/innings/${id}`)}
        sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
      >
        End Over
      </Button>
      <Typography color="textSecondary" sx={{ mt: 2 }}>
        Placeholder for last 6 balls, undo, and partnership info.
      </Typography>
    </Container>
  );
};

export default PerBallManagement;