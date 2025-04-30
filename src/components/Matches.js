import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesSnapshot = await getDocs(collection(db, 'matches'));
        setMatches(matchesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches: ' + error.message);
      }
    };
    fetchMatches();
  }, []);

  // Render teams as a string
  const renderTeams = (teams) => {
    if (!teams) {
      return 'Teams not specified';
    }
    if (typeof teams === 'string') {
      return teams;
    }
    if (teams.team1 && teams.team2) {
      return `${teams.team1} vs ${teams.team2}`;
    }
    console.warn('Invalid teams format:', teams);
    return 'Teams not specified';
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Live Matches
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Grid container spacing={2}>
        {matches.length > 0 ? (
          matches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{renderTeams(match.teams)}</Typography>
                  <Typography>Status: {match.status || 'N/A'}</Typography>
                  <Typography>Score: {match.score || 'N/A'}</Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/match/${match.id}`}
                    sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
                  >
                    View Details
                  </Button>
                  {match.status === 'Live' && (
                    <Button
                      variant="contained"
                      component={Link}
                      to="/live-stream"
                      sx={{ mt: 2, ml: 2, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#f44336' } }}
                    >
                      Watch Live
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography color="textSecondary">No live matches available.</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default Matches;