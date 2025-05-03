import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container, Paper, Typography, Box, Grid, Divider, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, Skeleton,
  Chip, Tabs, Tab, IconButton, LinearProgress, Card
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator,
  TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsIcon from '@mui/icons-material/Sports';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';

const MatchDetail = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState({});
  const [league, setLeague] = useState(null);
  const [commentary, setCommentary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [matchStats, setMatchStats] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const unsubscribeMatch = onSnapshot(
          doc(db, 'matches', matchId),
          async (matchDoc) => {
            if (!matchDoc.exists()) return;
            const matchData = { id: matchDoc.id, ...matchDoc.data() };

            // Fetch teams and their players
            const [team1Doc, team2Doc] = await Promise.all([
              getDoc(doc(db, 'teams', matchData.team1Id)),
              getDoc(doc(db, 'teams', matchData.team2Id))
            ]);

            // Fetch all players for both teams
            const playersQuery = query(collection(db, 'players'), 
              where('teamId', 'in', [matchData.team1Id, matchData.team2Id]));
            const playersSnapshot = await getDocs(playersQuery);
            
            const players = {};
            playersSnapshot.docs.forEach(doc => {
              players[doc.id] = doc.data();
            });

            setMatch({
              ...matchData,
              team1: team1Doc.data()?.name,
              team2: team2Doc.data()?.name,
              team1Logo: team1Doc.data()?.logo,
              team2Logo: team2Doc.data()?.logo
            });

            setTeams({
              [matchData.team1Id]: {...team1Doc.data(), players},
              [matchData.team2Id]: {...team2Doc.data(), players}
            });

            calculateMatchStats(matchData);
          }
        );

        // Update commentary subscription
        const unsubscribeCommentary = onSnapshot(
          query(
            collection(db, 'commentary'),
            where('matchId', '==', matchId),
            orderBy('timestamp', 'desc')
          ),
          (snapshot) => {
            const comments = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                playerName: teams[data.battingTeam]?.players[data.batsmanId]?.name || 'Batsman',
                bowlerName: teams[data.bowlingTeam]?.players[data.bowlerId]?.name || 'Bowler'
              };
            });
            setCommentary(comments);
          }
        );

        setLoading(false);
        return () => {
          unsubscribeMatch();
          unsubscribeCommentary();
        };
      } catch (error) {
        console.error('Error fetching match data:', error);
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId]);

  const calculateMatchStats = (matchData) => {
    if (!matchData?.currentOverBalls) return;

    const stats = {
      runRate: 0,
      requiredRate: 0,
      predictedScore: 0,
      boundaries: {
        fours: 0,
        sixes: 0
      },
      extras: {
        total: 0,
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0
      }
    };

    // Calculate boundaries and extras from ball-by-ball data
    Object.keys(matchData.currentOverBalls).forEach(over => {
      matchData.currentOverBalls[over].forEach(ball => {
        if (!ball.extra && ball.runs === 4) stats.boundaries.fours++;
        if (!ball.extra && ball.runs === 6) stats.boundaries.sixes++;
        
        if (ball.extra) {
          stats.extras.total++;
          switch (ball.extra) {
            case 'wide': stats.extras.wides++; break;
            case 'noBall': stats.extras.noBalls++; break;
            case 'bye': stats.extras.byes++; break;
            case 'legBye': stats.extras.legByes++; break;
          }
        }
      });
    });

    // Calculate run rates
    const battingTeam = matchData.battingTeam === matchData.team1Id ? 'team1' : 'team2';
    const currentInningsScore = matchData.score[battingTeam];
    if (currentInningsScore) {
      stats.runRate = (currentInningsScore.runs / parseFloat(currentInningsScore.overs || 1)).toFixed(2);
    }

    setMatchStats(stats);
  };

  const calculateBowlingStats = (currentOverBalls) => {
    const bowlingStats = {};
    
    Object.keys(currentOverBalls).forEach(over => {
      const overData = currentOverBalls[over];
      overData.forEach(ball => {
        if (!bowlingStats[ball.bowlerId]) {
          bowlingStats[ball.bowlerId] = {
            id: ball.bowlerId,
            name: 'Bowler ' + ball.bowlerId,
            balls: 0,
            runs: 0,
            wickets: 0,
            maidenOvers: 0,
            overRuns: 0,
            currentOver: parseInt(over)
          };
        }

        const bowler = bowlingStats[ball.bowlerId];

        // Count legal deliveries
        if (!ball.extra || (ball.extra !== 'wide' && ball.extra !== 'noBall')) {
          bowler.balls++;
        }

        // Add runs including extras
        if (!ball.extra) {
          bowler.runs += ball.runs;
          bowler.overRuns += ball.runs;
        } else if (ball.extra === 'wide' || ball.extra === 'noBall') {
          bowler.runs += ball.runs + 1;
          bowler.overRuns += ball.runs + 1;
        }

        // Count wickets
        if (ball.wicket && ball.wicketType !== 'Run Out') {
          bowler.wickets++;
        }
      });

      // Check for maiden over
      Object.values(bowlingStats).forEach(bowler => {
        if (bowler.currentOver === parseInt(over) && bowler.overRuns === 0) {
          bowler.maidenOvers++;
        }
        bowler.overRuns = 0; // Reset for next over
      });
    });

    // Calculate overs
    Object.values(bowlingStats).forEach(bowler => {
      bowler.overs = Math.floor(bowler.balls / 6) + (bowler.balls % 6) / 10;
    });

    return bowlingStats;
  };

  const renderScorecard = () => {
    if (!match) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Loading scorecard...
          </Typography>
        </Box>
      );
    }

    const battingTeamId = match.battingTeam;
    const bowlingTeamId = match.team1Id === battingTeamId ? match.team2Id : match.team1Id;
    const currentInnings = match.score[battingTeamId === match.team1Id ? 'team1' : 'team2'];

    // Calculate batting statistics from currentOverBalls
    const battingStats = {};
    Object.keys(match.currentOverBalls || {}).forEach(over => {
      match.currentOverBalls[over].forEach(ball => {
        if (!battingStats[ball.batsmanId]) {
          const player = teams[battingTeamId]?.players[ball.batsmanId];
          battingStats[ball.batsmanId] = {
            id: ball.batsmanId,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            name: player?.name || 'Unknown Player'
          };
        }
        
        if (!ball.extra || ball.extra === 'bye' || ball.extra === 'legBye') {
          battingStats[ball.batsmanId].ballsFaced++;
        }
        
        if (!ball.extra) {
          battingStats[ball.batsmanId].runs += ball.runs;
          if (ball.runs === 4) battingStats[ball.batsmanId].fours++;
          if (ball.runs === 6) battingStats[ball.batsmanId].sixes++;
        }
      });
    });

    // Calculate bowling statistics
    const bowlingStats = calculateBowlingStats(match.currentOverBalls || {});
    Object.keys(bowlingStats).forEach(bowlerId => {
      const player = teams[bowlingTeamId]?.players[bowlerId];
      bowlingStats[bowlerId].name = player?.name || 'Unknown Player';
    });

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 4, color: 'primary.main' }}>
          {teams[battingTeamId]?.name} - {currentInnings?.runs}/{currentInnings?.wickets} ({currentInnings?.overs})
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 3, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Batsman</TableCell>
                <TableCell align="right">Runs</TableCell>
                <TableCell align="right">Balls</TableCell>
                <TableCell align="right">4s</TableCell>
                <TableCell align="right">6s</TableCell>
                <TableCell align="right">SR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(battingStats).map((batsman) => {
                const strikeRate = batsman.ballsFaced > 0 
                  ? ((batsman.runs / batsman.ballsFaced) * 100).toFixed(2)
                  : 0;

                return (
                  <TableRow key={batsman.id}>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {batsman.name}
                        {(match.currentBatsman === batsman.id || match.currentNonStriker === batsman.id) && (
                          <Chip 
                            label="batting" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{batsman.runs}</TableCell>
                    <TableCell align="right">{batsman.ballsFaced}</TableCell>
                    <TableCell align="right">{batsman.fours}</TableCell>
                    <TableCell align="right">{batsman.sixes}</TableCell>
                    <TableCell align="right">{strikeRate}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Bowling
        </Typography>
        <Card variant="outlined" sx={{ mb: 3, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>Bowler</TableCell>
                <TableCell align="right">O</TableCell>
                <TableCell align="right">M</TableCell>
                <TableCell align="right">R</TableCell>
                <TableCell align="right">W</TableCell>
                <TableCell align="right">Econ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(bowlingStats).map((bowler) => {
                const economy = bowler.overs > 0 
                  ? (bowler.runs / bowler.overs).toFixed(2)
                  : '0.00';

                return (
                  <TableRow key={bowler.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {bowler.name}
                        {match.currentBowler === bowler.id && (
                          <Chip 
                            label="bowling" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{bowler.overs.toFixed(1)}</TableCell>
                    <TableCell align="right">{bowler.maidenOvers}</TableCell>
                    <TableCell align="right">{bowler.runs}</TableCell>
                    <TableCell align="right">{bowler.wickets}</TableCell>
                    <TableCell align="right">{economy}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </Box>
    );
  };

  const renderCommentary = () => (
    <Timeline>
      {commentary.map((comment) => (
        <TimelineItem key={comment.id}>
          <TimelineSeparator>
            <TimelineDot 
              color={
                comment.wicket ? 'error' : 
                comment.runs >= 4 ? 'success' : 
                comment.extra ? 'warning' : 
                'primary'
              } 
            />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="subtitle2">
              Over {comment.over}.{comment.ball}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {comment.wicket ? (
                <span style={{ color: '#d32f2f' }}>
                  WICKET! {comment.wicketType} - {comment.playerName}
                </span>
              ) : comment.extra ? (
                `${comment.extra.toUpperCase()} - ${comment.runs} run${comment.runs !== 1 ? 's' : ''}`
              ) : (
                `${comment.runs} run${comment.runs !== 1 ? 's' : ''}`
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`${comment.playerName} facing ${comment.bowlerName}`}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );

  const renderStatistics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Match Statistics
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Run Rate
            </Typography>
            <Typography variant="h5">
              {matchStats?.runRate}
            </Typography>
          </Box>
          {matchStats?.requiredRate > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Required Run Rate
              </Typography>
              <Typography variant="h5" color="error">
                {matchStats.requiredRate}
              </Typography>
            </Box>
          )}
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Boundaries
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box>
              <Typography variant="h5">
                {matchStats?.boundaries.fours}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fours
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5">
                {matchStats?.boundaries.sixes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sixes
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Extras
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box>
              <Typography variant="h6">
                {matchStats?.extras.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2">
                Wides: {matchStats?.extras.wides}
              </Typography>
              <Typography variant="body2">
                No Balls: {matchStats?.extras.noBalls}
              </Typography>
              <Typography variant="body2">
                Byes: {matchStats?.extras.byes}
              </Typography>
              <Typography variant="body2">
                Leg Byes: {matchStats?.extras.legByes}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {match?.title || `${match?.team1} vs ${match?.team2}`}
          </Typography>
          <Box>
            <Chip 
              label={match?.status?.toUpperCase()} 
              color={match?.status === 'live' ? 'error' : 'default'}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={5} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={match?.team1Logo} 
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {match?.team1}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {match?.score?.team1?.runs || 0}/{match?.score?.team1?.wickets || 0}
            </Typography>
            <Typography variant="subtitle1">
              ({match?.score?.team1?.overs || 0} overs)
            </Typography>
          </Grid>

          <Grid item xs={2} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography variant="h4">VS</Typography>
          </Grid>

          <Grid item xs={5} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={match?.team2Logo} 
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {match?.team2}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {match?.score?.team2?.runs || 0}/{match?.score?.team2?.wickets || 0}
            </Typography>
            <Typography variant="subtitle1">
              ({match?.score?.team2?.overs || 0} overs)
            </Typography>
          </Grid>
        </Grid>

        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SportsIcon />} label="SCORECARD" />
          <Tab icon={<GroupIcon />} label="COMMENTARY" />
          <Tab icon={<BarChartIcon />} label="STATISTICS" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && renderScorecard()}
          {activeTab === 1 && renderCommentary()}
          {activeTab === 2 && renderStatistics()}
        </Box>
      </Paper>
    </Container>
  );
};

export default MatchDetail;