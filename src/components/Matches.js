import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LiveScoreboard from './LiveScoreboard';
import MatchCreationForm from './MatchCreationForm';
import PerBallCommentary from './PerBallCommentary';
import TossManagement from './TossManagement';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/matches');
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    fetchMatches();
  }, []);

  const handleEdit = (match) => {
    setEditingMatch(match);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingMatch({ ...editingMatch, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/matches/${editingMatch._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMatch),
      });
      const result = await response.json();
      if (response.ok) {
        setMatches(
          matches.map((match) => (match._id === editingMatch._id ? result : match))
        );
        setEditingMatch(null);
        alert('Match updated successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Failed to update match.');
    }
  };

  const handleDelete = async (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/matches/${matchId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMatches(matches.filter((match) => match._id !== matchId));
          alert('Match deleted successfully!');
        } else {
          throw new Error('Failed to delete match');
        }
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('Failed to delete match.');
      }
    }
  };

  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h1" color="primary" gutterBottom>
        Matches
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        View live scores, commentary, manage toss, and create/edit matches.
      </Typography>
      <Typography variant="h2" color="primary" gutterBottom>
        Existing Matches
      </Typography>
      {matches.length > 0 ? (
        matches.map((match) => (
          <Card key={match._id} sx={{ maxWidth: 600, mx: 'auto', mb: 2, p: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h3" color="primary">
                  {match.team1} vs {match.team2}
                </Typography>
                <Typography>Date: {match.matchDate}</Typography>
                <Typography>Time: {match.matchTime}</Typography>
                <Typography>Venue: {match.venue}</Typography>
                <Typography>Type: {match.matchType}</Typography>
              </Box>
              <Box>
                <IconButton color="primary" onClick={() => handleEdit(match)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(match._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography color="textSecondary">No matches available.</Typography>
      )}
      {editingMatch && (
        <Card sx={{ maxWidth: 500, mx: 'auto', p: 2, mt: 3 }}>
          <CardContent>
            <Typography variant="h2" color="primary" align="center" gutterBottom>
              Edit Match
            </Typography>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                label="Team 1"
                name="team1"
                value={editingMatch.team1}
                onChange={handleEditChange}
                required
                fullWidth
              />
              <TextField
                label="Team 2"
                name="team2"
                value={editingMatch.team2}
                onChange={handleEditChange}
                required
                fullWidth
              />
              <TextField
                label="Match Date"
                name="matchDate"
                type="date"
                value={editingMatch.matchDate}
                onChange={handleEditChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Match Time"
                name="matchTime"
                type="time"
                value={editingMatch.matchTime}
                onChange={handleEditChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Venue"
                name="venue"
                value={editingMatch.venue}
                onChange={handleEditChange}
                required
                fullWidth
              />
              <TextField
                label="Match Type"
                name="matchType"
                select
                value={editingMatch.matchType}
                onChange={handleEditChange}
                fullWidth
              >
                <MenuItem value="T20">T20</MenuItem>
                <MenuItem value="ODI">ODI</MenuItem>
                <MenuItem value="Test">Test</MenuItem>
              </TextField>
              <TextField
                label="League ID (Optional)"
                name="leagueId"
                value={editingMatch.leagueId}
                onChange={handleEditChange}
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Update Match
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ mt: 1 }}
                onClick={() => setEditingMatch(null)}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      <LiveScoreboard matchId="1" />
      <PerBallCommentary matchId="1" />
      <TossManagement matchId="1" />
      <MatchCreationForm />
    </Container>
  );
};

export default Matches;