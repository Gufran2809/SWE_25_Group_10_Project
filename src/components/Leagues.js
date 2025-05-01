import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  InputLabel,
  Divider,
  Snackbar,
  IconButton,
  CircularProgress,
  Avatar,
  Tooltip,
  TableSortLabel,
  Skeleton,
  Container,
} from '@mui/material';
import {
  MdAdd as AddIcon,
  MdPerson as PersonIcon,
  MdEmojiEvents as TrophyIcon,
  MdSchedule as ScheduleIcon,
  MdScoreboard as ScoreboardIcon,
  MdComment as CommentIcon,
  MdVideocam as StreamIcon,
  MdDashboard as DashboardIcon,
  MdNotifications as NotificationIcon,
  MdLogout as LogoutIcon,
  MdUpload as UploadIcon,
  MdMenu as MenuIcon
} from 'react-icons/md';
import jsPDF from 'jspdf';
import { styled } from '@mui/material/styles';
import { auth, db, googleProvider } from '../firebase';
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';

// Cricket-themed background pattern (subtle)
const CricketBackground = styled(Box)(({ theme }) => ({
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20l10-10m0 10l-10-10m-10 10l10-10m0 10L10 10' stroke='%231b5e20' stroke-opacity='0.1' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
  backgroundSize: '40px 40px',
  minHeight: '100vh',
}));

// Styled components for enhanced UI
const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1b5e20, #4caf50)',
  color: '#ffffff',
  '&:hover': {
    background: 'linear-gradient(45deg, #2e7d32, #66bb6a)',
  },
  borderRadius: '8px',
  padding: theme.spacing(1, 3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[6],
  },
  backgroundColor: '#ffffff',
}));

const Sidebar = styled(Box)(({ theme }) => ({
  width: 250,
  backgroundColor: '#1b5e20',
  color: '#ffffff',
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: '100%',
    position: 'fixed',
    top: 64, // Adjust for navbar height
    left: 0,
    zIndex: 1000,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    '&.open': {
      transform: 'translateX(0)',
    },
  },
}));

const storage = getStorage();

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const commentaryTemplates = {
  runs: {
    0: ['Dot ball!', 'Good length, defended.'],
    1: ['Quick single!', 'Pushed to mid-on for one.'],
    2: ['Nice running, two runs!', 'Driven for a couple.'],
    4: ['Four! Smashed through the covers!', 'Beautiful boundary!'],
    6: ['Six! Over the ropes!', 'What a massive hit!'],
  },
  wicket: ['Gone! Clean bowled!', 'Caught in the slips!', 'LBW! Huge wicket!'],
  noBall: ['No ball! Free hit coming up!', 'Overstepped by the bowler!'],
  wide: ['Wide! Way outside off!', 'Strays down the leg side!'],
  bye: ['Byes! Missed by the keeper!', 'Sneaks through for a bye!'],
  legBye: ['Leg bye! Off the pads!', 'Deflected for a leg bye!'],
  fifty: ['Fifty! Brilliant knock!', 'Half-century in style!'],
  century: ['Century! What an innings!', 'Hundred up, take a bow!'],
};

