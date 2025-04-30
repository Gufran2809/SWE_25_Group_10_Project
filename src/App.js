import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Typography, Container, Button } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Notifications from './components/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import PlayerStats from './components/PlayerStats';
import Matches from './components/Matches';
import LeagueManagement from './components/LeagueManagement.js';
import PlayerProfiles from './components/PlayerProfiles';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/ProfilePage';
import MatchDetail from './components/MatchDetail';
import MatchPreview from './components/MatchPreview';
import Scorecard from './components/Scorecard';
import Tournament from './components/Tournament';
import TeamProfile from './components/TeamProfile';
import LiveStream from './components/LiveStream';
import ComparePlayers from './components/ComparePlayers';
import CreateLeague from './components/CreateLeague';
import ManageLeague from './components/ManageLeague';
import BracketManagement from './components/BracketManagement';
import PoolManagement from './components/PoolManagement';
import CreateMatch from './components/CreateMatch';
import ManageMatch from './components/ManageMatch';
import TeamManagement from './components/TeamManagement';
import LiveStreamingManagement from './components/LiveStreamingManagement';
import PerBallManagement from './components/PerBallManagement';
import EndOfInnings from './components/EndOfInnings';
import EndOfMatch from './components/EndOfMatch';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <Container sx={{ py: 4 }}>
          <Typography color="error" variant="h5">
            Something went wrong: {this.state.error.message}
          </Typography>
          <Button
            variant="contained"
            component="a"
            href="/"
            sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
          >
            Back to Home
          </Button>
        </Container>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Notifications />
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              </>
            }
          />
          <Route
            path="/live-matches"
            element={
              <>
                <Navbar />
                <Notifications />
                <ErrorBoundary>
                  <Matches />
                </ErrorBoundary>
              </>
            }
          />
          <Route
            path="/match/:id"
            element={
              <>
                <Navbar />
                <Notifications />
                <ErrorBoundary>
                  <MatchDetail />
                </ErrorBoundary>
              </>
            }
          />
          <Route
            path="/match/:id/preview"
            element={
              <>
                <Navbar />
                <Notifications />
                <MatchPreview />
              </>
            }
          />
          <Route
            path="/scorecard/:id"
            element={
              <>
                <Navbar />
                <Notifications />
                <Scorecard />
              </>
            }
          />
          <Route
            path="/tournament/:id"
            element={
              <>
                <Navbar />
                <Notifications />
                <Tournament />
              </>
            }
          />
          <Route
            path="/team/:id"
            element={
              <>
                <Navbar />
                <Notifications />
                <TeamProfile />
              </>
            }
          />
          <Route
            path="/player/:id"
            element={
              <>
                <Navbar />
                <Notifications />
                <PlayerProfiles />
              </>
            }
          />
          <Route
            path="/statistics"
            element={
              <>
                <Navbar />
                <Notifications />
                <PlayerStats />
              </>
            }
          />
          <Route
            path="/live-stream"
            element={
              <>
                <Navbar />
                <Notifications />
                <LiveStream />
              </>
            }
          />
          <Route
            path="/compare/:id"
            element={
              <>
                <Navbar />
                <Notifications />
                <ComparePlayers />
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Navbar />
                <Notifications />
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <LeagueManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/league/create"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <CreateLeague />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/league/:id"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <ErrorBoundary>
                  <ManageLeague />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/bracket/:id"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <BracketManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/pool/:id"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <PoolManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/match/create"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <CreateMatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/match/:id"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <ManageMatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/team"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <TeamManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/stream"
            element={
              <ProtectedRoute role="organizer">
                <Navbar />
                <Notifications />
                <LiveStreamingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scorer/match/:id"
            element={
              <ProtectedRoute role="scorer">
                <Navbar />
                <Notifications />
                <PerBallManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scorer/innings/:id"
            element={
              <ProtectedRoute role="scorer">
                <Navbar />
                <Notifications />
                <EndOfInnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scorer/match/:id/end"
            element={
              <ProtectedRoute role="scorer">
                <Navbar />
                <Notifications />
                <EndOfMatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Notifications />
                <Container sx={{ py: 4 }}>
                  <Typography variant="h5">404: Page Not Found</Typography>
                  <Button
                    variant="contained"
                    component="a"
                    href="/"
                    sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#4caf50' } }}
                  >
                    Back to Home
                  </Button>
                </Container>
              </>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;