import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';
import TournamentStats from './TournamentStats';

const Home = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Replace with actual API call
        const mockData = [
          { id: 1, team1: 'Team A', team2: 'Team B', date: '2025-04-28', status: 'Live' },
          { id: 2, team1: 'Team C', team2: 'Team D', date: '2025-04-29', status: 'Upcoming' },
        ];
        setMatches(mockData);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    fetchMatches();
  }, []);

  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h1" color="primary" gutterBottom>
        Welcome to Live Cricket Score
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Real-time updates for university cricket tournaments
      </Typography>
      <Typography variant="h2" color="primary" gutterBottom>
        Ongoing & Upcoming Matches
      </Typography>
      {matches.length > 0 ? (
        matches.map((match) => (
          <Card key={match.id} sx={{ maxWidth: 500, mx: 'auto', mb: 2, p: 2 }}>
            <CardContent>
              <Typography variant="h3" color="primary">
                {match.team1} vs {match.team2}
              </Typography>
              <Typography>Date: {match.date}</Typography>
              <Typography>Status: {match.status}</Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography color="textSecondary">No matches available.</Typography>
      )}
      <TournamentStats />
    </Container>
  );
};

export default Home;