import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Tabs,
  Tab,
  Skeleton,
  Chip,
  Divider,
  Avatar,
  Paper,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { styled } from '@mui/material/styles';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components
const HeroBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)',
  padding: theme.spacing(8, 2),
  color: '#ffffff',
  textAlign: 'center',
  borderRadius: '12px',
  marginBottom: theme.spacing(4),
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 2),
  },
}));

const PromotionalBanner = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)',
  padding: theme.spacing(6, 2),
  color: '#ffffff',
  borderRadius: '12px',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '40%',
    background: 'url(/cricket-illustration.png) no-repeat center right',
    backgroundSize: 'contain',
    opacity: 0.2,
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  },
  borderRadius: '12px',
  overflow: 'hidden',
}));

const LiveMatchCard = styled(StyledCard)(({ theme }) => ({
  borderLeft: '4px solid #f44336',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1b5e20, #43a047)',
  color: '#ffffff',
  borderRadius: '24px',
  padding: theme.spacing(1, 3),
  fontWeight: 'bold',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #2e7d32, #66bb6a)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  position: 'relative',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  fontWeight: 'bold',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: '50%',
    width: '80px',
    height: '4px',
    background: 'linear-gradient(45deg, #1b5e20, #43a047)',
    transform: 'translateX(-50%)',
    borderRadius: '4px',
  },
}));

const LiveIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: '#f44336',
  fontWeight: 'bold',
  '& svg': {
    animation: 'pulse 1.5s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      opacity: 0.6,
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      opacity: 0.6,
    },
  },
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Roboto Mono", monospace',
  fontWeight: 'bold',
  fontSize: '1.25rem',
}));

const CountdownTimer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
  fontWeight: 'bold',
  color: theme.palette.primary.main,
}));

const AnimatedStatBox = styled(motion.div)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(3),
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'background 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
  }
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 900,
  marginBottom: theme.spacing(1),
  background: 'linear-gradient(45deg, #fff, #e0e0e0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const CountdownBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  textAlign: 'center'
}));

const CountdownNumber = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 900,
  color: '#fff',
  textShadow: '0 0 20px rgba(255,255,255,0.3)',
  marginBottom: theme.spacing(1)
}));

const StatGrid = styled(Grid)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '100%'
}));

