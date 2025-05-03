import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  IconButton,
  styled,
  InputAdornment
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: 24,
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const LoginContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a3c34 0%, #2e7d32 100%)',
  padding: '20px',
});

const LogoCircle = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  '& svg': {
    fontSize: 40,
    color: '#1a3c34',
  },
}));

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Player');
  const [isSignup, setIsSignup] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setSnackbar({ open: false, message: '', severity: 'error' });
    setLoading(true);

    try {
      if (isSignup) {
        if (password.length < 6) {
          throw new Error('Password should be at least 6 characters long');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Create user document
        await setDoc(doc(db, 'users', newUser.uid), {
          email: newUser.email,
          role: role,
          createdAt: new Date(),
          displayName: newUser.displayName || email.split('@')[0],
          photoURL: newUser.photoURL || '',
        });

        // If role is Player, create player document
        if (role === 'Player') {
          const playerId = `p-${Date.now()}`;
          await setDoc(doc(db, 'players', playerId), {
            id: playerId,
            userId: newUser.uid,
            name: newUser.displayName || email.split('@')[0],
            role: 'batsman', // default role
            isCaptain: false,
            isWicketKeeper: false,
            isOut: false,
            jerseyNumber: null,
            profileImage: newUser.photoURL || '',
            achievements: [],
            stats: {
              ballsFaced: 0,
              isOut: false,
              overall: {
                batting: {
                  average: 0,
                  fifties: 0,
                  fours: 0,
                  highest: 0,
                  hundreds: 0,
                  innings: 0,
                  lastFiveScores: [],
                  notOuts: 0,
                  runs: 0,
                  sixes: 0,
                  strikeRate: 0
                },
                matches: 0
              },
              runs: 0,
              strikeRate: "0"
            },
            team: "",
            teamId: ""
          });
        }

        await sendEmailVerification(newUser);
        setSnackbar({
          open: true,
          message: 'Account created! Please verify your email.',
          severity: 'success',
        });
        navigate('/login', { replace: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (!userDoc.exists()) {
          throw new Error('User profile not found');
        }

        const userRole = userDoc.data().role;
        navigate(userRole === 'Organizer' ? '/organizer' : '/', { replace: true });
      }
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later';
          break;
        default:
          errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await login();
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        navigate('/organizer', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to login. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <LoginContainer>
      <Container maxWidth="sm">
        <StyledPaper elevation={3}>
          <LogoCircle>
            <SportsCricketIcon />
          </LogoCircle>

          <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff', fontWeight: 'bold' }}>
            Live Cricket Score
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: '#fff', mb: 4 }}>
            Inter/Intra University Tournaments
          </Typography>

          <form onSubmit={handleEmailAuth}>
            <TextField
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              }}
            />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                },
              }}
            />

            {isSignup && (
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Role"
                  sx={{
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <MenuItem value="Player">Player</MenuItem>
                  <MenuItem value="Organizer">Organizer</MenuItem>
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mb: 2,
                bgcolor: '#2e7d32',
                '&:hover': { bgcolor: '#1b5e20' },
                py: 1.5,
                borderRadius: 2,
              }}
            >
              {isSignup ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>or</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            sx={{
              color: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              mb: 2,
            }}
          >
            Sign in with Google
          </Button>

          <Button
            fullWidth
            onClick={() => setIsSignup(!isSignup)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Button>
        </StyledPaper>

        {snackbar.open && (
          <Alert
            severity={snackbar.severity}
            sx={{ mt: 2 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setSnackbar({ ...snackbar, open: false })}
              >
                ×
              </IconButton>
            }
          >
            {snackbar.message}
          </Alert>
        )}
      </Container>
    </LoginContainer>
  );
};

export default LoginPage;