const EnhancedLeagueManagement = () => {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [userLeagues, setUserLeagues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [umpires, setUmpires] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openLeagueDialog, setOpenLeagueDialog] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [openPlayerDialog, setOpenPlayerDialog] = useState(false);
  const [openMatchDialog, setOpenMatchDialog] = useState(false);
  const [openScoringDialog, setOpenScoringDialog] = useState(false);
  const [openBracketDialog, setOpenBracketDialog] = useState(false);
  const [openPoolDialog, setOpenPoolDialog] = useState(false);
  const [openStreamDialog, setOpenStreamDialog] = useState(false);
  const [newLeague, setNewLeague] = useState({
    name: '',
    startDate: '',
    endDate: '',
    matchType: 'T20',
    format: 'round-robin',
    venue: '',
    description: '',
    thumbnail: null,
  });
  const [newTeam, setNewTeam] = useState({ name: '', logo: null, captainId: '', wicketKeeperId: '' });
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [playerFormData, setPlayerFormData] = useState({ name: '', role: '', isCaptain: false, isWicketKeeper: false });
  const [matchFormData, setMatchFormData] = useState({
    team1Id: '',
    team2Id: '',
    matchDate: '',
    matchTime: '',
    venue: '',
    matchType: 'T20',
    overs: 20,
    umpireId: '',
  });
  const [scoringData, setScoringData] = useState({
    matchId: '',
    over: 0,
    ball: 1,
    runs: 0,
    extra: '',
    wicket: false,
    batsmanId: '',
    bowlerId: '',
    wicketType: '',
  });
  const [bracketData, setBracketData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [streamConfig, setStreamConfig] = useState({
    protocol: 'RTMP',
    serverUrl: '',
    streamKey: '',
    resolution: '720p',
    bitrate: 2500,
  });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'points', direction: 'desc' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLeagues([]);
        setTeams([]);
        setPlayers([]);
        setMatches([]);
        setCommentary([]);
        setUserLeagues([]);
        setNotifications([]);
        setUmpires([]);
        setSelectedLeague(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore data
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribeLeagues = onSnapshot(collection(db, 'leagues'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLeagues(data);
      setLoading(false);
    });

    const unsubscribeTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTeams(data);
      setLoading(false);
    });

    const unsubscribePlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlayers(data);
      setLoading(false);
    });

    const unsubscribeMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMatches(data);
      setLoading(false);
    });

    const unsubscribeCommentary = onSnapshot(collection(db, 'commentary'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCommentary(data);
      setLoading(false);
    });

    const unsubscribeUserLeagues = onSnapshot(collection(db, 'userLeagues'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserLeagues(data);
      setLoading(false);
    });

    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
      setLoading(false);
    });

    const unsubscribeUmpires = onSnapshot(collection(db, 'umpires'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUmpires(data);
      setLoading(false);
    });

    return () => {
      unsubscribeLeagues();
      unsubscribeTeams();
      unsubscribePlayers();
      unsubscribeMatches();
      unsubscribeCommentary();
      unsubscribeUserLeagues();
      unsubscribeNotifications();
      unsubscribeUmpires();
    };
  }, [user]);

  const handleError = (error, message) => {
    console.error(message, error);
    setSnackbar({ open: true, message });
    setLoading(false);
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setSnackbar({ open: true, message: 'Signed in successfully!' });
    } catch (error) {
      handleError(error, 'Sign-in failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSnackbar({ open: true, message: 'Signed out successfully!' });
    } catch (error) {
      handleError(error, 'Sign-out failed');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleLeagueDialogOpen = () => {
    setOpenLeagueDialog(true);
  };

  const handleLeagueDialogClose = () => {
    setOpenLeagueDialog(false);
    setNewLeague({ name: '', startDate: '', endDate: '', matchType: 'T20', format: 'round-robin', venue: '', description: '', thumbnail: null });
  };

  const handleLeagueChange = (e) => {
    const { name, value, files } = e.target;
    setNewLeague({ ...newLeague, [name]: files ? files[0] : value });
  };

  const handleCreateLeague = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      const leagueId = `league-${Date.now()}`;
      let thumbnailUrl = '';
      if (newLeague.thumbnail) {
        const storageRef = ref(storage, `leagues/${leagueId}/${newLeague.thumbnail.name}`);
        await uploadBytes(storageRef, newLeague.thumbnail);
        thumbnailUrl = await getDownloadURL(storageRef);
      }
      const newLeagueData = {
        id: leagueId,
        name: newLeague.name,
        startDate: newLeague.startDate,
        endDate: newLeague.endDate,
        matchType: newLeague.matchType,
        format: newLeague.format,
        venue: newLeague.venue,
        description: newLeague.description,
        thumbnail: thumbnailUrl,
        teamIds: [],
        status: 'upcoming',
      };
      await setDoc(doc(db, 'leagues', leagueId), newLeagueData);
      await addDoc(collection(db, 'userLeagues'), {
        id: `userLeague-${Date.now()}`,
        userId: user.uid,
        leagueId,
      });
      setSelectedLeague(newLeagueData);
      setOpenLeagueDialog(false);
      setOpenTeamDialog(true);
      setNewLeague({ name: '', startDate: '', endDate: '', matchType: 'T20', format: 'round-robin', venue: '', description: '', thumbnail: null });
      setSnackbar({ open: true, message: 'League created successfully!' });
    } catch (error) {
      handleError(error, 'Failed to create league');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamDialogOpen = () => {
    setOpenTeamDialog(true);
  };

  const handleTeamDialogClose = () => {
    setOpenTeamDialog(false);
    setNewTeam({ name: '', logo: null, captainId: '', wicketKeeperId: '' });
    setSelectedTeams([]);
  };

  const handleTeamChange = (e) => {
    const { name, value, files } = e.target;
    setNewTeam({ ...newTeam, [name]: files ? files[0] : value });
  };

  const handleAddTeam = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      const teamId = `team-${Date.now()}`;
      let logoUrl = '';
      if (newTeam.logo) {
        const storageRef = ref(storage, `teams/${teamId}/${newTeam.logo.name}`);
        await uploadBytes(storageRef, newTeam.logo);
        logoUrl = await getDownloadURL(storageRef);
      }
      const newTeamData = {
        id: teamId,
        name: newTeam.name,
        leagueId: selectedLeague.id,
        logo: logoUrl,
        captainId: newTeam.captainId,
        wicketKeeperId: newTeam.wicketKeeperId,
        playerIds: [],
        stats: { matches: 0, wins: 0, losses: 0 },
      };
      await setDoc(doc(db, 'teams', teamId), newTeamData);
      setSelectedTeams([...selectedTeams, teamId]);
      setNewTeam({ name: '', logo: null, captainId: '', wicketKeeperId: '' });
      setSnackbar({ open: true, message: 'Team added successfully!' });
    } catch (error) {
      handleError(error, 'Failed to add team');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamToggle = (teamId) => {
    setSelectedTeams(selectedTeams.includes(teamId) ? selectedTeams.filter((id) => id !== teamId) : [...selectedTeams, teamId]);
  };

  const handleSaveTeams = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      await updateDoc(doc(db, 'leagues', selectedLeague.id), {
        teamIds: selectedTeams,
      });
      setOpenTeamDialog(false);
      setSnackbar({ open: true, message: 'Teams saved successfully!' });
    } catch (error) {
      handleError(error, 'Failed to save teams');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerDialogOpen = () => {
    setOpenPlayerDialog(true);
  };

  const handlePlayerDialogClose = () => {
    setOpenPlayerDialog(false);
    setSelectedTeamId('');
    setPlayerFormData({ name: '', role: '', isCaptain: false, isWicketKeeper: false });
  };

  const handlePlayerFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlayerFormData({ ...playerFormData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCreatePlayer = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      const teamPlayers = players.filter((p) => p.teamId === selectedTeamId);
      if (teamPlayers.length >= 11) {
        setSnackbar({ open: true, message: 'Team already has 11 players!' });
        return;
      }
      const playerId = `player-${Date.now()}`;
      const newPlayer = {
        id: playerId,
        name: playerFormData.name,
        role: playerFormData.role,
        teamId: selectedTeamId,
        isCaptain: playerFormData.isCaptain,
        isWicketKeeper: playerFormData.isWicketKeeper,
        stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, catches: 0 },
      };
      await setDoc(doc(db, 'players', playerId), newPlayer);
      await updateDoc(doc(db, 'teams', selectedTeamId), {
        playerIds: arrayUnion(playerId),
        captainId: playerFormData.isCaptain ? playerId : doc(db, 'teams', selectedTeamId).captainId,
        wicketKeeperId: playerFormData.isWicketKeeper ? playerId : doc(db, 'teams', selectedTeamId).wicketKeeperId,
      });
      setPlayerFormData({ name: '', role: '', isCaptain: false, isWicketKeeper: false });
      setSnackbar({ open: true, message: 'Player added successfully!' });
      if (teamPlayers.length + 1 === 11) {
        setOpenPlayerDialog(false);
        setSelectedTeamId('');
      }
    } catch (error) {
      handleError(error, 'Failed to add player');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchDialogOpen = () => {
    setOpenMatchDialog(true);
  };

  const handleMatchDialogClose = () => {
    setOpenMatchDialog(false);
    setMatchFormData({ team1Id: '', team2Id: '', matchDate: '', matchTime: '', venue: '', matchType: 'T20', overs: 20, umpireId: '' });
  };

  const handleMatchFormChange = (e) => {
    setMatchFormData({ ...matchFormData, [e.target.name]: e.target.value });
  };

  const handleCreateMatch = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      const matchId = `match-${Date.now()}`;
      const matchDateTime = new Date(`${matchFormData.matchDate}T${matchFormData.matchTime}`);
      const newMatch = {
        id: matchId,
        title: `${teams.find(t => t.id === matchFormData.team1Id)?.name || ''} vs ${teams.find(t => t.id === matchFormData.team2Id)?.name || ''}`,
        leagueId: selectedLeague.id,
        team1Id: matchFormData.team1Id,
        team2Id: matchFormData.team2Id,
        venue: matchFormData.venue,
        matchType: matchFormData.matchType,
        overs: parseInt(matchFormData.overs),
        umpireId: matchFormData.umpireId,
        status: 'upcoming',
        date: Timestamp.fromDate(matchDateTime),
        score: {
          team1: { runs: 0, wickets: 0, overs: 0 },
          team2: { runs: 0, wickets: 0, overs: 0 },
        },
        battingTeam: matchFormData.team1Id,
        currentOver: 0,
        currentBall: 1,
        toss: { winner: '', decision: '' },
      };
      await setDoc(doc(db, 'matches', matchId), newMatch);
      setOpenMatchDialog(false);
      setMatchFormData({ team1Id: '', team2Id: '', matchDate: '', matchTime: '', venue: '', matchType: 'T20', overs: 20, umpireId: '' });
      setSnackbar({ open: true, message: 'Match scheduled successfully!' });
    } catch (error) {
      handleError(error, 'Failed to schedule match');
    } finally {
      setLoading(false);
    }
  };

  const handleScoringDialogOpen = (match) => {
    setSelectedMatch(match);
    setScoringData({
      matchId: match.id,
      over: match.currentOver,
      ball: match.currentBall,
      runs: 0,
      extra: '',
      wicket: false,
      batsmanId: '',
      bowlerId: '',
      wicketType: '',
    });
    setOpenScoringDialog(true);
  };

  const handleScoringDialogClose = () => {
    setOpenScoringDialog(false);
    setScoringData({ matchId: '', over: 0, ball: 1, runs: 0, extra: '', wicket: false, batsmanId: '', bowlerId: '', wicketType: '' });
    setSelectedMatch(null);
  };

  const handleScoringChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScoringData({ ...scoringData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddBall = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      const match = matches.find((m) => m.id === scoringData.matchId);
      const isExtra = scoringData.extra === 'noBall' || scoringData.extra === 'wide';
      const runs = parseInt(scoringData.runs);
      const commentaryId = `comment-${Date.now()}`;
      const newCommentary = {
        id: commentaryId,
        matchId: scoringData.matchId,
        over: scoringData.over,
        ball: scoringData.ball,
        runs,
        extra: scoringData.extra,
        wicket: scoringData.wicket,
        wicketType: scoringData.wicketType,
        batsmanId: scoringData.batsmanId,
        bowlerId: scoringData.bowlerId,
        commentary: generateCommentary(runs, scoringData.extra, scoringData.wicket, scoringData.wicketType, match),
      };

      const battingTeamKey = match.battingTeam === match.team1Id ? 'team1' : 'team2';
      const newScore = { ...match.score };
      newScore[battingTeamKey].runs += runs;
      if (scoringData.wicket) newScore[battingTeamKey].wickets += 1;
      if (scoringData.extra === 'wide' || scoringData.extra === 'bye' || scoringData.extra === 'legBye') {
        newScore[battingTeamKey].runs += 1;
      }
      if (!isExtra) {
        newScore[battingTeamKey].overs = scoringData.ball === 6 ? scoringData.over + 1 : scoringData.over + scoringData.ball / 10;
      }

      const updatedMatch = {
        ...match,
        score: newScore,
        currentOver: scoringData.ball === 6 ? scoringData.over + 1 : scoringData.over,
        currentBall: scoringData.ball === 6 ? 1 : scoringData.ball + 1,
        status: 'Live',
      };

      const updatedPlayers = players.map((p) => {
        if (p.id === scoringData.batsmanId) {
          return {
            ...p,
            stats: {
              ...p.stats,
              runs: p.stats.runs + runs,
              matches: p.stats.matches + (scoringData.ball === 1 && scoringData.over === 0 ? 1 : 0),
              strikeRate: ((p.stats.runs + runs) / (p.stats.matches || 1)) * 100,
            },
          };
        }
        if (scoringData.wicket && p.id === scoringData.bowlerId) {
          return {
            ...p,
            stats: { ...p.stats, wickets: p.stats.wickets + 1 },
          };
        }
        return p;
      });

      await Promise.all([
        setDoc(doc(db, 'matches', match.id), updatedMatch),
        setDoc(doc(db, 'commentary', commentaryId), newCommentary),
        setDoc(doc(db, 'notifications', `notification-${Date.now()}`), {
          id: `notification-${Date.now()}`,
          matchId: match.id,
          message: `Over ${newCommentary.over}.${newCommentary.ball}: ${newCommentary.commentary}`,
          timestamp: Date.now(),
        }),
        ...updatedPlayers.map((p) => setDoc(doc(db, 'players', p.id), p)),
      ]);

      setScoringData({
        ...scoringData,
        ball: scoringData.ball === 6 ? 1 : scoringData.ball + 1,
        over: scoringData.ball === 6 ? scoringData.over + 1 : scoringData.over,
        runs: 0,
        extra: '',
        wicket: false,
        wicketType: '',
      });
      setSnackbar({ open: true, message: 'Ball recorded!' });
      checkMilestones(match, runs);
    } catch (error) {
      handleError(error, 'Failed to record ball');
    } finally {
      setLoading(false);
    }
  };

  const handleUndoBall = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      const lastCommentary = commentary.filter((c) => c.matchId === scoringData.matchId).slice(-1)[0];
      if (!lastCommentary) return;

      const match = matches.find((m) => m.id === scoringData.matchId);
      const battingTeamKey = match.battingTeam === match.team1Id ? 'team1' : 'team2';
      const newScore = { ...match.score };
      newScore[battingTeamKey].runs -= lastCommentary.runs;
      if (lastCommentary.wicket) newScore[battingTeamKey].wickets -= 1;
      if (lastCommentary.extra === 'wide' || lastCommentary.extra === 'bye' || lastCommentary.extra === 'legBye') {
        newScore[battingTeamKey].runs -= 1;
      }
      const isExtra = lastCommentary.extra === 'noBall' || lastCommentary.extra === 'wide';
      if (!isExtra) {
        newScore[battingTeamKey].overs = lastCommentary.ball === 1 ? lastCommentary.over - 1 : lastCommentary.over + (lastCommentary.ball - 1) / 10;
      }

      const updatedMatch = {
        ...match,
        score: newScore,
        currentOver: lastCommentary.ball === 1 ? lastCommentary.over - 1 : lastCommentary.over,
        currentBall: lastCommentary.ball === 1 ? 6 : lastCommentary.ball - 1,
      };

      const updatedPlayers = players.map((p) => {
        if (p.id === lastCommentary.batsmanId) {
          return {
            ...p,
            stats: {
              ...p.stats,
              runs: p.stats.runs - lastCommentary.runs,
            },
          };
        }
        if (lastCommentary.wicket && p.id === lastCommentary.bowlerId) {
          return {
            ...p,
            stats: { ...p.stats, wickets: p.stats.wickets - 1 },
          };
        }
        return p;
      });

      await Promise.all([
        setDoc(doc(db, 'matches', match.id), updatedMatch),
        deleteDoc(doc(db, 'commentary', lastCommentary.id)),
        ...updatedPlayers.map((p) => setDoc(doc(db, 'players', p.id), p)),
        ...notifications
          .filter((n) => n.matchId === match.id && n.message.includes(`Over ${lastCommentary.over}.${lastCommentary.ball}`))
          .map((n) => deleteDoc(doc(db, 'notifications', n.id))),
      ]);

      setScoringData({
        ...scoringData,
        over: lastCommentary.ball === 1 ? lastCommentary.over - 1 : lastCommentary.over,
        ball: lastCommentary.ball === 1 ? 6 : lastCommentary.ball - 1,
      });
      setSnackbar({ open: true, message: 'Last ball undone!' });
    } catch (error) {
      handleError(error, 'Failed to undo ball');
    } finally {
      setLoading(false);
    }
  };

  const generateCommentary = (runs, extra, wicket, wicketType, match) => {
    if (wicket) {
      return commentaryTemplates.wicket[Math.floor(Math.random() * commentaryTemplates.wicket.length)].replace('Wicket', wicketType || 'Wicket');
    }
    if (extra) {
      return commentaryTemplates[extra][Math.floor(Math.random() * commentaryTemplates[extra].length)];
    }
    return commentaryTemplates.runs[runs][Math.floor(Math.random() * commentaryTemplates.runs[runs].length)];
  };

  const checkMilestones = async (match, runs) => {
    try {
      if (!user) throw new Error('You must be signed in');
      const battingTeamKey = match.battingTeam === match.team1Id ? 'team1' : 'team2';
      const teamRuns = match.score[battingTeamKey].runs + runs;
      if (teamRuns >= 50 && teamRuns < 100) {
        const comment = commentaryTemplates.fifty[Math.floor(Math.random() * commentaryTemplates.fifty.length)];
        const commentaryId = `comment-${Date.now()}`;
        await Promise.all([
          setDoc(doc(db, 'commentary', commentaryId), {
            id: commentaryId,
            matchId: match.id,
            over: scoringData.over,
            ball: scoringData.ball,
            commentary: comment,
          }),
          setDoc(doc(db, 'notifications', `notification-${Date.now()}`), {
            id: `notification-${Date.now()}`,
            matchId: match.id,
            message: comment,
            timestamp: Date.now(),
          }),
        ]);
        setSnackbar({ open: true, message: comment });
      } else if (teamRuns >= 100) {
        const comment = commentaryTemplates.century[Math.floor(Math.random() * commentaryTemplates.century.length)];
        const commentaryId = `comment-${Date.now()}`;
        await Promise.all([
          setDoc(doc(db, 'commentary', commentaryId), {
            id: commentaryId,
            matchId: match.id,
            over: scoringData.over,
            ball: scoringData.ball,
            commentary: comment,
          }),
          setDoc(doc(db, 'notifications', `notification-${Date.now()}`), {
            id: `notification-${Date.now()}`,
            matchId: match.id,
            message: comment,
            timestamp: Date.now(),
          }),
        ]);
        setSnackbar({ open: true, message: comment });
      }
    } catch (error) {
      handleError(error, 'Failed to check milestones');
    }
  };

  const handleBracketDialogOpen = () => {
    setBracketData(generateBracket(selectedLeague.teamIds));
    setOpenBracketDialog(true);
  };

  const handleBracketDialogClose = () => {
    setOpenBracketDialog(false);
    setBracketData([]);
  };

  const generateBracket = (teamIds) => {
    const bracket = [];
    const numTeams = teamIds.length;
    const numRounds = Math.ceil(Math.log2(numTeams));
    for (let round = 0; round < numRounds; round++) {
      const matches = Math.pow(2, numRounds - round - 1);
      for (let i = 0; i < matches; i++) {
        bracket.push({
          round,
          matchId: `bracket-${round}-${i}`,
          team1Id: round === 0 ? teamIds[i * 2] || '' : '',
          team2Id: round === 0 ? teamIds[i * 2 + 1] || '' : '',
          date: '',
          venue: '',
        });
      }
    }
    return bracket;
  };

  const handleBracketChange = (index, field, value) => {
    const updatedBracket = [...bracketData];
    updatedBracket[index] = { ...updatedBracket[index], [field]: value };
    setBracketData(updatedBracket);
  };

  const handleSaveBracket = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      await updateDoc(doc(db, 'leagues', selectedLeague.id), {
        bracket: bracketData,
      });
      setOpenBracketDialog(false);
      setSnackbar({ open: true, message: 'Bracket saved successfully!' });
    } catch (error) {
      handleError(error, 'Failed to save bracket');
    } finally {
      setLoading(false);
    }
  };

  const handlePoolDialogOpen = () => {
    setPoolData([{ id: 'pool-A', teamIds: [], matches: [] }]);
    setOpenPoolDialog(true);
  };

  const handlePoolDialogClose = () => {
    setOpenPoolDialog(false);
    setPoolData([]);
  };

  const handlePoolChange = (index, field, value) => {
    const updatedPools = [...poolData];
    updatedPools[index] = { ...updatedPools[index], [field]: value };
    setPoolData(updatedPools);
  };

  const handleAddPool = () => {
    setPoolData([...poolData, { id: `pool-${poolData.length + 1}`, teamIds: [], matches: [] }]);
  };

  const handleSavePools = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      await updateDoc(doc(db, 'leagues', selectedLeague.id), {
        pools: poolData,
      });
      setOpenPoolDialog(false);
      setSnackbar({ open: true, message: 'Pools saved successfully!' });
    } catch (error) {
      handleError(error, 'Failed to save pools');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamDialogOpen = () => {
    setOpenStreamDialog(true);
  };

  const handleStreamDialogClose = () => {
    setOpenStreamDialog(false);
    setStreamConfig({ protocol: 'RTMP', serverUrl: '', streamKey: '', resolution: '720p', bitrate: 2500 });
  };

  const handleStreamConfigChange = (e) => {
    setStreamConfig({ ...streamConfig, [e.target.name]: e.target.value });
  };

  const handleStartStream = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      // Placeholder for actual stream start logic
      setSnackbar({ open: true, message: 'Stream started successfully!' });
      setOpenStreamDialog(false);
    } catch (error) {
      handleError(error, 'Failed to start stream');
    } finally {
      setLoading(false);
    }
  };

  const getPointsTable = (leagueId) => {
    const leagueTeams = teams.filter((t) => t.leagueId === leagueId);
    const pointsTable = leagueTeams.map((team) => {
      const teamMatches = matches.filter((m) => m.leagueId === leagueId && (m.team1Id === team.id || m.team2Id === team.id) && m.status === 'Completed');
      let points = 0;
      let matchesPlayed = 0;
      let wins = 0;
      let losses = 0;
      let nrr = 0;
      teamMatches.forEach((m) => {
        matchesPlayed++;
        const isTeam1 = m.team1Id === team.id;
        const teamScore = isTeam1 ? m.score.team1 : m.score.team2;
        const opponentScore = isTeam1 ? m.score.team2 : m.score.team1;
        if (teamScore.runs > opponentScore.runs) {
          points += 2;
          wins++;
        } else if (teamScore.runs < opponentScore.runs) {
          losses++;
        }
        nrr += (teamScore.runs - opponentScore.runs) / (teamScore.overs || 1);
      });
      return { teamId: team.id, teamName: team.name, matchesPlayed, wins, losses, points, nrr: nrr.toFixed(2) };
    });
    return pointsTable.sort((a, b) => {
      if (sortConfig.key === 'points') {
        return sortConfig.direction === 'desc' ? b.points - a.points : a.points - b.points;
      }
      if (sortConfig.key === 'nrr') {
        return sortConfig.direction === 'desc' ? b.nrr - a.nrr : a.nrr - b.nrr;
      }
      return 0;
    });
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc',
    });
  };

  const getPlayerRankings = (leagueId) => {
    const leaguePlayers = players.filter((p) => teams.find((t) => t.id === p.teamId && t.leagueId === leagueId));
    return {
      batsmen: leaguePlayers.sort((a, b) => b.stats.runs - a.stats.runs).map((p) => ({ id: p.id, name: p.name, teamId: p.teamId, stats: p.stats })),
      bowlers: leaguePlayers.sort((a, b) => b.stats.wickets - a.stats.wickets).map((p) => ({ id: p.id, name: p.name, teamId: p.teamId, stats: p.stats })),
    };
  };

  const getMatchCommentary = (matchId) => {
    return commentary.filter((c) => c.matchId === matchId).sort((a, b) => a.over - b.over || a.ball - b.ball);
  };

  const exportScorecard = (match) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Match: ${teams.find((t) => t.id === match.team1Id)?.name} vs ${teams.find((t) => t.id === match.team2Id)?.name}`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Venue: ${match.venue}`, 10, 20);
    doc.text(`Date: ${match.matchDate} ${match.matchTime}`, 10, 30);
    doc.text(`Score: ${match.score.team1.runs}/${match.score.team1.wickets} (${match.score.team1.overs} overs)`, 10, 40);
    doc.text(`      ${match.score.team2.runs}/${match.score.team2.wickets} (${match.score.team2.overs} overs)`, 10, 50);
    doc.text('Commentary:', 10, 60);
    getMatchCommentary(match.id).forEach((c, idx) => {
      doc.text(`${c.over}.${c.ball}: ${c.commentary}`, 10, 70 + idx * 10);
    });
    doc.save(`scorecard-${match.id}.pdf`);
  };

  const Leagues = () => {
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
      const unsubscribeTournaments = onSnapshot(collection(db, 'leagues'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTournaments(data);
      });

      return () => unsubscribeTournaments();
    }, []);

    return (
      <Container>
        {tournaments.map((tournament) => (
          <Paper 
            key={tournament.id}
            component={Link}
            to={`/leagues/${tournament.id}`}
            sx={{
              p: 2,
              mb: 2,
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <Typography variant="h6">{tournament.name}</Typography>
            {/* ... other tournament details ... */}
          </Paper>
        ))}
      </Container>
    );
  };

  return (
    <CricketBackground>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar Navigation */}
        {user && (
          <Sidebar className={sidebarOpen ? 'open' : ''}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon /> Live Cricket
            </Typography>
            <Divider sx={{ bgcolor: 'white', my: 1 }} />
            <List>
              {[
                { label: 'Dashboard', value: 0, icon: <DashboardIcon /> },
                { label: 'Leagues', value: 1, icon: <TrophyIcon /> },
                { label: 'Teams', value: 2, icon: <PersonIcon /> },
                { label: 'Matches', value: 3, icon: <ScheduleIcon /> },
                { label: 'Points Table', value: 4, icon: <ScoreboardIcon /> },
                { label: 'Live Match', value: 5, icon: <CommentIcon /> },
                { label: 'Streaming', value: 6, icon: <StreamIcon /> },
              ].map((item) => (
                <ListItem
                  key={item.label}
                  button
                  onClick={() => setTabValue(item.value)}
                  sx={{
                    bgcolor: tabValue === item.value ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    borderRadius: '8px',
                    mb: 1,
                  }}
                >
                  <ListItemText primary={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon} {item.label}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Sidebar>
        )}

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', mt: { xs: 8, md: 0 } }}>
          {/* Mobile Menu Toggle */}
          {user && (
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
              <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: '#1b5e20' }}>
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Top Navigation (Moved to Navbar.js) */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#1b5e20', fontWeight: 'bold', textAlign: 'center' }}>
              Live Cricket Score System
            </Typography>
            <Typography variant="body1" sx={{ color: '#424242', textAlign: 'center', mb: 2 }}>
              Manage your university cricket tournaments with ease
            </Typography>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: '12px' }} />
            </Box>
          )}

          {/* Content */}
          {!user ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <StyledCard sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#1b5e20' }}>
                  Please sign in to manage leagues
                </Typography>
                <ActionButton onClick={handleSignIn}>Sign In with Google</ActionButton>
              </StyledCard>
            </Box>
          ) : leagues.length === 0 && !loading ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <StyledCard sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#1b5e20' }}>
                  No leagues available. Create a new league to get started!
                </Typography>
                <ActionButton
                  startIcon={<AddIcon />}
                  onClick={handleLeagueDialogOpen}
                >
                  Create League
                </ActionButton>
              </StyledCard>
            </Box>
          ) : (
            <>
              {/* League Selection and Quick Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: { xs: '100%', sm: 300 } }}>
                  <InputLabel sx={{ color: '#1b5e20' }}>Select League</InputLabel>
                  <Select
                    value={selectedLeague?.id || ''}
                    onChange={(e) => setSelectedLeague(leagues.find((l) => l.id === e.target.value))}
                    label="Select League"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    {leagues
                      .filter((league) => userLeagues.some((ul) => ul.leagueId === league.id && ul.userId === user.uid))
                      .map((league) => (
                        <MenuItem key={league.id} value={league.id}>
                          {league.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <ActionButton startIcon={<AddIcon />} onClick={handleLeagueDialogOpen}>
                  Create League
                </ActionButton>
                {selectedLeague && (
                  <>
                    <ActionButton onClick={handleMatchDialogOpen}>Create Match</ActionButton>
                    <ActionButton onClick={handleStreamDialogOpen}>Manage Stream</ActionButton>
                  </>
                )}
              </Box>

              {/* Dashboard */}
              {selectedLeague && tabValue === 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                    Welcome, {user.displayName}
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { title: 'Active Tournaments', value: leagues.filter((l) => l.status === 'active').length, bg: '#e8f5e9' },
                      { title: 'Upcoming Matches', value: matches.filter((m) => m.status === 'Scheduled').length, bg: '#e3f2fd' },
                      { title: 'Live Matches', value: matches.filter((m) => m.status === 'Live').length, bg: '#ffebee' },
                      { title: 'Concluded Matches', value: matches.filter((m) => m.status === 'Completed').length, bg: '#f1f8e9' },
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <StyledCard sx={{ bgcolor: item.bg }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ color: '#1b5e20' }}>{item.title}</Typography>
                            <Typography variant="h4" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>{item.value}</Typography>
                          </CardContent>
                        </StyledCard>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Tabs */}
              {selectedLeague && (
                <Box>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="league management tabs"
                    centered
                    sx={{
                      bgcolor: '#ffffff',
                      borderRadius: '12px',
                      mb: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Tab icon={<DashboardIcon />} label="Dashboard" sx={{ color: '#1b5e20' }} />
                    <Tab icon={<TrophyIcon />} label="Leagues" sx={{ color: '#1b5e20' }} />
                    <Tab icon={<PersonIcon />} label="Teams" sx={{ color: '#1b5e20' }} />
                    <Tab icon={<ScheduleIcon />} label="Matches" sx={{ color: '#1b5e20' }} />
                    <Tab icon={<ScoreboardIcon />} label="Points Table" sx={{ color: '#1b5e20' }} />
                    <Tab icon={<CommentIcon />} label="Live Match" sx={{ color: '#1b5e20' }} />
                    <Tab icon={<StreamIcon />} label="Streaming" sx={{ color: '#1b5e20' }} />
                  </Tabs>

                  {/* Leagues Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <StyledCard>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              {selectedLeague.thumbnail && <Avatar src={selectedLeague.thumbnail} sx={{ width: 60, height: 60, border: '2px solid #1b5e20' }} />}
                              <Box>
                                <Typography variant="h5" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>{selectedLeague.name}</Typography>
                                <Typography color="textSecondary">{selectedLeague.description}</Typography>
                              </Box>
                            </Box>
                            <Typography sx={{ color: '#424242' }}>Start Date: {selectedLeague.startDate}</Typography>
                            <Typography sx={{ color: '#424242' }}>End Date: {selectedLeague.endDate}</Typography>
                            <Typography sx={{ color: '#424242' }}>Venue: {selectedLeague.venue}</Typography>
                            <Typography sx={{ color: '#424242' }}>Format: {selectedLeague.format}</Typography>
                            <Typography sx={{ color: '#424242' }}>Status: {selectedLeague.status}</Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <ActionButton onClick={handleTeamDialogOpen}>Manage Teams</ActionButton>
                              <ActionButton onClick={handleBracketDialogOpen}>Manage Bracket</ActionButton>
                              <ActionButton onClick={handlePoolDialogOpen}>Manage Pools</ActionButton>
                            </Box>
                          </CardContent>
                        </StyledCard>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Teams Tab */}
                  <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <ActionButton startIcon={<AddIcon />} onClick={handlePlayerDialogOpen} sx={{ mb: 3 }}>
                          Add Player
                        </ActionButton>
                        <Grid container spacing={2}>
                          {loading
                            ? [...Array(6)].map((_, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
                                </Grid>
                              ))
                            : teams
                                .filter((t) => t.leagueId === selectedLeague.id)
                                .map((team) => (
                                  <Grid item xs={12} sm={6} md={4} key={team.id}>
                                    <StyledCard>
                                      <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                          {team.logo && <Avatar src={team.logo} sx={{ border: '2px solid #1b5e20' }} />}
                                          <Typography variant="h6" sx={{ color: '#1b5e20' }}>{team.name}</Typography>
                                        </Box>
                                        <Typography sx={{ color: '#424242' }}>Players: {(team.playerIds || []).length}</Typography>
                                        <Typography sx={{ color: '#424242' }}>
                                          Captain: {players.find((p) => p.id === team.captainId)?.name || 'Not assigned'}
                                        </Typography>
                                        <Typography sx={{ color: '#424242' }}>
                                          Wicket Keeper: {players.find((p) => p.id === team.wicketKeeperId)?.name || 'Not assigned'}
                                        </Typography>
                                        <Button
                                          variant="outlined"
                                          onClick={() => {
                                            setSelectedTeamId(team.id);
                                            setOpenPlayerDialog(true);
                                          }}
                                          sx={{ mt: 2, color: '#1b5e20', borderColor: '#1b5e20' }}
                                        >
                                          Edit Team
                                        </Button>
                                      </CardContent>
                                    </StyledCard>
                                  </Grid>
                                ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Matches Tab */}
                  <TabPanel value={tabValue} index={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <ActionButton startIcon={<AddIcon />} onClick={handleMatchDialogOpen} sx={{ mb: 3 }}>
                          Schedule Match
                        </ActionButton>
                        <List>
                          {loading
                            ? [...Array(4)].map((_, index) => (
                                <ListItem key={index}>
                                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: '8px' }} />
                                </ListItem>
                              ))
                            : matches
                                .filter((m) => selectedLeague && m.leagueId === selectedLeague.id)
                                .map((match) => (
                                  <ListItem
                                    key={match.id}
                                    sx={{
                                      bgcolor: match.status === 'Live' ? '#ffebee' : '#ffffff',
                                      mb: 1,
                                      borderRadius: '8px',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    }}
                                  >
                                    <ListItemText
                                      primary={`${teams.find((t) => t.id === match.team1Id)?.name} vs ${teams.find((t) => t.id === match.team2Id)?.name}`}
                                      secondary={`Date: ${match.matchDate}, Time: ${match.matchTime}, Venue: ${match.venue}, Status: ${match.status}`}
                                      primaryTypographyProps={{ color: '#1b5e20', fontWeight: 'bold' }}
                                      secondaryTypographyProps={{ color: '#424242' }}
                                    />
                                    {match.status !== 'Completed' && (
                                      <ActionButton
                                        onClick={() => handleScoringDialogOpen(match)}
                                        sx={{ ml: 2, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
                                      >
                                        Start Scoring
                                      </ActionButton>
                                    )}
                                    <Button
                                      variant="outlined"
                                      onClick={() => exportScorecard(match)}
                                      sx={{ ml: 2, color: '#1b5e20', borderColor: '#1b5e20' }}
                                    >
                                      Export Scorecard
                                    </Button>
                                  </ListItem>
                                ))}
                        </List>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Points Table Tab */}
                  <TabPanel value={tabValue} index={4}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                          Points Table
                        </Typography>
                        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                                <TableCell>
                                  <TableSortLabel
                                    active={sortConfig.key === 'teamName'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('teamName')}
                                    sx={{ color: '#1b5e20', fontWeight: 'bold' }}
                                  >
                                    Team
                                  </TableSortLabel>
                                </TableCell>
                                <TableCell align="right" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Matches</TableCell>
                                <TableCell align="right" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Wins</TableCell>
                                <TableCell align="right" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Losses</TableCell>
                                <TableCell align="right">
                                  <TableSortLabel
                                    active={sortConfig.key === 'points'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('points')}
                                    sx={{ color: '#1b5e20', fontWeight: 'bold' }}
                                  >
                                    Points
                                  </TableSortLabel>
                                </TableCell>
                                <TableCell align="right">
                                  <TableSortLabel
                                    active={sortConfig.key === 'nrr'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('nrr')}
                                    sx={{ color: '#1b5e20', fontWeight: 'bold' }}
                                  >
                                    NRR
                                  </TableSortLabel>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {loading
                                ? [...Array(5)].map((_, index) => (
                                    <TableRow key={index}>
                                      <TableCell colSpan={6}>
                                        <Skeleton variant="text" />
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : getPointsTable(selectedLeague.id).map((row) => (
                                    <TableRow key={row.teamId}>
                                      <TableCell sx={{ color: '#424242' }}>{row.teamName}</TableCell>
                                      <TableCell align="right" sx={{ color: '#424242' }}>{row.matchesPlayed}</TableCell>
                                      <TableCell align="right" sx={{ color: '#424242' }}>{row.wins}</TableCell>
                                      <TableCell align="right" sx={{ color: '#424242' }}>{row.losses}</TableCell>
                                      <TableCell align="right" sx={{ color: '#424242' }}>{row.points}</TableCell>
                                      <TableCell align="right" sx={{ color: '#424242' }}>{row.nrr}</TableCell>
                                    </TableRow>
                                  ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 4, color: '#1b5e20', fontWeight: 'bold' }}>
                          Top Batsmen
                        </Typography>
                        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                                <TableCell sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Rank</TableCell>
                                <TableCell sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Player</TableCell>
                                <TableCell sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Team</TableCell>
                                <TableCell align="right" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Runs</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {loading
                                ? [...Array(5)].map((_, index) => (
                                    <TableRow key={index}>
                                      <TableCell colSpan={4}>
                                        <Skeleton variant="text" />
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : getPlayerRankings(selectedLeague.id).batsmen.slice(0, 5).map((player, idx) => (
                                    <TableRow key={player.id}>
                                      <TableCell sx={{ color: '#424242' }}>{idx + 1}</TableCell>
                                      <TableCell sx={{ color: '#424242' }}>{player.name}</TableCell>
                                      <TableCell sx={{ color: '#424242' }}>{teams.find((t) => t.id === player.teamId)?.name || 'Unknown'}</TableCell>
                                      <TableCell align="right" sx={{ color: '#424242' }}>{player.stats.runs}</TableCell>
                                    </TableRow>
                                  ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 4, color: '#1b5e20', fontWeight: 'bold' }}>
                          Top Bowlers
                        </Typography>
                        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                                <TableCell sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Rank</TableCell>
                                <TableCell sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Player</TableCell>
                                <TableCell sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Team</TableCell>
                                <TableCell align="right" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>Wickets</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {loading
                                ? [...Array(5)].map((_, index) => (
                                    <TableRow key={index}>
                                      <TableCell colSpan={4}>
                                        <Skeleton variant="text" />
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : getPlayerRankings(selectedLeague.id).bowlers.slice(0, 5).map((player, idx) => (
                                    <TableRow key={player.id}>
                                      <TableCell sx={{ color: '#424242' }}>{idx + 1}</TableCell>
                                      <TableCell sx={{ color: '#424242' }}>{player.name}</TableCell>
                                      <TableCell sx={{ color: '#424242' }}>{teams.find((t) => t.id === player.teamId)?.name || 'Unknown'}</TableCell>
                                      <TableCell align="right" sx={{ color: '#424242' }}>{player.stats.wickets}</TableCell>
                                    </TableRow>
                                  ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Live Match Tab */}
                  <TabPanel value={tabValue} index={5}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <FormControl sx={{ minWidth: { xs: '100%', sm: 300 }, mb: 3 }}>
                          <InputLabel sx={{ color: '#1b5e20' }}>Select Match</InputLabel>
                          <Select
                            value={selectedMatch?.id || ''}
                            onChange={(e) => setSelectedMatch(matches.find((m) => m.id === e.target.value))}
                            label="Select Match"
                            sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                          >
                            {matches
                              .filter((m) => m.leagueId === selectedLeague.id)
                              .map((match) => (
                                <MenuItem key={match.id} value={match.id}>
                                  {teams.find((t) => t.id === match.team1Id)?.name} vs {teams.find((t) => t.id === match.team2Id)?.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      {selectedMatch && (
                        <>
                          <Grid item xs={12} md={6}>
                            <StyledCard sx={{ bgcolor: '#ffebee' }}>
                              <CardContent>
                                <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                  Live Scoreboard
                                </Typography>
                                <Typography variant="h5" sx={{ color: '#1b5e20', mt: 1 }}>
                                  {teams.find((t) => t.id === selectedMatch.team1Id)?.name}: {selectedMatch.score.team1.runs}/{selectedMatch.score.team1.wickets} ({selectedMatch.score.team1.overs} overs)
                                </Typography>
                                <Typography variant="h5" sx={{ color: '#1b5e20', mt: 1 }}>
                                  {teams.find((t) => t.id === selectedMatch.team2Id)?.name}: {selectedMatch.score.team2.runs}/{selectedMatch.score.team2.wickets} ({selectedMatch.score.team2.overs} overs)
                                </Typography>
                                <Divider sx={{ my: 2, bgcolor: '#1b5e20' }} />
                                <Typography variant="h6" sx={{ color: '#1b5e20' }}>Current Batsmen</Typography>
                                <Typography sx={{ color: '#424242' }}>
                                  Striker: {players.find((p) => p.id === scoringData.batsmanId)?.name || 'Select Batsman'}
                                </Typography>
                                <Typography sx={{ color: '#424242' }}>
                                  Non-Striker: {players.find((p) => p.id !== scoringData.batsmanId && p.teamId === selectedMatch.battingTeam)?.name || 'Select Batsman'}
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 2, color: '#1b5e20' }}>Current Bowler</Typography>
                                <Typography sx={{ color: '#424242' }}>
                                  {players.find((p) => p.id === scoringData.bowlerId)?.name || 'Select Bowler'}
                                </Typography>
                                <Divider sx={{ my: 2, bgcolor: '#1b5e20' }} />
                                <Typography variant="h6" sx={{ color: '#1b5e20' }}>Match Highlights</Typography>
                                <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                                  {getMatchCommentary(selectedMatch.id)
                                    .filter((c) => c.commentary.includes('Four') || c.commentary.includes('Six') || c.commentary.includes('Wicket') || c.commentary.includes('Fifty') || c.commentary.includes('Century'))
                                    .map((comment) => (
                                      <ListItem key={comment.id}>
                                        <ListItemText
                                          primary={`Over ${comment.over}.${comment.ball}: ${comment.commentary}`}
                                          primaryTypographyProps={{ color: '#1b5e20' }}
                                        />
                                      </ListItem>
                                    ))}
                                </List>
                              </CardContent>
                            </StyledCard>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <StyledCard>
                              <CardContent>
                                <Typography variant="h6" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                                  Ball-by-Ball Commentary
                                </Typography>
                                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                  {getMatchCommentary(selectedMatch.id).map((comment) => (
                                    <ListItem key={comment.id}>
                                      <ListItemText
                                        primary={`Over ${comment.over}.${comment.ball}: ${comment.commentary}`}
                                        secondary={comment.extra ? `Extra: ${comment.extra}` : null}
                                        primaryTypographyProps={{ color: '#1b5e20' }}
                                        secondaryTypographyProps={{ color: '#424242' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </StyledCard>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </TabPanel>

                  {/* Streaming Tab */}
                  <TabPanel value={tabValue} index={6}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <ActionButton startIcon={<StreamIcon />} onClick={handleStreamDialogOpen} sx={{ mb: 3 }}>
                          Configure Live Stream
                        </ActionButton>
                        <Typography variant="h6" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                          Streaming Status
                        </Typography>
                        <Typography color="textSecondary">
                          No active streams. Configure a new stream to start broadcasting.
                        </Typography>
                      </Grid>
                    </Grid>
                  </TabPanel>
                </Box>
              )}
            </>
          )}

          {/* Create League Dialog */}
          <Dialog open={openLeagueDialog} onClose={handleLeagueDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#ffffff' }}>Create New League</DialogTitle>
            <DialogContent sx={{ bgcolor: '#f5f5f5' }}>
              <TextField
                label="League Name"
                name="name"
                value={newLeague.name}
                onChange={handleLeagueChange}
                fullWidth
                margin="normal"
                required
                sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
              />
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={newLeague.startDate}
                onChange={handleLeagueChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
                sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
              />
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={newLeague.endDate}
                onChange={handleLeagueChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
                sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: '#1b5e20' }}>Match Type</InputLabel>
                <Select
                  name="matchType"
                  value={newLeague.matchType}
                  onChange={handleLeagueChange}
                  label="Match Type"
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                >
                  <MenuItem value="T20">T20</MenuItem>
                  <MenuItem value="ODI">ODI</MenuItem>
                  <MenuItem value="Test">Test</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: '#1b5e20' }}>Tournament Format</InputLabel>
                <Select
                  name="format"
                  value={newLeague.format}
                  onChange={handleLeagueChange}
                  label="Tournament Format"
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                >
                  <MenuItem value="round-robin">Round Robin</MenuItem>
                  <MenuItem value="knockout">Knockout</MenuItem>
                  <MenuItem value="groups">Groups</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Venue"
                name="venue"
                value={newLeague.venue}
                onChange={handleLeagueChange}
                fullWidth
                margin="normal"
                sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
              />
              <TextField
                label="Description"
                name="description"
                value={newLeague.description}
                onChange={handleLeagueChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                sx={{ bgcolor: '#ffffff',
                  // Continuation of league.js from the Create League Dialog
                borderRadius: '8px' }}
                />
                <Box sx={{ mt: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="thumbnail-upload"
                    type="file"
                    name="thumbnail"
                    onChange={handleLeagueChange}
                  />
                  <label htmlFor="thumbnail-upload">
                    <Tooltip title="Upload League Thumbnail">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                        sx={{ color: '#1b5e20', borderColor: '#1b5e20', borderRadius: '8px' }}
                      >
                        Upload Thumbnail
                      </Button>
                    </Tooltip>
                  </label>
                  {newLeague.thumbnail && (
                    <Typography sx={{ mt: 1, color: '#424242' }}>
                      Selected: {newLeague.thumbnail.name}
                    </Typography>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Button
                  onClick={handleLeagueDialogClose}
                  sx={{ color: '#424242', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <ActionButton
                  onClick={handleCreateLeague}
                  disabled={loading || !newLeague.name || !newLeague.startDate || !newLeague.endDate}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create League'}
                </ActionButton>
              </DialogActions>
            </Dialog>
  
            {/* Team Management Dialog */}
            <Dialog open={openTeamDialog} onClose={handleTeamDialogClose} maxWidth="md" fullWidth>
              <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#ffffff' }}>
                Manage Teams for {selectedLeague?.name}
              </DialogTitle>
              <DialogContent sx={{ bgcolor: '#f5f5f5' }}>
                <Box sx={{ mb: 3, mt: 2 }}>
                  <Typography variant="h6" sx={{ color: '#1b5e20', mb: 2 }}>
                    Add New Team
                  </Typography>
                  <TextField
                    label="Team Name"
                    name="name"
                    value={newTeam.name}
                    onChange={handleTeamChange}
                    fullWidth
                    margin="normal"
                    required
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  />
                  <Box sx={{ mt: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="team-logo-upload"
                      type="file"
                      name="logo"
                      onChange={handleTeamChange}
                    />
                    <label htmlFor="team-logo-upload">
                      <Tooltip title="Upload Team Logo">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          sx={{ color: '#1b5e20', borderColor: '#1b5e20', borderRadius: '8px' }}
                        >
                          Upload Logo
                        </Button>
                      </Tooltip>
                    </label>
                    {newTeam.logo && (
                      <Typography sx={{ mt: 1, color: '#424242' }}>
                        Selected: {newTeam.logo.name}
                      </Typography>
                    )}
                  </Box>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: '#1b5e20' }}>Captain</InputLabel>
                    <Select
                      name="captainId"
                      value={newTeam.captainId}
                      onChange={handleTeamChange}
                      label="Captain"
                      sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                    >
                      {players
                        .filter((p) => p.teamId === selectedTeamId || !p.teamId)
                        .map((player) => (
                          <MenuItem key={player.id} value={player.id}>
                            {player.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: '#1b5e20' }}>Wicket Keeper</InputLabel>
                    <Select
                      name="wicketKeeperId"
                      value={newTeam.wicketKeeperId}
                      onChange={handleTeamChange}
                      label="Wicket Keeper"
                      sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                    >
                      {players
                        .filter((p) => p.teamId === selectedTeamId || !p.teamId)
                        .map((player) => (
                          <MenuItem key={player.id} value={player.id}>
                            {player.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <ActionButton
                    onClick={handleAddTeam}
                    disabled={loading || !newTeam.name}
                    sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Team'}
                  </ActionButton>
                </Box>
                <Divider sx={{ my: 2, bgcolor: '#1b5e20' }} />
                <Typography variant="h6" sx={{ color: '#1b5e20', mb: 2 }}>
                  Select Participating Teams
                </Typography>
                <Grid container spacing={2}>
                  {teams
                    .filter((t) => t.leagueId === selectedLeague?.id || !t.leagueId)
                    .map((team) => (
                      <Grid item xs={12} sm={6} key={team.id}>
                        <StyledCard>
                          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Checkbox
                              checked={selectedTeams.includes(team.id)}
                              onChange={() => handleTeamToggle(team.id)}
                              sx={{ color: '#1b5e20', '&.Mui-checked': { color: '#1b5e20' } }}
                            />
                            {team.logo && <Avatar src={team.logo} sx={{ border: '2px solid #1b5e20' }} />}
                            <Box>
                              <Typography sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                                {team.name}
                              </Typography>
                              <Typography sx={{ color: '#424242' }}>
                                Players: {(team.playerIds || []).length}
                              </Typography>
                            </Box>
                          </CardContent>
                        </StyledCard>
                      </Grid>
                    ))}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Button
                  onClick={handleTeamDialogClose}
                  sx={{ color: '#424242', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <ActionButton
                  onClick={handleSaveTeams}
                  disabled={loading || selectedTeams.length === 0}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Teams'}
                </ActionButton>
              </DialogActions>
            </Dialog>
  
            {/* Player Management Dialog */}
            <Dialog open={openPlayerDialog} onClose={handlePlayerDialogClose} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#ffffff' }}>
                Add Player to Team
              </DialogTitle>
              <DialogContent sx={{ bgcolor: '#f5f5f5' }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#1b5e20' }}>Select Team</InputLabel>
                  <Select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    label="Select Team"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    {teams
                      .filter((t) => t.leagueId === selectedLeague?.id)
                      .map((team) => (
                        <MenuItem key={team.id} value={team.id}>
                          {team.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Player Name"
                  name="name"
                  value={playerFormData.name}
                  onChange={handlePlayerFormChange}
                  fullWidth
                  margin="normal"
                  required
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#1b5e20' }}>Role</InputLabel>
                  <Select
                    name="role"
                    value={playerFormData.role}
                    onChange={handlePlayerFormChange}
                    label="Role"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    <MenuItem value="Batsman">Batsman</MenuItem>
                    <MenuItem value="Bowler">Bowler</MenuItem>
                    <MenuItem value="All-Rounder">All-Rounder</MenuItem>
                    <MenuItem value="Wicket-Keeper">Wicket-Keeper</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isCaptain"
                        checked={playerFormData.isCaptain}
                        onChange={handlePlayerFormChange}
                        sx={{ color: '#1b5e20', '&.Mui-checked': { color: '#1b5e20' } }}
                      />
                    }
                    label="Captain"
                    sx={{ color: '#424242' }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isWicketKeeper"
                        checked={playerFormData.isWicketKeeper}
                        onChange={handlePlayerFormChange}
                        sx={{ color: '#1b5e20', '&.Mui-checked': { color: '#1b5e20' } }}
                      />
                    }
                    label="Wicket Keeper"
                    sx={{ color: '#424242' }}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Button
                  onClick={handlePlayerDialogClose}
                  sx={{ color: '#424242', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <ActionButton
                  onClick={handleCreatePlayer}
                  disabled={loading || !playerFormData.name || !selectedTeamId}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Player'}
                </ActionButton>
              </DialogActions>
            </Dialog>
  
            {/* Match Creation Dialog */}
            <Dialog open={openMatchDialog} onClose={handleMatchDialogClose} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#ffffff' }}>
                Schedule New Match
              </DialogTitle>
              <DialogContent sx={{ bgcolor: '#f5f5f5' }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#1b5e20' }}>Team 1</InputLabel>
                  <Select
                    name="team1Id"
                    value={matchFormData.team1Id}
                    onChange={handleMatchFormChange}
                    label="Team 1"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    {teams
                      .filter((t) => t.leagueId === selectedLeague?.id)
                      .map((team) => (
                        <MenuItem key={team.id} value={team.id}>
                          {team.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#1b5e20' }}>Team 2</InputLabel>
                  <Select
                    name="team2Id"
                    value={matchFormData.team2Id}
                    onChange={handleMatchFormChange}
                    label="Team 2"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    {teams
                      .filter((t) => t.leagueId === selectedLeague?.id && t.id !== matchFormData.team1Id)
                      .map((team) => (
                        <MenuItem key={team.id} value={team.id}>
                          {team.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Match Date"
                  name="matchDate"
                  type="date"
                  value={matchFormData.matchDate}
                  onChange={handleMatchFormChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
                <TextField
                  label="Match Time"
                  name="matchTime"
                  type="time"
                  value={matchFormData.matchTime}
                  onChange={handleMatchFormChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
                <TextField
                  label="Venue"
                  name="venue"
                  value={matchFormData.venue}
                  onChange={handleMatchFormChange}
                  fullWidth
                  margin="normal"
                  required
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#1b5e20' }}>Match Type</InputLabel>
                  <Select
                    name="matchType"
                    value={matchFormData.matchType}
                    onChange={handleMatchFormChange}
                    label="Match Type"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    <MenuItem value="T20">T20</MenuItem>
                    <MenuItem value="ODI">ODI</MenuItem>
                    <MenuItem value="Test">Test</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Overs"
                  name="overs"
                  type="number"
                  value={matchFormData.overs}
                  onChange={handleMatchFormChange}
                  fullWidth
                  margin="normal"
                  required
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#1b5e20' }}>Umpire</InputLabel>
                  <Select
                    name="umpireId"
                    value={matchFormData.umpireId}
                    onChange={handleMatchFormChange}
                    label="Umpire"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    {umpires.map((umpire) => (
                      <MenuItem key={umpire.id} value={umpire.id}>
                        {umpire.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Button
                  onClick={handleMatchDialogClose}
                  sx={{ color: '#424242', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <ActionButton
                  onClick={handleCreateMatch}
                  disabled={loading || !matchFormData.team1Id || !matchFormData.team2Id || !matchFormData.matchDate || !matchFormData.venue}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Schedule Match'}
                </ActionButton>
              </DialogActions>
            </Dialog>
  
            {/* Scoring Dialog */}
            <Dialog open={openScoringDialog} onClose={handleScoringDialogClose} maxWidth="lg" fullWidth>
              <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#ffffff' }}>
                Live Scoring: {selectedMatch ? `${teams.find((t) => t.id === selectedMatch.team1Id)?.name} vs ${teams.find((t) => t.id === selectedMatch.team2Id)?.name}` : ''}
              </DialogTitle>
              <DialogContent sx={{ bgcolor: '#f5f5f5' }}>
                {selectedMatch && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <StyledCard sx={{ bgcolor: '#ffebee' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                            Current Score
                          </Typography>
                          <Typography variant="h5" sx={{ color: '#1b5e20' }}>
                            {teams.find((t) => t.id === selectedMatch.battingTeam)?.name}: {selectedMatch.score[selectedMatch.battingTeam === selectedMatch.team1Id ? 'team1' : 'team2'].runs}/
                            {selectedMatch.score[selectedMatch.battingTeam === selectedMatch.team1Id ? 'team1' : 'team2'].wickets} ({selectedMatch.score[selectedMatch.battingTeam === selectedMatch.team1Id ? 'team1' : 'team2'].overs} overs)
                          </Typography>
                          <Divider sx={{ my: 2, bgcolor: '#1b5e20' }} />
                          <Typography variant="h6" sx={{ color: '#1b5e20' }}>Current Batsmen</Typography>
                          <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ color: '#1b5e20' }}>Striker</InputLabel>
                            <Select
                              name="batsmanId"
                              value={scoringData.batsmanId}
                              onChange={handleScoringChange}
                              label="Striker"
                              sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                            >
                              {players
                                .filter((p) => p.teamId === selectedMatch.battingTeam)
                                .map((player) => (
                                  <MenuItem key={player.id} value={player.id}>
                                    {player.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                          <Typography variant="h6" sx={{ mt: 2, color: '#1b5e20' }}>Current Bowler</Typography>
                          <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ color: '#1b5e20' }}>Bowler</InputLabel>
                            <Select
                              name="bowlerId"
                              value={scoringData.bowlerId}
                              onChange={handleScoringChange}
                              label="Bowler"
                              sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                            >
                              {players
                                .filter((p) => p.teamId !== selectedMatch.battingTeam)
                                .map((player) => (
                                  <MenuItem key={player.id} value={player.id}>
                                    {player.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </CardContent>
                      </StyledCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StyledCard>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                            Record Ball
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 2 }}>
                            {[0, 1, 2, 3, 4, 6].map((run) => (
                              <ActionButton
                                key={run}
                                onClick={() => setScoringData({ ...scoringData, runs: run, extra: '', wicket: false })}
                                sx={{ minWidth: 60, bgcolor: scoringData.runs === run && !scoringData.extra && !scoringData.wicket ? '#d32f2f' : '#1b5e20' }}
                              >
                                {run}
                              </ActionButton>
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 2 }}>
                            {['wide', 'noBall', 'bye', 'legBye'].map((extra) => (
                              <ActionButton
                                key={extra}
                                onClick={() => setScoringData({ ...scoringData, extra, runs: 0, wicket: false })}
                                sx={{ bgcolor: scoringData.extra === extra ? '#d32f2f' : '#1b5e20' }}
                              >
                                {extra.replace(/([A-Z])/g, ' $1').trim()}
                              </ActionButton>
                            ))}
                            <ActionButton
                              onClick={() => setScoringData({ ...scoringData, wicket: true, extra: '', runs: 0 })}
                              sx={{ bgcolor: scoringData.wicket ? '#d32f2f' : '#1b5e20' }}
                            >
                              Wicket
                            </ActionButton>
                          </Box>
                          {scoringData.wicket && (
                            <FormControl fullWidth margin="normal">
                              <InputLabel sx={{ color: '#1b5e20' }}>Wicket Type</InputLabel>
                              <Select
                                name="wicketType"
                                value={scoringData.wicketType}
                                onChange={handleScoringChange}
                                label="Wicket Type"
                                sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                              >
                                <MenuItem value="Bowled">Bowled</MenuItem>
                                <MenuItem value="Caught">Caught</MenuItem>
                                <MenuItem value="LBW">LBW</MenuItem>
                                <MenuItem value="Run Out">Run Out</MenuItem>
                                <MenuItem value="Stumped">Stumped</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <ActionButton
                              onClick={handleAddBall}
                              disabled={loading || !scoringData.batsmanId || !scoringData.bowlerId || (scoringData.wicket && !scoringData.wicketType)}
                            >
                              {loading ? <CircularProgress size={24} color="inherit" /> : 'Record Ball'}
                            </ActionButton>
                            <Button
                              variant="outlined"
                              onClick={handleUndoBall}
                              disabled={loading}
                              sx={{ color: '#1b5e20', borderColor: '#1b5e20', borderRadius: '8px' }}
                            >
                              Undo Last Ball
                            </Button>
                          </Box>
                          <Typography sx={{ mt: 2, color: '#1b5e20' }}>
                            Over: {scoringData.over}.{scoringData.ball}
                          </Typography>
                        </CardContent>
                      </StyledCard>
                    </Grid>
                  </Grid>
                )}
              </DialogContent>
              <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Button
                  onClick={handleScoringDialogClose}
                  sx={{ color: '#424242', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <ActionButton
                  onClick={() => setOpenScoringDialog(false)} // Placeholder for End Innings
                  disabled={loading}
                >
                  End Innings
                </ActionButton>
              </DialogActions>
            </Dialog>
  
            {/* Bracket Management Dialog */}
            <Dialog open={openBracketDialog} onClose={handleBracketDialogClose} maxWidth="lg" fullWidth>
              <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#ffffff' }}>
                Manage Tournament Bracket
              </DialogTitle>
              <DialogContent sx={{ bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" sx={{ color: '#1b5e20', mb: 2 }}>
                  Configure Bracket Matches
                </Typography>
                <Grid container spacing={3}>
                  {bracketData.map((match, index) => (
                    <Grid item xs={12} md={6} key={match.matchId}>
                      <StyledCard>
                        <CardContent>
                          <Typography sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                            Round {match.round + 1}, Match {index + 1}
                          </Typography>
                          <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ color: '#1b5e20' }}>Team 1</InputLabel>
                            <Select
                              value={match.team1Id}
                              onChange={(e) => handleBracketChange(index, 'team1Id', e.target.value)}
                              label="Team 1"
                              sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                            >
                              {teams
                                .filter((t) => t.leagueId === selectedLeague?.id)
                                .map((team) => (
                                  <MenuItem key={team.id} value={team.id}>
                                    {team.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                          <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ color: '#1b5e20' }}>Team 2</InputLabel>
                            <Select
                              value={match.team2Id}
                              onChange={(e) => handleBracketChange(index, 'team2Id', e.target.value)}
                              label="Team 2"
                              sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                            >
                              {teams
                                .filter((t) => t.leagueId === selectedLeague?.id)
                                .map((team) => (
                                  <MenuItem key={team.id} value={team.id}>
                                    {team.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                          <TextField
                            label="Match Date"
                            type="date"
                            value={match.date}
                            onChange={(e) => handleBracketChange(index, 'date', e.target.value)}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                          />
                          <TextField
                            label="Venue"
                            value={match.venue}
                            onChange={(e) => handleBracketChange(index, 'venue', e.target.value)}
                            fullWidth
                            margin="normal"
                            sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                          />
                        </CardContent>
                      </StyledCard>
                    </Grid>
                  ))}
                </Grid>
                <ActionButton
                  onClick={() => setBracketData(generateBracket(selectedTeams))}
                  sx={{ mt: 3 }}
                >
                  Auto-Generate Bracket
                </ActionButton>
              </DialogContent>
              <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Button
                  onClick={handleBracketDialogClose}
                  sx={{ color: '#424242', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <ActionButton
                  onClick={handleSaveBracket}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Bracket'}
                </ActionButton>
              </DialogActions>
            </Dialog>
  
            {/* Pool Management Dialog */}
            <Dialog open={openPoolDialog} onClose={handlePoolDialogClose} maxWidth="lg" fullWidth>
              <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#ffffff' }}>
                Manage Tournament Pools
              </DialogTitle>
              <DialogContent sx={{ bgcolor: '#f5f5f5' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#1b5e20', mb: 2 }}>
                    Configure Pools
                  </Typography>
                  <ActionButton
                    onClick={handleAddPool}
                    startIcon={<AddIcon />}
                    sx={{ mb: 2 }}
                  >
                    Add Pool
                  </ActionButton>
                </Box>
                {poolData.map((pool, index) => (
                  <StyledCard key={pool.id} sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                        Pool {String.fromCharCode(65 + index)}
                      </Typography>
                      <Typography sx={{ color: '#424242', mb: 2 }}>
                        Teams: {pool.teamIds.length}
                      </Typography>
                      <FormControl fullWidth margin="normal">
                        <InputLabel sx={{ color: '#1b5e20' }}>Select Teams</InputLabel>
                        <Select
                          multiple
                          value={pool.teamIds}
                          onChange={(e) => handlePoolChange(index, 'teamIds', e.target.value)}
                          label="Select Teams"
                          sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                          renderValue={(selected) =>
                            selected.map((id) => teams.find((t) => t.id === id)?.name).join(', ')
                          }
                        >
                          {teams
                            .filter((t) => t.leagueId === selectedLeague?.id)
                            .map((team) => (
                              <MenuItem key={team.id} value={team.id}>
                                <Checkbox
                                  checked={pool.teamIds.includes(team.id)}
                                  sx={{ color: '#1b5e20', '&.Mui-checked': { color: '#1b5e20' } }}
                                />
                                {team.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="Matches (JSON)"
                        value={JSON.stringify(pool.matches)}
                        onChange={(e) => handlePoolChange(index, 'matches', JSON.parse(e.target.value || '[]'))}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                      />
                    </CardContent>
                  </StyledCard>
                ))}
              </DialogContent>
              <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Button
                  onClick={handlePoolDialogClose}
                  sx={{ color: '#424242', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <ActionButton
                  onClick={handleSavePools}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Pools'}
                </ActionButton>
              </DialogActions>
            </Dialog>
  
            {/* Stream Configuration Dialog */}
            <Dialog open={openStreamDialog} onClose={handleStreamDialogClose} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#ffffff' }}>
                Configure Live Stream
              </DialogTitle>
              <DialogContent sx={{ bgcolor: '#f5f5f5' }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#1b5e20' }}>Protocol</InputLabel>
                  <Select
                    name="protocol"
                    value={streamConfig.protocol}
                    onChange={handleStreamConfigChange}
                    label="Protocol"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    <MenuItem value="RTMP">RTMP</MenuItem>
                    <MenuItem value="DASH">DASH</MenuItem>
                    <MenuItem value="ABS">ABS</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Server URL"
                  name="serverUrl"
                  value={streamConfig.serverUrl}
                  onChange={handleStreamConfigChange}
                  fullWidth
                  margin="normal"
                  required
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
                <TextField
                  label="Stream Key"
                  name="streamKey"
                  value={streamConfig.streamKey}
                  onChange={handleStreamConfigChange}
                  fullWidth
                  margin="normal"
                  required
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#1b5e20' }}>Resolution</InputLabel>
                  <Select
                    name="resolution"
                    value={streamConfig.resolution}
                    onChange={handleStreamConfigChange}
                    label="Resolution"
                    sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                  >
                    <MenuItem value="480p">480p</MenuItem>
                    <MenuItem value="720p">720p</MenuItem>
                    <MenuItem value="1080p">1080p</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Bitrate (kbps)"
                  name="bitrate"
                  type="number"
                  value={streamConfig.bitrate}
                  onChange={handleStreamConfigChange}
                  fullWidth
                  margin="normal"
                  required
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
              </DialogContent>
              <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Button
                  onClick={handleStreamDialogClose}
                  sx={{ color: '#424242', borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <ActionButton
                  onClick={handleStartStream}
                  disabled={loading || !streamConfig.serverUrl || !streamConfig.streamKey}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Stream'}
                </ActionButton>
              </DialogActions>
            </Dialog>
  
            {/* Snackbar for Notifications */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              message={snackbar.message}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              sx={{
                '& .MuiSnackbarContent-root': {
                  bgcolor: '#1b5e20',
                  color: '#ffffff',
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
        </Box>
      </CricketBackground>
    );
  };
  
  export default EnhancedLeagueManagement;