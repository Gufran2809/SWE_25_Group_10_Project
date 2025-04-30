import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const MatchPreview = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', id));
        if (matchDoc.exists()) {
          setMatch({ id: matchDoc.id, ...matchDoc.data() });
        } else {
          setMatch({ id, teams: 'Team A vs Team B', date: '2025-05-01', venue: 'Stadium' });
        }
      } catch (error) {
        console.error('Error fetching match:', error);
      }
    };
    fetchMatch();
  }, [id]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Match Preview
      </Typography>
      {match ? (
        <Box>
          <Typography variant="h4">{match.teams}</Typography>
          <Typography>Date: {match.date}</Typography>
          <Typography>Venue: {match.venue}</Typography>
          <Typography color="textSecondary" sx={{ mt: 2 }}>
            Placeholder for team squads, pitch conditions, and head-to-head stats.
          </Typography>
        </Box>
      ) : (
        <Typography color="textSecondary">Loading match preview...</Typography>
      )}
    </Container>
  );
};

export default MatchPreview;