import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, Typography, List, ListItem, ListItemIcon, ListItemText, Checkbox, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  color: '#ffffff',
  '&:hover': { background: 'linear-gradient(45deg, #01579b, #e65100)' },
  textTransform: 'none',
  fontWeight: 600,
}));

const SquadDialog = ({ open, onClose, match, players, getTeamName, setSnackbar, handleOpenScoringDialog }) => {
  const [loading, setLoading] = useState(false);
  const [squads, setSquads] = useState({ team1: [], team2: [] });

  useEffect(() => {
    const fetchSquads = async () => {
      if (!match) return;
      setLoading(true);
      try {
        const matchDoc = await getDoc(doc(db, 'matches', match.id));
        if (matchDoc.exists()) {
          const matchData = matchDoc.data();
          setSquads({
            team1: matchData.squads?.team1 || [],
            team2: matchData.squads?.team2 || [],
          });
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Error loading squads: ' + error.message, severity: 'error' });
      }
      setLoading(false);
    };
    fetchSquads();
  }, [match, setSnackbar]);

  const handleSquadChange = (team, playerId) => {
    setSquads(prev => ({
      ...prev,
      [team]: prev[team].includes(playerId) ? prev[team].filter(id => id !== playerId) : [...prev[team], playerId],
    }));
  };

  const handleSaveSquads = async () => {
    try {
      if (squads.team1.length < 11 || squads.team2.length < 11) {
        setSnackbar({ open: true, message: 'Each team must have at least 11 players', severity: 'error' });
        return;
      }
      await updateDoc(doc(db, 'matches', match.id), { squads });
      setSnackbar({ open: true, message: 'Squads saved successfully', severity: 'success' });
      onClose();
      handleOpenScoringDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving squads: ' + error.message, severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Select Squads for {match?.title}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">{getTeamName(match?.team1Id)} Squad</Typography>
                <List dense>
                  {players.filter(p => p.teamId === match?.team1Id).map(player => (
                    <ListItem key={player.id}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={squads.team1.includes(player.id)}
                          onChange={() => handleSquadChange('team1', player.id)}
                        />
                      </ListItemIcon>
                      <ListItemText primary={player.name} secondary={player.role} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">{getTeamName(match?.team2Id)} Squad</Typography>
                <List dense>
                  {players.filter(p => p.teamId === match?.team2Id).map(player => (
                    <ListItem key={player.id}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={squads.team2.includes(player.id)}
                          onChange={() => handleSquadChange('team2', player.id)}
                        />
                      </ListItemIcon>
                      <ListItemText primary={player.name} secondary={player.role} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <ActionButton onClick={handleSaveSquads} disabled={squads.team1.length < 11 || squads.team2.length < 11}>
          Save Squads
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default SquadDialog;