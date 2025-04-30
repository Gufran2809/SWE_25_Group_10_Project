import React, { useState } from 'react';
import { Container, Typography, TextField, MenuItem, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateMatch = () => {
  const [form, setForm] = useState({
    title: '',
    leagueId: '',
    team1: '',
    team2: '',
    date: '',
    venue: '',
    overs: '',
    innings: '',
    matchType: '',
    umpire: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'matches'), { ...form, createdAt: new Date() });
      navigate('/organizer');
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Create Match
      </Typography>
      <Box component="form" sx={{ maxWidth: 600, mx: 'auto' }}>
        <TextField
          label="Match Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="League/Tournament"
          name="leagueId"
          select
          value={form.leagueId}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="t1">University Cup</MenuItem>
          <MenuItem value="t2">Intra-University League</MenuItem>
        </TextField>
        <TextField
          label="Team 1"
          name="team1"
          select
          value={form.team1}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="team1">Team A</MenuItem>
          <MenuItem value="team2">Team B</MenuItem>
        </TextField>
        <TextField
          label="Team 2"
          name="team2"
          select
          value={form.team2}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="team1">Team A</MenuItem>
          <MenuItem value="team2">Team B</MenuItem>
        </TextField>
        <TextField
          label="Date and Time"
          name="date"
          type="datetime-local"
          value={form.date}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Venue"
          name="venue"
          value={form.venue}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Number of Overs"
          name="overs"
          type="number"
          value={form.overs}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Umpire"
          name="umpire"
          value={form.umpire}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
        >
          Create Match
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/organizer')}
          sx={{ ml: 2 }}
        >
          Cancel
        </Button>
      </Box>
    </Container>
  );
};

export default CreateMatch;