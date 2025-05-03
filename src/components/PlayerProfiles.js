import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  MenuItem,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const PlayerProfiles = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filter, setFilter] = useState({ searchQuery: '', role: '' });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        let q = collection(db, 'players');
        
        if (filter.role) {
          const roleMap = {
            'Batsman': 'batsman',
            'Bowler': 'bowler',
            'All-Rounder': 'all-rounder',
            'Wicket-Keeper': 'wicketkeeper'
          };
          const dbRole = roleMap[filter.role] || filter.role;
          q = query(q, where('role', '==', dbRole));
        }

        const snapshot = await getDocs(q);
        let playersData = snapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));

        if (filter.searchQuery) {
          const searchTerm = filter.searchQuery.toLowerCase();
          playersData = playersData.filter(player => 
            player.name.toLowerCase().includes(searchTerm)
          );
        }

        setPlayers(playersData);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      }
    };
    fetchPlayers();
  }, [filter]);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    setSelectedPlayer(null);
  };

  const renderPlayerStats = (player) => {
    const stats = player.stats.overall;
    
    const formatNumber = (value) => {
      return typeof value === 'number' 
        ? value.toFixed(2) 
        : (value || '-');
    };

    return (
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={player.profileImage}
              sx={{ width: 100, height: 100, mr: 3 }}
            />
            <Box>
              <Typography variant="h3" color="primary" gutterBottom>
                {player.name}
              </Typography>
              <Chip label={`#${player.jerseyNumber}`} sx={{ mr: 1 }} />
              <Chip label={player.team} color="primary" />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h4" color="primary" gutterBottom>
            Career Statistics
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Typography>
              <strong>Matches:</strong> {stats.matches || 0}
            </Typography>
            <Typography>
              <strong>Role:</strong> {player.role}
            </Typography>
            
            {stats.batting && (
              <>
                <Typography variant="h6" color="primary" sx={{ gridColumn: '1/-1', mt: 2 }}>
                  Batting Stats
                </Typography>
                <Typography>
                  <strong>Runs:</strong> {stats.batting.runs || 0}
                </Typography>
                <Typography>
                  <strong>Average:</strong> {formatNumber(stats.batting.average)}
                </Typography>
                <Typography>
                  <strong>Strike Rate:</strong> {formatNumber(stats.batting.strikeRate)}
                </Typography>
                <Typography>
                  <strong>Highest:</strong> {stats.batting.highest || 0}
                </Typography>
                <Typography>
                  <strong>50s/100s:</strong> {stats.batting.fifties || 0}/{stats.batting.hundreds || 0}
                </Typography>
              </>
            )}
            
            {stats.bowling && (
              <>
                <Typography variant="h6" color="primary" sx={{ gridColumn: '1/-1', mt: 2 }}>
                  Bowling Stats
                </Typography>
                <Typography>
                  <strong>Wickets:</strong> {stats.bowling.wickets || 0}
                </Typography>
                <Typography>
                  <strong>Economy:</strong> {formatNumber(stats.bowling.economy)}
                </Typography>
                <Typography>
                  <strong>Average:</strong> {formatNumber(stats.bowling.average)}
                </Typography>
                <Typography>
                  <strong>Best Bowling:</strong> {stats.bowling.bestBowling || '-'}
                </Typography>
                <Typography>
                  <strong>5 Wickets:</strong> {stats.bowling.fiveWickets || 0}
                </Typography>
              </>
            )}
            
            {player.achievements && (
              <>
                <Typography variant="h6" color="primary" sx={{ gridColumn: '1/-1', mt: 2 }}>
                  Achievements
                </Typography>
                <Box sx={{ gridColumn: '1/-1' }}>
                  {player.achievements.map((achievement, index) => (
                    <Chip 
                      key={index}
                      label={achievement}
                      sx={{ m: 0.5 }}
                      color="secondary"
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h2" color="primary" align="center" gutterBottom>
        Player Profiles
      </Typography>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search by Name"
            name="searchQuery"
            value={filter.searchQuery}
            onChange={handleFilterChange}
            sx={{ flex: 1 }}
            InputProps={{
              type: 'search',
              'aria-label': 'search players by name'
            }}
          />
          <TextField
            label="Filter by Role"
            name="role"
            select
            value={filter.role}
            onChange={handleFilterChange}
            sx={{ flex: 1 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="Batsman">Batsman</MenuItem>
            <MenuItem value="Bowler">Bowler</MenuItem>
            <MenuItem value="All-Rounder">All-Rounder</MenuItem>
            <MenuItem value="Wicket-Keeper">Wicket-Keeper</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ width: '33%' }}>
            <Typography variant="h3" color="primary" gutterBottom>
              Players
            </Typography>
            {players.length > 0 ? (
              <List>
                {players.map((player) => (
                  <ListItem
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    sx={{
                      bgcolor: selectedPlayer?.id === player.id ? 'primary.main' : '#f5f5f5',
                      color: selectedPlayer?.id === player.id ? 'white' : 'text.primary',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'secondary.main', color: 'white' },
                    }}
                  >
                    <Avatar src={player.profileImage} sx={{ mr: 2, width: 40, height: 40 }} />
                    <ListItemText 
                      primary={player.name}
                      secondary={`${player.role} - ${player.team}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No players match the filters.</Typography>
            )}
          </Box>
          <Box sx={{ width: '67%' }}>
            {selectedPlayer ? (
              renderPlayerStats(selectedPlayer)
            ) : (
              <Typography color="textSecondary">Select a player to view details.</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PlayerProfiles;