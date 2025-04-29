import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Grid,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import LiveScoreboard from './LiveScoreboard';
import MatchCreationForm from './MatchCreationForm';
import PerBallCommentary from './PerBallCommentary';
import TossManagement from './TossManagement';
import { styled } from '@mui/material/styles';

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  color: '#ffffff',
  '&:hover': {
    background: 'linear-gradient(45deg, #01579b, #e65100)',
  },
}));

const Matches = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesCollection = collection(db, 'matches');
        const snapshot = await getDocs(matchesCollection);
        const matchesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMatches(matchesData);
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
    if (!user) {
      alert('Please log in to edit matches.');
      return;
    }
    try {
      const matchRef = doc(db, 'matches', editingMatch.id);
      await setDoc(matchRef, editingMatch, { merge: true });
      await addDoc(collection(db, 'notifications'), {
        message: `Match updated: ${editingMatch.team1} vs ${editingMatch.team2}`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
      setMatches(
        matches.map((match) => (match.id === editingMatch.id ? editingMatch : match))
      );
      setEditingMatch(null);
      alert('Match updated successfully!');
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Failed to update match.');
    }
  };

  const handleDelete = async (matchId) => {
    if (!user) {
      alert('Please log in to delete matches.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await deleteDoc(doc(db, 'matches', matchId));
        await addDoc(collection(db, 'notifications'), {
          message: `Match deleted`,
          severity: 'warning',
          timestamp: new Date().toISOString(),
        });
        setMatches(matches.filter((match) => match.id !== matchId));
        alert('Match deleted successfully!');
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('Failed to delete match.');
      }
    }
  };

  return (
    <Container sx={{ py: 4, mt: 8 }}>
      <Typography variant="h1" color="primary" gutterBottom sx={{ textAlign: 'center' }}>
        Matches
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
        View live scores, commentary, manage toss, and create/edit matches.
      </Typography>
      <Typography variant="h2" color="primary" gutterBottom sx={{ textAlign: 'center' }}>
        Existing Matches
      </Typography>
      <Grid container spacing={3}>
        {matches.length > 0 ? (
          matches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match.id}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h3" color="primary">
                    {match.team1} vs {match.team2}
                  </Typography>
                  <Typography>Date: {match.matchDate}</Typography>
                  <Typography>Time: {match.matchTime}</Typography>
                  <Typography>Venue: {match.venue}</Typography>
                  <Typography>Type: {match.matchType}</Typography>
                  {user && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <IconButton color="primary" onClick={() => handleEdit(match)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(match.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography color="textSecondary" sx={{ textAlign: 'center', width: '100%' }}>
            No matches available.
          </Typography>
        )}
      </Grid>
      {editingMatch && (
        <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 2 }}>
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
              <ActionButton type="submit" variant="contained" sx={{ mt: 2 }}>
                Update Match
              </ActionButton>
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
      <MatchCreationForm />
      <LiveScoreboard matchId="1" />
      <PerBallCommentary matchId="1" />
      <TossManagement matchId="1" />
    </Container>
  );
};

export default Matches;