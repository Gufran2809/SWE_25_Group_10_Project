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
  const [commentary, setCommentary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [matchStats, setMatchStats] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'matches', matchId),
      (doc) => {
        if (doc.exists()) {
          setMatch({ id: doc.id, ...doc.data() });
          calculateMatchStats(doc.data());
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [matchId]);

  useEffect(() => {
    const fetchCommentary = async () => {
      const q = query(
        collection(db, 'commentary'),
        where('matchId', '==', matchId),
        orderBy('timestamp', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommentary(comments);
      });

      return () => unsubscribe();
    };

    fetchCommentary();
  }, [matchId]);

  const calculateMatchStats = (matchData) => {
    if (!matchData?.score) return;

    const stats = {
      runRate: ((matchData.score.team1?.runs || 0) / (matchData.score.team1?.overs || 1)).toFixed(2),
      requiredRate: 0,
      predictedScore: 0,
      boundaries: {
        fours: matchData.score.batting?.reduce((acc, bat) => acc + (bat.fours || 0), 0) || 0,
        sixes: matchData.score.batting?.reduce((acc, bat) => acc + (bat.sixes || 0), 0) || 0
      }
    };

    if (matchData.score.team2) {
      const remainingRuns = (matchData.score.team1?.runs || 0) - (matchData.score.team2?.runs || 0);
      const remainingOvers = 20 - (matchData.score.team2?.overs || 0);
      stats.requiredRate = (remainingRuns / remainingOvers).toFixed(2);
    }

    setMatchStats(stats);
  };

  const renderScorecard = () => (
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
            {match.score?.batting?.map((batsman, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                  '&:last-child td': { border: 0 }
                }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {batsman.name}
                    {batsman.isNotOut && (
                      <Chip 
                        label="not out" 
                        size="small" 
                        color="success" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">{batsman.runs}</TableCell>
                <TableCell align="right">{batsman.balls}</TableCell>
                <TableCell align="right">{batsman.fours}</TableCell>
                <TableCell align="right">{batsman.sixes}</TableCell>
                <TableCell align="right">
                  {((batsman.runs / batsman.balls) * 100).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Bowling Card */}
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
            {match.score?.bowling?.map((bowler, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                  '&:last-child td': { border: 0 }
                }}
              >
                <TableCell>{bowler.name}</TableCell>
                <TableCell align="right">{bowler.overs}</TableCell>
                <TableCell align="right">{bowler.maidens}</TableCell>
                <TableCell align="right">{bowler.runs}</TableCell>
                <TableCell align="right">{bowler.wickets}</TableCell>
                <TableCell align="right">
                  {(bowler.runs / bowler.overs).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );

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
          <Typography variant="h4">Match Details</Typography>
          <IconButton onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
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