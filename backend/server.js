const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:3000' } });

app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
mongoose.connect('mongodb+srv://cs22btech11014:N68KZJhrLjCiH7Yb@cvpr.3izru0g.mongodb.net/cricket-score?retryWrites=true&w=majority&appName=cvpr')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Schemas
const matchSchema = new mongoose.Schema({
  team1: String,
  team2: String,
  matchDate: String,
  matchTime: String,
  venue: String,
  matchType: String,
  leagueId: String,
});

const tossSchema = new mongoose.Schema({
  matchId: String,
  winner: String,
  decision: String,
});

const perBallSchema = new mongoose.Schema({
  matchId: String,
  ball: String,
  runs: Number,
  event: String,
  description: String,
});

const leagueSchema = new mongoose.Schema({
  name: String,
  startDate: String,
  endDate: String,
  description: String,
});

const playerSchema = new mongoose.Schema({
  name: String,
  team: String,
  role: String,
  stats: {
    matches: Number,
    runs: Number,
    wickets: Number,
    average: Number,
  },
});

const Match = mongoose.model('Match', matchSchema);
const Toss = mongoose.model('Toss', tossSchema);
const PerBall = mongoose.model('PerBall', perBallSchema);
const League = mongoose.model('League', leagueSchema);
const Player = mongoose.model('Player', playerSchema);

// API Endpoints
// Create Match
app.post('/api/matches', async (req, res) => {
  try {
    const match = new Match(req.body);
    await match.save();
    io.emit('match-event', { message: `New match created: ${req.body.team1} vs ${req.body.team2}`, severity: 'success' });
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Get Matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Update Match
app.put('/api/matches/:id', async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    io.emit('match-event', { message: `Match updated: ${req.body.team1} vs ${req.body.team2}`, severity: 'info' });
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// Delete Match
app.delete('/api/matches/:id', async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    io.emit('match-event', { message: `Match ${req.params.id} deleted`, severity: 'warning' });
    res.json({ message: 'Match deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

// Record Toss
app.post('/api/matches/:id/toss', async (req, res) => {
  try {
    const toss = new Toss({ matchId: req.params.id, ...req.body });
    await toss.save();
    io.emit('match-event', { message: `Toss recorded: ${req.body.winner} chose to ${req.body.decision}`, severity: 'info' });
    res.status(201).json(toss);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record toss' });
  }
});

// Get Toss
app.get('/api/matches/:id/toss', async (req, res) => {
  try {
    const toss = await Toss.findOne({ matchId: req.params.id });
    res.json(toss || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch toss' });
  }
});

// Get Per-Ball Commentary
app.get('/api/matches/:id/per-ball', async (req, res) => {
  try {
    const commentary = await PerBall.find({ matchId: req.params.id });
    res.json(commentary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commentary' });
  }
});

// Create League
app.post('/api/leagues', async (req, res) => {
  try {
    const league = new League(req.body);
    await league.save();
    res.status(201).json(league);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create league' });
  }
});

// Get Leagues
app.get('/api/leagues', async (req, res) => {
  try {
    const leagues = await League.find();
    res.json(leagues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

// Delete League
app.delete('/api/leagues/:id', async (req, res) => {
  try {
    await League.findByIdAndDelete(req.params.id);
    res.json({ message: 'League deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete league' });
  }
});

// Create Player
app.post('/api/players', async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add player' });
  }
});

// Get Players
app.get('/api/players', async (req, res) => {
  try {
    const { team, role } = req.query;
    const query = {};
    if (team) query.team = team;
    if (role) query.role = role;
    const players = await Player.find(query);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get Tournament Stats
app.get('/api/tournament/stats', async (req, res) => {
  try {
    const topRunScorers = await Player.find().sort({ 'stats.runs': -1 }).limit(5);
    const topWicketTakers = await Player.find().sort({ 'stats.wickets': -1 }).limit(5);
    res.json({ topRunScorers, topWicketTakers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournament stats' });
  }
});

// WebSocket for Per-Ball Updates (Example)
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  const interval = setInterval(() => {
    const mockBall = {
      matchId: '1',
      ball: '15.4',
      runs: 2,
      event: 'Run',
      description: 'Quick double taken!',
    };
    socket.emit('match-event', { message: `Ball ${mockBall.ball}: ${mockBall.description}`, severity: 'success' });
  }, 60000);
  socket.on('disconnect', () => clearInterval(interval));
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));