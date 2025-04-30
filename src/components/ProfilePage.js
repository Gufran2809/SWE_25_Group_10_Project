import React, { useContext } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h2" color="primary" gutterBottom>
        User Profile
      </Typography>
      {user ? (
        <Box>
          <Typography variant="h5">Name: {user.displayName || 'N/A'}</Typography>
          <Typography variant="h5">Email: {user.email}</Typography>
          <Typography variant="h5">Role: {user.role || 'Fan'}</Typography>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{ mt: 3, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Typography color="textSecondary">Please log in to view your profile.</Typography>
      )}
    </Container>
  );
};

export default ProfilePage;