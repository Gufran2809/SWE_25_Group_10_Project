import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, Switch, FormControlLabel, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  color: '#ffffff',
  '&:hover': { background: 'linear-gradient(45deg, #01579b, #e65100)' },
  textTransform: 'none',
  fontWeight: 600,
}));

const MatchDialog = ({ open, onClose, isEdit, match, leagues, teams, venues, umpires }) => {
  const [formData, setFormData] = useState(
    isEdit && match
      ? {
          title: match.title || '',
          leagueId: match.leagueId || '',
          team1Id: match.team1Id || '',
          team2Id: match.team2Id || '',
          date: match.date ? match.date.toDate() : new Date(),
          venue: match.venue || '',
          matchType: match.matchType || 'T20',
          overs: match.overs || 20,
          umpireIds: match.umpireIds || [],
          status: match.status || 'upcoming',
          description: match.description || '',
          isFeatured: match.isFeatured || false,
        }
      : {
          title: '',
          leagueId: leagues.length > 0 ? leagues[0].id : '',
          team1Id: '',
          team2Id: '',
          date: (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);
            return tomorrow;
          })(),
          venue: '',
          matchType: 'T20',
          overs: 20,
          umpireIds: [],
          status: 'upcoming',
          description: '',
          isFeatured: false,
        }
  );

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDateChange = (newDate) => setFormData(prev => ({ ...prev, date: newDate }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Match' : 'Create New Match'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Match Title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Team A vs Team B"
                helperText="Leave blank to auto-generate from team names"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>League</InputLabel>
                <Select name="leagueId" value={formData.leagueId} onChange={handleFormChange} label="League">
                  {leagues.map(league => <MenuItem key={league.id} value={league.id}>{league.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select name="venue" value={formData.venue} onChange={handleFormChange} label="Venue">
                  {venues.map(venue => <MenuItem key={venue.id} value={venue.id}>{venue.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Team 1</InputLabel>
                <Select name="team1Id" value={formData.team1Id} onChange={handleFormChange} label="Team 1">
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id} disabled={team.id === formData.team2Id}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Team 2</InputLabel>
                <Select name="team2Id" value={formData.team2Id} onChange={handleFormChange} label="Team 2">
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id} disabled={team.id === formData.team1Id}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Match Date and Time"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={params => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Match Type</InputLabel>
                <Select name="matchType" value={formData.matchType} onChange={handleFormChange} label="Match Type">
                  <MenuItem value="T20">T20</MenuItem>
                  <MenuItem value="One Day">One Day</MenuItem>
                  <MenuItem value="Test">Test</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Overs"
                name="overs"
                type="number"
                value={formData.overs}
                onChange={handleFormChange}
                slotProps={{ input: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Umpires</InputLabel>
                <Select
                  multiple
                  name="umpireIds"
                  value={formData.umpireIds}
                  onChange={handleFormChange}
                  label="Umpires"
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => <Chip key={value} label={umpires.find(u => u.id === value)?.name || 'Unknown'} />)}
                    </Box>
                  )}
                >
                  {umpires.map(umpire => <MenuItem key={umpire.id} value={umpire.id}>{umpire.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.isFeatured} onChange={handleFormChange} name="isFeatured" color="primary" />}
                label="Mark as Featured Match"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <ActionButton startIcon={<AddIcon />}>{isEdit ? 'Update' : 'Create'}</ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default MatchDialog;