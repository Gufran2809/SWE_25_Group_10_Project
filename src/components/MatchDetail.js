import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
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

            const [team1Doc, team2Doc] = await Promise.all([
              getDoc(doc(db, 'teams', matchData.team1Id)),
              getDoc(doc(db, 'teams', matchData.team2Id))
            ]);

            const leagueDoc = await getDoc(doc(db, 'leagues', matchData.leagueId));

            setMatch({
              ...matchData,
              team1: team1Doc.data()?.name,
              team2: team2Doc.data()?.name,
              team1Logo: team1Doc.data()?.logo,
              team2Logo: team2Doc.data()?.logo
            });
            setTeams({
              [matchData.team1Id]: team1Doc.data(),
              [matchData.team2Id]: team2Doc.data()
            });
            setLeague(leagueDoc.data());
            calculateMatchStats(matchData);
          }
        );

        const commentaryQuery = query(
          collection(db, 'commentary'),
          where('matchId', '==', matchId),
          orderBy('timestamp', 'desc')
        );

        const unsubscribeCommentary = onSnapshot(commentaryQuery, (snapshot) => {
          const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCommentary(comments);
        });

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
    if (!matchData?.score) return;

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

    const battingTeam = matchData.battingTeam === matchData.team1Id ? 'team1' : 'team2';
    const currentInningsScore = matchData.score[battingTeam];
    if (currentInningsScore) {
      stats.runRate = (currentInningsScore.runs / parseFloat(currentInningsScore.overs || 1)).toFixed(2);
    }

    if (matchData.score.team1 && matchData.score.team2) {
      const target = matchData.score.team1.runs + 1;
      const remainingRuns = target - (matchData.score.team2.runs || 0);
      const remainingOvers = matchData.overs - parseFloat(matchData.score.team2.overs || 0);
      if (remainingOvers > 0) {
        stats.requiredRate = (remainingRuns / remainingOvers).toFixed(2);
      }
    }

    Object.values(matchData.battingStats || {}).forEach(batsman => {
      stats.boundaries.fours += batsman.fours || 0;
      stats.boundaries.sixes += batsman.sixes || 0;
    });

    setMatchStats(stats);
  };

  const renderScorecard = () => {
    if (!match || !match.battingStats || !match.bowlingStats) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No scorecard data available
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 4, color: 'primary.main' }}>
          Detailed Scorecard
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
              {Object.values(match.battingStats).map((batsman, index) => {
                // Calculate strike rate
                const strikeRate = batsman.ballsFaced > 0 
                  ? ((batsman.runs / batsman.ballsFaced) * 100)
                  : 0;

                return (
                  <TableRow 
                    key={batsman.id || index}
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:last-child td': { border: 0 }
                    }}
                  >
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
                    <TableCell align="right">{batsman.runs || 0}</TableCell>
                    <TableCell align="right">{batsman.ballsFaced || 0}</TableCell>
                    <TableCell align="right">{batsman.fours || 0}</TableCell>
                    <TableCell align="right">{batsman.sixes || 0}</TableCell>
                    <TableCell align="right">{strikeRate.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Bowling Statistics
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
              {Object.values(match.bowlingStats).map((bowler, index) => {
                // Calculate economy rate
                const economy = bowler.overs > 0 
                  ? (bowler.runs / parseFloat(bowler.overs))
                  : 0;

                return (
                  <TableRow 
                    key={bowler.id || index}
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:last-child td': { border: 0 }
                    }}
                  >
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
                    <TableCell align="right">{bowler.overs || 0}</TableCell>
                    <TableCell align="right">{bowler.maidens || 0}</TableCell>
                    <TableCell align="right">{bowler.runs || 0}</TableCell>
                    <TableCell align="right">{bowler.wickets || 0}</TableCell>
                    <TableCell align="right">{economy.toFixed(2)}</TableCell>
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
      {commentary.map((comment, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color={comment.type === 'wicket' ? 'error' : 'primary'} />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="subtitle2" component="span">
              {comment.over}.{comment.ball} Over
            </Typography>
            <Typography>{comment.text}</Typography>
            {comment.runs > 0 && (
              <Chip 
                label={`${comment.runs} runs`}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
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