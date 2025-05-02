import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, IconButton, Divider } from '@mui/material';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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
  advancedFiltersOpen,
  setAdvancedFiltersOpen,
  leagues,
  teams,
  venues
}) => {
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterLeague('all');
    setFilterVenue('all');
    setFilterTeam('all');
    setFilterMatchType('all');
    setAdvancedFiltersOpen(false);
  };

  return (
    <FilterPaper elevation={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Filter Matches</Typography>
        <Box display="flex" alignItems="center">
          <IconButton 
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            color="primary"
          >
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
              {leagues.map(league => (
                <MenuItem key={league.id} value={league.id}>{league.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleClearFilters} 
            fullWidth
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {advancedFiltersOpen && (
        <Box mt={3}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Advanced Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} label="Venue">
                  <MenuItem value="all">All Venues</MenuItem>
                  {venues.map(venue => (
                    <MenuItem key={venue.id} value={venue.id}>{venue.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Team</InputLabel>
                <Select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} label="Team">
                  <MenuItem value="all">All Teams</MenuItem>
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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
          </Grid>
        </Box>
      )}
    </FilterPaper>
  );
};

FilterPanel.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  filterStatus: PropTypes.string.isRequired,
  setFilterStatus: PropTypes.func.isRequired,
  filterLeague: PropTypes.string.isRequired,
  setFilterLeague: PropTypes.func.isRequired,
  filterVenue: PropTypes.string.isRequired,
  setFilterVenue: PropTypes.func.isRequired,
  filterTeam: PropTypes.string.isRequired,
  setFilterTeam: PropTypes.func.isRequired,
  filterMatchType: PropTypes.string.isRequired,
  setFilterMatchType: PropTypes.func.isRequired,
  advancedFiltersOpen: PropTypes.bool.isRequired,
  setAdvancedFiltersOpen: PropTypes.func.isRequired,
  leagues: PropTypes.array.isRequired,
  teams: PropTypes.array.isRequired,
  venues: PropTypes.array.isRequired
};

export default FilterPanel;