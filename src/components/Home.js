import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Box, Grid } from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import TournamentStats from './TournamentStats';
import { styled } from '@mui/material/styles';

const HeroBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  padding: theme.spacing(8, 2),
  color: '#ffffff',
  textAlign: 'center',
  borderRadius: '12px',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 2),
  },
}));

const Home = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesCollection = collection(db, 'matches');
        const snapshot = await getDocs(matchesCollection);
        const matchesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMatches(matchesData);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatches([
          { id: '1', team1: 'Team A', team2: 'Team B', matchDate: '2025-04-28', status: 'Live' },
          { id: '2', team1: 'Team C', team2: 'Team D', matchDate: '2025-04-29', status: 'Upcoming' },
        ]);
      }
    };
    fetchMatches();
  }, []);

  return (
    <Container sx={{ py: 4, mt: 8 }}>
      <HeroBox>
        <Typography
          variant="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', fontSize: { xs: '2rem', md: '3rem' } }}
        >
          Live Cricket Score
        </Typography>
        <Typography variant="h5" sx={{ fontFamily: 'Roboto, sans-serif' }}>
          Real-time updates for university cricket tournaments
        </Typography>
      </HeroBox>
      <Typography variant="h2" color="primary" gutterBottom sx={{ textAlign: 'center' }}>
        Ongoing & Upcoming Matches
      </Typography>
      <Grid container spacing={3}>
        {matches.length > 0 ? (
          matches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match.id}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h3" color="primary">
                    {match.team1} vs {match.team2}
                  </Typography>
                  <Typography>Date: {match.matchDate}</Typography>
                  <Typography color={match.status === 'Live' ? 'error' : 'textSecondary'}>
                    Status: {match.status || 'Upcoming'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography color="textSecondary" sx={{ textAlign: 'center', width: '100%' }}>
            No matches available.
          </Typography>
        )}
      </Grid>
      <TournamentStats />
    </Container>
  );
};

export default Home;