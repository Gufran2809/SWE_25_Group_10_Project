import React, { useState, useEffect } from 'react';
import { Container, Typography, Tabs, Tab, Box, Button } from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ManageMatch = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', id));
        if (matchDoc.exists()) {
          setMatch({ id: matchDoc.id, ...matchDoc.data() });
        } else {
          setMatch({ id, teams: 'Team A vs Team B', status: 'Upcoming' });
        }
      } catch (error) {
        console.error('Error fetching match:', error);
      }
    };
    fetchMatch();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Manage Match
      </Typography>
      {match ? (
        <Box>
          <Typography variant="h4">{match.teams}</Typography>
          <Typography>Status: {match.status}</Typography>
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ my: 2 }}>
            <Tab label="Details" />
            <Tab label="Teams/Squads" />
            <Tab label="Toss/Results" />
            <Tab label="Scorecard" />
          </Tabs>
          {tabValue === 0 && <Typography>Details: Placeholder</Typography>}
          {tabValue === 1 && <Typography>Teams/Squads: Placeholder</Typography>}
          {tabValue === 2 && <Typography>Toss/Results: Placeholder</Typography>}
          {tabValue === 3 && <Typography>Scorecard: Placeholder</Typography>}
          <Button
            variant="contained"
            component={Link}
            to={`/scorer/match/${id}`}
            sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
          >
            Start Live Scoring
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/organizer')}
            sx={{ mt: 2, ml: 2 }}
          >
            Cancel
          </Button>
        </Box>
      ) : (
        <Typography color="textSecondary">Loading match details...</Typography>
      )}
    </Container>
  );
};

export default ManageMatch;