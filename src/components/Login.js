import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { styled } from '@mui/material/styles';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Input = styled('input')({
  display: 'none',
});

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    team: '',
    role: '',
    jerseyNumber: '',
    achievements: '',
    profileImage: null,
  });

  const teamOptions = [
    'Engineering Titans',
    'Science Strikers',
    'Management Masters',
    'Arts Avengers',
    'Commerce Kings'
  ];

  const roleOptions = [
    'batsman',
    'bowler',
    'all-rounder',
    'wicketkeeper'
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, profileImage: file });
    } else {
      setError('Please upload a valid image file');
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home page after successful login
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate form data
        if (!formData.name || !formData.team || !formData.role || !formData.jerseyNumber) {
          throw new Error('Please fill in all required fields');
        }

        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );

        // Upload profile image
        let imageUrl = '/default-avatar.png';
        if (formData.profileImage) {
          const imageRef = ref(storage, `players/${userCredential.user.uid}`);
          await uploadBytes(imageRef, formData.profileImage);
          imageUrl = await getDownloadURL(imageRef);
        }

        // Create player document with default stats
        const playerData = {
          id: userCredential.user.uid,
          name: formData.name,
          team: formData.team,
          role: formData.role,
          jerseyNumber: Number(formData.jerseyNumber),
          profileImage: imageUrl,
          achievements: formData.achievements ? formData.achievements.split(',').map(a => a.trim()) : [],
          stats: {
            overall: {
              matches: 0,
              batting: {
                innings: 0,
                runs: 0,
                notOuts: 0,
                highest: 0,
                average: 0,
                strikeRate: 0,
                fifties: 0,
                hundreds: 0,
                fours: 0,
                sixes: 0,
                lastFiveScores: []
              },
              bowling: {
                innings: 0,
                overs: 0,
                wickets: 0,
                runs: 0,
                average: 0,
                economy: 0,
                bestBowling: '0/0',
                fiveWickets: 0,
                lastFiveSpells: []
              }
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'players', userCredential.user.uid), playerData);
        navigate('/'); // Redirect to home page after successful signup

      } else {
        // Handle login
        await handleLogin(formData.email, formData.password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
        <Typography variant="h5" align="center" gutterBottom>
          {isSignUp ? 'Create Player Account' : 'Welcome Back'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {isSignUp ? (
              <>
                {/* Signup Fields */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar
                      src={formData.profileImage ? URL.createObjectURL(formData.profileImage) : ''}
                      sx={{ width: 100, height: 100, mb: 1 }}
                    />
                  </Box>
                  <label htmlFor="icon-button-file">
                    <Input accept="image/*" id="icon-button-file" type="file" onChange={handleImageUpload} />
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<PhotoCamera />}
                    >
                      Upload Photo
                    </Button>
                  </label>
                </Grid>

                {/* Player Info Fields */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Team</InputLabel>
                    <Select
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    >
                      {teamOptions.map((team) => (
                        <MenuItem key={team} value={team}>{team}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      {roleOptions.map((role) => (
                        <MenuItem key={role} value={role}>{role}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Jersey Number"
                    type="number"
                    value={formData.jerseyNumber}
                    onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Achievements"
                    value={formData.achievements}
                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                    helperText="Enter achievements separated by commas"
                    multiline
                    rows={2}
                  />
                </Grid>
              </>
            ) : null}

            {/* Common Auth Fields */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Login')}
          </Button>
        </form>

        <Divider sx={{ my: 2 }} />

        <Button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setFormData({
              email: '',
              password: '',
              name: '',
              team: '',
              role: '',
              jerseyNumber: '',
              achievements: '',
              profileImage: null,
            });
          }}
          fullWidth
          color="primary"
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </Button>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
