import React, { useState, useEffect } from 'react';
import { Container, Typography, Tabs, Tab, Box, Button, Link } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ManageLeague = () => {
  const { id } = useParams();
  const [league, setLeague] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const leagueDoc = await getDoc(doc(db, 'leagues', id));
        if (leagueDoc.exists()) {
          setLeague({ id: leagueDoc.id, ...leagueDoc.data() });
        } else {
          setLeague({ id, name: 'University Cup', status: 'Active' });
        }
      } catch (error) {
        console.error('Error fetching league:', error);
      }
    };
    fetchLeague();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Manage League
      </Typography>
      {league ? (
        <Box>
          <Typography variant="h4">{league.name}</Typography>
          <Typography>Status: {league.status}</Typography>
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ my: 2 }}>
            <Tab label="Teams" />
            <Tab label="Schedule" />
            <Tab label="Points Table" />
            <Tab label="Brackets" />
            <Tab label="Pools" />
          </Tabs>
          {tabValue === 0 && <Typography>Teams: Placeholder</Typography>}
          {tabValue === 1 && <Typography>Schedule: Placeholder</Typography>}
          {tabValue === 2 && <Typography>Points Table: Placeholder</Typography>}
          {tabValue === 3 && (
            <Button
              component={Link}
              to={`/organizer/bracket/${id}`}
              sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
            >
              Manage Brackets
            </Button>
          )}
          {tabValue === 4 && (
            <Button
              component={Link}
              to={`/organizer/pool/${id}`}
              sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
            >
              Manage Pools
            </Button>
          )}
          <Button
            variant="contained"
            sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => navigate('/organizer')}
          >
            Delete League
          </Button>
        </Box>
      ) : (
        <Typography color="textSecondary">Loading league details...</Typography>
      )}
    </Container>
  );
};

export default ManageLeague;