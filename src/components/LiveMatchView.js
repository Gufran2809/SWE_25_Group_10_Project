import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container, Paper, Typography, Box, Grid, Avatar,
  Chip, LinearProgress, Card, IconButton, Stack,
  List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import {
  SportsCricket as BatIcon,
  Sports as BallIcon,
  Timeline as OversIcon,
  Speed as RunRateIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const LiveMatchView = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [ballByBall, setBallByBall] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastBalls, setLastBalls] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'matches', matchId), (doc) => {
      if (doc.exists()) {
        setMatch({ id: doc.id, ...doc.data() });
        updateLastBalls(doc.data().currentOver?.balls || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId]);

  useEffect(() => {
    const q = query(
      collection(db, 'balls'),
      where('matchId', '==', matchId),
      orderBy('timestamp', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const balls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBallByBall(balls);
    });

    return () => unsubscribe();
  }, [matchId]);

  const updateLastBalls = (balls) => {
    setLastBalls(balls.map(ball => ({
      runs: ball.runs,
      isWicket: ball.isWicket,
      color: ball.isWicket ? 'error' : ball.runs === 4 || ball.runs === 6 ? 'success' : 'default'
    })));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Live Match Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Chip 
            label="LIVE" 
            color="error"
            sx={{ 
              '& .MuiChip-label': { px: 3 },
              animation: 'pulse 1.5s infinite'
            }}
          />
          <IconButton color="inherit" onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={5} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={match.team1Logo} 
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {match.team1}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {match.score?.team1?.runs || 0}/{match.score?.team1?.wickets || 0}
            </Typography>
            <Typography variant="subtitle1">
              ({match.score?.team1?.overs || 0} overs)
            </Typography>
          </Grid>

          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4">VS</Typography>
          </Grid>

          <Grid item xs={5} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={match.team2Logo} 
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {match.team2}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {match.score?.team2?.runs || 0}/{match.score?.team2?.wickets || 0}
            </Typography>
            <Typography variant="subtitle1">
              ({match.score?.team2?.overs || 0} overs)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Current Over and Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              This Over
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {lastBalls.map((ball, index) => (
                <Chip
                  key={index}
                  label={ball.isWicket ? 'W' : ball.runs}
                  color={ball.color}
                  size="small"
                  sx={{ width: 40, height: 40 }}
                />
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Match Stats
            </Typography>
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <RunRateIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Current Run Rate"
                  secondary={((match.score?.team1?.runs || 0) / (match.score?.team1?.overs || 1)).toFixed(2)}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <OversIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Required Run Rate"
                  secondary={match.requiredRunRate?.toFixed(2) || 'N/A'}
                />
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* Ball by Ball Commentary */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ball by Ball
        </Typography>
        <List>
          {ballByBall.map((ball, index) => (
            <ListItem 
              key={index}
              sx={{
                bgcolor: ball.isWicket ? 'error.light' : 
                  ball.runs === 4 || ball.runs === 6 ? 'success.light' : 'transparent',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: ball.isWicket ? 'error.main' : 'primary.main' }}>
                  {ball.isWicket ? <BallIcon /> : <BatIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={`${ball.over}.${ball.ballNumber} - ${ball.commentary}`}
                secondary={`${ball.runs} runs`}
              />
            </ListItem>
          ))}
        </List>
      </Card>
    </Container>
  );
};

export default LiveMatchView;