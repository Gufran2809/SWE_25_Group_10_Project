import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  Grid,
  Divider,
  TextField,
  CircularProgress,
  Snackbar,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginBottom: theme.spacing(2),
  border: '4px solid #1b5e20',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1b5e20, #43a047)',
  color: '#ffffff',
  padding: theme.spacing(1, 3),
  '&:hover': {
    background: 'linear-gradient(45deg, #2e7d32, #66bb6a)',
  },
}));

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    role: '',
    createdAt: null,
    photoURL: ''  // Add this line
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setProfileData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        role: profileData.role
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4, textAlign: 'center' }}>
          Please login to view your profile
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <ProfileContainer>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LargeAvatar src={profileData.photoURL}>
            {!profileData.photoURL && profileData.displayName?.[0]?.toUpperCase()}
          </LargeAvatar>
          <Typography variant="h4" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
            {profileData.displayName}
          </Typography>
          <Typography color="textSecondary">
            Member since {new Date(profileData.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={profileData.displayName}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profileData.email}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={profileData.role}
                onChange={handleChange}
                select
                variant="outlined"
              >
                <MenuItem value="Organizer">Organizer</MenuItem>
                <MenuItem value="Player">Player</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <StyledButton
              type="submit"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </StyledButton>
          </Box>
        </form>
      </ProfileContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default ProfilePage;