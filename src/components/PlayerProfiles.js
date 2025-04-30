import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  boxShadow: theme.shadows[2],
}));

const PlayerProfiles = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filter, setFilter] = useState({ team: '', role: '', tournament: '', year: '' });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        let q = collection(db, 'players');
        if (filter.team || filter.role || filter.tournament || filter.year) {
          q = query(
            q,
            ...(filter.team ? [where('teamId', '==', filter.team)] : []),
            ...(filter.role ? [where('role', '==', filter.role)] : []),
            ...(filter.tournament ? [where('tournamentId', '==', filter.tournament)] : []),
            ...(filter.year ? [where('year', '==', filter.year)] : [])
          );
        }
        const snapshot = await getDocs(q);
        const playersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          stats: {
            batting: doc.data().stats?.batting || { matches: 0, runs: 0, average: 0, centuries: 0 },
            bowling: doc.data().stats?.bowling || { matches: 0, wickets: 0, average: 0, best: '0/0' },
            fielding: doc.data().stats?.fielding || { catches: 0, runOuts: 0 },
            overall: doc.data().stats?.overall || { matches: 0, runs: 0, wickets: 0 },
          },
        }));
        setPlayers(playersData);
        if (playersData.length > 0 && !selectedPlayer) {
          setSelectedPlayer(playersData[0]);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([
          {
            id: '1',
            name: 'John Doe',
            teamId: 'team1',
            team: 'Team A',
            role: 'Batsman',
            tournamentId: 't1',
            year: '2025',
            photo: '',
            stats: {
              batting: { matches: 10, runs: 450, average: 45.0, centuries: 1 },
              bowling: { matches: 10, wickets: 2, average: 50.0, best: '1/30' },
              fielding: { catches: 5, runOuts: 1 },
              overall: { matches: 10, runs: 450, wickets: 2 },
            },
            recentMatches: [
              { matchId: 'm1', runs: 75, wickets: 0, date: '2025-04-28' },
              { matchId: 'm2', runs: 20, wickets: 1, date: '2025-04-29' },
            ],
          },
        ]);
        setSelectedPlayer({
          id: '1',
          name: 'John Doe',
          teamId: 'team1',
          team: 'Team A',
          role: 'Batsman',
          tournamentId: 't1',
          year: '2025',
          photo: '',
          stats: {
            batting: { matches: 10, runs: 450, average: 45.0, centuries: 1 },
            bowling: { matches: 10, wickets: 2, average: 50.0, best: '1/30' },
            fielding: { catches: 5, runOuts: 1 },
            overall: { matches: 10, runs: 450, wickets: 2 },
          },
          recentMatches: [
            { matchId: 'm1', runs: 75, wickets: 0, date: '2025-04-28' },
            { matchId: 'm2', runs: 20, wickets: 1, date: '2025-04-29' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [filter]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    setSelectedPlayer(null);
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setTabValue(0);
  };

  const getGraphData = () => {
    return selectedPlayer?.recentMatches?.map((match) => ({
      date: match.date,
      runs: match.runs,
      wickets: match.wickets,
    })) || [];
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <Typography variant="h2" color="primary" align="center" gutterBottom>
        Player Profiles
      </Typography>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Filter by Team"
              name="team"
              select
              value={filter.team}
              onChange={handleFilterChange}
              fullWidth
            >
              <MenuItem value="">All Teams</MenuItem>
              <MenuItem value="team1">Team A</MenuItem>
              <MenuItem value="team2">Team B</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Filter by Role"
              name="role"
              select
              value={filter.role}
              onChange={handleFilterChange}
              fullWidth
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="Batsman">Batsman</MenuItem>
              <MenuItem value="Bowler">Bowler</MenuItem>
              <MenuItem value="All-Rounder">All-Rounder</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Filter by Tournament"
              name="tournament"
              select
              value={filter.tournament}
              onChange={handleFilterChange}
              fullWidth
            >
              <MenuItem value="">All Tournaments</MenuItem>
              <MenuItem value="t1">University Cup</MenuItem>
              <MenuItem value="t2">Intra-University League</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Filter by Year"
              name="year"
              select
              value={filter.year}
              onChange={handleFilterChange}
              fullWidth
            >
              <MenuItem value="">All Years</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Player List */}
            <Grid item xs={12} md={4}>
              <Typography variant="h4" color="primary" gutterBottom>
                Players
              </Typography>
              {players.length > 0 ? (
                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                  {players.map((player) => (
                    <ListItem
                      key={player.id}
                      onClick={() => handlePlayerClick(player)}
                      sx={{
                        bgcolor: selectedPlayer?.id === player.id ? '#1b5e20' : '#f5f5f5',
                        color: selectedPlayer?.id === player.id ? 'white' : 'text.primary',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#4caf50', color: 'white' },
                      }}
                    >
                      <ListItemText primary={`${player.name} (${player.role})`} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">No players match the filters.</Typography>
              )}
            </Grid>

            {/* Player Details */}
            <Grid item xs={12} md={8}>
              {selectedPlayer ? (
                <StyledCard>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <img
                          src={selectedPlayer.photo || 'https://via.placeholder.com/150'}
                          alt={selectedPlayer.name}
                          style={{ width: '100%', borderRadius: '8px' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Typography variant="h3" color="primary" gutterBottom>
                          {selectedPlayer.name}
                        </Typography>
                        <Typography>
                          <strong>Team:</strong>{' '}
                          <Link to={`/team/${selectedPlayer.teamId}`}>{selectedPlayer.team}</Link>
                        </Typography>
                        <Typography>
                          <strong>Role:</strong> {selectedPlayer.role}
                        </Typography>
                        <Typography>
                          <strong>Tournament:</strong>{' '}
                          <Link to={`/tournament/${selectedPlayer.tournamentId}`}>
                            {selectedPlayer.tournamentId === 't1' ? 'University Cup' : 'Intra-University League'}
                          </Link>
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Statistics Tabs */}
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      centered
                      sx={{ mt: 2, mb: 3 }}
                    >
                      <Tab label="Batting" />
                      <Tab label="Bowling" />
                      <Tab label="Fielding" />
                      <Tab label="Overall" />
                    </Tabs>

                    {tabValue === 0 && (
                      <Box>
                        <Typography>
                          <strong>Matches:</strong> {selectedPlayer.stats.batting.matches}
                        </Typography>
                        <Typography>
                          <strong>Runs:</strong> {selectedPlayer.stats.batting.runs}
                        </Typography>
                        <Typography>
                          <strong>Average:</strong> {selectedPlayer.stats.batting.average}
                        </Typography>
                        <Typography>
                          <strong>Centuries:</strong> {selectedPlayer.stats.batting.centuries}
                        </Typography>
                      </Box>
                    )}
                    {tabValue === 1 && (
                      <Box>
                        <Typography>
                          <strong>Matches:</strong> {selectedPlayer.stats.bowling.matches}
                        </Typography>
                        <Typography>
                          <strong>Wickets:</strong> {selectedPlayer.stats.bowling.wickets}
                        </Typography>
                        <Typography>
                          <strong>Average:</strong> {selectedPlayer.stats.bowling.average}
                        </Typography>
                        <Typography>
                          <strong>Best:</strong> {selectedPlayer.stats.bowling.best}
                        </Typography>
                      </Box>
                    )}
                    {tabValue === 2 && (
                      <Box>
                        <Typography>
                          <strong>Catches:</strong> {selectedPlayer.stats.fielding.catches}
                        </Typography>
                        <Typography>
                          <strong>Run Outs:</strong> {selectedPlayer.stats.fielding.runOuts}
                        </Typography>
                      </Box>
                    )}
                    {tabValue === 3 && (
                      <Box>
                        <Typography>
                          <strong>Matches:</strong> {selectedPlayer.stats.overall.matches}
                        </Typography>
                        <Typography>
                          <strong>Runs:</strong> {selectedPlayer.stats.overall.runs}
                        </Typography>
                        <Typography>
                          <strong>Wickets:</strong> {selectedPlayer.stats.overall.wickets}
                        </Typography>
                      </Box>
                    )}

                    {/* Performance Graph */}
                    <Typography variant="h4" color="primary" sx={{ mt: 3, mb: 2 }}>
                      Recent Performances
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={getGraphData()}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="runs" fill="#1b5e20" />
                        <Bar dataKey="wickets" fill="#d32f2f" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Recent Matches */}
                    <Typography variant="h4" color="primary" sx={{ mt: 3, mb: 2 }}>
                      Last 5 Matches
                    </Typography>
                    {selectedPlayer.recentMatches?.slice(0, 5).map((match) => (
                      <Box key={match.matchId} sx={{ mb: 1 }}>
                        <Typography>
                          <Link to={`/scorecard/${match.matchId}`}>{match.date}</Link> - Runs: {match.runs}, Wickets:{' '}
                          {match.wickets}
                        </Typography>
                      </Box>
                    ))}

                    {/* Compare Button */}
                    <Button
                      variant="contained"
                      sx={{ mt: 3, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
                      component={Link}
                      to={`/compare/${selectedPlayer.id}`}
                    >
                      Compare Player
                    </Button>
                  </CardContent>
                </StyledCard>
              ) : (
                <Typography color="textSecondary">Select a player to view details.</Typography>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default PlayerProfiles;