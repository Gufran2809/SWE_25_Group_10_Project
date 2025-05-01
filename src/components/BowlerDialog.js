import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { db } from '../firebase';
import { updateDoc, doc } from 'firebase/firestore';

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  color: '#ffffff',
  '&:hover': { background: 'linear-gradient(45deg, #01579b, #e65100)' },
  textTransform: 'none',
  fontWeight: 600,
}));

const BowlerDialog = ({ open, onClose, match, players, squads, bowler, setBowler, setSnackbar }) => {
  const [newBowlerId, setNewBowlerId] = useState('');

  const handleSaveBowler = async () => {
    try {
      if (!match || !match.id) {
        setSnackbar({ open: true, message: 'Invalid match data', severity: 'error' });
        onClose();
        return;
      }
      if (!newBowlerId) {
        setSnackbar({ open: true, message: 'Please select a new bowler', severity: 'error' });
        return;
      }
      const newBowler = players.find(p => p.id === newBowlerId) || { id: newBowlerId, name: 'New Bowler', overs: 0, runs: 0, wickets: 0 };
      setBowler(newBowler);
      await updateDoc(doc(db, 'matches', match.id), { currentBowler: newBowlerId });
      setSnackbar({ open: true, message: 'Bowler changed successfully', severity: 'success' });
      onClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error changing bowler: ' + error.message, severity: 'error' });
    }
    // Testing: Test bowler change with Jest
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

  const availableBowlers = squads[match.currentInnings === 1 ? 'team2' : 'team1']
    ?.filter(id => id !== bowler?.id)
    ?.map(id => players.find(p => p.id === id)) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Bowler</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>New Bowler</InputLabel>
                <Select
                  value={newBowlerId}
                  onChange={e => setNewBowlerId(e.target.value)}
                  label="New Bowler"
                >
                  {availableBowlers.map(player => (
                    <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <ActionButton onClick={handleSaveBowler}>Change Bowler</ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default BowlerDialog;