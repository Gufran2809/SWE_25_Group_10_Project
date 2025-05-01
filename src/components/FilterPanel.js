import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, Switch, FormControlLabel, IconButton, Divider } from '@mui/material';
import { FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: theme.shadows[2],
}));

const FilterPanel = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterLeague,
  setFilterLeague,
  filterVenue,
  setFilterVenue,
  filterTeam,
  setFilterTeam,
  filterMatchType,
  setFilterMatchType,
  filterDateRange,
  setFilterDateRange,
  sortOption,
  setSortOption,
  sortDirection,
  setSortDirection,
  liveUpdates,
  setLiveUpdates,
  advancedFiltersOpen,
  setAdvancedFiltersOpen,
}) => {
  // Fetch leagues, teams, venues from Firestore
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const leaguesSnap = await getDocs(collection(db, 'leagues'));
      setLeagues(leaguesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const teamsSnap = await getDocs(collection(db, 'teams'));
      setTeams(teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const venuesSnap = await getDocs(collection(db, 'venues'));
      setVenues(venuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterLeague('all');
    setFilterVenue('all');
    setFilterTeam('all');
    setFilterMatchType('all');
    setFilterDateRange({ start: null, end: null });
    setSortOption('date');
    setSortDirection('asc');
  };

  return (
    <FilterPaper elevation={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Filter Matches</Typography>
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={<Switch checked={liveUpdates} onChange={() => setLiveUpdates(!liveUpdates)} color="primary" />}
            label="Live Updates"
          />
          <IconButton onClick={() => {}} color="primary">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)} color="primary">
            <FilterIcon />
          </IconButton>
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search Matches"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by title, team, league, or venue"
            slotProps={{ input: { startAdornment: <FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} label="Status">
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="live">Live</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>League</InputLabel>
            <Select value={filterLeague} onChange={e => setFilterLeague(e.target.value)} label="League">
              <MenuItem value="all">All Leagues</MenuItem>
              {leagues.map(league => <MenuItem key={league.id} value={league.id}>{league.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button variant="outlined" color="secondary" onClick={handleClearFilters} fullWidth>
            Clear Filters
          </Button>
        </Grid>
      </Grid>
      {advancedFiltersOpen && (
        <Box mt={3}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Advanced Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} label="Venue">
                  <MenuItem value="all">All Venues</MenuItem>
                  {venues.map(venue => <MenuItem key={venue.id} value={venue.id}>{venue.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Team</InputLabel>
                <Select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} label="Team">
                  <MenuItem value="all">All Teams</MenuItem>
                  {teams.map(team => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Match Type</InputLabel>
                <Select value={filterMatchType} onChange={e => setFilterMatchType(e.target.value)} label="Match Type">
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="T20">T20</MenuItem>
                  <MenuItem value="One Day">One Day</MenuItem>
                  <MenuItem value="Test">Test</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date"
                  value={filterDateRange.start}
                  onChange={date => setFilterDateRange(prev => ({ ...prev, start: date }))}
                  renderInput={params => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Date"
                  value={filterDateRange.end}
                  onChange={date => setFilterDateRange(prev => ({ ...prev, end: date }))}
                  renderInput={params => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortOption} onChange={e => setSortOption(e.target.value)} label="Sort By">
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="league">League</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={<Switch checked={sortDirection === 'asc'} onChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} color="primary" />}
                label={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </FilterPaper>
  );
};

export default FilterPanel;