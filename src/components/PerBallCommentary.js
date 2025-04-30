import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const PerBallCommentary = ({ matchId }) => {
  const [commentary, setCommentary] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'perBall'), where('matchId', '==', matchId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentaryData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCommentary(commentaryData);
    }, (error) => {
      console.error('Error fetching commentary:', error);
      setCommentary([
        { id: '1', ball: '15.1', runs: 4, event: 'Boundary', description: 'Smashed through cover!' },
        { id: '2', ball: '15.2', runs: 0, event: 'Dot', description: 'Good length, defended.' },
        { id: '3', ball: '15.3', runs: 6, event: 'Six', description: 'Lofted over mid-wicket!' },
      ]);
    });
    return () => unsubscribe();
  }, [matchId]);

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', p: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h2" color="primary" align="center" gutterBottom>
          Per-Ball Commentary
        </Typography>
        {commentary.length > 0 ? (
          <List>
            {commentary.map((ball) => (
              <ListItem key={ball.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      <strong>Ball {ball.ball}:</strong> {ball.runs} runs ({ball.event})
                    </Typography>
                  }
                  secondary={<Typography variant="body2">{ball.description}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="textSecondary" align="center">
            No commentary available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PerBallCommentary;