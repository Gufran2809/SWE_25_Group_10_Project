import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const PerBallCommentary = ({ matchId }) => {
  const [commentary, setCommentary] = useState([]);

  useEffect(() => {
    const fetchCommentary = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/matches/${matchId}/per-ball`);
        const mockData = [
          { ball: '15.1', runs: 4, event: 'Boundary', description: 'Smashed through cover!' },
          { ball: '15.2', runs: 0, event: 'Dot', description: 'Good length, defended.' },
          { ball: '15.3', runs: 6, event: 'Six', description: 'Lofted over mid-wicket!' },
        ];
        setCommentary(mockData);
      } catch (error) {
        console.error('Error fetching commentary:', error);
      }
    };
    fetchCommentary();
    const interval = setInterval(fetchCommentary, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [matchId]);

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', p: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h2" color="primary" align="center" gutterBottom>
          Per-Ball Commentary
        </Typography>
        {commentary.length > 0 ? (
          <List>
            {commentary.map((ball, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid #e0e0e0' }}>
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