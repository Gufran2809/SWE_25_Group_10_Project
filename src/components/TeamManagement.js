import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        setTeams(teamsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([{ id: 'team1', name: 'Team A', players: 11 }]);
      }
    };
    fetchTeams();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Team Management
      </Typography>
      <Button
        variant="contained"
        sx={{ mb: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
      >
        Create New Team
      </Button>
      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} key={team.id}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h5">{team.name}</Typography>
              <Typography>Players: {team.players}</Typography>
              <Button sx={{ mt: 1 }}>Edit</Button>
              <Button sx={{ mt: 1, ml: 1 }} color="error">
                Delete
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Typography color="textSecondary" sx={{ mt: 2 }}>
        Placeholder for team creation and statistics.
      </Typography>
    </Container>
  );
};

export default TeamManagement;