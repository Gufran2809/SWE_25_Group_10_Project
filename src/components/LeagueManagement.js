import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const LeagueManagement = () => {
  const [leagues, setLeagues] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/leagues');
        const mockData = [
          { id: 1, name: 'University T20 League', startDate: '2025-05-01', endDate: '2025-05-30', description: 'Annual T20 tournament' },
          { id: 2, name: 'ODI Championship', startDate: '2025-06-01', endDate: '2025-06-15', description: 'ODI series' },
        ];
        setLeagues(mockData);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };
    fetchLeagues();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5001/api/leagues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      console.log('League created:', formData);
      setLeagues([...leagues, { id: leagues.length + 1, ...formData }]);
      setFormData({ name: '', startDate: '', endDate: '', description: '' });
      alert('League created successfully!');
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Failed to create league.');
    }
  };

  const handleDelete = async (leagueId) => {
    if (window.confirm('Are you sure you want to delete this league?')) {
      try {
const response = await fetch(`http://localhost:5001/api/leagues/${leagueId}`, { method: 'DELETE' });
        setLeagues(leagues.filter((league) => league.id !== leagueId));
        alert('League deleted successfully!');
      } catch (error) {
        console.error('Error deleting league:', error);
        alert('Failed to delete league.');
      }
    }
  };

  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h2" color="primary" align="center" gutterBottom>
        League Management
      </Typography>
      {/* Create League Form */}
      <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h3" color="primary" gutterBottom>
            Create New League
          </Typography>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="League Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Create League
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* League List */}
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h3" color="primary" gutterBottom>
          Existing Leagues
        </Typography>
        {leagues.length > 0 ? (
          <Grid container spacing={2}>
            {leagues.map((league) => (
              <Grid item xs={12} md={6} key={league.id}>
                <Card sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {league.name}
                    </Typography>
                    <Typography>Start: {league.startDate}</Typography>
                    <Typography>End: {league.endDate}</Typography>
                    <Typography>{league.description}</Typography>
                  </CardContent>
                  <IconButton color="error" onClick={() => handleDelete(league.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">No leagues available.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default LeagueManagement;