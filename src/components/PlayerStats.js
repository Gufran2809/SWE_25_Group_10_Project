import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { saveAs } from 'file-saver';
import { styled } from '@mui/material/styles';
import PlayerProfiles from './PlayerProfiles';

const StyledTable = styled(Table)(({ theme }) => ({
  '& th, & td': {
    border: '1px solid #e0e0e0',
  },
  '& th': {
    backgroundColor: '#1b5e20',
    color: 'white',
  },
}));

const PlayerStats = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState({ tournament: '', team: '', matchType: '' });
  const [statsData, setStatsData] = useState({
    batting: [],
    bowling: [],
    fielding: [],
    allRounders: [],
    teams: [],
    records: [],
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch batting stats
        let battingQuery = query(collection(db, 'players'), orderBy('stats.batting.runs', 'desc'));
        if (filter.tournament || filter.team || filter.matchType) {
          battingQuery = query(
            battingQuery,
            ...(filter.tournament ? [where('tournamentId', '==', filter.tournament)] : []),
            ...(filter.team ? [where('teamId', '==', filter.team)] : []),
            ...(filter.matchType ? [where('matchType', '==', filter.matchType)] : [])
          );
        }
        const battingSnapshot = await getDocs(battingQuery);
        const battingData = battingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          stats: doc.data().stats?.batting || { runs: 0, average: 0, centuries: 0 },
        }));

        // Fetch bowling stats
        let bowlingQuery = query(collection(db, 'players'), orderBy('stats.bowling.wickets', 'desc'));
        if (filter.tournament || filter.team || filter.matchType) {
          bowlingQuery = query(
            bowlingQuery,
            ...(filter.tournament ? [where('tournamentId', '==', filter.tournament)] : []),
            ...(filter.team ? [where('teamId', '==', filter.team)] : []),
            ...(filter.matchType ? [where('matchType', '==', filter.matchType)] : [])
          );
        }
        const bowlingSnapshot = await getDocs(bowlingQuery);
        const bowlingData = bowlingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          stats: doc.data().stats?.bowling || { wickets: 0, average: 0, best: '0/0' },
        }));

        // Fetch team stats
        let teamsQuery = query(collection(db, 'teams'), orderBy('stats.wins', 'desc'));
        if (filter.tournament) {
          teamsQuery = query(teamsQuery, where('tournamentId', '==', filter.tournament));
        }
        const teamsSnapshot = await getDocs(teamsQuery);
        const teamsData = teamsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          stats: doc.data().stats || { wins: 0, losses: 0, netRunRate: 0 },
        }));

        setStatsData({
          batting: battingData,
          bowling: bowlingData,
          fielding: [], // Placeholder
          allRounders: battingData.filter((p) => p.role === 'All-Rounder'),
          teams: teamsData,
          records: [
            { type: 'Highest Score', player: 'John Doe', value: '150*', matchId: 'm1' },
            { type: 'Best Bowling', player: 'Jane Smith', value: '5/20', matchId: 'm2' },
          ],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setSnackbar({ open: true, message: 'Failed to load statistics. Showing sample data.' });
        setStatsData({
          batting: [
            {
              id: '1',
              name: 'John Doe',
              stats: { runs: 450, average: 45.0, centuries: 1 },
            },
          ],
          bowling: [
            {
              id: '2',
              name: 'Jane Smith',
              stats: { wickets: 15, average: 20.5, best: '4/25' },
            },
          ],
          fielding: [],
          allRounders: [
            {
              id: '3',
              name: 'Mike Brown',
              role: 'All-Rounder',
              stats: { batting: { runs: 300 }, bowling: { wickets: 10 } },
            },
          ],
          teams: [
            { id: 'team1', name: 'Team A', stats: { wins: 5, losses: 2, netRunRate: 0.5 } },
          ],
          records: [
            { type: 'Highest Score', player: 'John Doe', value: '150*', matchId: 'm1' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filter]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const exportToCSV = () => {
    const headers = ['Player/Team', 'Stat', 'Value'];
    const data = [];
    if (tabValue === 0) {
      statsData.batting.forEach((p) =>
        data.push([p.name, 'Runs', p.stats.runs], [p.name, 'Average', p.stats.average])
      );
    } else if (tabValue === 1) {
      statsData.bowling.forEach((p) =>
        data.push([p.name, 'Wickets', p.stats.wickets], [p.name, 'Average', p.stats.average])
      );
    }
    const csv = [headers, ...data].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'stats.csv');
  };

  const getGraphData = () => {
    if (tabValue === 0) {
      return statsData.batting.slice(0, 5).map((p) => ({
        name: p.name,
        value: p.stats.runs,
      }));
    } else if (tabValue === 1) {
      return statsData.bowling.slice(0, 5).map((p) => ({
        name: p.name,
        value: p.stats.wickets,
      }));
    }
    return [];
  };

  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h1" color="primary" gutterBottom>
        Statistics Hub
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Comprehensive statistics for players, teams, and records.
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
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
        <Grid item xs={12} sm={4}>
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
        <Grid item xs={12} sm={4}>
          <TextField
            label="Filter by Match Type"
            name="matchType"
            select
            value={filter.matchType}
            onChange={handleFilterChange}
            fullWidth
          >
            <MenuItem value="">All Match Types</MenuItem>
            <MenuItem value="T20">T20</MenuItem>
            <MenuItem value="One Day">One Day</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Batting" />
        <Tab label="Bowling" />
        <Tab label="Fielding" />
        <Tab label="All-Rounders" />
        <Tab label="Teams" />
        <Tab label="Records" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Leaderboard Table */}
          <StyledTable>
            <TableHead>
              <TableRow>
                {tabValue === 0 && (
                  <>
                    <TableCell>Player</TableCell>
                    <TableCell>Runs</TableCell>
                    <TableCell>Average</TableCell>
                    <TableCell>Centuries</TableCell>
                  </>
                )}
                {tabValue === 1 && (
                  <>
                    <TableCell>Player</TableCell>
                    <TableCell>Wickets</TableCell>
                    <TableCell>Average</TableCell>
                    <TableCell>Best</TableCell>
                  </>
                )}
                {tabValue === 2 && (
                  <>
                    <TableCell>Player</TableCell>
                    <TableCell>Catches</TableCell>
                    <TableCell>Run Outs</TableCell>
                  </>
                )}
                {tabValue === 3 && (
                  <>
                    <TableCell>Player</TableCell>
                    <TableCell>Runs</TableCell>
                    <TableCell>Wickets</TableCell>
                  </>
                )}
                {tabValue === 4 && (
                  <>
                    <TableCell>Team</TableCell>
                    <TableCell>Wins</TableCell>
                    <TableCell>Losses</TableCell>
                    <TableCell>Net Run Rate</TableCell>
                  </>
                )}
                {tabValue === 5 && (
                  <>
                    <TableCell>Type</TableCell>
                    <TableCell>Player</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Match</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tabValue === 0 &&
                statsData.batting.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Link to={`/player/${player.id}`}>{player.name}</Link>
                    </TableCell>
                    <TableCell>{player.stats.runs}</TableCell>
                    <TableCell>{player.stats.average}</TableCell>
                    <TableCell>{player.stats.centuries}</TableCell>
                  </TableRow>
                ))}
              {tabValue === 1 &&
                statsData.bowling.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Link to={`/player/${player.id}`}>{player.name}</Link>
                    </TableCell>
                    <TableCell>{player.stats.wickets}</TableCell>
                    <TableCell>{player.stats.average}</TableCell>
                    <TableCell>{player.stats.best}</TableCell>
                  </TableRow>
                ))}
              {tabValue === 2 &&
                statsData.fielding.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Link to={`/player/${player.id}`}>{player.name}</Link>
                    </TableCell>
                    <TableCell>{player.stats.catches}</TableCell>
                    <TableCell>{player.stats.runOuts}</TableCell>
                  </TableRow>
                ))}
              {tabValue === 3 &&
                statsData.allRounders.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Link to={`/player/${player.id}`}>{player.name}</Link>
                    </TableCell>
                    <TableCell>{player.stats.batting.runs}</TableCell>
                    <TableCell>{player.stats.bowling.wickets}</TableCell>
                  </TableRow>
                ))}
              {tabValue === 4 &&
                statsData.teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <Link to={`/team/${team.id}`}>{team.name}</Link>
                    </TableCell>
                    <TableCell>{team.stats.wins}</TableCell>
                    <TableCell>{team.stats.losses}</TableCell>
                    <TableCell>{team.stats.netRunRate}</TableCell>
                  </TableRow>
                ))}
              {tabValue === 5 &&
                statsData.records.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{record.player}</TableCell>
                    <TableCell>{record.value}</TableCell>
                    <TableCell>
                      <Link to={`/scorecard/${record.matchId}`}>View Match</Link>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </StyledTable>

          {/* Visualizations */}
          {(tabValue === 0 || tabValue === 1) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                Top Performers
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getGraphData()}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill={tabValue === 0 ? '#1b5e20' : '#d32f2f'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Export Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={exportToCSV}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
            >
              Export to CSV
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
              onClick={() => setSnackbar({ open: true, message: 'PDF export not implemented yet.' })}
            >
              Export to PDF
            </Button>
          </Box>

          {/* Player Profiles Section */}
          <Box sx={{ mt: 6 }}>
            <PlayerProfiles />
          </Box>

          {/* Snackbar for Error Handling */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            message={snackbar.message}
          />
        </>
      )}
    </Container>
  );
};

export default PlayerStats;