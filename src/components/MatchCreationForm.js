import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, MenuItem } from '@mui/material';

const MatchCreationForm = () => {
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    matchDate: '',
    matchTime: '',
    venue: '',
    matchType: 'T20',
    leagueId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Match created successfully!');
        setFormData({
          team1: '',
          team2: '',
          matchDate: '',
          matchTime: '',
          venue: '',
          matchType: 'T20',
          leagueId: '',
        });
      } else {
        throw new Error('Failed to create match');
      }
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match.');
    }
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', p: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h2" color="primary" align="center" gutterBottom>
          Create New Match
        </Typography>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            label="Team 1"
            name="team1"
            value={formData.team1}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Team 2"
            name="team2"
            value={formData.team2}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Match Date"
            name="matchDate"
            type="date"
            value={formData.matchDate}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Match Time"
            name="matchTime"
            type="time"
            value={formData.matchTime}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Match Type"
            name="matchType"
            select
            value={formData.matchType}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="T20">T20</MenuItem>
            <MenuItem value="ODI">ODI</MenuItem>
            <MenuItem value="Test">Test</MenuItem>
          </TextField>
          <TextField
            label="League ID (Optional)"
            name="leagueId"
            value={formData.leagueId}
            onChange={handleChange}
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Create Match
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MatchCreationForm;