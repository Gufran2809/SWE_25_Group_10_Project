import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Matches from './components/Matches';
import Leagues from './components/Leagues';
import LiveStream from './components/LiveStream';
import PlayerStats from './components/PlayerStats';
import Notifications from './components/Notifications';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Notifications />
                <Home />
              </>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Navbar />
                <Notifications />
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leagues"
            element={
              <ProtectedRoute>
                <Navbar />
                <Notifications />
                <Leagues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-stream"
            element={
              <ProtectedRoute>
                <Navbar />
                <Notifications />
                <LiveStream />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player-stats"
            element={
              <ProtectedRoute>
                <Navbar />
                <Notifications />
                <PlayerStats />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;