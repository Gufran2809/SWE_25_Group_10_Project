import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Scorecard = () => {
  const { id } = useParams();
  const [scorecard, setScorecard] = useState(null);

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', id));
        if (matchDoc.exists()) {
          setScorecard({ id: matchDoc.id, ...matchDoc.data() });
        } else {
          setScorecard({
            id,
            teams: 'Team A vs Team B',
            score: '150/5 (20 overs)',
            result: 'Team A won by 10 runs',
          });
        }
      } catch (error) {
        console.error('Error fetching scorecard:', error);
      }
    };
    fetchScorecard();
  }, [id]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Match Scorecard
      </Typography>
      {scorecard ? (
        <Box>
          <Typography variant="h4">{scorecard.teams}</Typography>
          <Typography>Score: {scorecard.score}</Typography>
          <Typography>Result: {scorecard.result}</Typography>
          <Typography color="textSecondary" sx={{ mt: 2 }}>
            Placeholder for batting, bowling, and fall of wickets details.
          </Typography>
        </Box>
      ) : (
        <Typography color="textSecondary">Loading scorecard...</Typography>
      )}
    </Container>
  );
};

export default Scorecard;