import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const PoolManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Pool Management
      </Typography>
      <Box>
        <Typography color="textSecondary">
          Placeholder for pool configuration for league {id}.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
        >
          Save Pools
        </Button>
        <Button
          variant="contained"
          sx={{ mt: 2, ml: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
        >
          Create Pools
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/organizer/league/${id}`)}
          sx={{ mt: 2, ml: 2 }}
        >
          Back
        </Button>
      </Box>
    </Container>
  );
};

export default PoolManagement;