const MotionValue = ({ value, duration = 2 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, count: 0 }}
      animate={{ 
        opacity: 1,
        count: value,
      }}
      transition={{ 
        duration: duration,
        ease: "easeOut"
      }}
    >
      {Math.round(value)}
    </motion.span>
  );
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [featuredMatch, setFeaturedMatch] = useState(null);
  const [totalStats, setTotalStats] = useState({
    matchesPlayed: 0,
    totalPlayers: 0,
    activeTournaments: 0,
    liveMatches: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch total matches played
        const matchesCollection = collection(db, 'matches');
        const matchesQuery = query(matchesCollection, where('status', '==', 'Completed'));
        const matchesSnapshot = await getDocs(matchesQuery);
        const totalMatches = matchesSnapshot.docs.length;

        // Fetch all players without status filter
        const playersCollection = collection(db, 'players');
        const playersSnapshot = await getDocs(playersCollection);
        const totalPlayers = playersSnapshot.docs.length;

        // Fetch active tournaments
        const tournamentsCollection = collection(db, 'leagues');
        const tournamentsQuery = query(tournamentsCollection, where('status', '==', 'active'));
        const tournamentsSnapshot = await getDocs(tournamentsQuery);
        const activeTournaments = tournamentsSnapshot.docs.length;

        // Fetch live matches
        const liveMatchesQuery = query(matchesCollection, where('status', '==', 'Live'));
        const liveMatchesSnapshot = await getDocs(liveMatchesQuery);
        const liveMatchesCount = liveMatchesSnapshot.docs.length;

        setTotalStats({
          matchesPlayed: totalMatches,
          totalPlayers: totalPlayers, // This now shows total players in database
          activeTournaments: activeTournaments,
          liveMatches: liveMatchesCount
        });

        // Fetch matches with the new structure
        const matchesQueryWithLimit = query(
          matchesCollection,
          orderBy('date', 'desc'),
          limit(10)
        );
        const matchesSnapshotWithLimit = await getDocs(matchesQueryWithLimit);
        const matchesData = matchesSnapshotWithLimit.docs.map((doc) => {
          const data = doc.data();
          const team1Score = data.score?.team1 || { runs: 0, wickets: 0, overs: "0.0" };
          const team2Score = data.score?.team2 || { runs: 0, wickets: 0, overs: "0.0" };
          
          return {
            id: doc.id,
            title: data.title || '',
            team1Id: data.team1Id,
            team2Id: data.team2Id,
            team1Score: `${team1Score.runs}/${team1Score.wickets} (${team1Score.overs})`,
            team2Score: `${team2Score.runs}/${team2Score.wickets} (${team2Score.overs})`,
            status: data.status || 'Upcoming',
            matchDate: data.date?.toDate() || new Date(),
            venue: data.venue || 'TBD',
            matchType: data.matchType || '',
            overs: data.overs || 20,
            battingTeam: data.battingTeam,
            currentOver: data.currentOver,
            currentBall: data.currentBall,
            leagueId: data.leagueId
          };
        });

        // Fetch team details for the matches
        const teamPromises = matchesData.map(async (match) => {
          const team1Doc = await getDocs(query(collection(db, 'teams'), where('id', '==', match.team1Id)));
          const team2Doc = await getDocs(query(collection(db, 'teams'), where('id', '==', match.team2Id)));
          
          const team1Data = team1Doc.docs[0]?.data() || { name: 'Team 1', logo: '/default-logo.png' };
          const team2Data = team2Doc.docs[0]?.data() || { name: 'Team 2', logo: '/default-logo.png' };
          
          return {
            ...match,
            team1: team1Data.name,
            team2: team2Data.name,
            team1Logo: team1Data.logo,
            team2Logo: team2Data.logo
          };
        });

        const matchesWithTeams = await Promise.all(teamPromises);
        setMatches(matchesWithTeams);

        // Set featured match
        const liveMatches = matchesWithTeams.filter(m => m.status === 'Live');
        const upcomingMatches = matchesWithTeams.filter(m => m.status === 'Upcoming');
        setFeaturedMatch(liveMatches[0] || upcomingMatches[0] || matchesWithTeams[0]);

        // Update tournament fetching from 'leagues' collection
        const tournamentsQueryWithLimit = query(
          tournamentsCollection,
          where('status', 'in', ['active', 'upcoming']),
          limit(5)
        );
        const tournamentsSnapshotWithLimit = await getDocs(tournamentsQueryWithLimit);
        const tournamentsData = await Promise.all(
          tournamentsSnapshotWithLimit.docs.map(async (doc) => {
            const data = doc.data();
            // Fetch team count for each tournament
            const teamCount = data.teamIds?.length || 0;
            
            return {
              id: doc.id,
              name: data.name,
              format: data.format,
              matchType: data.matchType,
              status: data.status,
              startDate: data.startDate,
              endDate: data.endDate,
              venue: data.venue,
              teams: teamCount,
              thumbnail: data.thumbnail || '/default-tournament.png',
              description: data.description || 'No description available'
            };
          })
        );
        setTournaments(tournamentsData);

        // Fetch player stats (top performers)
        const playersQueryWithLimit = query(
          playersCollection,
          orderBy('stats.overall.matches', 'desc'),  // First sort by matches played
          limit(6)
        );
        const playersSnapshotWithLimit = await getDocs(playersQueryWithLimit);
        const playersData = playersSnapshotWithLimit.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            team: data.team,
            role: data.role,
            jerseyNumber: data.jerseyNumber,
            photo: data.profileImage,
            stats: data.stats?.overall || {},
            achievements: data.achievements || []
          };
        });
        setPlayerStats(playersData);

        // Fetch news
        const newsCollection = collection(db, 'news');
        const newsQuery = query(
          newsCollection,
          orderBy('date', 'desc'),
          limit(4)
        );
        const newsSnapshot = await getDocs(newsQuery);
        const newsData = newsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setFeaturedMatch(null);
        setMatches([]);
        setTournaments([]);
        setPlayerStats([]);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh live matches every 30 seconds
    const interval = setInterval(() => {
      if (matches.some(m => m.status === 'Live')) {
        fetchData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredMatches = () => {
    if (tabValue === 0) return matches.filter((m) => m.status === 'Live');
    if (tabValue === 1) return matches.filter((m) => m.status === 'Upcoming');
    if (tabValue === 2) return matches.filter((m) => m.status === 'Completed');
    return matches;
  };

  const getTournamentStandings = (tournamentId) => {
    // Simulated standings data
    return [
      { team: 'Team A', played: 5, won: 4, lost: 1, points: 8, nrr: '+1.258' },
      { team: 'Team B', played: 5, won: 3, lost: 2, points: 6, nrr: '+0.502' },
      { team: 'Team C', played: 5, won: 2, lost: 3, points: 4, nrr: '-0.125' },
      { team: 'Team D', played: 5, won: 1, lost: 4, points: 2, nrr: '-1.305' },
    ];
  };

  // Function to calculate countdown to match
  const getCountdown = (matchDate) => {
    const now = new Date();
    const matchTime = new Date(matchDate);
    const diff = matchTime - now;

    if (diff <= 0) return "Starting soon";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
      <PromotionalBanner>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2
              }}
            >
              IITH Cricket Championship 2024
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontWeight: 300,
                lineHeight: 1.4
              }}
            >
              Experience the thrill of campus cricket - Where legends are made
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <AnimatedStatBox
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <StatNumber>
                    <MotionValue value={totalStats.matchesPlayed} />
                  </StatNumber>
                  <Typography variant="body2">
                    Matches Played
                  </Typography>
                </AnimatedStatBox>
              </Grid>
              <Grid item xs={6} sm={3}>
                <AnimatedStatBox
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <StatNumber sx={{ color: '#ff4444' }}>
                    <MotionValue value={totalStats.liveMatches} />
                  </StatNumber>
                  <Typography variant="body2">
                    Live Now
                  </Typography>
                </AnimatedStatBox>
              </Grid>
              <Grid item xs={6} sm={3}>
                <AnimatedStatBox
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <StatNumber>
                    <MotionValue value={totalStats.activeTournaments} />
                  </StatNumber>
                  <Typography variant="body2">
                    Active Tournaments
                  </Typography>
                </AnimatedStatBox>
              </Grid>
              <Grid item xs={6} sm={3}>
                <AnimatedStatBox
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <StatNumber>
                    <MotionValue value={totalStats.totalPlayers} />
                  </StatNumber>
                  <Typography variant="body2">
                    Active Players
                  </Typography>
                </AnimatedStatBox>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <StatGrid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                  Tournament Highlights
                </Typography>
              </Grid>
              {tournaments.slice(0, 3).map((tournament, index) => (
                <Grid item xs={12} key={index}>
                  <Box 
                    sx={{ 
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateX(10px)',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    <Avatar 
                      src={tournament.thumbnail} 
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: 'white' }}>
                        {tournament.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {tournament.teams} Teams • {tournament.format}
                      </Typography>
                    </Box>
                    <Chip 
                      label={tournament.status}
                      size="small"
                      sx={{ 
                        bgcolor: tournament.status === 'active' ? '#ff4444' : 'primary.main',
                        color: 'white'
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </StatGrid>
          </Grid>
        </Grid>
      </PromotionalBanner>

      {/* Match Tabs Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          mb: 5, 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            backgroundColor: '#f5f5f5',
            '& .MuiTab-root': { 
              fontWeight: 'bold',
              py: 2
            },
            '& .Mui-selected': {
              color: '#1b5e20 !important'
            }
          }}
          TabIndicatorProps={{
            style: {
              backgroundColor: '#1b5e20',
              height: 3
            }
          }}
        >
          <Tab label="Live Matches" icon={<FiberManualRecordIcon color="error" fontSize="small" />} iconPosition="start" />
          <Tab label="Upcoming" icon={<CalendarTodayIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Recent" icon={<ScoreboardIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
        
        {/* Matches Grid */}
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(3)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={200} animation="wave" sx={{ borderRadius: '12px' }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {filteredMatches().length > 0 ? (
                filteredMatches().map((match) => (
                  <Grid item xs={12} sm={6} md={4} key={match.id}>
                    {match.status === 'Live' ? (
                      <LiveMatchCard>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {match.tournamentName}
                            </Typography>
                            <LiveIndicator>
                              <FiberManualRecordIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">LIVE</Typography>
                            </LiveIndicator>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={match.team1Logo} alt={match.team1} sx={{ width: 32, height: 32, mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {match.team1}
                              </Typography>
                            </Box>
                            <ScoreText variant="body2">
                              {match.team1Score}
                            </ScoreText>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={match.team2Logo} alt={match.team2} sx={{ width: 32, height: 32, mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {match.team2}
                              </Typography>
                            </Box>
                            <ScoreText variant="body2">
                              {match.team2Score}
                            </ScoreText>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {match.venue}
                          </Typography>
                          
                          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                            <Button
                              component={Link}
                              to={`/matches/${match.id}/live`}
                              variant="contained"
                              size="small"
                              color="error"
                              startIcon={<PlayArrowIcon />}
                              sx={{ borderRadius: '20px', textTransform: 'none' }}
                            >
                              Watch Live
                            </Button>
                            <Button
                              component={Link}
                              to={`/matches/${match.id}`}
                              variant="outlined"
                              size="small"
                              sx={{ borderRadius: '20px', textTransform: 'none' }}
                            >
                              View Scorecard
                            </Button>
                          </Box>
                        </CardContent>
                      </LiveMatchCard>
                    ) : (
                      <StyledCard>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {match.tournamentName}
                            </Typography>
                            {match.status === 'Upcoming' ? (
                              <Chip 
                                label="Upcoming" 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ height: 24 }}
                              />
                            ) : (
                              <Chip 
                                label="Completed" 
                                size="small" 
                                color="success" 
                                variant="outlined" 
                                sx={{ height: 24 }}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={match.team1Logo} alt={match.team1} sx={{ width: 32, height: 32, mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {match.team1}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={match.team2Logo} alt={match.team2} sx={{ width: 32, height: 32, mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {match.team2}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {match.status === 'Completed' && match.result && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {match.result}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(match.matchDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {match.venue}
                          </Typography>
                          
                          <Box sx={{ mt: 'auto' }}>
                            <Button
                              component={Link}
                              to={match.status === 'Upcoming' ? `/matches/${match.id}/preview` : `/matches/${match.id}`}
                              variant="outlined"
                              size="small"
                              fullWidth
                              sx={{ borderRadius: '20px', textTransform: 'none' }}
                            >
                              {match.status === 'Upcoming' ? 'Match Details' : 'View Scorecard'}
                            </Button>
                          </Box>
                        </CardContent>
                      </StyledCard>
                    )}
                  </Grid>
                ))
              ) : (
                <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No {tabValue === 0 ? 'live' : tabValue === 1 ? 'upcoming' : 'recent'} matches available at the moment.
                  </Typography>
                </Box>
              )}
              
              {filteredMatches().length > 0 && (
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Button 
                    component={Link} 
                    to="/matches"
                    variant="text" 
                    color="primary"
                    sx={{ borderRadius: '20px', textTransform: 'none' }}
                  >
                    View All Matches
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Tournament Section */}
      <SectionHeading variant="h4" color="primary" gutterBottom>
        Tournaments
      </SectionHeading>
      
      {loading ? (
        <Skeleton variant="rectangular" height={300} animation="wave" sx={{ borderRadius: '12px', mb: 5 }} />
      ) : (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {tournaments.map((tournament) => (
            <Grid item xs={12} md={6} key={tournament.id}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={tournament.thumbnail} 
                      alt={tournament.name}
                      variant="rounded"
                      sx={{ width: 48, height: 48, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6">
                        {tournament.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tournament.matchType} • {tournament.format}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={tournament.status}
                      size="small"
                      color={tournament.status === 'active' ? 'error' : 'primary'}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      at {tournament.venue}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Typography variant="body2" gutterBottom>
                    <strong>{tournament.teams}</strong> teams registered
                  </Typography>

                  {tournament.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {tournament.description}
                    </Typography>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button 
          component={Link} 
          to="/leagues"
          variant="text" 
          color="primary"
          sx={{ borderRadius: '20px', textTransform: 'none' }}
        >
          View All Tournaments
        </Button>
      </Box>

    {/* Player Stats Section */}
    <SectionHeading variant="h4" color="primary" gutterBottom>
      Top Performers
    </SectionHeading>
    
    {loading ? (
      <Skeleton variant="rectangular" height={300} animation="wave" sx={{ borderRadius: '12px', mb: 5 }} />
    ) : (
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {playerStats.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player.id}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Avatar 
                    src={player.photo} 
                    alt={player.name}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {player.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {player.team} • {player.role}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Matches
                    </Typography>
                    <Typography variant="h6" color="text.primary">
                      {player.stats.matches || 0}
                    </Typography>
                  </Grid>
                  
                  {player.stats.batting && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Runs
                        </Typography>
                        <Typography variant="h6" color="text.primary">
                          {player.stats.batting.runs || 0}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Average
                        </Typography>
                        <Typography variant="h6" color="text.primary">
                          {player.stats.batting.average?.toFixed(2) || 0}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Strike Rate
                        </Typography>
                        <Typography variant="h6" color="text.primary">
                          {player.stats.batting.strikeRate?.toFixed(1) || 0}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {player.stats.bowling && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Wickets
                        </Typography>
                        <Typography variant="h6" color="text.primary">
                          {player.stats.bowling.wickets || 0}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Economy
                        </Typography>
                        <Typography variant="h6" color="text.primary">
                          {player.stats.bowling.economy?.toFixed(2) || 0}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {player.stats.keeping && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Dismissals
                      </Typography>
                      <Typography variant="h6" color="text.primary">
                        {player.stats.keeping.totalDismissals || 0}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {player.achievements && player.achievements.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Recent Achievement
                    </Typography>
                    <Chip 
                      label={player.achievements[0]}
                      size="small"
                      color="primary"
                      sx={{ borderRadius: '12px' }}
                    />
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    )}
    
    <Box sx={{ textAlign: 'center', mt: 2, mb: 5 }}>
      <Button 
        component={Link} 
        to="/player-stats"
        variant="text" 
        color="primary"
        sx={{ borderRadius: '20px', textTransform: 'none' }}
      >
        View All Statistics
      </Button>
    </Box>

    {/* News Section */}
    <SectionHeading variant="h4" color="primary" gutterBottom>
      Latest News & Announcements
    </SectionHeading>
    
    {loading ? (
      <Skeleton variant="rectangular" height={300} animation="wave" sx={{ borderRadius: '12px', mb: 5 }} />
    ) : (
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {news.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <StyledCard>
              <Box sx={{ 
                height: 200,
                backgroundImage: `url(${item.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                  p: 2,
                  color: 'white'
                }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.title}
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  {item.summary}
                </Typography>
                <Button
                  component={Link}
                  to={`/news/${item.id}`}
                  variant="text"
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  Read More
                </Button>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    )}
    
    <Box sx={{ textAlign: 'center', mb: 5 }}>
      <Button 
        component={Link} 
        to="/news"
        variant="text" 
        color="primary"
        sx={{ borderRadius: '20px', textTransform: 'none' }}
      >
        View All News
      </Button>
    </Box>

    {/* Call to Action Section */}
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        textAlign: 'center', 
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)',
        color: 'white',
        mb: 5
      }}
    >
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Join the Community
      </Typography>
      <Typography variant="body1" paragraph sx={{ maxWidth: '700px', mx: 'auto', mb: 3 }}>
        Are you a player, team manager, or cricket enthusiast? Join our growing community and stay updated with all the university cricket action.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <ActionButton
          component={Link}
          to="/signup"
          startIcon={<SportsCricketIcon />}
        >
          Register Your Team
        </ActionButton>
        <Button
          component={Link}
          to="/faq"
          variant="outlined"
          color="inherit"
          sx={{ 
            borderRadius: '24px', 
            borderColor: 'white', 
            color: 'white',
            '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } 
          }}
        >
          Learn More
        </Button>
      </Box>
    </Paper>
  </Container>
);
};

export default Home;