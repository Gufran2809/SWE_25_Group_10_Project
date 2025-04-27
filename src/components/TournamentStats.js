import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const TournamentStats = () => {
  const [stats, setStats] = useState({
    topRunScorers: [],
    topWicketTakers: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/tournament/stats');
        const mockData = {
          topRunScorers: [
            { name: 'John Doe', team: 'Team A', runs: 450, matches: 10 },
            { name: 'Mike Brown', team: 'Team A', runs: 300, matches: 9 },
          ],
          topWicketTakers: [
            { name: 'Jane Smith', team: 'Team B', wickets: 15, matches: 8 },
            { name: 'Mike Brown', team: 'Team A', wickets: 10, matches: 9 },
          ],
        };
        setStats(mockData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <Card sx={{ maxWidth: 900, mx: 'auto', p: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h2" color="primary" align="center" gutterBottom>
          Tournament Statistics
        </Typography>
        {/* Top Run Scorers */}
        <Typography variant="h3" color="primary" gutterBottom>
          Top Run Scorers
        </Typography>
        {stats.topRunScorers.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Runs</TableCell>
                <TableCell>Matches</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.topRunScorers.map((player, index) => (
                <TableRow key={index}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>{player.runs}</TableCell>
                  <TableCell>{player.matches}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography color="textSecondary">No run scorers data available.</Typography>
        )}
        {/* Top Wicket Takers */}
        <Typography variant="h3" color="primary" sx={{ mt: 3 }} gutterBottom>
          Top Wicket Takers
        </Typography>
        {stats.topWicketTakers.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Wickets</TableCell>
                <TableCell>Matches</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.topWicketTakers.map((player, index) => (
                <TableRow key={index}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>{player.wickets}</TableCell>
                  <TableCell>{player.matches}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography color="textSecondary">No wicket takers data available.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TournamentStats;