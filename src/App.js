import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Matches from './components/Matches';
import Leagues from './components/Leagues';
import LiveStream from './components/LiveStream';
import PlayerStats from './components/PlayerStats';
import Notifications from './components/Notifications';

function App() {
  return (
    <Router>
      <CssBaseline />
      <div>
        <Navbar />
        <Notifications />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/live-stream" element={<LiveStream />} />
          <Route path="/player-stats" element={<PlayerStats />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;