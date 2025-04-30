import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { styled } from '@mui/material/styles';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TournamentStats from './TournamentStats';

const HeroBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1b5e20, #4caf50)',
  padding: theme.spacing(8, 2),
  color: '#ffffff',
  textAlign: 'center',
  borderRadius: '12px',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 2),
  },
}));

const MatchCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
}));

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch tournaments
        const tournamentsQuery = query(collection(db, 'leagues'), where('status', 'in', ['active', 'upcoming']));
        const tournamentsSnapshot = await getDocs(tournamentsQuery);
        const tournamentsData = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTournaments(tournamentsData);

        // Fetch top players
        const playersQuery = query(collection(db, 'players'), orderBy('stats.runs', 'desc'));
        const playersSnapshot = await getDocs(playersQuery);
        const playersData = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching static data:', error);
        setSnackbar({ open: true, message: 'Failed to load data. Showing sample data.' });
        setTournaments([
          { id: 't1', name: 'University Cup', status: 'active' },
          { id: 't2', name: 'Intra-University League', status: 'upcoming' }
        ]);
        setPlayers([
          { id: 'p1', name: 'Player 1', teamId: 'team1', stats: { runs: 200, wickets: 5 } },
          { id: 'p2', name: 'Player 2', teamId: 'team2', stats: { runs: 180, wickets: 3 } }
        ]);
      }
    };

    const subscribeToMatches = () => {
      const matchesQuery = query(collection(db, 'matches'), orderBy('matchDate', 'asc'));
      const unsubscribe = onSnapshot(
        matchesQuery,
        (snapshot) => {
          const matchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMatches(matchesData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching matches:', error);
          setSnackbar({ open: true, message: 'Failed to load matches. Showing sample data.' });
          setMatches([
            {
              id: '1',
              teams: 'Team A vs Team B',
              matchDate: '2025-05-01',
              matchTime: '14:00',
              status: 'Live',
              score: { team1: { runs: 120, wickets: 3, overs: 15 }, team2: { runs: 0, wickets: 0, overs: 0 } }
            },
            {
              id: '2',
              teams: 'Team C vs Team D',
              matchDate: '2025-05-02',
              matchTime: '16:00',
              status: 'Scheduled'
            }
          ]);
          setLoading(false);
        }
      );
      return unsubscribe;
    };

    fetchData();
    const unsubscribe = subscribeToMatches();
    return () => unsubscribe();
  }, []);

  // Render teams as a string
  const renderTeams = (match) => {
    if (match.teams) {
      if (typeof match.teams === 'string') {
        return match.teams;
      }
      if (match.teams.team1 && match.teams.team2) {
        return `${match.teams.team1} vs ${match.teams.team2}`;
      }
    }
    if (match.team1 && match.team2) {
      return `${match.team1} vs ${match.team2}`;
    }
    console.warn('Invalid teams format:', match);
    return 'Teams not specified';
  };

  const getCountdown = (matchDate, matchTime) => {
    const matchDateTime = new Date(`${matchDate}T${matchTime}`);
    const now = new Date();
    const diff = matchDateTime - now;
    if (diff <= 0) return 'Starting soon';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Container sx={{ py: 4, mt: 8 }}>
      {/* Hero Banner */}
      <HeroBox>
        <Typography
          variant="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', fontSize: { xs: '2rem', md: '3.5rem' } }}
        >
          Live Cricket Score
        </Typography>
        <Typography variant="h5" sx={{ fontFamily: 'Roboto, sans-serif' }}>
          Real-time updates for inter/intra-university cricket tournaments
        </Typography>
        {tournaments.length > 0 && (
          <Button
            variant="contained"
            component={Link}
            to={`/tournament/${tournaments[0].id}`}
            sx={{ mt: 2, bgcolor: '#ffffff', color: '#1b5e20', '&:hover': { bgcolor: '#e0e0e0' } }}
          >
            Explore {tournaments[0].name}
          </Button>
        )}
      </HeroBox>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Live Matches */}
      {!loading && (
        <>
          <Typography variant="h4" color="primary" gutterBottom sx={{ textAlign: 'center' }}>
            Live Matches
          </Typography>
          <Grid container spacing={3}>
            {matches.filter(m => m.status === 'Live').length > 0 ? (
              matches
                .filter(m => m.status === 'Live')
                .map(match => (
                  <Grid item xs={12} sm={6} md={4} key={match.id}>
                    <MatchCard>
                      <CardContent>
                        <Typography variant="h6" color="primary">
                          {renderTeams(match)}
                        </Typography>
                        <Typography>
                          Score: {match.score?.team1.runs ?? 'N/A'}/{match.score?.team1.wickets ?? 'N/A'} ({match.score?.team1.overs ?? 'N/A'} overs)
                        </Typography>
                        <Typography color="error">Live</Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            component={Link}
                            to={`/match/${match.id}`}
                            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
                          >
                            Watch Live
                          </Button>
                          <Button
                            variant="outlined"
                            component={Link}
                            to={`/scorecard/${match.id}`}
                          >
                            View Scorecard
                          </Button>
                        </Box>
                      </CardContent>
                    </MatchCard>
                  </Grid>
                ))
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', width: '100%' }}>
                No live matches at the moment.
              </Typography>
            )}
          </Grid>

          {/* Upcoming Matches */}
          <Typography variant="h4" color="primary" gutterBottom sx={{ textAlign: 'center', mt: 6 }}>
            Upcoming Matches
          </Typography>
          <Grid container spacing={3}>
            {matches.filter(m => m.status === 'Scheduled').length > 0 ? (
              matches
                .filter(m => m.status === 'Scheduled')
                .slice(0, 6)
                .map(match => (
                  <Grid item xs={12} sm={6} md={4} key={match.id}>
                    <MatchCard>
                      <CardContent>
                        <Typography variant="h6" color="primary">
                          {renderTeams(match)}
                        </Typography>
                        <Typography>Date: {match.matchDate} at {match.matchTime}</Typography>
                        <Typography>Countdown: {getCountdown(match.matchDate, match.matchTime)}</Typography>
                        <Button
                          variant="outlined"
                          component={Link}
                          to={`/match/${match.id}/preview`}
                          sx={{ mt: 2 }}
                        >
                          Match Preview
                        </Button>
                      </CardContent>
                    </MatchCard>
                  </Grid>
                ))
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', width: '100%' }}>
                No upcoming matches scheduled.
              </Typography>
            )}
          </Grid>

          {/* Recently Concluded Matches */}
          <Typography variant="h4" color="primary" gutterBottom sx={{ textAlign: 'center', mt: 6 }}>
            Recently Concluded Matches
          </Typography>
          <Grid container spacing={3}>
            {matches.filter(m => m.status === 'Completed').length > 0 ? (
              matches
                .filter(m => m.status === 'Completed')
                .slice(0, 3)
                .map(match => (
                  <Grid item xs={12} sm={6} md={4} key={match.id}>
                    <MatchCard>
                      <CardContent>
                        <Typography variant="h6" color="primary">
                          {renderTeams(match)}
                        </Typography>
                        <Typography>
                          Result: {match.score?.team1.runs ?? 'N/A'}/{match.score?.team1.wickets ?? 'N/A'} vs {match.score?.team2.runs ?? 'N/A'}/{match.score?.team2.wickets ?? 'N/A'}
                        </Typography>
                        <Button
                          variant="outlined"
                          component={Link}
                          to={`/scorecard/${match.id}`}
                          sx={{ mt: 2 }}
                        >
                          View Scorecard
                        </Button>
                      </CardContent>
                    </MatchCard>
                  </Grid>
                ))
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', width: '100%' }}>
                No recently concluded matches.
              </Typography>
            )}
          </Grid>

          {/* Tournament Standings */}
          <Typography variant="h4" color="primary" gutterBottom sx={{ textAlign: 'center', mt: 6 }}>
            Tournament Standings
          </Typography>
          <Grid container spacing={3}>
            {tournaments.slice(0, 2).map(tournament => (
              <Grid item xs={12} sm={6} key={tournament.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{tournament.name}</Typography>
                    <Typography color="textSecondary">Status: {tournament.status}</Typography>
                    <Button
                      variant="outlined"
                      component={Link}
                      to={`/tournament/${tournament.id}`}
                      sx={{ mt: 2 }}
                    >
                      View Full Standings
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Featured Player Statistics */}
          <Typography variant="h4" color="primary" gutterBottom sx={{ textAlign: 'center', mt: 6 }}>
            Featured Players
          </Typography>
          <Grid container spacing={3}>
            {players.map(player => (
              <Grid item xs={12} sm={6} md={4} key={player.id}>
                <MatchCard>
                  <CardContent>
                    <Typography variant="h6">{player.name}</Typography>
                    <Typography>Runs: {player.stats?.runs ?? 'N/A'}</Typography>
                    <Typography>Wickets: {player.stats?.wickets ?? 'N/A'}</Typography>
                    <Button
                      variant="outlined"
                      component={Link}
                      to={`/player/${player.id}`}
                      sx={{ mt: 2 }}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </MatchCard>
              </Grid>
            ))}
          </Grid>

          {/* News/Announcements */}
          <Typography variant="h4" color="primary" gutterBottom sx={{ textAlign: 'center', mt: 6 }}>
            News & Announcements
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="h6">Latest Updates</Typography>
              <Typography color="textSecondary">
                Stay tuned for the upcoming University Cup finals! Check out the live stream schedule.
              </Typography>
              <Button
                variant="outlined"
                component={Link}
                to="/live-stream"
                sx={{ mt: 2 }}
              >
                View Live Stream Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Tournament Stats Component */}
          <Box sx={{ mt: 6 }}>
            <TournamentStats />
          </Box>
        </>
      )}

      {/* Snackbar for Error Handling */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Home;