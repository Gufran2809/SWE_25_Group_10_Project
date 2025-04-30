import React, { useState } from 'react';
import { Container, Typography, TextField, MenuItem, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateLeague = () => {
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    matchType: '',
    format: '',
    teams: [],
    venue: '',
    description: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'leagues'), { ...form, createdAt: new Date() });
      navigate('/organizer');
    } catch (error) {
      console.error('Error creating league:', error);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Create League
      </Typography>
      <Box component="form" sx={{ maxWidth: 600, mx: 'auto' }}>
        <TextField
          label="League Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Match Type"
          name="matchType"
          select
          value={form.matchType}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="T20">T20</MenuItem>
          <MenuItem value="One Day">One Day</MenuItem>
          <MenuItem value="Test">Test</MenuItem>
        </TextField>
        <TextField
          label="Tournament Format"
          name="format"
          select
          value={form.format}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="knockout">Knockout</MenuItem>
          <MenuItem value="round-robin">Round-Robin</MenuItem>
          <MenuItem value="groups">Groups</MenuItem>
        </TextField>
        <TextField
          label="Venue"
          name="venue"
          value={form.venue}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
        >
          Create League
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

export default CreateLeague;