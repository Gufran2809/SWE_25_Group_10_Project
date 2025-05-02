import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import FilterPanel from './FilterPanel';
import MatchCard from './MatchCard';

// Add this function after the existing imports
const getMatchStatus = (match) => {
  if (!match) return 'upcoming';

  const totalOversTeam1 = parseFloat(match.score?.team1?.overs || '0');
  const totalOversTeam2 = parseFloat(match.score?.team2?.overs || '0');
  const maxOvers = match.overs || 20;

  // Match is completed if either:
  // 1. Both teams completed innings
  // 2. Second team has won
  // 3. All wickets down
  if (
    (totalOversTeam1 >= maxOvers && totalOversTeam2 >= maxOvers) ||
    (totalOversTeam2 > 0 && match.score?.team2?.runs > match.score?.team1?.runs) ||
    (match.score?.team1?.wickets === 10 && match.score?.team2?.wickets === 10)
  ) {
    return 'completed';
  }

  // Match is live if any balls have been bowled
  if (totalOversTeam1 > 0 || totalOversTeam2 > 0) {
    return 'live';
  }

  return 'upcoming';
};

const Matches = () => {
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
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Load matches and reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set up real-time listener for matches
        const matchesQuery = query(
          collection(db, 'matches'), 
          orderBy('date', 'desc')
        );
        
        const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
          const matchesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMatches(matchesData);
          setFilteredMatches(matchesData);
        });

        // Fetch reference data
        await Promise.all([
          fetchCollectionData('leagues', setLeagues),
          fetchCollectionData('teams', setTeams),
          fetchCollectionData('venues', setVenues)
        ]);

        setLoading(false);
        return () => unsubscribe();
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Error loading data: ' + error.message, 
          severity: 'error' 
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to fetch collection data
  const fetchCollectionData = async (collectionName, setterFunction) => {
    const querySnapshot = await getDocs(
      query(collection(db, collectionName), orderBy('name'))
    );
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setterFunction(data);
  };

  // Filter matches
  useEffect(() => {
    let filtered = [...matches];

    // Apply tab filters based on actual match progress
    if (tabValue === 1) filtered = filtered.filter(match => getMatchStatus(match) === 'live');
    else if (tabValue === 2) filtered = filtered.filter(match => getMatchStatus(match) === 'upcoming');
    else if (tabValue === 3) filtered = filtered.filter(match => getMatchStatus(match) === 'completed');

    // Apply status filter based on actual match progress
    if (filterStatus !== 'all') {
      filtered = filtered.filter(match => getMatchStatus(match) === filterStatus);
    }

    // Rest of the filters remain the same
    if (filterLeague !== 'all') {
      filtered = filtered.filter(match => match.leagueId === filterLeague);
    }
    if (filterVenue !== 'all') {
      filtered = filtered.filter(match => match.venue === filterVenue);
    }
    if (filterTeam !== 'all') {
      filtered = filtered.filter(match => 
        match.team1Id === filterTeam || match.team2Id === filterTeam
      );
    }
    if (filterMatchType !== 'all') {
      filtered = filtered.filter(match => match.matchType === filterMatchType);
    }

    // Apply date range filter if set
    if (filterDateRange.start && filterDateRange.end) {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate >= filterDateRange.start && matchDate <= filterDateRange.end;
      });
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(match => 
        match.title?.toLowerCase().includes(term) ||
        getTeamName(match.team1Id)?.toLowerCase().includes(term) ||
        getTeamName(match.team2Id)?.toLowerCase().includes(term)
      );
    }

    // Sort matches
    filtered.sort((a, b) => {
      if (sortOption === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return 0;
    });

    setFilteredMatches(filtered);
  }, [matches, tabValue, searchTerm, filterStatus, filterLeague, filterVenue, 
      filterTeam, filterMatchType, filterDateRange, sortOption, sortDirection]);

  // Helper functions
  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  const getLeagueName = (leagueId) => leagues.find(l => l.id === leagueId)?.name || 'Unknown League';
  const getVenueName = (venueId) => venues.find(v => v.id === venueId)?.name || 'Unknown Venue';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Matches
      </Typography>

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
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr 1fr', 
            md: '1fr 1fr 1fr' 
          }, 
          gap: 2 
        }}>
          {filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              getTeamName={getTeamName}
              getLeagueName={getLeagueName}
              getVenueName={getVenueName}
              onViewMatch={() => navigate(`/match/${match.id}`)}
            />
          ))}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Matches;