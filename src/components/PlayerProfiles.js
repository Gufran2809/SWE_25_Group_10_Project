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
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const PlayerProfiles = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filter, setFilter] = useState({ team: '', role: '' });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        let q = collection(db, 'players');
        if (filter.team || filter.role) {
          q = query(
            q,
            ...(filter.team ? [where('team', '==', filter.team)] : []),
            ...(filter.role ? [where('role', '==', filter.role)] : [])
          );
        }
        const snapshot = await getDocs(q);
        const playersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersData);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([
          {
            id: '1',
            name: 'John Doe',
            team: 'Team A',
            role: 'Batsman',
            stats: { matches: 10, runs: 450, wickets: 2, average: 45.0 },
          },
          {
            id: '2',
            name: 'Jane Smith',
            team: 'Team B',
            role: 'Bowler',
            stats: { matches: 8, runs: 50, wickets: 15, average: 20.5 },
          },
          {
            id: '3',
            name: 'Mike Brown',
            team: 'Team A',
            role: 'All-Rounder',
            stats: { matches: 9, runs: 300, wickets: 10, average: 33.3 },
          },
        ]);
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

  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h2" color="primary" align="center" gutterBottom>
        Player Profiles
      </Typography>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Filter by Team"
            name="team"
            select
            value={filter.team}
            onChange={handleFilterChange}
            sx={{ flex: 1 }}
          >
            <MenuItem value="">All Teams</MenuItem>
            <MenuItem value="Team A">Team A</MenuItem>
            <MenuItem value="Team B">Team B</MenuItem>
          </TextField>
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
                    <ListItemText primary={`${player.name} (${player.role})`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No players match the filters.</Typography>
            )}
          </Box>
          <Box sx={{ width: '67%' }}>
            {selectedPlayer ? (
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {selectedPlayer.name}
                  </Typography>
                  <Typography>
                    <strong>Team:</strong> {selectedPlayer.team}
                  </Typography>
                  <Typography>
                    <strong>Role:</strong> {selectedPlayer.role}
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ mt: 2, mb: 1 }}>
                    Statistics
                  </Typography>
                  <Typography>
                    <strong>Matches:</strong> {selectedPlayer.stats.matches}
                  </Typography>
                  <Typography>
                    <strong>Runs:</strong> {selectedPlayer.stats.runs}
                  </Typography>
                  <Typography>
                    <strong>Wickets:</strong> {selectedPlayer.stats.wickets}
                  </Typography>
                  <Typography>
                    <strong>Batting Average:</strong> {selectedPlayer.stats.average}
                  </Typography>
                </CardContent>
              </Card>
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