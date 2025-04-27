import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, MenuItem } from '@mui/material';

const TossManagement = ({ matchId }) => {
  const [tossStatus, setTossStatus] = useState({});
  const [tossData, setTossData] = useState({
    winner: '',
    decision: '',
  });

  useEffect(() => {
    const fetchToss = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/matches/${matchId}/toss`);
        const data = await response.json();
        setTossStatus(data);
      } catch (error) {
        console.error('Error fetching toss:', error);
      }
    };
    fetchToss();
  }, [matchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTossData({ ...tossData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/matches/${matchId}/toss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tossData),
      });
      if (response.ok) {
        const updatedToss = await response.json();
        setTossStatus(updatedToss);
        alert('Toss recorded successfully!');
      } else {
        throw new Error('Failed to record toss');
      }
    } catch (error) {
      console.error('Error recording toss:', error);
      alert('Failed to record toss.');
    }
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', p: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h2" color="primary" align="center" gutterBottom>
          Toss Management
        </Typography>
        {tossStatus.winner ? (
          <Typography variant="body1" align="center">
            {tossStatus.winner} won the toss and chose to {tossStatus.decision}.
          </Typography>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Toss Winner"
              name="winner"
              value={tossData.winner}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Decision"
              name="decision"
              select
              value={tossData.decision}
              onChange={handleChange}
              required
              fullWidth
            >
              <MenuItem value="Bat">Bat</MenuItem>
              <MenuItem value="Bowl">Bowl</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Record Toss
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default TossManagement;