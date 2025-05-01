import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, FormControl, InputLabel, Select, MenuItem, Button, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { db } from '../firebase';
import { addDoc, updateDoc, doc, collection } from 'firebase/firestore';

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  color: '#ffffff',
  '&:hover': { background: 'linear-gradient(45deg, #01579b, #e65100)' },
  textTransform: 'none',
  fontWeight: 600,
}));

const WicketDialog = ({ open, onClose, match, players, squads, batsmen, setBatsmen, bowler, setBowler, score, setScore, setSnackbar, setOpenBowlerDialog }) => {
  const [wicketData, setWicketData] = useState({
    type: 'bowled',
    fielderId: '',
    newBatsmanId: '',
    commentary: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWicketData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveWicket = async () => {
    try {
      if (!match || !match.id) {
        setSnackbar({ open: true, message: 'Invalid match data', severity: 'error' });
        onClose();
        return;
      }
      if (!wicketData.newBatsmanId) {
        setSnackbar({ open: true, message: 'Please select a new batsman', severity: 'error' });
        return;
      }

      const ballData = {
        innings: match.currentInnings || 1,
        over: Math.floor(score.balls / 6) + 1,
        ball: (score.balls % 6) + 1,
        type: 'wicket',
        value: { type: wicketData.type, fielderId: wicketData.fielderId || null },
        batsman: batsmen.striker.id,
        bowler: bowler.id,
        commentary: wicketData.commentary,
        timestamp: new Date(),
      };

      const newScore = {
        ...score,
        wickets: score.wickets + 1,
        balls: score.balls + 1,
        overs: Math.floor((score.balls + 1) / 6) + ((score.balls + 1) % 6 === 0 ? 0 : score.overs % 1),
      };

      const newBowler = { ...bowler, wickets: (bowler.wickets || 0) + 1 };
      const newBatsmen = {
        striker: players.find(p => p.id === wicketData.newBatsmanId) || { id: wicketData.newBatsmanId, name: 'New Batsman', runs: 0, balls: 0 },
        nonStriker: batsmen.nonStriker,
      };

      await addDoc(collection(db, 'matches', match.id, 'balls'), ballData);
      await updateDoc(doc(db, 'matches', match.id), {
        score: newScore,
        currentBatsmen: { striker: newBatsmen.striker.id, nonStriker: newBatsmen.nonStriker.id },
        currentBowler: newBowler.id,
      });

      setScore(newScore);
      setBatsmen(newBatsmen);
      setBowler(newBowler);
      setSnackbar({ open: true, message: 'Wicket recorded successfully', severity: 'success' });
      onClose();

      if (newScore.balls % 6 === 0) {
        setOpenBowlerDialog(true);
        const switchedBatsmen = { striker: newBatsmen.nonStriker, nonStriker: newBatsmen.striker };
        setBatsmen(switchedBatsmen);
        await updateDoc(doc(db, 'matches', match.id), {
          currentBatsmen: { striker: switchedBatsmen.striker.id, nonStriker: switchedBatsmen.nonStriker.id },
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error recording wicket: ' + error.message, severity: 'error' });
    }
    // Testing: Test wicket recording with Jest
  };

  if (!match || !match.id) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography color="error">Invalid match data. Please try again.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const availableBatsmen = squads[match.currentInnings === 1 ? 'team1' : 'team2']
    ?.filter(id => id !== batsmen.striker?.id && id !== batsmen.nonStriker?.id)
    ?.map(id => players.find(p => p.id === id)) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Wicket</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Wicket Type</InputLabel>
                <Select name="type" value={wicketData.type} onChange={handleChange} label="Wicket Type">
                  <MenuItem value="bowled">Bowled</MenuItem>
                  <MenuItem value="caught">Caught</MenuItem>
                  <MenuItem value="lbw">LBW</MenuItem>
                  <MenuItem value="run-out">Run Out</MenuItem>
                  <MenuItem value="stumped">Stumped</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(wicketData.type === 'caught' || wicketData.type === 'run-out') && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Fielder</InputLabel>
                  <Select name="fielderId" value={wicketData.fielderId} onChange={handleChange} label="Fielder">
                    <MenuItem value="">No Fielder</MenuItem>
                    {squads[match.currentInnings === 1 ? 'team2' : 'team1']?.map(id => {
                      const player = players.find(p => p.id === id);
                      return <MenuItem key={id} value={id}>{player?.name || 'Unknown'}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>New Batsman</InputLabel>
                <Select name="newBatsmanId" value={wicketData.newBatsmanId} onChange={handleChange} label="New Batsman">
                  {availableBatsmen.map(player => (
                    <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commentary"
                name="commentary"
                value={wicketData.commentary}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Enter wicket commentary"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <ActionButton onClick={handleSaveWicket}>Save Wicket</ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default WicketDialog;