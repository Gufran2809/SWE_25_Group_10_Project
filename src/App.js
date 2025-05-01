import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Matches from './components/Matches';
import Leagues from './components/Leagues';
import PlayerStats from './components/PlayerStats';
import Notifications from './components/Notifications';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import TournamentDetail from './components/TournamentDetail';
import MatchDetail from './components/MatchDetail';
import LiveMatchView from './components/LiveMatchView';
import MatchPreview from './components/MatchPreview';

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Home Route */}
          <Route path="/" element={
            <>
              <Navbar />
              <Notifications />
              <Home />
            </>
          } />

          {/* Matches Routes */}
          <Route path="/matches/*" element={
            <ProtectedRoute>
              <Navbar />
              <Notifications />
              <Routes>
                <Route index element={<Matches />} />
                <Route path=":matchId" element={<MatchDetail />} />
                <Route path=":matchId/live" element={<LiveMatchView />} />
                <Route path=":matchId/preview" element={<MatchPreview />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Leagues/Tournaments Routes */}
          <Route path="/leagues/*" element={
            <ProtectedRoute>
              <Navbar />
              <Notifications />
              <Routes>
                <Route index element={<Leagues />} />
                <Route path=":tournamentId" element={<TournamentDetail />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Player Stats Route */}
          <Route path="/player-stats" element={
            <ProtectedRoute>
              <Navbar />
              <Notifications />
              <PlayerStats />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={
            <>
              <Navbar />
              <Notifications />
              <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>404 - Page Not Found</h2>
              </div>
            </>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
