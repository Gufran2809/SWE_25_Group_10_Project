import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EndOfMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [form, setForm] = useState({
    winner: '',
    margin: '',
    playerOfMatch: '',
    highlights: '',
  });

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', id));
        if (matchDoc.exists()) {
          setMatch({ id: matchDoc.id, ...matchDoc.data() });
        } else {
          setMatch({
            id,
            teams: 'Team A vs Team B',
            score: '150/5 vs 140/7',
            status: 'Completed',
          });
        }
      } catch (error) {
        console.error('Error fetching match:', error);
      }
    };
    fetchMatch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await updateDoc(doc(db, 'matches', id), {
        ...form,
        status: 'Completed',
        updatedAt: new Date(),
      });
      navigate(`/match/${id}`);
    } catch (error) {
      console.error('Error finalizing match:', error);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        End of Match
      </Typography>
      {match ? (
        <Box>
          <Typography variant="h4">{match.teams}</Typography>
          <Typography>Score: {match.score}</Typography>
          <Box component="form" sx={{ mt: 2, maxWidth: 600 }}>
            <TextField
              label="Winner"
              name="winner"
              select
              value={form.winner}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="Team A">Team A</MenuItem>
              <MenuItem value="Team B">Team B</MenuItem>
              <MenuItem value="Tie">Tie</MenuItem>
              <MenuItem value="Abandoned">Abandoned</MenuItem>
            </TextField>
            <TextField
              label="Winning Margin"
              name="margin"
              value={form.margin}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Player of the Match"
              name="playerOfMatch"
              value={form.playerOfMatch}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Match Highlights"
              name="highlights"
              value={form.highlights}
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
              Save and Publish Results
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/scorer/innings/${id}`)}
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </Box>
          <Typography color="textSecondary" sx={{ mt: 2 }}>
            Placeholder for full scorecard and tournament standings update.
          </Typography>
        </Box>
      ) : (
        <Typography color="textSecondary">Loading match details...</Typography>
      )}
    </Container>
  );
};

export default EndOfMatch;