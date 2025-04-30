import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Avatar,
  Button,
  CircularProgress,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { MdEmojiEvents as TrophyIcon } from 'react-icons/md';
import { db } from '../firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';

// TabPanel component (reused from EnhancedLeagueManagement.js for consistency)
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tournament-tabpanel-${index}`}
    aria-labelledby={`tournament-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Tournament = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'points', direction: 'desc' });
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Fetch tournament and related data
  useEffect(() => {
    setLoading(true);

    // Fetch tournament
    const fetchTournament = async () => {
      try {
        const tournamentDoc = await getDoc(doc(db, 'leagues', id));
        if (tournamentDoc.exists()) {
          setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() });
        } else {
          setSnackbar({ open: true, message: 'Tournament not found' });
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setSnackbar({ open: true, message: 'Failed to load tournament details' });
      }
    };

    // Real-time subscriptions
    const unsubscribeTeams = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTeams(data.filter((team) => team.leagueId === id));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching teams:', error);
        setSnackbar({ open: true, message: 'Failed to load teams' });
        setLoading(false);
      }
    );

    const unsubscribeMatches = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMatches(data.filter((match) => match.leagueId === id));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching matches:', error);
        setSnackbar({ open: true, message: 'Failed to load matches' });
        setLoading(false);
      }
    );

    const unsubscribePlayers = onSnapshot(
      collection(db, 'players'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlayers(data.filter((player) => teams.some((team) => team.id === player.teamId)));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching players:', error);
        setSnackbar({ open: true, message: 'Failed to load players' });
        setLoading(false);
      }
    );

    fetchTournament();

    return () => {
      unsubscribeTeams();
      unsubscribeMatches();
      unsubscribePlayers();
    };
  }, [id, teams]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc',
    });
  };

  const handleScheduleFilterChange = (event) => {
    setScheduleFilter(event.target.value);
  };

  // Calculate Points Table
  const getPointsTable = () => {
    const pointsTable = teams.map((team) => {
      const teamMatches = matches.filter(
        (m) => (m.team1Id === team.id || m.team2Id === team.id) && m.status === 'Completed'
      );
      let points = 0;
      let matchesPlayed = 0;
      let wins = 0;
      let losses = 0;
      let nrr = 0;
      teamMatches.forEach((m) => {
        matchesPlayed++;
        const isTeam1 = m.team1Id === team.id;
        const teamScore = isTeam1 ? m.score.team1 : m.score.team2;
        const opponentScore = isTeam1 ? m.score.team2 : m.score.team1;
        if (teamScore.runs > opponentScore.runs) {
          points += 2;
          wins++;
        } else if (teamScore.runs < opponentScore.runs) {
          losses++;
        }
        nrr += (teamScore.runs - opponentScore.runs) / (teamScore.overs || 1);
      });
      return {
        teamId: team.id,
        teamName: team.name,
        matchesPlayed,
        wins,
        losses,
        points,
        nrr: nrr.toFixed(2),
      };
    });
    return pointsTable.sort((a, b) => {
      if (sortConfig.key === 'points') {
        return sortConfig.direction === 'desc' ? b.points - a.points : a.points - b.points;
      }
      if (sortConfig.key === 'nrr') {
        return sortConfig.direction === 'desc' ? b.nrr - a.nrr : a.nrr - b.nrr;
      }
      return 0;
    });
  };

  // Get Player Rankings
  const getPlayerRankings = () => {
    return {
      batsmen: players
        .sort((a, b) => b.stats.runs - a.stats.runs)
        .slice(0, 5)
        .map((p) => ({ id: p.id, name: p.name, teamId: p.teamId, stats: p.stats })),
      bowlers: players
        .sort((a, b) => b.stats.wickets - a.stats.wickets)
        .slice(0, 5)
        .map((p) => ({ id: p.id, name: p.name, teamId: p.teamId, stats: p.stats })),
    };
  };

  // Filter Matches
  const filteredMatches = matches.filter((match) => {
    if (scheduleFilter === 'all') return true;
    if (scheduleFilter === 'upcoming') return match.status === 'Scheduled';
    if (scheduleFilter === 'live') return match.status === 'Live';
    if (scheduleFilter === 'completed') return match.status === 'Completed';
    return true;
  });

  // Render Bracket (Placeholder for interactive visualization)
  const renderBracket = () => {
    const bracket = tournament?.bracket || [];
    if (!bracket.length) return <Typography>No bracket data available</Typography>;
    return (
      <Box>
        {bracket.map((match, index) => (
          <Card key={match.matchId} sx={{ mb: 2 }}>
            <CardContent>
              <Typography>
                Round {match.round + 1}: {teams.find((t) => t.id === match.team1Id)?.name || 'TBD'} vs{' '}
                {teams.find((t) => t.id === match.team2Id)?.name || 'TBD'}
              </Typography>
              <Typography>Date: {match.date || 'TBD'}</Typography>
              <Typography>Venue: {match.venue || 'TBD'}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Container sx={{ py: 4, maxWidth: 'lg' }}>
      {/* Tournament Header */}
      {tournament ? (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {tournament.thumbnail && <Avatar src={tournament.thumbnail} sx={{ width: 80, height: 80 }} />}
            <Box>
              <Typography variant="h3" color="primary" gutterBottom>
                {tournament.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {tournament.description}
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography>Dates: {tournament.startDate} - {tournament.endDate}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>Format: {tournament.format}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>Status: {tournament.status}</Typography>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabs */}
      {tournament && (
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{ bgcolor: 'white', borderRadius: 1, mb: 2 }}
          >
            <Tab label="Overview" icon={<TrophyIcon />} />
            <Tab label="Teams" />
            <Tab label="Schedule" />
            <Tab label="Points Table" />
            <Tab label="Brackets" />
            <Tab label="Statistics" />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tournament Overview
                </Typography>
                <Typography>{tournament.description || 'No description available.'}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography>Venue: {tournament.venue || 'TBD'}</Typography>
                <Typography>Match Type: {tournament.matchType}</Typography>
                <Typography>Teams Participating: {teams.length}</Typography>
                <Typography>Matches Scheduled: {matches.length}</Typography>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Teams Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {teams.map((team) => (
                <Grid item xs={12} sm={6} md={4} key={team.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {team.logo && <Avatar src={team.logo} />}
                        <Typography variant="h6">
                          <Link to={`/team/${team.id}`} style={{ textDecoration: 'none', color: '#1b5e20' }}>
                            {team.name}
                          </Link>
                        </Typography>
                      </Box>
                      <Typography>Players: {team.playerIds.length}</Typography>
                      <Typography>
                        Captain: {players.find((p) => p.id === team.captainId)?.name || 'Not assigned'}
                      </Typography>
                      <Typography>
                        Stats: {team.stats.wins} Wins, {team.stats.losses} Losses
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Schedule Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter Matches</InputLabel>
                <Select value={scheduleFilter} onChange={handleScheduleFilterChange} label="Filter Matches">
                  <MenuItem value="all">All Matches</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="live">Live</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <List>
              {filteredMatches.map((match) => (
                <ListItem
                  key={match.id}
                  sx={{ bgcolor: match.status === 'Live' ? '#ffebee' : 'white', mb: 1, borderRadius: 1 }}
                >
                  <ListItemText
                    primary={
                      <Link to={`/match/${match.id}`} style={{ textDecoration: 'none', color: '#1b5e20' }}>
                        {teams.find((t) => t.id === match.team1Id)?.name} vs{' '}
                        {teams.find((t) => t.id === match.team2Id)?.name}
                      </Link>
                    }
                    secondary={`Date: ${match.matchDate}, Time: ${match.matchTime}, Venue: ${match.venue}, Status: ${match.status}`}
                  />
                  {match.status === 'Live' && (
                    <Button
                      variant="contained"
                      component={Link}
                      to={`/match/${match.id}`}
                      sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
                    >
                      Watch Live
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </TabPanel>

          {/* Points Table Tab */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'teamName'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('teamName')}
                      >
                        Team
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Matches</TableCell>
                    <TableCell align="right">Wins</TableCell>
                    <TableCell align="right">Losses</TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'points'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('points')}
                      >
                        Points
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'nrr'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('nrr')}
                      >
                        NRR
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getPointsTable().map((row) => (
                    <TableRow key={row.teamId}>
                      <TableCell>
                        <Link to={`/team/${row.teamId}`} style={{ textDecoration: 'none', color: '#1b5e20' }}>
                          {row.teamName}
                        </Link>
                      </TableCell>
                      <TableCell align="right">{row.matchesPlayed}</TableCell>
                      <TableCell align="right">{row.wins}</TableCell>
                      <TableCell align="right">{row.losses}</TableCell>
                      <TableCell align="right">{row.points}</TableCell>
                      <TableCell align="right">{row.nrr}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Brackets Tab */}
          <TabPanel value={tabValue} index={4}>
            {renderBracket()}
          </TabPanel>

          {/* Statistics Tab */}
          <TabPanel value={tabValue} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Leading Run-Scorers
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Player</TableCell>
                        <TableCell>Team</TableCell>
                        <TableCell align="right">Runs</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPlayerRankings().batsmen.map((player, idx) => (
                        <TableRow key={player.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            <Link
                              to={`/player/${player.id}`}
                              style={{ textDecoration: 'none', color: '#1b5e20' }}
                            >
                              {player.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {teams.find((t) => t.id === player.teamId)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell align="right">{player.stats.runs}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Leading Wicket-Takers
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Player</TableCell>
                        <TableCell>Team</TableCell>
                        <TableCell align="right">Wickets</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPlayerRankings().bowlers.map((player, idx) => (
                        <TableRow key={player.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            <Link
                              to={`/player/${player.id}`}
                              style={{ textDecoration: 'none', color: '#1b5e20' }}
                            >
                              {player.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {teams.find((t) => t.id === player.teamId)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell align="right">{player.stats.wickets}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      )}

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Tournament;