import React, { useContext, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
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
import { Link } from "react-router-dom"

const HeroBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  height: '100vh',
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

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log(`Initiating email ${isSignup ? 'signup' : 'signin'} with`, email);
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('Email signup successful');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Email signin successful');
      }
      console.log('Navigating to / after email auth');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Email auth error:', error);
      setError(error.message);
    }
  };

  return (
    <HeroBox>
      <Container maxWidth="sm">
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', fontFamily: 'Poppins, sans-serif' }}
        >
          Welcome to Live Cricket Score
        </Typography>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ mb: 4, fontFamily: 'Roboto, sans-serif' }}
        >
          {isSignup
            ? 'Sign up to access real-time cricket updates!'
            : 'Sign in to access real-time cricket updates!'}
        </Typography>
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
          />
{/* newly added  */}
          <p>
  Forgot your password? <Link to="/password-reset">Reset it here</Link>
</p>

{/* newly added  */}
          {error && (
            <Typography color="error" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          <AuthButton type="submit">
            {isSignup ? 'Sign Up' : 'Sign In'}
          </AuthButton>
          <Button
            onClick={() => setIsSignup(!isSignup)}
            sx={{ color: '#ffffff', textDecoration: 'underline' }}
          >
            {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Button>
        </form>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Or
        </Typography>
        <AuthButton startIcon={<GoogleIcon />} onClick={login}>
          Sign In with Google
        </AuthButton>
      </Container>
    </HeroBox>
    
  );
};

export default LoginPage;