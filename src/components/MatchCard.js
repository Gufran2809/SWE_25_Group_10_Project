import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider, Grid, IconButton, Button, Avatar } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PlayArrow as PlayArrowIcon, VisibilityOutlined as ViewIcon, EmojiEvents as TrophyIcon, Schedule as ScheduleIcon, Place as PlaceIcon, SportsCricket as SportsCricketIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[8] },
  borderRadius: '12px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  backgroundColor: 
    status === 'live' ? theme.palette.error.main :
    status === 'upcoming' ? theme.palette.success.main :
    status === 'completed' ? theme.palette.grey[600] : theme.palette.primary.main,
  color: '#ffffff',
  fontWeight: 'bold',
  borderRadius: '4px',
  fontSize: '0.7rem',
}));

const TeamAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  boxShadow: theme.shadows[2],
  border: `2px solid ${theme.palette.background.paper}`,
}));

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  color: '#ffffff',
  '&:hover': { background: 'linear-gradient(45deg, #01579b, #e65100)' },
  textTransform: 'none',
  fontWeight: 600,
}));

const MatchCard = ({
  match,
  userRole,
  getTeamName,
  getLeagueName,
  getVenueName,
  handleOpenViewDialog,
  handleOpenSquadDialog,
  handleOpenEditDialog,
  handleDeleteMatch,
  handleViewLiveMatch,
  handleViewScorecard,
}) => {
  const formatMatchDate = (dateObj) => {
    if (!dateObj) return 'Date not set';
    try {
      const date = dateObj.toDate();
      return format(date, 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const isMatchSoon = () => {
    if (!match.date) return false;
    const matchDate = match.date.toDate();
    const now = new Date();
    const hoursDiff = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return match.status === 'upcoming' && hoursDiff > 0 && hoursDiff < 24;
  };

  return (
    <StyledCard elevation={match.isFeatured ? 6 : 2}>
      {match.isFeatured && (
        <Box sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', py: 0.5, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrophyIcon fontSize="small" sx={{ mr: 0.5 }} /> FEATURED MATCH
          </Typography>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {match.status === 'live' && (
          <Box mb={1}>
            <img
              src="https://via.placeholder.com/300x150?text=Live+Stream+Preview"
              alt="Live Stream Preview"
              style={{ width: '100%', height: 'auto', borderRadius: '8px', cursor: 'pointer' }}
              onClick={handleViewLiveMatch}
            />
          </Box>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="textSecondary">{getLeagueName(match.leagueId)}</Typography>
          <Box display="flex" alignItems="center">
            {isMatchSoon() && <Chip label="SOON" size="small" color="warning" sx={{ mr: 1, height: 24 }} />}
            <StatusChip label={match.status.toUpperCase()} status={match.status} size="small" />
          </Box>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {match.title}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={3}>
          <Box textAlign="center" width="40%">
            <TeamAvatar src={match.teams && match.teams[0]?.logo} alt={getTeamName(match.team1Id)} sx={{ mx: 'auto', mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{getTeamName(match.team1Id)}</Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ bgcolor: 'background.paper', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            VS
          </Typography>
          <Box textAlign="center" width="40%">
            <TeamAvatar src={match.teams && match.teams[1]?.logo} alt={getTeamName(match.team2Id)} sx={{ mx: 'auto', mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{getTeamName(match.team2Id)}</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box display="flex" alignItems="center" mt={1.5}>
          <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">{formatMatchDate(match.date)}</Typography>
        </Box>
        <Box display="flex" alignItems="center" mt={1}>
          <PlaceIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">{getVenueName(match.venue)}</Typography>
        </Box>
        {match.matchType && (
          <Box display="flex" alignItems="center" mt={1}>
            <SportsCricketIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{match.matchType} ({match.overs} overs)</Typography>
          </Box>
        )}
        {match.status === 'live' && (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
              Score: {match.score?.runs}/{match.score?.wickets} ({match.score?.overs} overs)
            </Typography>
          </Box>
        )}
      </CardContent>
      <Box sx={{ p: 1, bgcolor: 'background.default', borderTop: theme => `1px solid ${theme.palette.divider}` }}>
        <Grid container spacing={1} justifyContent="center">
          <Grid item>
            <IconButton size="small" onClick={handleOpenViewDialog} color="primary">
              <ViewIcon />
            </IconButton>
          </Grid>
          {match.status === 'live' && (
            <Grid item>
              <ActionButton size="small" startIcon={<PlayArrowIcon />} onClick={handleViewLiveMatch}>
                Watch Live
              </ActionButton>
            </Grid>
          )}
          {match.status === 'completed' && (
            <Grid item>
              <Button size="small" startIcon={<ViewIcon />} onClick={handleViewScorecard} color="secondary">
                Scorecard
              </Button>
            </Grid>
          )}
          {(userRole === 'organizer' || userRole === 'umpire') && (
            <>
              {match.status === 'upcoming' && (
                <Grid item>
                  <ActionButton size="small" startIcon={<PlayArrowIcon />} onClick={handleOpenSquadDialog}>
                    Start Scoring
                  </ActionButton>
                </Grid>
              )}
              <Grid item>
                <IconButton size="small" onClick={handleOpenEditDialog} color="primary">
                  <EditIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton size="small" onClick={handleDeleteMatch} color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </StyledCard>
  );
};

export default MatchCard;