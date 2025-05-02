import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container, Paper, Typography, Box, Grid, Avatar,
  Card, Chip, Divider, LinearProgress, Button
} from '@mui/material';
import {
  SportsCricket as CricketIcon,
  Public as StadiumIcon,
  Schedule as TimeIcon,
  EventAvailable as CalendarIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

const MatchPreview = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState({});
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        // Fetch match data
        const matchDoc = await getDoc(doc(db, 'matches', matchId));
        if (!matchDoc.exists()) return;
        const matchData = { id: matchDoc.id, ...matchDoc.data() };

        // Fetch teams data
        const team1Doc = await getDoc(doc(db, 'teams', matchData.team1Id));
        const team2Doc = await getDoc(doc(db, 'teams', matchData.team2Id));
        
        // Fetch league data
        const leagueDoc = await getDoc(doc(db, 'leagues', matchData.leagueId));

        setMatch(matchData);
        setTeams({
          [matchData.team1Id]: { id: team1Doc.id, ...team1Doc.data() },
          [matchData.team2Id]: { id: team2Doc.id, ...team2Doc.data() }
        });
        setLeague(leagueDoc.exists() ? { id: leagueDoc.id, ...leagueDoc.data() } : null);
      } catch (error) {
        console.error('Error fetching match data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId]);

  if (loading || !match) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  // Format match date and time
  const matchDate = new Date(match.date);
  const formattedDate = matchDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getTeamName = (teamId) => teams[teamId]?.name || 'Team Not Found';
  const getTeamLogo = (teamId) => teams[teamId]?.logo || '';

  // Calculate time until match
  const now = new Date();
  const matchDateTime = new Date(match.date + 'T' + match.matchTime);
  const timeUntilMatch = matchDateTime - now;
  
  // Time until match in days, hours, minutes
  const daysUntil = Math.floor(timeUntilMatch / (1000 * 60 * 60 * 24));
  const hoursUntil = Math.floor((timeUntilMatch % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntilMatch % (1000 * 60)) / (1000 * 60));
  
  // Status label based on time until match
  let statusLabel = 'Upcoming';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Match Header */}
      <Paper elevation={3} sx={{ 
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        p: 3, 
        borderRadius: '16px',
        color: 'white'
      }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={5} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={getTeamLogo(match.team1Id)}
              sx={{ 
                width: 140, 
                height: 140, 
                mx: 'auto', 
                mb: 2,
                border: '4px solid rgba(255,255,255,0.2)'
              }}
            >
              {getTeamName(match.team1Id).substring(0, 2).toUpperCase()}
            </Avatar>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {getTeamName(match.team1Id)}
            </Typography>
            {match.score?.team1 && (
              <Typography variant="h5" sx={{ opacity: 0.9 }}>
                {match.score.team1.runs}/{match.score.team1.wickets}
                <Typography variant="subtitle1" component="span" sx={{ ml: 1 }}>
                  ({match.score.team1.overs})
                </Typography>
              </Typography>
            )}
          </Grid>

          <Grid item xs={2} sx={{ textAlign: 'center' }}>
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              p: 2,
              width: 60,
              height: 60,
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h4" fontWeight="bold">VS</Typography>
            </Box>
            <Chip 
              label={statusLabel}
              sx={{ 
                mt: 2,
                bgcolor: match.status === 'live' ? '#f44336' : 
                       (statusLabel === 'Starting Soon' ? '#ff9800' : 'rgba(255,255,255,0.2)'),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Grid>

          <Grid item xs={5} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={getTeamLogo(match.team2Id)}
              sx={{ 
                width: 140, 
                height: 140, 
                mx: 'auto', 
                mb: 2,
                border: '4px solid rgba(255,255,255,0.2)'
              }}
            >
              {getTeamName(match.team2Id).substring(0, 2).toUpperCase()}
            </Avatar>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {getTeamName(match.team2Id)}
            </Typography>
            {match.score?.team2 && (
              <Typography variant="h5" sx={{ opacity: 0.9 }}>
                {match.score.team2.runs}/{match.score.team2.wickets}
                <Typography variant="subtitle1" component="span" sx={{ ml: 1 }}>
                  ({match.score.team2.overs})
                </Typography>
              </Typography>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CricketIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                {league?.matchType || match.matchType} ({match.overs} overs)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StadiumIcon sx={{ mr: 1 }} />
              <Typography variant="body1">{league?.venue || match.venue}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                {match.matchTime} | {formattedDate}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Countdown Timer */}
      {match.status !== 'live' && match.status !== 'completed' && (
        <Card sx={{ p: 3, mb: 3, borderRadius: '16px', textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Match Starts In
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="text.primary">{daysUntil}</Typography>
              <Typography variant="body2" color="text.secondary">Days</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="text.primary">{hoursUntil}</Typography>
              <Typography variant="body2" color="text.secondary">Hours</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="text.primary">{minutesUntil}</Typography>
              <Typography variant="body2" color="text.secondary">Minutes</Typography>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            startIcon={<CalendarIcon />}
          >
            Add to Calendar
          </Button>
        </Card>
      )}

      {/* Match Information */}
      <Grid container spacing={3}>
        {/* Match Details */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%', borderRadius: '16px' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Match Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  League/Tournament
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {league?.name || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Match Format
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {match.matchType} ({match.overs} overs)
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Venue
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {match.venue}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Umpire
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {match.umpireId || 'To be announced'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formattedDate} at {match.matchTime}
                </Typography>
              </Grid>
              {match.weatherInfo && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Weather Forecast
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {match.weatherInfo}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        {/* Team Information */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%', borderRadius: '16px' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Teams Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {getTeamName(match.team1Id)}
              </Typography>
              {teams[match.team1Id]?.playerIds?.length > 0 ? (
                <Typography variant="body2">
                  Squad Size: {teams[match.team1Id].playerIds.length} players
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Squad details will be announced soon
                </Typography>
              )}
            </Box>
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {getTeamName(match.team2Id)}
              </Typography>
              {teams[match.team2Id]?.playerIds?.length > 0 ? (
                <Typography variant="body2">
                  Squad Size: {teams[match.team2Id].playerIds.length} players
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Squad details will be announced soon
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MatchPreview;