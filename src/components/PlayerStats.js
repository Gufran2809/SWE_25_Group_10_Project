import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Grid, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TableSortLabel,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SportsIcon from '@mui/icons-material/Sports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import PlayerProfiles from './PlayerProfiles';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy as firestoreOrderBy } from 'firebase/firestore';

const getTrendIcon = (trend) => {
  switch(trend) {
    case 'up':
      return <TrendingUpIcon sx={{ color: 'success.main' }} />;
    case 'down':
      return <TrendingDownIcon sx={{ color: 'error.main' }} />;
    default:
      return <TrendingFlatIcon sx={{ color: 'info.main' }} />;
  }
};

const PlayerStats = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [league, setLeague] = useState('');
  const [team, setTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [players, setPlayers] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch leagues
        const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
        setLeagues(leaguesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch teams
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        setTeams(teamsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch players
        await fetchPlayers();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  // Fetch players with filters
  const fetchPlayers = async () => {
    try {
      let q = collection(db, 'players');

      if (team) {
        q = query(q, where('team', '==', team));
      }

      if (league) {
        q = query(q, where('leagues', 'array-contains', league));
      }

      if (orderBy) {
        // Handle nested field sorting
        const orderByField = `stats.overall.${orderBy}`;
        q = query(q, firestoreOrderBy(orderByField, order));
      }

      const snapshot = await getDocs(q);
      let playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply search filter client-side
      if (searchQuery) {
        playersData = playersData.filter(player =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Update filters effect
  useEffect(() => {
    fetchPlayers();
  }, [team, league, orderBy, order]);

  // Update search effect (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlayers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Function to render batting leaders table
  const renderBattingLeaders = () => (
    <TableContainer component={Paper} elevation={2}>
      <Table aria-label="batting leaders table">
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Player</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Matches</TableCell>
            <TableCell>Runs</TableCell>
            <TableCell>Average</TableCell>
            <TableCell>Strike Rate</TableCell>
            <TableCell>50s/100s</TableCell>
            <TableCell>Form</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} align="center"><CircularProgress /></TableCell>
            </TableRow>
          ) : (
            players
              .filter(player => player.stats?.overall?.batting)
              .sort((a, b) => {
                const runsA = a.stats.overall.batting.runs || 0;
                const runsB = b.stats.overall.batting.runs || 0;
                return runsB - runsA;
              })
              .map((player, index) => (
                <TableRow key={player.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>{player.stats.overall.matches || 0}</TableCell>
                  <TableCell>{player.stats.overall.batting.runs || 0}</TableCell>
                  <TableCell>
                    {typeof player.stats.overall.batting.average === 'number' 
                      ? player.stats.overall.batting.average.toFixed(2) 
                      : (player.stats.overall.batting.average || '-')}
                  </TableCell>
                  <TableCell>
                    {typeof player.stats.overall.batting.strikeRate === 'number'
                      ? player.stats.overall.batting.strikeRate.toFixed(2)
                      : (player.stats.overall.batting.strikeRate || '-')}
                  </TableCell>
                  <TableCell>
                    {`${player.stats.overall.batting.fifties || 0}/${player.stats.overall.batting.hundreds || 0}`}
                  </TableCell>
                  <TableCell>{getTrendIcon(player.form)}</TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Function to render bowling leaders table
  const renderBowlingLeaders = () => (
    <TableContainer component={Paper} elevation={2}>
      <Table aria-label="bowling leaders table">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell>Rank</TableCell>
            <TableCell>Player</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'matches'}
                direction={orderBy === 'matches' ? order : 'asc'}
                onClick={() => handleRequestSort('matches')}
              >
                Matches
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'wickets'}
                direction={orderBy === 'wickets' ? order : 'desc'}
                onClick={() => handleRequestSort('wickets')}
              >
                Wickets
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'avg'}
                direction={orderBy === 'avg' ? order : 'asc'}
                onClick={() => handleRequestSort('avg')}
              >
                Average
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'econ'}
                direction={orderBy === 'econ' ? order : 'asc'}
                onClick={() => handleRequestSort('econ')}
              >
                Economy
              </TableSortLabel>
            </TableCell>
            <TableCell>Best</TableCell>
            <TableCell>Form</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            players
              .filter(player => player.stats?.overall?.bowling)
              .sort((a, b) => {
                const wicketsA = a.stats.overall.bowling.wickets || 0;
                const wicketsB = b.stats.overall.bowling.wickets || 0;
                return wicketsB - wicketsA;
              })
              .map((player, index) => (
                <TableRow 
                  key={player.id}
                  hover 
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell component="th" scope="row">{index + 1}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'medium', 
                        color: 'primary.main', 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {player.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>{player.stats.overall.matches}</TableCell>
                  <TableCell><strong>{player.stats.overall.bowling.wickets}</strong></TableCell>
                  <TableCell>
                    {typeof player.stats.overall.bowling.average === 'number'
                      ? player.stats.overall.bowling.average.toFixed(2)
                      : (player.stats.overall.bowling.average || '-')}
                  </TableCell>
                  <TableCell>
                    {typeof player.stats.overall.bowling.economy === 'number'
                      ? player.stats.overall.bowling.economy.toFixed(2)
                      : (player.stats.overall.bowling.economy || '-')}
                  </TableCell>
                  <TableCell>{player.stats.overall.bowling.bestBowling}</TableCell>
                  <TableCell>{getTrendIcon(player.form)}</TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Function to render all-rounders table
  const renderAllRounders = () => (
    <TableContainer component={Paper} elevation={2}>
      <Table aria-label="all-rounders table">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell>Rank</TableCell>
            <TableCell>Player</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'matches'}
                direction={orderBy === 'matches' ? order : 'asc'}
                onClick={() => handleRequestSort('matches')}
              >
                Matches
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'runs'}
                direction={orderBy === 'runs' ? order : 'desc'}
                onClick={() => handleRequestSort('runs')}
              >
                Runs
              </TableSortLabel>
            </TableCell>
            <TableCell>Bat Avg</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'wickets'}
                direction={orderBy === 'wickets' ? order : 'desc'}
                onClick={() => handleRequestSort('wickets')}
              >
                Wickets
              </TableSortLabel>
            </TableCell>
            <TableCell>Bowl Avg</TableCell>
            <TableCell>Form</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            players
              .filter(player => 
                player.role === 'all-rounder' &&
                player.stats?.overall?.batting &&
                player.stats?.overall?.bowling
              )
              .sort((a, b) => {
                const pointsA = (a.stats.overall.batting.runs || 0) + (a.stats.overall.bowling.wickets * 20 || 0);
                const pointsB = (b.stats.overall.batting.runs || 0) + (b.stats.overall.bowling.wickets * 20 || 0);
                return pointsB - pointsA;
              })
              .map((player, index) => (
                <TableRow 
                  key={player.id} 
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell component="th" scope="row">{index + 1}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'medium', 
                        color: 'primary.main', 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {player.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>{player.stats.overall.matches}</TableCell>
                  <TableCell>{player.stats.overall.batting.runs}</TableCell>
                  <TableCell>
                    {typeof player.stats.overall.batting.average === 'number'
                      ? player.stats.overall.batting.average.toFixed(2)
                      : (player.stats.overall.batting.average || '-')}
                  </TableCell>
                  <TableCell>{player.stats.overall.bowling.wickets}</TableCell>
                  <TableCell>
                    {typeof player.stats.overall.bowling.average === 'number'
                      ? player.stats.overall.bowling.average.toFixed(2)
                      : (player.stats.overall.bowling.average || '-')}
                  </TableCell>
                  <TableCell>{getTrendIcon(player.form)}</TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Function to render records
  const renderRecords = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ mr: 1 }} color="primary" /> Highest Scores
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Against</TableCell>
                    <TableCell>League</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Virat Kohli</TableCell>
                    <TableCell>128*</TableCell>
                    <TableCell>Team B</TableCell>
                    <TableCell>UPL 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Joe Root</TableCell>
                    <TableCell>112</TableCell>
                    <TableCell>Team E</TableCell>
                    <TableCell>Campus Cricket</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Kane Williamson</TableCell>
                    <TableCell>105</TableCell>
                    <TableCell>Team C</TableCell>
                    <TableCell>T20 Bash</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ mr: 1 }} color="primary" /> Best Bowling
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Figures</TableCell>
                    <TableCell>Against</TableCell>
                    <TableCell>League</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Jasprit Bumrah</TableCell>
                    <TableCell>5/12</TableCell>
                    <TableCell>Team C</TableCell>
                    <TableCell>UPL 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Kagiso Rabada</TableCell>
                    <TableCell>4/15</TableCell>
                    <TableCell>Team A</TableCell>
                    <TableCell>ICC 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Rashid Khan</TableCell>
                    <TableCell>4/16</TableCell>
                    <TableCell>Team D</TableCell>
                    <TableCell>T20 Bash</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 1 }} color="primary" /> Fastest Centuries
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Balls</TableCell>
                    <TableCell>Against</TableCell>
                    <TableCell>League</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Virat Kohli</TableCell>
                    <TableCell>52</TableCell>
                    <TableCell>Team D</TableCell>
                    <TableCell>UPL 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Steve Smith</TableCell>
                    <TableCell>58</TableCell>
                    <TableCell>Team B</TableCell>
                    <TableCell>ICC 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Babar Azam</TableCell>
                    <TableCell>61</TableCell>
                    <TableCell>Team E</TableCell>
                    <TableCell>T20 Bash</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EqualizerIcon sx={{ mr: 1 }} color="primary" /> Highest Partnerships
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Players</TableCell>
                    <TableCell>Runs</TableCell>
                    <TableCell>Against</TableCell>
                    <TableCell>League</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Kohli & Root</TableCell>
                    <TableCell>182</TableCell>
                    <TableCell>Team C</TableCell>
                    <TableCell>UPL 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Smith & Williamson</TableCell>
                    <TableCell>156</TableCell>
                    <TableCell>Team E</TableCell>
                    <TableCell>ICC 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Azam & Stokes</TableCell>
                    <TableCell>143</TableCell>
                    <TableCell>Team A</TableCell>
                    <TableCell>T20 Bash</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (tabValue) {
      case 0:
        return renderBattingLeaders();
      case 1:
        return renderBowlingLeaders();
      case 2:
        return renderAllRounders();
      case 3:
        return <PlayerProfiles />;
      case 4:
        return renderRecords();
      default:
        return renderBattingLeaders();
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Player Statistics Hub
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Comprehensive statistics and records from all leagues
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} /> Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Players"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>League</InputLabel>
              <Select
                value={league}
                label="League"
                onChange={(e) => setLeague(e.target.value)}
              >
                <MenuItem value="">All Leagues</MenuItem>
                {leagues.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Team</InputLabel>
              <Select
                value={team}
                label="Team"
                onChange={(e) => setTeam(e.target.value)}
              >
                <MenuItem value="">All Teams</MenuItem>
                {teams.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          sx={{ borderRadius: 28 }}
        >
          Export Statistics
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="player statistics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<SportsIcon />} iconPosition="start" label="Batting Leaders" />
          <Tab icon={<SportsIcon />} iconPosition="start" label="Bowling Leaders" />
          <Tab icon={<SportsIcon />} iconPosition="start" label="All-rounders" />
          <Tab icon={<SportsIcon />} iconPosition="start" label="Player Profiles" />
          <Tab icon={<EmojiEventsIcon />} iconPosition="start" label="Records" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ py: 3 }}>
        {renderTabContent()}
      </Box>
    </Container>
  );
};

export default PlayerStats;