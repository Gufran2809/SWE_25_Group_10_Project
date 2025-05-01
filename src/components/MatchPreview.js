import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';

const MatchPreview = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', matchId));
        if (matchDoc.exists()) {
          setMatch({ id: matchDoc.id, ...matchDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching match:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) return null;
  if (!match) return <Typography>Match not found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: '12px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Match Preview
        </Typography>

        {/* Teams */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={5} sx={{ textAlign: 'center' }}>
            <Avatar
              src={match.team1Logo}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5">{match.team1}</Typography>
          </Grid>
          <Grid item xs={2} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <Typography variant="h4">VS</Typography>
          </Grid>
          <Grid item xs={5} sx={{ textAlign: 'center' }}>
            <Avatar
              src={match.team2Logo}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5">{match.team2}</Typography>
          </Grid>
        </Grid>

        {/* Match Details */}
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <CalendarTodayIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Match Date & Time"
              secondary={new Date(match.matchDate).toLocaleString()}
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <LocationOnIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Venue"
              secondary={match.venue}
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <GroupsIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Tournament"
              secondary={match.tournamentName}
            />
          </ListItem>
        </List>

        {/* Team Squads */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Probable Playing XI
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                {match.team1}
              </Typography>
              <List>
                {match.team1Squad?.map((player, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={player.name} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                {match.team2}
              </Typography>
              <List>
                {match.team2Squad?.map((player, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={player.name} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default MatchPreview;