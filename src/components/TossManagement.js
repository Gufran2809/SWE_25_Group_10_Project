import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, Typography, TextField, Button, MenuItem } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, addDoc, collection } from 'firebase/firestore';

const TossManagement = ({ matchId }) => {
  const { user } = useContext(AuthContext);
  const [tossData, setTossData] = useState({
    winner: '',
    decision: '',
  });
  const [tossStatus, setTossStatus] = useState(null);

  useEffect(() => {
    const tossRef = doc(db, 'tosses', matchId);
    const unsubscribe = onSnapshot(tossRef, (doc) => {
      if (doc.exists()) {
        setTossStatus(doc.data());
      } else {
        setTossStatus(null);
      }
    }, (error) => {
      console.error('Error fetching toss:', error);
      setTossStatus({ winner: 'Team A', decision: 'Bat' });
    });
    return () => unsubscribe();
  }, [matchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTossData({ ...tossData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to record toss.');
      return;
    }
    try {
      const tossRef = doc(db, 'tosses', matchId);
      await setDoc(tossRef, { matchId, ...tossData });
      await addDoc(collection(db, 'notifications'), {
        message: `Toss recorded: ${tossData.winner} chose to ${tossData.decision}`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
      setTossStatus(tossData);
      setTossData({ winner: '', decision: '' });
      alert('Toss recorded successfully!');
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
        {tossStatus ? (
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            <strong>Toss:</strong> {tossStatus.winner} won and chose to {tossStatus.decision}
          </Typography>
        ) : (
          <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 2 }}>
            Toss not yet recorded.
          </Typography>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            label="Toss Winner"
            name="winner"
            select
            value={tossData.winner}
            onChange={handleChange}
            required
            fullWidth
          >
            <MenuItem value="Team A">Team A</MenuItem>
            <MenuItem value="Team B">Team B</MenuItem>
          </TextField>
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
      </CardContent>
    </Card>
  );
};

export default TossManagement;