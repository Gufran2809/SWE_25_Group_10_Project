import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const LiveScoreboard = ({ matchId }) => {
  const [scoreData, setScoreData] = useState({
    team1: { name: '', score: 0, wickets: 0, overs: 0 },
    team2: { name: '', score: 0, wickets: 0, overs: 0 },
    currentBall: { ballNumber: 0, runs: 0, event: '' },
    status: 'Live',
  });

  useEffect(() => {
    const scoreRef = doc(db, 'scores', matchId);
    const unsubscribe = onSnapshot(scoreRef, (doc) => {
      if (doc.exists()) {
        setScoreData(doc.data());
      } else {
        setScoreData({
          team1: { name: 'Team A', score: 120, wickets: 3, overs: 15.2 },
          team2: { name: 'Team B', score: 80, wickets: 2, overs: 10.0 },
          currentBall: { ballNumber: 1, runs: 4, event: 'Boundary' },
          status: 'Live',
        });
      }
    }, (error) => {
      console.error('Error fetching score:', error);
    });
    return () => unsubscribe();
  }, [matchId]);

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, p: 2 }}>
      <CardContent>
        <Typography variant="h2" color="primary" align="center" gutterBottom>
          Live Scoreboard
        </Typography>
        <Typography variant="h6" color="error" align="center" sx={{ mb: 2 }}>
          {scoreData.status}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="h3" color="primary">
                {scoreData.team1.name}
              </Typography>
              <Typography variant="h5">
                {scoreData.team1.score}/{scoreData.team1.wickets}
              </Typography>
              <Typography>Overs: {scoreData.team1.overs}</Typography>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="h3" color="primary">
                {scoreData.team2.name}
              </Typography>
              <Typography variant="h5">
                {scoreData.team2.score}/{scoreData.team2.wickets}
              </Typography>
              <Typography>Overs: {scoreData.team2.overs}</Typography>
            </Card>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, p: 2, bgcolor: '#e0e0e0', borderRadius: 1 }}>
          <Typography variant="h4" color="primary">
            Current Ball
          </Typography>
          <Typography>
            Ball {scoreData.currentBall.ballNumber}: {scoreData.currentBall.runs} runs (
            {scoreData.currentBall.event})
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LiveScoreboard;