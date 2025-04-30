import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { MdGroup as TeamIcon } from 'react-icons/md';
import { db } from '../firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';

const TeamProfile = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    setLoading(true);

    // Fetch team
    const fetchTeam = async () => {
      try {
        const teamDoc = await getDoc(doc(db, 'teams', id));
        if (teamDoc.exists()) {
          const teamData = { id: teamDoc.id, ...teamDoc.data() };
          setTeam(teamData);
          // Fetch tournament
          const tournamentDoc = await getDoc(doc(db, 'leagues', teamData.leagueId));
          if (tournamentDoc.exists()) {
            setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() });
          }
        } else {
          setSnackbar({ open: true, message: 'Team not found' });
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        setSnackbar({ open: true, message: 'Failed to load team details' });
      }
    };

    // Real-time subscriptions
    const unsubscribePlayers = onSnapshot(
      collection(db, 'players'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlayers(data.filter((player) => player.teamId === id));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching players:', error);
        setSnackbar({ open: true, message: 'Failed to load players' });
        setLoading(false);
      }
    );

    const unsubscribeMatches = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMatches(data.filter((match) => match.team1Id === id || match.team2Id === id));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching matches:', error);
        setSnackbar({ open: true, message: 'Failed to load matches' });
        setLoading(false);
      }
    );

    fetchTeam();

    return () => {
      unsubscribePlayers();
      unsubscribeMatches();
    };
  }, [id]);

  const recentMatches = matches
    .filter((m) => m.status === 'Completed')
    .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate))
    .slice(0, 5);

  const upcomingMatches = matches
    .filter((m) => m.status === 'Scheduled')
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
    .slice(0, 5);

  return (
    <Container sx={{ py: 4, maxWidth: 'lg' }}>
      {team ? (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            {team.logo && <Avatar src={team.logo} sx={{ width: 80, height: 80 }} />}
            <Box>
              <Typography variant="h3" color="primary" gutterBottom>
                {team.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                <Link
                  to={`/tournament/${tournament?.id}`}
                  style={{ textDecoration: 'none', color: '#1b5e20' }}
                >
                  {tournament?.name}
                </Link>
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Overview
                  </Typography>
                  <Typography>Record: {team.stats.wins} Wins, {team.stats.losses} Losses</Typography>
                  <Typography>Captain: {players.find((p) => p.id === team.captainId)?.name}</Typography>
                  <Typography>
                    Wicketkeeper: {players.find((p) => p.id === team.wicketkeeperId)?.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Statistics
                  </Typography>
                  <Typography>Batting Average: {team.stats.battingAvg?.toFixed(2)}</Typography>
                  <Typography>Bowling Economy: {team.stats.bowlingEcon?.toFixed(2)}</Typography>
                  <Typography>Fielding Catches: {team.stats.catches}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Player Roster
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Player</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Runs</TableCell>
                          <TableCell>Wickets</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {players.map((player) => (
                          <TableRow key={player.id}>
                            <TableCell>
                              <Link
                                to={`/player/${player.id}`}
                                style={{ textDecoration: 'none', color: '#1b5e20' }}
                              >
                                {player.name}
                                {player.id === team.captainId && ' (C)'}
                                {player.id === team.wicketkeeperId && ' (WK)'}
                              </Link>
                            </TableCell>
                            <TableCell>{player.role}</TableCell>
                            <TableCell>{player.stats.runs}</TableCell>
                            <TableCell>{player.stats.wickets}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Results
                  </Typography>
                  <List>
                    {recentMatches.map((match) => (
                      <ListItem key={match.id}>
                        <ListItemText
                          primary={
                            <Link
                              to={`/match/${match.id}`}
                              style={{ textDecoration: 'none', color: '#1b5e20' }}
                            >
                              vs {match.team1Id === id ? match.team2Name : match.team1Name}
                            </Link>
                          }
                          secondary={`Result: ${match.winnerId === id ? 'Won' : 'Lost'}, Score: ${
                            match.score.team1.runs
                          }/${match.score.team1.wickets} vs ${match.score.team2.runs}/${
                            match.score.team2.wickets
                          }`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Fixtures
                  </Typography>
                  <List>
                    {upcomingMatches.map((match) => (
                      <ListItem key={match.id}>
                        <ListItemText
                          primary={
                            <Link
                              to={`/match/${match.id}`}
                              style={{ textDecoration: 'none', color: '#1b5e20' }}
                            >
                              vs {match.team1Id === id ? match.team2Name : match.team1Name}
                            </Link>
                          }
                          secondary={`Date: ${match.matchDate}, Venue: ${match.venue}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default TeamProfile;