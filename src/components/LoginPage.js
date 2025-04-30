import React, { useContext, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { styled } from '@mui/material/styles';

const HeroBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  textAlign: 'center',
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const AuthButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ffffff, #e0e0e0)',
  color: '#212121',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.2rem',
  fontWeight: 'bold',
  borderRadius: '30px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    background: 'linear-gradient(45deg, #e0e0e0, #ffffff)',
  },
}));

const FormCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    // Reset error and success messages
    setError('');
    setSuccess('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    // Validate password confirmation for signup
    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Initiating email ${isSignup ? 'signup' : 'signin'} with`, email);
      
      if (isSignup) {
        // Create new user
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('Email signup successful');
        setSuccess('Account created successfully! You can now sign in.');
        // Reset form and switch to signin mode after successful signup
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsSignup(false);
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Email signin successful');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Email auth error:', error);
      // Format Firebase error messages to be more user-friendly
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    // Reset form when switching between signup and signin
    setIsSignup(!isSignup);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <HeroBox>
      <Container maxWidth="sm">
        <FormCard>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', fontFamily: 'Poppins, sans-serif', fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
          >
            Live Cricket Score
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ mb: 4, fontFamily: 'Roboto, sans-serif' }}
          >
            {isSignup
              ? 'Create an account to access real-time cricket updates'
              : 'Sign in to access real-time cricket updates'}
          </Typography>
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form
            onSubmit={handleEmailAuth}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="filled"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
              disabled={isLoading}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              variant="filled"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
              disabled={isLoading}
            />
            {isSignup && (
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                variant="filled"
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
                disabled={isLoading}
              />
            )}
            
            <AuthButton type="submit" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : isSignup ? 'Sign Up' : 'Sign In'}
            </AuthButton>
          </form>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Or
          </Typography>
          
          <AuthButton 
            startIcon={<GoogleIcon />} 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In with Google'}
          </AuthButton>
          
          <Box sx={{ mt: 3 }}>
            <Button
              onClick={toggleMode}
              sx={{ color: '#ffffff', textDecoration: 'underline' }}
              disabled={isLoading}
            >
              {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </Button>
          </Box>
        </FormCard>
      </Container>
    </HeroBox>
  );
};

export default LoginPage;