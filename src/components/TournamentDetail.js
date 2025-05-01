import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';

const TournamentDetail = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
        if (tournamentDoc.exists()) {
          setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() });
        } else {
          setError('Tournament not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          {tournament?.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {tournament?.startDate} - {tournament?.endDate}
        </Typography>
        {/* Add more tournament details here */}
      </Paper>
    </Container>
  );
};

export default TournamentDetail;