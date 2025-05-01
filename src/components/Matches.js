import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Tabs, Tab, CircularProgress, Snackbar, Alert, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import FilterPanel from './FilterPanel';
import MatchCard from './MatchCard';
import MatchDialog from './MatchDialog';
import ViewDialog from './ViewDialog';
import SquadDialog from './SquadDialog';
import ScoringDialog from './ScoringDialog';
import WicketDialog from './WicketDialog';
import BowlerDialog from './BowlerDialog';

// Main Matches component
const Matches = () => {
  const { userRole } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State variables
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLeague, setFilterLeague] = useState('all');
  const [filterVenue, setFilterVenue] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterMatchType, setFilterMatchType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState({ start: null, end: null });
  const [sortOption, setSortOption] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openSquadDialog, setOpenSquadDialog] = useState(false);
  const [openScoringDialog, setOpenScoringDialog] = useState(false);
  const [openWicketDialog, setOpenWicketDialog] = useState(false);
  const [openBowlerDialog, setOpenBowlerDialog] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [umpires, setUmpires] = useState([]);
  const [players, setPlayers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load matches and reference data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchReferenceData();
        if (liveUpdates) {
          const matchesQuery = query(collection(db, 'matches'), orderBy('date', 'desc'));
          const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
            const matchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMatches(matchesData);
            setFilteredMatches(matchesData);
            setLoading(false);
          }, (error) => {
            setSnackbar({ open: true, message: 'Error loading matches: ' + error.message, severity: 'error' });
            setLoading(false);
          });
          return () => unsubscribe();
        } else {
          const matchesSnapshot = await getDocs(query(collection(db, 'matches'), orderBy('date', 'desc')));
          const matchesData = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMatches(matchesData);
          setFilteredMatches(matchesData);
          setLoading(false);
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Error loading data: ' + error.message, severity: 'error' });
        setLoading(false);
      }
    };
    fetchData();
    // Testing: Use Jest to mock Firestore calls and test data fetching
    // Testing: Use Cypress to verify matches load correctly in UI
  }, [liveUpdates]);

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      const leaguesSnapshot = await getDocs(query(collection(db, 'leagues'), orderBy('name')));
      setLeagues(leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const teamsSnapshot = await getDocs(query(collection(db, 'teams'), orderBy('name')));
      setTeams(teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const venuesSnapshot = await getDocs(query(collection(db, 'venues'), orderBy('name')));
      setVenues(venuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const umpiresSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'umpire')));
      setUmpires(umpiresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const playersSnapshot = await getDocs(query(collection(db, 'players'), orderBy('name')));
      setPlayers(playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      setSnackbar({ open: true, message: 'Error loading reference data: ' + error.message, severity: 'error' });
    }
    // Testing: Mock Firestore responses to test reference data loading
  };

  // Filter matches
  useEffect(() => {
    let filtered = [...matches];
    if (tabValue === 1) filtered = filtered.filter(match => match.status === 'live');
    else if (tabValue === 2) filtered = filtered.filter(match => match.status === 'upcoming');
    else if (tabValue === 3) filtered = filtered.filter(match => match.status === 'completed');
    if (filterStatus !== 'all') filtered = filtered.filter(match => match.status === filterStatus);
    if (filterLeague !== 'all') filtered = filtered.filter(match => match.leagueId === filterLeague);
    if (filterVenue !== 'all') filtered = filtered.filter(match => match.venue === filterVenue);
    if (filterTeam !== 'all') filtered = filtered.filter(match => match.team1Id === filterTeam || match.team2Id === filterTeam);
    if (filterMatchType !== 'all') filtered = filtered.filter(match => match.matchType === filterMatchType);
    if (filterDateRange.start) {
      filtered = filtered.filter(match => {
        const matchDate = match.date.toDate();
        return matchDate >= filterDateRange.start;
      });
    }
    if (filterDateRange.end) {
      filtered = filtered.filter(match => {
        const matchDate = match.date.toDate();
        return matchDate <= filterDateRange.end;
      });
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(match => 
        match.title?.toLowerCase().includes(term) ||
        getTeamName(match.team1Id)?.toLowerCase().includes(term) ||
        getTeamName(match.team2Id)?.toLowerCase().includes(term) ||
        getLeagueName(match.leagueId)?.toLowerCase().includes(term) ||
        getVenueName(match.venue)?.toLowerCase().includes(term)
      );
    }
    filtered = sortMatches(filtered, sortOption, sortDirection);
    setFilteredMatches(filtered);
    // Testing: Write unit tests to verify filtering logic
  }, [matches, tabValue, searchTerm, filterStatus, filterLeague, filterVenue, filterTeam, filterMatchType, filterDateRange, sortOption, sortDirection]);

  // Sort matches
  const sortMatches = (matchList, option, direction) => {
    return [...matchList].sort((a, b) => {
      let comparison = 0;
      switch (option) {
        case 'date': comparison = a.date.toDate() - b.date.toDate(); break;
        case 'title': comparison = (a.title || '').localeCompare(b.title || ''); break;
        case 'league': comparison = getLeagueName(a.leagueId).localeCompare(getLeagueName(b.leagueId)); break;
        case 'status': comparison = (a.status || '').localeCompare(b.status || ''); break;
        default: comparison = 0;
      }
      return direction === 'desc' ? -comparison : comparison;
    });
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    setOpenCreateDialog(true);
  };

  const handleOpenViewDialog = () => {
    setOpenViewDialog(true);
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleOpenSquadDialog = () => {
    setOpenSquadDialog(true);
  };

  const handleOpenScoringDialog = () => {
    setOpenScoringDialog(true);
  };

  // Helper functions
  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  const getLeagueName = (leagueId) => leagues.find(l => l.id === leagueId)?.name || 'Unknown League';
  const getVenueName = (venueId) => venues.find(v => v.id === venueId)?.name || 'Unknown Venue';


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Matches</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Create Match
        </Button>
      </Box>
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} centered sx={{ mb: 3 }}>
        <Tab label="All Matches" />
        <Tab label="Live" />
        <Tab label="Upcoming" />
        <Tab label="Completed" />
      </Tabs>
      <FilterPanel
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterLeague={filterLeague}
        setFilterLeague={setFilterLeague}
        filterVenue={filterVenue}
        setFilterVenue={setFilterVenue}
        filterTeam={filterTeam}
        setFilterTeam={setFilterTeam}
        filterMatchType={filterMatchType}
        setFilterMatchType={setFilterMatchType}
        filterDateRange={filterDateRange}
        setFilterDateRange={setFilterDateRange}
        sortOption={sortOption}
        setSortOption={setSortOption}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        liveUpdates={liveUpdates}
        setLiveUpdates={setLiveUpdates}
        advancedFiltersOpen={advancedFiltersOpen}
        setAdvancedFiltersOpen={setAdvancedFiltersOpen}
        leagues={leagues}
        teams={teams}
        venues={venues}
      />
      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredMatches.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          No matches found. Try adjusting the filters.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              userRole={userRole}
              getTeamName={getTeamName}
              getLeagueName={getLeagueName}
              getVenueName={getVenueName}
              handleOpenViewDialog={() => setOpenViewDialog(true) && setCurrentMatch(match)}
              handleOpenSquadDialog={() => setOpenSquadDialog(true) && setCurrentMatch(match)}
              handleOpenEditDialog={() => setOpenEditDialog(true) && setCurrentMatch(match)}
              handleOpenScoringDialog={() => setOpenScoringDialog(true) && setCurrentMatch(match)}
              handleDeleteMatch={() => {}}
              handleViewLiveMatch={() => navigate(`/match/${match.id}`)}
              handleViewScorecard={() => navigate(`/scorecard/${match.id}`)}
            />
          ))}
        </Box>
      )}
      <MatchDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        isEdit={false}
        leagues={leagues}
        teams={teams}
        venues={venues}
        umpires={umpires}
      />
      <MatchDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        isEdit={true}
        match={currentMatch}
        leagues={leagues}
        teams={teams}
        venues={venues}
        umpires={umpires}
      />
      <ViewDialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        match={currentMatch}
        getTeamName={getTeamName}
        getLeagueName={getLeagueName}
        getVenueName={getVenueName}
        umpires={umpires}
        navigate={navigate}
      />
      <SquadDialog
        open={openSquadDialog}
        onClose={() => setOpenSquadDialog(false)}
        match={currentMatch}
        players={players}
        getTeamName={getTeamName}
        setSnackbar={setSnackbar}
        handleOpenScoringDialog={() => setOpenScoringDialog(true)}
      />
      <ScoringDialog
        open={openScoringDialog}
        onClose={() => setOpenScoringDialog(false)}
        match={currentMatch}
        players={players}
        getTeamName={getTeamName}
        setOpenWicketDialog={setOpenWicketDialog}
        setOpenBowlerDialog={setOpenBowlerDialog}
        setSnackbar={setSnackbar}
      />
      <WicketDialog
        open={openWicketDialog}
        onClose={() => setOpenWicketDialog(false)}
        setSnackbar={setSnackbar}
      />
      <BowlerDialog
        open={openBowlerDialog}
        onClose={() => setOpenBowlerDialog(false)}
        players={players}
        squads={{ team1: [], team2: [] }}
        setSnackbar={setSnackbar}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button onClick={handleOpenViewDialog}>View</Button>
        <Button onClick={handleOpenEditDialog}>Edit</Button>
        <Button onClick={handleOpenSquadDialog}>Squad</Button>
        <Button onClick={handleOpenScoringDialog}>Scoring</Button>
        <Button disabled>View Scorecard</Button>
      </Box>
    </Container>
  );
};

export default Matches;