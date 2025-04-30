import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
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
  Button,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { MdSportsCricket as CricketIcon } from 'react-icons/md';
import { db } from '../firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} id={`match-tabpanel-${index}`}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const MatchDetail = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    setLoading(true);

    // Fetch match
    const fetchMatch = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', id));
        if (matchDoc.exists()) {
          setMatch({ id: matchDoc.id, ...matchDoc.data() });
        } else {
          setSnackbar({ open: true, message: 'Match not found' });
        }
      } catch (error) {
        console.error('Error fetching match:', error);
        setSnackbar({ open: true, message: 'Failed to load match details' });
      }
    };

    // Real-time subscriptions
    const unsubscribeTeams = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTeams(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching teams:', error);
        setSnackbar({ open: true, message: 'Failed to load teams' });
        setLoading(false);
      }
    );

    const unsubscribeCommentary = onSnapshot(
      collection(db, 'matches', id, 'commentary'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCommentary(data.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching commentary:', error);
        setSnackbar({ open: true, message: 'Failed to load commentary' });
        setLoading(false);
      }
    );

    fetchMatch();

    return () => {
      unsubscribeTeams();
      unsubscribeCommentary();
    };
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const team1 = teams.find((t) => t.id === match?.team1Id);
  const team2 = teams.find((t) => t.id === match?.team2Id);

  return (
    <Container sx={{ py: 4, maxWidth: 'lg' }}>
      {match ? (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" color="primary" gutterBottom>
              {team1?.name} vs {team2?.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {match.venue} | {match.matchDate} | {match.status}
            </Typography>
            {match.status === 'Live' && (
              <Typography variant="h5" color="secondary" sx={{ mt: 2 }}>
                {match.score.team1.runs}/{match.score.team1.wickets} ({match.score.team1.overs}) vs{' '}
                {match.score.team2.runs}/{match.score.team2.wickets} ({match.score.team2.overs})
              </Typography>
            )}
          </Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{ bgcolor: 'white', borderRadius: 1, mb: 2 }}
          >
            <Tab label="Summary" icon={<CricketIcon />} />
            <Tab label="Scorecard" />
            <Tab label="Commentary" />
            <Tab label="Statistics" />
            <Tab label="Teams" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6">Match Summary</Typography>
                <Typography>Toss: {match.tossWinner} chose to {match.tossDecision}</Typography>
                <Typography>Pitch: {match.pitchConditions}</Typography>
                <Typography>Weather: {match.weatherConditions}</Typography>
                {match.status === 'Completed' && (
                  <Typography>Result: {match.winnerName} won by {match.winningMargin}</Typography>
                )}
                {match.status === 'Live' && match.streamUrl && (
                  <Button
                    variant="contained"
                    color="secondary"
                    href={match.streamUrl}
                    target="_blank"
                    sx={{ mt: 2 }}
                  >
                    Watch Live
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardContent>
                <Typography variant="h6">Scorecard</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Batsman</TableCell>
                        <TableCell>Runs</TableCell>
                        <TableCell>Balls</TableCell>
                        <TableCell>4s</TableCell>
                        <TableCell>6s</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {match.scorecard?.batsmen.map((batsman) => (
                        <TableRow key={batsman.playerId}>
                          <TableCell>
                            <Link
                              to={`/player/${batsman.playerId}`}
                              style={{ textDecoration: 'none', color: '#1b5e20' }}
                            >
                              {batsman.name}
                            </Link>
                          </TableCell>
                          <TableCell>{batsman.runs}</TableCell>
                          <TableCell>{batsman.balls}</TableCell>
                          <TableCell>{batsman.fours}</TableCell>
                          <TableCell>{batsman.sixes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6">Ball-by-Ball Commentary</Typography>
                <List>
                  {commentary.map((comm) => (
                    <ListItem key={comm.id}>
                      <ListItemText
                        primary={`${comm.over}.${comm.ball}: ${comm.text}`}
                        secondary={new Date(comm.timestamp).toLocaleTimeString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Match Statistics</Typography>
                <Typography>Run Rate: {match.stats?.runRate?.toFixed(2)}</Typography>
                <Typography>Partnership: {match.stats?.currentPartnership?.runs} runs</Typography>
                <Typography>Fall of Wickets: {match.stats?.fallOfWickets.join(', ')}</Typography>
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Teams</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">
                      <Link to={`/team/${team1?.id}`} style={{ textDecoration: 'none', color: '#1b5e20' }}>
                        {team1?.name}
                      </Link>
                    </Typography>
                    <List>
                      {match.squads?.team1.map((playerId) => {
                        const player = match.players?.find((p) => p.id === playerId);
                        return (
                          <ListItem key={playerId}>
                            <ListItemText>
                              <Link
                                to={`/player/${playerId}`}
                                style={{ textDecoration: 'none', color: '#1b5e20' }}
                              >
                                {player?.name}
                              </Link>
                            </ListItemText>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">
                      <Link to={`/team/${team2?.id}`} style={{ textDecoration: 'none', color: '#1b5e20' }}>
                        {team2?.name}
                      </Link>
                    </Typography>
                    <List>
                      {match.squads?.team2.map((playerId) => {
                        const player = match.players?.find((p) => p.id === playerId);
                        return (
                          <ListItem key={playerId}>
                            <ListItemText>
                              <Link
                                to={`/player/${playerId}`}
                                style={{ textDecoration: 'none', color: '#1b5e20' }}
                              >
                                {player?.name}
                              </Link>
                            </ListItemText>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
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

export default MatchDetail;