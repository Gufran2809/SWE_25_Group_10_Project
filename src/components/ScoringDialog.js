import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, Typography, Card, CardContent, TextField, Button, Chip, Divider, CircularProgress } from '@mui/material';
import { Undo as UndoIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(45deg, #0288d1, #f57c00)',
  color: '#ffffff',
  '&:hover': { background: 'linear-gradient(45deg, #01579b, #e65100)' },
  textTransform: 'none',
  fontWeight: 600,
  minWidth: 60,
  padding: '8px 12px',
}));

const ScoreCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: theme.shadows[4],
  background: theme.palette.background.paper,
}));

const BallChip = styled(Chip)(({ type }) => ({
  backgroundColor: 
    type === 'wicket' ? '#d32f2f' :
    type === 'four' || type === 'six' ? '#388e3c' :
    type === 'extra' ? '#f57c00' : '#0288d1',
  color: '#ffffff',
  fontWeight: 'bold',
  margin: '2px',
  height: 24,
  fontSize: '0.75rem',
}));

const ScoringDialog = ({ open, onClose, match, players, getTeamName, setOpenWicketDialog, setOpenBowlerDialog, setSnackbar }) => {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [currentInnings, setCurrentInnings] = useState(1);
  const [batsmen, setBatsmen] = useState({ striker: null, nonStriker: null });
  const [bowler, setBowler] = useState(null);
  const [lastBalls, setLastBalls] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [fallOfWickets, setFallOfWickets] = useState([]);
  const [commentary, setCommentary] = useState('');
  const [squads, setSquads] = useState({ team1: [], team2: [] });
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!match || !open) return;
    setLoading(true);
    const fetchMatchData = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', match.id));
        if (matchDoc.exists()) {
          const matchData = matchDoc.data();
          setScore({
            runs: matchData.score?.runs || 0,
            wickets: matchData.score?.wickets || 0,
            overs: matchData.score?.overs || 0,
            balls: matchData.score?.balls || 0,
          });
          setCurrentInnings(matchData.currentInnings || 1);
          setSquads({
            team1: matchData.squads?.team1 || [],
            team2: matchData.squads?.team2 || [],
          });
          setTarget(matchData.firstInningsScore || null);
          setBatsmen({
            striker: players.find(p => p.id === (matchData.currentBatsmen?.striker || matchData.squads?.team1[0])) || { id: 'p1', name: 'Batsman 1', runs: 0, balls: 0 },
            nonStriker: players.find(p => p.id === (matchData.currentBatsmen?.nonStriker || matchData.squads?.team1[1])) || { id: 'p2', name: 'Batsman 2', runs: 0, balls: 0 },
          });
          setBowler(players.find(p => p.id === (matchData.currentBowler || matchData.squads?.team2[0])) || { id: 'b1', name: 'Bowler 1', overs: 0, runs: 0, wickets: 0 });
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Error loading match: ' + error.message, severity: 'error' });
      }
      setLoading(false);
    };
    fetchMatchData();

    const unsubscribe = onSnapshot(collection(db, 'matches', match.id, 'balls'), (snapshot) => {
      const balls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLastBalls(balls.slice(-6));
      const wickets = balls.filter(b => b.type === 'wicket').map(b => ({
        over: b.over,
        ball: b.ball,
        batsman: b.batsman,
        type: b.value.type,
      }));
      setFallOfWickets(wickets);
      const partnershipsData = [];
      let currentPair = { batsmen: [batsmen.striker?.id, batsmen.nonStriker?.id], runs: 0, balls: 0 };
      balls.forEach(ball => {
        if (ball.type === 'wicket') {
          if (currentPair.batsmen.length) {
            partnershipsData.push({ ...currentPair });
            currentPair = { batsmen: [batsmen.striker?.id, batsmen.nonStriker?.id], runs: 0, balls: 0 };
          }
        } else {
          currentPair.runs += ball.type === 'runs' ? ball.value : ball.type === 'extra' ? ball.value.runs : 0;
          currentPair.balls += ball.type === 'extra' && (ball.value.type === 'wide' || ball.value.type === 'no-ball') ? 0 : 1;
        }
      });
      if (currentPair.batsmen.length) partnershipsData.push(currentPair);
      setPartnerships(partnershipsData);
    });
    return () => unsubscribe();
    // Testing: Mock Firestore snapshot to test real-time ball updates
  }, [match, open, batsmen, players, setSnackbar]);

  const handleBallAction = async (type, value) => {
    try {
      const ballData = {
        innings: currentInnings,
        over: Math.floor(score.balls / 6) + 1,
        ball: (score.balls % 6) + 1,
        type,
        value,
        batsman: batsmen.striker?.id,
        bowler: bowler?.id,
        commentary,
        timestamp: new Date(),
      };

      let newScore = { ...score };
      let newBatsmen = { ...batsmen };
      let newBowler = { ...bowler };

      if (type === 'runs') {
        newScore.runs += value;
        newScore.balls += 1;
        newBatsmen.striker = { ...newBatsmen.striker, runs: newBatsmen.striker.runs + value, balls: newBatsmen.striker.balls + 1 };
        newBowler.runs = (newBowler.runs || 0) + value;
        if (value % 2 === 1) {
          [newBatsmen.striker, newBatsmen.nonStriker] = [newBatsmen.nonStriker, newBatsmen.striker];
        }
      } else if (type === 'extra') {
        newScore.runs += value.runs;
        newScore.balls += value.type === 'wide' || value.type === 'no-ball' ? 0 : 1;
        newBowler.runs = (newBowler.runs || 0) + value.runs;
      } else if (type === 'wicket') {
        setOpenWicketDialog(true);
        return;
      }

      newScore.overs = Math.floor(newScore.balls / 6) + (newScore.balls % 6 === 0 ? 0 : newScore.overs % 1);
      setScore(newScore);
      setBatsmen(newBatsmen);
      setBowler(newBowler);

      await addDoc(collection(db, 'matches', match.id, 'balls'), ballData);
      await updateDoc(doc(db, 'matches', match.id), {
        score: newScore,
        status: 'live',
        currentInnings,
        currentBatsmen: { striker: newBatsmen.striker.id, nonStriker: newBatsmen.nonStriker.id },
        currentBowler: newBowler.id,
      });

      if (newScore.balls % 6 === 0 && type !== 'extra') {
        setOpenBowlerDialog(true);
        [newBatsmen.striker, newBatsmen.nonStriker] = [newBatsmen.nonStriker, newBatsmen.striker];
        setBatsmen(newBatsmen);
        await updateDoc(doc(db, 'matches', match.id), {
          currentBatsmen: { striker: newBatsmen.striker.id, nonStriker: newBatsmen.nonStriker.id },
        });
      }

      setCommentary('');
      setSnackbar({ open: true, message: 'Ball recorded successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error recording ball: ' + error.message, severity: 'error' });
    }
    // Testing: Write Jest tests for ball action logic
  };

  const handleUndoLastAction = async () => {
    try {
      const lastBall = lastBalls[0];
      if (!lastBall) return;
      await deleteDoc(doc(db, 'matches', match.id, 'balls', lastBall.id));
      const newScore = { ...score };
      let newBatsmen = { ...batsmen };
      let newBowler = { ...bowler };

      if (lastBall.type === 'runs') {
        newScore.runs -= lastBall.value;
        newScore.balls -= 1;
        newBatsmen.striker = { ...newBatsmen.striker, runs: newBatsmen.striker.runs - lastBall.value, balls: newBatsmen.striker.balls - 1 };
        newBowler.runs = (newBowler.runs || 0) - lastBall.value;
      } else if (lastBall.type === 'extra') {
        newScore.runs -= lastBall.value.runs;
        newScore.balls -= lastBall.value.type === 'wide' || lastBall.value.type === 'no-ball' ? 0 : 1;
        newBowler.runs = (newBowler.runs || 0) - lastBall.value.runs;
      } else if (lastBall.type === 'wicket') {
        newScore.wickets -= 1;
      }

      newScore.overs = Math.floor(newScore.balls / 6) + (newScore.balls % 6 === 0 ? 0 : newScore.overs % 1);
      setScore(newScore);
      setBatsmen(newBatsmen);
      setBowler(newBowler);

      await updateDoc(doc(db, 'matches', match.id), {
        score: newScore,
        currentBatsmen: { striker: newBatsmen.striker.id, nonStriker: newBatsmen.nonStriker.id },
        currentBowler: newBowler.id,
      });
      setSnackbar({ open: true, message: 'Last action undone', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error undoing action: ' + error.message, severity: 'error' });
    }
    // Testing: Test undo functionality with Jest
  };

  const handleEndOver = async () => {
    try {
      setOpenBowlerDialog(true);
      const newBatsmen = { ...batsmen };
      [newBatsmen.striker, newBatsmen.nonStriker] = [newBatsmen.nonStriker, newBatsmen.striker];
      setBatsmen(newBatsmen);
      await updateDoc(doc(db, 'matches', match.id), {
        currentBatsmen: { striker: newBatsmen.striker.id, nonStriker: newBatsmen.nonStriker.id },
      });
      setSnackbar({ open: true, message: 'Over ended', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error ending over: ' + error.message, severity: 'error' });
    }
  };

  const handleEndInnings = async () => {
    try {
      if (currentInnings === 1) {
        await updateDoc(doc(db, 'matches', match.id), {
          firstInningsScore: score.runs,
          currentInnings: 2,
          score: { runs: 0, wickets: 0, overs: 0, balls: 0 },
          currentBatsmen: { striker: squads.team2[0], nonStriker: squads.team2[1] },
          currentBowler: squads.team1[0],
        });
        setCurrentInnings(2);
        setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
        setBatsmen({
          striker: players.find(p => p.id === squads.team2[0]) || { id: 'p1', name: 'Batsman 1', runs: 0, balls: 0 },
          nonStriker: players.find(p => p.id === squads.team2[1]) || { id: 'p2', name: 'Batsman 2', runs: 0, balls: 0 },
        });
        setBowler(players.find(p => p.id === squads.team1[0]) || { id: 'b1', name: 'Bowler 1', overs: 0, runs: 0, wickets: 0 });
        setTarget(score.runs + 1);
      } else {
        await updateDoc(doc(db, 'matches', match.id), { status: 'completed' });
        onClose();
      }
      setSnackbar({ open: true, message: `Innings ${currentInnings} ended`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error ending innings: ' + error.message, severity: 'error' });
    }
    // Testing: Test innings transition with Cypress
  };

  const partnershipChartData = {
    labels: partnerships.map((_, index) => `P${index + 1}`),
    datasets: [{
      label: 'Partnership Runs',
      data: partnerships.map(p => p.runs),
      borderColor: '#0288d1',
      backgroundColor: 'rgba(2, 136, 209, 0.2)',
      fill: true,
    }],
  };

  const fallOfWicketsChartData = {
    labels: fallOfWickets.map(w => `${w.over}.${w.ball}`),
    datasets: [{
      label: 'Wickets',
      data: fallOfWickets.map((_, index) => index + 1),
      borderColor: '#d32f2f',
      backgroundColor: 'rgba(211, 47, 47, 0.2)',
      fill: false,
      stepped: 'before',
    }],
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Live Scoring: {match?.title}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <ScoreCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {getTeamName(match?.team1Id)} vs {getTeamName(match?.team2Id)}
                </Typography>
                <Typography variant="h5" color="error.main">
                  Score: {score.runs}/{score.wickets} ({score.overs.toFixed(1)} overs)
                </Typography>
                {currentInnings === 2 && target && (
                  <Typography variant="body2" color="text.secondary">
                    Target: {target} runs (Need {target - score.runs} more runs)
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Current Batsmen</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Striker: {batsmen.striker?.name || 'Unknown'} - {batsmen.striker?.runs || 0} runs ({batsmen.striker?.balls || 0} balls, SR: {((batsmen.striker?.runs / batsmen.striker?.balls) * 100 || 0).toFixed(2)})
                      </Typography>
                      <Typography variant="body2">
                        Non-Striker: {batsmen.nonStriker?.name || 'Unknown'} - {batsmen.nonStriker?.runs || 0} runs ({batsmen.nonStriker?.balls || 0} balls, SR: {((batsmen.nonStriker?.runs / batsmen.nonStriker?.balls) * 100 || 0).toFixed(2)})
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Current Bowler</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {bowler?.name || 'Unknown'} - {bowler?.wickets || 0}/{bowler?.runs || 0} ({bowler?.overs || 0} overs)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Action Buttons</Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {[0, 1, 2, 3, 4, 6].map(run => (
                        <ActionButton key={run} onClick={() => handleBallAction('runs', run)} size="small" sx={{ minWidth: 50 }}>
                          {run}
                        </ActionButton>
                      ))}
                      <ActionButton onClick={() => handleBallAction('extra', { type: 'wide', runs: 1 })} size="small" color="warning">
                        Wide
                      </ActionButton>
                      <ActionButton onClick={() => handleBallAction('extra', { type: 'no-ball', runs: 1 })} size="small" color="warning">
                        No-Ball
                      </ActionButton>
                      <ActionButton onClick={() => handleBallAction('extra', { type: 'bye', runs: 1 })} size="small" color="warning">
                        Bye
                      </ActionButton>
                      <ActionButton onClick={() => handleBallAction('extra', { type: 'leg-bye', runs: 1 })} size="small" color="warning">
                        Leg-Bye
                      </ActionButton>
                      <ActionButton onClick={() => handleBallAction('wicket', {})} size="small" color="error">
                        Wicket
                      </ActionButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Last 6 Balls</Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap' }}>
                      {lastBalls.map(ball => (
                        <BallChip
                          key={ball.id}
                          label={
                            ball.type === 'runs' ? ball.value :
                            ball.type === 'extra' ? ball.value.type :
                            ball.type === 'wicket' ? 'W' : ''
                          }
                          type={ball.type === 'runs' && (ball.value === 4 || ball.value === 6) ? ball.value.toString() : ball.type}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Ball Commentary</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={commentary}
                      onChange={e => setCommentary(e.target.value)}
                      placeholder="Enter ball commentary"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Partnership Graph</Typography>
                    <Box sx={{ mt: 1, height: 200 }}>
                      <Line data={partnershipChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Fall of Wickets Timeline</Typography>
                    <Box sx={{ mt: 1, height: 200 }}>
                      <Line data={fallOfWicketsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Partnership Information</Typography>
                    <Typography variant="body2">
                      Current Partnership: {partnerships[partnerships.length - 1]?.runs || 0} runs ({partnerships[partnerships.length - 1]?.balls || 0} balls)
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </ScoreCard>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleUndoLastAction} startIcon={<UndoIcon />} disabled={!lastBalls.length}>
          Undo
        </Button>
        <Button onClick={handleEndOver} disabled={score.balls % 6 !== 0}>End Over</Button>
        <Button onClick={handleEndInnings}>End Innings</Button>
        <Button onClick={onClose} color="secondary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScoringDialog;