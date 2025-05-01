import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Grid, List, ListItem, ListItemText, Button, Avatar } from '@mui/material';
import { EmojiEvents as TrophyIcon, Schedule as ScheduleIcon, Place as PlaceIcon, SportsCricket as SportsCricketIcon, Person as PersonIcon, PlayArrow as PlayArrowIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

const TeamAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  boxShadow: theme.shadows[2],
  border: `2px solid ${theme.palette.background.paper}`,
}));

const ViewDialog = ({ open, onClose, match, getTeamName, getLeagueName, getVenueName, umpires, navigate }) => {
  const formatMatchDate = (dateObj) => {
    if (!dateObj) return 'Date not set';
    try {
      const date = dateObj.toDate();
      return format(date, 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Match Details</DialogTitle>
      <DialogContent>
        {match && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>{match.title}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrophyIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1"><strong>League:</strong> {getLeagueName(match.leagueId)}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1"><strong>Date:</strong> {formatMatchDate(match.date)}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <PlaceIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1"><strong>Venue:</strong> {getVenueName(match.venue)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <SportsCricketIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1"><strong>Match Type:</strong> {match.matchType} ({match.overs} overs)</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1"><strong>Status:</strong> {match.status.toUpperCase()}</Typography>
                </Box>
                {match.isFeatured && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrophyIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body1"><strong>Featured Match</strong></Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Teams</Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <TeamAvatar src={match.teams && match.teams[0]?.logo} alt={getTeamName(match.team1Id)} sx={{ mr: 2 }} />
                    <Typography variant="body1">{getTeamName(match.team1Id)}</Typography>
                  </Box>
                  <Typography variant="h6">VS</Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" sx={{ mr: 2 }}>{getTeamName(match.team2Id)}</Typography>
                    <TeamAvatar src={match.teams && match.teams[1]?.logo} alt={getTeamName(match.team2Id)} />
                  </Box>
                </Box>
              </Grid>
              {match.umpireIds?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Umpires</Typography>
                  <List dense>
                    {match.umpireIds.map(umpireId => (
                      <ListItem key={umpireId}>
                        <ListItemText primary={umpires.find(u => u.id === umpireId)?.name || 'Unknown'} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
              {match.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Description</Typography>
                  <Typography variant="body2">{match.description}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Close</Button>
        {match?.status === 'live' && (
          <Button onClick={() => navigate(`/match/${match.id}`)} startIcon={<PlayArrowIcon />}>
            Watch Live
          </Button>
        )}
        {match?.status === 'completed' && (
          <Button onClick={() => navigate(`/scorecard/${match.id}`)} startIcon={<ViewIcon />}>
            View Scorecard
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewDialog;