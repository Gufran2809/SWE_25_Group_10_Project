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

    // Apply tab filters
    if (tabValue === 1) filtered = filtered.filter(match => match.status === 'live');
    else if (tabValue === 2) filtered = filtered.filter(match => match.status === 'upcoming');
    else if (tabValue === 3) filtered = filtered.filter(match => match.status === 'completed');

    // Apply other filters
    if (filterStatus !== 'all') {
      filtered = filtered.filter(match => match.status === filterStatus);
    }
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

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(match => 
        match.title?.toLowerCase().includes(term) ||
        getTeamName(match.team1Id)?.toLowerCase().includes(term) ||
        getTeamName(match.team2Id)?.toLowerCase().includes(term)
      );
    }

    setFilteredMatches(filtered);
  }, [matches, tabValue, searchTerm, filterStatus, filterLeague, filterVenue, 
      filterTeam, filterMatchType, filterDateRange]);

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