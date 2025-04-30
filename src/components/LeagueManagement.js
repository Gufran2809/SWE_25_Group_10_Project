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
  InputLabel,
  Divider,
  Snackbar,
  IconButton,
  CircularProgress,
  Avatar,
  Tooltip,
  DialogContentText,
  TableSortLabel
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
  MdUpload as UploadIcon
} from 'react-icons/md';
import jsPDF from 'jspdf';
import { auth, db, googleProvider } from '../firebase';
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut
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
  getDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    6: ['Six! Over the ropes!', 'What a massive hit!']
  },
  wicket: ['Gone! Clean bowled!', 'Caught in the slips!', 'LBW! Huge wicket!'],
  noBall: ['No ball! Free hit coming up!', 'Overstepped by the bowler!'],
  wide: ['Wide! Way outside off!', 'Strays down the leg side!'],
  bye: ['Byes! Missed by the keeper!', 'Sneaks through for a bye!'],
  legBye: ['Leg bye! Off the pads!', 'Deflected for a leg bye!'],
  fifty: ['Fifty! Brilliant knock!', 'Half-century in style!'],
  century: ['Century! What an innings!', 'Hundred up, take a bow!']
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
    thumbnail: null
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
    umpireId: ''
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
    wicketType: ''
  });
  const [bracketData, setBracketData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [streamConfig, setStreamConfig] = useState({
    protocol: 'RTMP',
    serverUrl: '',
    streamKey: '',
    resolution: '720p',
    bitrate: 2500
  });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'points', direction: 'desc' });

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
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeagues(data);
      setLoading(false);
    }, handleError);

    const unsubscribeTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(data);
      setLoading(false);
    }, handleError);

    const unsubscribePlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(data);
      setLoading(false);
    }, handleError);

    const unsubscribeMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(data);
      setLoading(false);
    }, handleError);

    const unsubscribeCommentary = onSnapshot(collection(db, 'commentary'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommentary(data);
      setLoading(false);
    }, handleError);

    const unsubscribeUserLeagues = onSnapshot(collection(db, 'userLeagues'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserLeagues(data);
      setLoading(false);
    }, handleError);

    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
      setLoading(false);
    }, handleError);

    const unsubscribeUmpires = onSnapshot(collection(db, 'umpires'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUmpires(data);
      setLoading(false);
    }, handleError);

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
        status: 'upcoming'
      };
      await setDoc(doc(db, 'leagues', leagueId), newLeagueData);
      await addDoc(collection(db, 'userLeagues'), {
        id: `userLeague-${Date.now()}`,
        userId: user.uid,
        leagueId
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
        stats: { matches: 0, wins: 0, losses: 0 }
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
    setSelectedTeams(
      selectedTeams.includes(teamId)
        ? selectedTeams.filter(id => id !== teamId)
        : [...selectedTeams, teamId]
    );
  };

  const handleSaveTeams = async () => {
    try {
      if (!user) throw new Error('You must be signed in');
      setLoading(true);
      await updateDoc(doc(db, 'leagues', selectedLeague.id), {
        teamIds: selectedTeams
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
      const teamPlayers = players.filter(p => p.teamId === selectedTeamId);
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
        stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, catches: 0 }
      };
      await setDoc(doc(db, 'players', playerId), newPlayer);
      await updateDoc(doc(db, 'teams', selectedTeamId), {
        playerIds: arrayUnion(playerId),
        captainId: playerFormData.isCaptain ? playerId : doc(db, 'teams', selectedTeamId).captainId,
        wicketKeeperId: playerFormData.isWicketKeeper ? playerId : doc(db, 'teams', selectedTeamId).wicketKeeperId
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
      const newMatch = {
        id: matchId,
        leagueId: selectedLeague.id,
        team1Id: matchFormData.team1Id,
        team2Id: matchFormData.team2Id,
        matchDate: matchFormData.matchDate,
        matchTime: matchFormData.matchTime,
        venue: matchFormData.venue,
        matchType: matchFormData.matchType,
        overs: parseInt(matchFormData.overs),
        umpireId: matchFormData.umpireId,
        status: 'Scheduled',
        score: {
          team1: { runs: 0, wickets: 0, overs: 0 },
          team2: { runs: 0, wickets: 0, overs: 0 }
        },
        battingTeam: matchFormData.team1Id,
        currentOver: 0,
        currentBall: 1,
        toss: { winner: '', decision: '' }
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
      wicketType: ''
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
      const match = matches.find(m => m.id === scoringData.matchId);
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
        commentary: generateCommentary(runs, scoringData.extra, scoringData.wicket, scoringData.wicketType, match)
      };

      const battingTeamKey = match.battingTeam === match.team1Id ? 'team1' : 'team2';
      const newScore = { ...match.score };
      newScore[battingTeamKey].runs += runs;
      if (scoringData.wicket) newScore[battingTeamKey].wickets += 1;
      if (scoringData.extra === 'wide' || scoringData.extra === 'bye' || scoringData.extra === 'legBye') {
        newScore[battingTeamKey].runs += 1;
      }
      if (!isExtra) {
        newScore[battingTeamKey].overs = scoringData.ball === 6 ? scoringData.over + 1 : scoringData.over + (scoringData.ball / 10);
      }

      const updatedMatch = {
        ...match,
        score: newScore,
        currentOver: scoringData.ball === 6 ? scoringData.over + 1 : scoringData.over,
        currentBall: scoringData.ball === 6 ? 1 : scoringData.ball + 1,
        status: 'Live'
      };

      const updatedPlayers = players.map(p => {
        if (p.id === scoringData.batsmanId) {
          return {
            ...p,
            stats: {
              ...p.stats,
              runs: p.stats.runs + runs,
              matches: p.stats.matches + (scoringData.ball === 1 && scoringData.over === 0 ? 1 : 0),
              strikeRate: ((p.stats.runs + runs) / (p.stats.matches || 1)) * 100
            }
          };
        }
        if (scoringData.wicket && p.id === scoringData.bowlerId) {
          return {
            ...p,
            stats: { ...p.stats, wickets: p.stats.wickets + 1 }
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
          timestamp: Date.now()
        }),
        ...updatedPlayers.map(p => setDoc(doc(db, 'players', p.id), p))
      ]);

      setScoringData({
        ...scoringData,
        ball: scoringData.ball === 6 ? 1 : scoringData.ball + 1,
        over: scoringData.ball === 6 ? scoringData.over + 1 : scoringData.over,
        runs: 0,
        extra: '',
        wicket: false,
        wicketType: ''
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
      const lastCommentary = commentary.filter(c => c.matchId === scoringData.matchId).slice(-1)[0];
      if (!lastCommentary) return;

      const match = matches.find(m => m.id === scoringData.matchId);
      const battingTeamKey = match.battingTeam === match.team1Id ? 'team1' : 'team2';
      const newScore = { ...match.score };
      newScore[battingTeamKey].runs -= lastCommentary.runs;
      if (lastCommentary.wicket) newScore[battingTeamKey].wickets -= 1;
      if (lastCommentary.extra === 'wide' || lastCommentary.extra === 'bye' || lastCommentary.extra === 'legBye') {
        newScore[battingTeamKey].runs -= 1;
      }
      const isExtra = lastCommentary.extra === 'noBall' || lastCommentary.extra === 'wide';
      if (!isExtra) {
        newScore[battingTeamKey].overs = lastCommentary.ball === 1 ? lastCommentary.over - 1 : lastCommentary.over + ((lastCommentary.ball - 1) / 10);
      }

      const updatedMatch = {
        ...match,
        score: newScore,
        currentOver: lastCommentary.ball === 1 ? lastCommentary.over - 1 : lastCommentary.over,
        currentBall: lastCommentary.ball === 1 ? 6 : lastCommentary.ball - 1
      };

      const updatedPlayers = players.map(p => {
        if (p.id === lastCommentary.batsmanId) {
          return {
            ...p,
            stats: {
              ...p.stats,
              runs: p.stats.runs - lastCommentary.runs
            }
          };
        }
        if (lastCommentary.wicket && p.id === lastCommentary.bowlerId) {
          return {
            ...p,
            stats: { ...p.stats, wickets: p.stats.wickets - 1 }
          };
        }
        return p;
      });

      await Promise.all([
        setDoc(doc(db, 'matches', match.id), updatedMatch),
        deleteDoc(doc(db, 'commentary', lastCommentary.id)),
        ...updatedPlayers.map(p => setDoc(doc(db, 'players', p.id), p)),
        ...notifications
          .filter(n => n.matchId === match.id && n.message.includes(`Over ${lastCommentary.over}.${lastCommentary.ball}`))
          .map(n => deleteDoc(doc(db, 'notifications', n.id)))
      ]);

      setScoringData({
        ...scoringData,
        over: lastCommentary.ball === 1 ? lastCommentary.over - 1 : lastCommentary.over,
        ball: lastCommentary.ball === 1 ? 6 : lastCommentary.ball - 1
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
            commentary: comment
          }),
          setDoc(doc(db, 'notifications', `notification-${Date.now()}`), {
            id: `notification-${Date.now()}`,
            matchId: match.id,
            message: comment,
            timestamp: Date.now()
          })
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
            commentary: comment
          }),
          setDoc(doc(db, 'notifications', `notification-${Date.now()}`), {
            id: `notification-${Date.now()}`,
            matchId: match.id,
            message: comment,
            timestamp: Date.now()
          })
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
          venue: ''
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
        bracket: bracketData
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
        pools: poolData
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
    const leagueTeams = teams.filter(t => t.leagueId === leagueId);
    const pointsTable = leagueTeams.map(team => {
      const teamMatches = matches.filter(
        m => m.leagueId === leagueId && (m.team1Id === team.id || m.team2Id === team.id) && m.status === 'Completed'
      );
      let points = 0;
      let matchesPlayed = 0;
      let wins = 0;
      let losses = 0;
      let nrr = 0;
      teamMatches.forEach(m => {
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
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  const getPlayerRankings = (leagueId) => {
    const leaguePlayers = players.filter(p => teams.find(t => t.id === p.teamId && t.leagueId === leagueId));
    return {
      batsmen: leaguePlayers
        .sort((a, b) => b.stats.runs - a.stats.runs)
        .map(p => ({ id: p.id, name: p.name, teamId: p.teamId, stats: p.stats })),
      bowlers: leaguePlayers
        .sort((a, b) => b.stats.wickets - a.stats.wickets)
        .map(p => ({ id: p.id, name: p.name, teamId: p.teamId, stats: p.stats }))
    };
  };

  const getMatchCommentary = (matchId) => {
    return commentary
      .filter(c => c.matchId === matchId)
      .sort((a, b) => a.over - b.over || a.ball - b.ball);
  };

  const exportScorecard = (match) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Match: ${teams.find(t => t.id === match.team1Id)?.name} vs ${teams.find(t => t.id === match.team2Id)?.name}`, 10, 10);
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar Navigation */}
      {user && (
        <Box
          sx={{
            width: 250,
            bgcolor: '#1b5e20',
            color: 'white',
            p: 2,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon /> Cricket System
          </Typography>
          <Divider sx={{ bgcolor: 'white', my: 1 }} />
          <List>
            {[
              { label: 'Dashboard', value: 0, icon: <DashboardIcon /> },
              { label: 'Leagues', value: 0, icon: <TrophyIcon /> },
              { label: 'Teams', value: 1, icon: <PersonIcon /> },
              { label: 'Matches', value: 2, icon: <ScheduleIcon /> },
              { label: 'Points Table', value: 3, icon: <ScoreboardIcon /> },
              { label: 'Live Match', value: 4, icon: <CommentIcon /> },
              { label: 'Live Streaming', value: 5, icon: <StreamIcon /> }
            ].map(item => (
              <ListItem
                key={item.label}
                button
                onClick={() => setTabValue(item.value)}
                sx={{
                  bgcolor: tabValue === item.value ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <ListItemText primary={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.icon} {item.label}
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 4, maxWidth: 1200, mx: 'auto' }}>
        {/* Top Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#1b5e20' }}>
            Live Cricket Score System
          </Typography>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <NotificationIcon />
                  {notifications.length > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'red',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12
                      }}
                    >
                      {notifications.length}
                    </Box>
                  )}
                </IconButton>
              </Tooltip>
              <Avatar src={user.photoURL} alt={user.displayName} />
              <Typography>{user.displayName}</Typography>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                sx={{ borderColor: '#1b5e20', color: '#1b5e20' }}
              >
                Sign Out
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={handleSignIn}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Sign In with Google
            </Button>
          )}
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Content */}
        {!user ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Please sign in to manage leagues.
            </Typography>
          </Box>
        ) : leagues.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              No leagues available. Create a new league to get started!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleLeagueDialogOpen}
              sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Create League
            </Button>
          </Box>
        ) : (
          <>
            {/* League Selection and Quick Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FormControl sx={{ width: 300 }}>
                <InputLabel>Select League</InputLabel>
                <Select
                  value={selectedLeague?.id || ''}
                  onChange={(e) => setSelectedLeague(leagues.find(l => l.id === e.target.value))}
                  label="Select League"
                >
                  {leagues
                    .filter(league => userLeagues.some(ul => ul.leagueId === league.id && ul.userId === user.uid))
                    .map(league => (
                      <MenuItem key={league.id} value={league.id}>{league.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleLeagueDialogOpen}
                sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
              >
                Create League
              </Button>
              {selectedLeague && (
                <>
                  <Button
                    variant="contained"
                    onClick={handleMatchDialogOpen}
                    sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                  >
                    Create Match
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleStreamDialogOpen}
                    sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                  >
                    Manage Stream
                  </Button>
                </>
              )}
            </Box>

            {/* Dashboard */}
            {selectedLeague && tabValue === 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Welcome, {user.displayName}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                      <CardContent>
                        <Typography variant="h6">Active Tournaments</Typography>
                        <Typography variant="h4">{leagues.filter(l => l.status === 'active').length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                      <CardContent>
                        <Typography variant="h6">Upcoming Matches</Typography>
                        <Typography variant="h4">{matches.filter(m => m.status === 'Scheduled').length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                      <CardContent>
                        <Typography variant="h6">Live Matches</Typography>
                        <Typography variant="h4">{matches.filter(m => m.status === 'Live').length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                      <CardContent>
                        <Typography variant="h6">Concluded Matches</Typography>
                        <Typography variant="h4">{matches.filter(m => m.status === 'Completed').length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
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
                  sx={{ bgcolor: 'white', borderRadius: 1, mb: 2 }}
                >
                  <Tab icon={<DashboardIcon />} label="Dashboard" />
                  <Tab icon={<TrophyIcon />} label="Leagues" />
                  <Tab icon={<PersonIcon />} label="Teams" />
                  <Tab icon={<ScheduleIcon />} label="Matches" />
                  <Tab icon={<ScoreboardIcon />} label="Points Table" />
                  <Tab icon={<CommentIcon />} label="Live Match" />
                  <Tab icon={<StreamIcon />} label="Streaming" />
                </Tabs>

                {/* Leagues Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            {selectedLeague.thumbnail && (
                              <Avatar src={selectedLeague.thumbnail} sx={{ width: 60, height: 60 }} />
                            )}
                            <Box>
                              <Typography variant="h5">{selectedLeague.name}</Typography>
                              <Typography color="textSecondary">{selectedLeague.description}</Typography>
                            </Box>
                          </Box>
                          <Typography>Start Date: {selectedLeague.startDate}</Typography>
                          <Typography>End Date: {selectedLeague.endDate}</Typography>
                          <Typography>Venue: {selectedLeague.venue}</Typography>
                          <Typography>Format: {selectedLeague.format}</Typography>
                          <Typography>Status: {selectedLeague.status}</Typography>
                          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                              variant="contained"
                              onClick={handleTeamDialogOpen}
                              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                            >
                              Manage Teams
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleBracketDialogOpen}
                              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                            >
                              Manage Bracket
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handlePoolDialogOpen}
                              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                            >
                              Manage Pools
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Teams Tab */}
                <TabPanel value={tabValue} index={2}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handlePlayerDialogOpen}
                        sx={{ mb: 3, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                      >
                        Add Player
                      </Button>
                      <Grid container spacing={2}>
                        {teams
                          .filter(t => t.leagueId === selectedLeague.id)
                          .map(team => (
                            <Grid item xs={12} sm={6} md={4} key={team.id}>
                              <Card>
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    {team.logo && <Avatar src={team.logo} />}
                                    <Typography variant="h6">{team.name}</Typography>
                                  </Box>
                                  <Typography>Players: {team.playerIds.length}</Typography>
                                  <Typography>Captain: {players.find(p => p.id === team.captainId)?.name || 'Not assigned'}</Typography>
                                  <Typography>Wicket Keeper: {players.find(p => p.id === team.wicketKeeperId)?.name || 'Not assigned'}</Typography>
                                  <Button
                                    variant="outlined"
                                    onClick={() => setSelectedTeamId(team.id) & setOpenPlayerDialog(true)}
                                    sx={{ mt: 2 }}
                                  >
                                    Edit Team
                                  </Button>
                                </CardContent>
                              </Card>
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
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleMatchDialogOpen}
                        sx={{ mb: 3, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                      >
                        Schedule Match
                      </Button>
                      <List>
                        {matches
                          .filter(m => m.leagueId === selectedLeague.id)
                          .map(match => (
                            <ListItem key={match.id} sx={{ bgcolor: match.status === 'Live' ? '#ffebee' : 'white', mb: 1, borderRadius: 1 }}>
                              <ListItemText
                                primary={`${teams.find(t => t.id === match.team1Id)?.name} vs ${teams.find(t => t.id === match.team2Id)?.name}`}
                                secondary={`Date: ${match.matchDate}, Time: ${match.matchTime}, Venue: ${match.venue}, Status: ${match.status}`}
                              />
                              {match.status !== 'Completed' && (
                                <Button
                                  variant="contained"
                                  onClick={() => handleScoringDialogOpen(match)}
                                  sx={{ ml: 2, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
                                >
                                  Start Scoring
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                onClick={() => exportScorecard(match)}
                                sx={{ ml: 2 }}
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
                      <Typography variant="h6" gutterBottom>Points Table</Typography>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <TableSortLabel
                                  active={sortConfig.key === 'teamName'}
                                  direction={sortConfig.direction}
                                  onClick={() => handleSort('teamName')}
                                >
                                  Team
                                </TableSortLabel>
                              </TableCell>
                              <TableCell align="right">Matches</TableCell>
                              <TableCell align="right">Wins</TableCell>
                              <TableCell align="right">Losses</TableCell>
                              <TableCell align="right">
                                <TableSortLabel
                                  active={sortConfig.key === 'points'}
                                  direction={sortConfig.direction}
                                  onClick={() => handleSort('points')}
                                >
                                  Points
                                </TableSortLabel>
                              </TableCell>
                              <TableCell align="right">
                                <TableSortLabel
                                  active={sortConfig.key === 'nrr'}
                                  direction={sortConfig.direction}
                                  onClick={() => handleSort('nrr')}
                                >
                                  NRR
                                </TableSortLabel>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPointsTable(selectedLeague.id).map(row => (
                              <TableRow key={row.teamId}>
                                <TableCell>{row.teamName}</TableCell>
                                <TableCell align="right">{row.matchesPlayed}</TableCell>
                                <TableCell align="right">{row.wins}</TableCell>
                                <TableCell align="right">{row.losses}</TableCell>
                                <TableCell align="right">{row.points}</TableCell>
                                <TableCell align="right">{row.nrr}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Top Batsmen</Typography>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Rank</TableCell>
                              <TableCell>Player</TableCell>
                              <TableCell>Team</TableCell>
                              <TableCell align="right">Runs</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPlayerRankings(selectedLeague.id).batsmen.slice(0, 5).map((player, idx) => (
                              <TableRow key={player.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{player.name}</TableCell>
                                <TableCell>{teams.find(t => t.id === player.teamId)?.name || 'Unknown'}</TableCell>
                                <TableCell align="right">{player.stats.runs}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Top Bowlers</Typography>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Rank</TableCell>
                              <TableCell>Player</TableCell>
                              <TableCell>Team</TableCell>
                              <TableCell align="right">Wickets</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPlayerRankings(selectedLeague.id).bowlers.slice(0, 5).map((player, idx) => (
                              <TableRow key={player.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{player.name}</TableCell>
                                <TableCell>{teams.find(t => t.id === player.teamId)?.name || 'Unknown'}</TableCell>
                                <TableCell align="right">{player.stats.wickets}</TableCell>
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
                      <FormControl sx={{ width: 300, mb: 3 }}>
                        <InputLabel>Select Match</InputLabel>
                        <Select
                          value={selectedMatch?.id || ''}
                          onChange={(e) => setSelectedMatch(matches.find(m => m.id === e.target.value))}
                          label="Select Match"
                        >
                          {matches
                            .filter(m => m.leagueId === selectedLeague.id)
                            .map(match => (
                              <MenuItem key={match.id} value={match.id}>
                                {teams.find(t => t.id === match.team1Id)?.name} vs {teams.find(t => t.id === match.team2Id)?.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {selectedMatch && (
                      <>
                        <Grid item xs={12} md={6}>
                          <Card sx={{ bgcolor: '#ffebee' }}>
                            <CardContent>
                              <Typography variant="h6">Live Scoreboard</Typography>
                              <Typography variant="h5">
                                {teams.find(t => t.id === selectedMatch.team1Id)?.name}: {selectedMatch.score.team1.runs}/{selectedMatch.score.team1.wickets} ({selectedMatch.score.team1.overs} overs)
                              </Typography>
                              <Typography variant="h5" sx={{ mt: 1 }}>
                                {teams.find(t => t.id === selectedMatch.team2Id)?.name}: {selectedMatch.score.team2.runs}/{selectedMatch.score.team2.wickets} ({selectedMatch.score.team2.overs} overs)
                              </Typography>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="h6">Current Batsmen</Typography>
                              <Typography>
                                Striker: {players.find(p => p.id === scoringData.batsmanId)?.name || 'Select Batsman'}
                              </Typography>
                              <Typography>
                                Non-Striker: {players.find(p => p.id !== scoringData.batsmanId && p.teamId === selectedMatch.battingTeam)?.name || 'Select Batsman'}
                              </Typography>
                              <Typography variant="h6" sx={{ mt: 2 }}>Current Bowler</Typography>
                              <Typography>
                                {players.find(p => p.id === scoringData.bowlerId)?.name || 'Select Bowler'}
                              </Typography>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="h6">Match Highlights</Typography>
                              <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                                {getMatchCommentary(selectedMatch.id)
                                  .filter(c => c.commentary.includes('Four') || c.commentary.includes('Six') || c.commentary.includes('Wicket') || c.commentary.includes('Fifty') || c.commentary.includes('Century'))
                                  .map(comment => (
                                    <ListItem key={comment.id}>
                                      <ListItemText
                                        primary={`Over ${comment.over}.${comment.ball}: ${comment.commentary}`}
                                      />
                                    </ListItem>
                                  ))}
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6">Ball-by-Ball Commentary</Typography>
                              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {getMatchCommentary(selectedMatch.id).map(comment => (
                                  <ListItem key={comment.id}>
                                    <ListItemText
                                      primary={`Over ${comment.over}.${comment.ball}: ${comment.commentary}`}
                                      secondary={comment.extra ? `Extra: ${comment.extra}` : null}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </TabPanel>

                {/* Streaming Tab */}
                <TabPanel value={tabValue} index={6}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<StreamIcon />}
                        onClick={handleStreamDialogOpen}
                        sx={{ mb: 3, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                      >
                        Configure Live Stream
                      </Button>
                      <Typography variant="h6">Streaming Status</Typography>
                      <Typography color="textSecondary">No active streams. Configure a new stream to start broadcasting.</Typography>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Box>
            )}
          </>
        )}

        {/* Create League Dialog */}
        <Dialog open={openLeagueDialog} onClose={handleLeagueDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Create New League</DialogTitle>
          <DialogContent>
            <TextField
              label="League Name"
              name="name"
              value={newLeague.name}
              onChange={handleLeagueChange}
              fullWidth
              margin="normal"
              required
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
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Match Type</InputLabel>
              <Select
                name="matchType"
                value={newLeague.matchType}
                onChange={handleLeagueChange}
                label="Match Type"
              >
                <MenuItem value="T20">T20</MenuItem>
                <MenuItem value="ODI">ODI</MenuItem>
                <MenuItem value="Test">Test</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tournament Format</InputLabel>
              <Select
                name="format"
                value={newLeague.format}
                onChange={handleLeagueChange}
                label="Tournament Format"
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
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
            >
              Upload Thumbnail
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleLeagueChange}
                name="thumbnail"
              />
            </Button>
            {newLeague.thumbnail && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {newLeague.thumbnail.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLeagueDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateLeague}
              disabled={!user || !newLeague.name || !newLeague.startDate || !newLeague.endDate || loading}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Manage Teams Dialog */}
        <Dialog open={openTeamDialog} onClose={handleTeamDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>Manage Teams for {selectedLeague?.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Add New Team</Typography>
              <TextField
                label="Team Name"
                name="name"
                value={newTeam.name}
                onChange={handleTeamChange}
                fullWidth
                margin="normal"
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Upload Team Logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleTeamChange}
                  name="logo"
                />
              </Button>
              {newTeam.logo && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {newTeam.logo.name}
                </Typography>
              )}
              <Button
                variant="contained"
                onClick={handleAddTeam}
                disabled={!user || !newTeam.name.trim() || loading}
                startIcon={<AddIcon />}
                sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
              >
                Add Team
              </Button>
            </Box>
            <Typography variant="h6" gutterBottom>Select Teams</Typography>
            <List>
              {teams
                .filter(team => team.leagueId === selectedLeague?.id)
                .map(team => (
                  <ListItem key={team.id}>
                    <Checkbox
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => handleTeamToggle(team.id)}
                    />
                    <Avatar src={team.logo} sx={{ mr: 2 }} />
                    <ListItemText primary={team.name} />
                  </ListItem>
                ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTeamDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveTeams}
              disabled={!user || selectedTeams.length === 0 || loading}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Save Teams
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Player Dialog */}
        <Dialog open={openPlayerDialog} onClose={handlePlayerDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Player</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Team</InputLabel>
              <Select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                label="Select Team"
              >
                {teams
                  .filter(team => team.leagueId === selectedLeague?.id)
                  .map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
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
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={playerFormData.role}
                onChange={handlePlayerFormChange}
                label="Role"
              >
                <MenuItem value="Batsman">Batsman</MenuItem>
                <MenuItem value="Bowler">Bowler</MenuItem>
                <MenuItem value="All-rounder">All-rounder</MenuItem>
                <MenuItem value="Wicket Keeper">Wicket Keeper</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  name="isCaptain"
                  checked={playerFormData.isCaptain}
                  onChange={handlePlayerFormChange}
                />
                <Typography>Captain</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  name="isWicketKeeper"
                  checked={playerFormData.isWicketKeeper}
                  onChange={handlePlayerFormChange}
                />
                <Typography>Wicket Keeper</Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePlayerDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreatePlayer}
              disabled={!user || !selectedTeamId || !playerFormData.name || loading}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Add Player
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Match Dialog */}
        <Dialog open={openMatchDialog} onClose={handleMatchDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Match</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Team 1</InputLabel>
              <Select
                name="team1Id"
                value={matchFormData.team1Id}
                onChange={handleMatchFormChange}
                label="Team 1"
              >
                {teams
                  .filter(team => team.leagueId === selectedLeague?.id)
                  .map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Team 2</InputLabel>
              <Select
                name="team2Id"
                value={matchFormData.team2Id}
                onChange={handleMatchFormChange}
                label="Team 2"
              >
                {teams
                  .filter(team => team.leagueId === selectedLeague?.id && team.id !== matchFormData.team1Id)
                  .map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
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
            />
            <TextField
              label="Venue"
              name="venue"
              value={matchFormData.venue}
              onChange={handleMatchFormChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Match Type</InputLabel>
              <Select
                name="matchType"
                value={matchFormData.matchType}
                onChange={handleMatchFormChange}
                label="Match Type"
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
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Umpire</InputLabel>
              <Select
                name="umpireId"
                value={matchFormData.umpireId}
                onChange={handleMatchFormChange}
                label="Umpire"
              >
                {umpires.map(umpire => (
                  <MenuItem key={umpire.id} value={umpire.id}>{umpire.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMatchDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateMatch}
              disabled={!user || !matchFormData.team1Id || !matchFormData.team2Id || !matchFormData.matchDate || loading}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Create Match
            </Button>
          </DialogActions>
        </Dialog>

        {/* Live Scoring Dialog */}
        <Dialog open={openScoringDialog} onClose={handleScoringDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>
            Live Scoring: {selectedMatch && `${teams.find(t => t.id === selectedMatch.team1Id)?.name} vs ${teams.find(t => t.id === selectedMatch.team2Id)?.name}`}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: '#ffebee' }}>
                  <CardContent>
                    <Typography variant="h6">Current Score</Typography>
                    <Typography variant="h5">
                      {selectedMatch?.score.team1.runs}/{selectedMatch?.score.team1.wickets} ({selectedMatch?.score.team1.overs} overs)
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {teams.find(t => t.id === selectedMatch?.team2Id)?.name}: {selectedMatch?.score.team2.runs}/{selectedMatch?.score.team2.wickets} ({selectedMatch?.score.team2.overs} overs)
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6">Current Batsmen</Typography>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Striker</InputLabel>
                      <Select
                        name="batsmanId"
                        value={scoringData.batsmanId}
                        onChange={handleScoringChange}
                        label="Striker"
                      >
                        {players
                          .filter(p => p.teamId === selectedMatch?.battingTeam)
                          .map(p => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Typography>
                      Non-Striker: {players.find(p => p.id !== scoringData.batsmanId && p.teamId === selectedMatch?.battingTeam)?.name || 'Select Batsman'}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2 }}>Current Bowler</Typography>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Bowler</InputLabel>
                      <Select
                        name="bowlerId"
                        value={scoringData.bowlerId}
                        onChange={handleScoringChange}
                        label="Bowler"
                      >
                        {players
                          .filter(p => p.teamId !== selectedMatch?.battingTeam && p.role !== 'Batsman')
                          .map(p => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6">Last 6 Balls</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {commentary
                        .filter(c => c.matchId === selectedMatch?.id)
                        .slice(-6)
                        .map(c => (
                          <Box key={c.id} sx={{ bgcolor: '#e0e0e0', p: 1, borderRadius: 1 }}>
                            {c.runs || c.extra || c.wicketType || 'Dot'}
                          </Box>
                        ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Record Ball</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Typography>Over: {scoringData.over}.{scoringData.ball}</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {[0, 1, 2, 3, 4, 6].map(run => (
                        <Grid item key={run}>
                          <Button
                            variant="contained"
                            onClick={() => setScoringData({ ...scoringData, runs: run, extra: '', wicket: false })}
                            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' }, minWidth: 60 }}
                          >
                            {run}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      {['Wide', 'No-ball', 'Bye', 'Leg-bye'].map(extra => (
                        <Button
                          key={extra}
                          variant="outlined"
                          onClick={() => setScoringData({ ...scoringData, runs: 0, extra: extra.toLowerCase(), wicket: false })}
                        >
                          {extra}
                        </Button>
                      ))}
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setScoringData({ ...scoringData, wicket: true })}
                      >
                        Wicket
                      </Button>
                    </Box>
                    {scoringData.wicket && (
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Wicket Type</InputLabel>
                        <Select
                          name="wicketType"
                          value={scoringData.wicketType}
                          onChange={handleScoringChange}
                          label="Wicket Type"
                        >
                          <MenuItem value="Bowled">Bowled</MenuItem>
                          <MenuItem value="Caught">Caught</MenuItem>
                          <MenuItem value="LBW">LBW</MenuItem>
                          <MenuItem value="Run Out">Run Out</MenuItem>
                          <MenuItem value="Stumped">Stumped</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                    <TextField
                      label="Ball Commentary"
                      name="commentary"
                      value={generateCommentary(scoringData.runs, scoringData.extra, scoringData.wicket, scoringData.wicketType, selectedMatch) || ''}
                      fullWidth
                      margin="normal"
                      disabled
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleAddBall}
                        disabled={!scoringData.batsmanId || !scoringData.bowlerId || loading}
                        sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
                      >
                        Record Ball
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleUndoBall}
                        disabled={commentary.filter(c => c.matchId === selectedMatch?.id).length === 0 || loading}
                      >
                        Undo Last Ball
                      </Button>
                      {scoringData.ball === 6 && (
                        <Button
                          variant="contained"
                          onClick={() => setScoringData({ ...scoringData, ball: 1, over: scoringData.over + 1 })}
                          sx={{ bgcolor: '#0288d1', '&:hover': { bgcolor: '#01579b' } }}
                        >
                          End Over
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleScoringDialogClose}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                // Placeholder for End Innings logic
                setOpenScoringDialog(false);
                setSnackbar({ open: true, message: 'Innings ended. Proceed to next innings or match summary.' });
              }}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              End Innings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bracket Management Dialog */}
        <Dialog open={openBracketDialog} onClose={handleBracketDialogClose} maxWidth="lg" fullWidth>
          <DialogTitle>Manage Tournament Bracket</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>Tournament Bracket</Typography>
            {bracketData.map((match, index) => (
              <Card key={match.matchId} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography>Round {match.round + 1} - Match {index + 1}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Team 1</InputLabel>
                        <Select
                          value={match.team1Id}
                          onChange={(e) => handleBracketChange(index, 'team1Id', e.target.value)}
                          label="Team 1"
                        >
                          <MenuItem value="">Select Team</MenuItem>
                          {teams
                            .filter(t => t.leagueId === selectedLeague?.id)
                            .map(team => (
                              <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Team 2</InputLabel>
                        <Select
                          value={match.team2Id}
                          onChange={(e) => handleBracketChange(index, 'team2Id', e.target.value)}
                          label="Team 2"
                        >
                          <MenuItem value="">Select Team</MenuItem>
                          {teams
                            .filter(t => t.leagueId === selectedLeague?.id)
                            .map(team => (
                              <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date"
                        type="date"
                        value={match.date}
                        onChange={(e) => handleBracketChange(index, 'date', e.target.value)}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Venue"
                        value={match.venue}
                        onChange={(e) => handleBracketChange(index, 'venue', e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="contained"
              onClick={() => setBracketData(generateBracket(selectedLeague.teamIds))}
              sx={{ mt: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Auto-Generate Bracket
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleBracketDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveBracket}
              disabled={loading}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Save Bracket
            </Button>
          </DialogActions>
        </Dialog>

        {/* Pool Management Dialog */}
        <Dialog open={openPoolDialog} onClose={handlePoolDialogClose} maxWidth="lg" fullWidth>
          <DialogTitle>Manage Tournament Pools</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Create Pools</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPool}
                sx={{ mb: 2, bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
              >
                Add Pool
              </Button>
            </Box>
            {poolData.map((pool, index) => (
              <Card key={pool.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">Pool {String.fromCharCode(65 + index)}</Typography>
                  <Typography variant="subtitle1">Teams</Typography>
                  <List>
                    {teams
                      .filter(t => pool.teamIds.includes(t.id))
                      .map(team => (
                        <ListItem key={team.id}>
                          <ListItemText primary={team.name} />
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              const updatedPools = [...poolData];
                              updatedPools[index].teamIds = updatedPools[index].teamIds.filter(id => id !== team.id);
                              setPoolData(updatedPools);
                            }}
                          >
                            Remove
                          </Button>
                        </ListItem>
                      ))}
                    <ListItem>
                      <FormControl fullWidth>
                        <InputLabel>Add Team</InputLabel>
                        <Select
                          value=""
                          onChange={(e) => {
                            const updatedPools = [...poolData];
                            updatedPools[index].teamIds.push(e.target.value);
                            setPoolData(updatedPools);
                          }}
                          label="Add Team"
                        >
                          {teams
                            .filter(t => t.leagueId === selectedLeague?.id && !pool.teamIds.includes(t.id))
                            .map(team => (
                              <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </ListItem>
                  </List>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Matches</Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      const updatedPools = [...poolData];
                      updatedPools[index].matches.push({
                        team1Id: '',
                        team2Id: '',
                        date: '',
                        venue: ''
                      });
                      setPoolData(updatedPools);
                    }}
                    sx={{ mb: 2 }}
                  >
                    Add Match
                  </Button>
                  {pool.matches.map((match, mIndex) => (
                    <Box key={mIndex} sx={{ mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth>
                            <InputLabel>Team 1</InputLabel>
                            <Select
                              value={match.team1Id}
                              onChange={(e) => {
                                const updatedPools = [...poolData];
                                updatedPools[index].matches[mIndex].team1Id = e.target.value;
                                setPoolData(updatedPools);
                              }}
                              label="Team 1"
                            >
                              <MenuItem value="">Select Team</MenuItem>
                              {teams
                                .filter(t => pool.teamIds.includes(t.id))
                                .map(team => (
                                  <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth>
                            <InputLabel>Team 2</InputLabel>
                            <Select
                              value={match.team2Id}
                              onChange={(e) => {
                                const updatedPools = [...poolData];
                                updatedPools[index].matches[mIndex].team2Id = e.target.value;
                                setPoolData(updatedPools);
                              }}
                              label="Team 2"
                            >
                              <MenuItem value="">Select Team</MenuItem>
                              {teams
                                .filter(t => pool.teamIds.includes(t.id) && t.id !== match.team1Id)
                                .map(team => (
                                  <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Date"
                            type="date"
                            value={match.date}
                            onChange={(e) => {
                              const updatedPools = [...poolData];
                              updatedPools[index].matches[mIndex].date = e.target.value;
                              setPoolData(updatedPools);
                            }}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Venue"
                            value={match.venue}
                            onChange={(e) => {
                              const updatedPools = [...poolData];
                              updatedPools[index].matches[mIndex].venue = e.target.value;
                              setPoolData(updatedPools);
                            }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePoolDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSavePools}
              disabled={loading}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Save Pools
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stream Configuration Dialog */}
        <Dialog open={openStreamDialog} onClose={handleStreamDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Configure Live Stream</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Protocol</InputLabel>
              <Select
                name="protocol"
                value={streamConfig.protocol}
                onChange={handleStreamConfigChange}
                label="Protocol"
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
            />
            <TextField
              label="Stream Key"
              name="streamKey"
              value={streamConfig.streamKey}
              onChange={handleStreamConfigChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Resolution</InputLabel>
              <Select
                name="resolution"
                value={streamConfig.resolution}
                onChange={handleStreamConfigChange}
                label="Resolution"
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
              inputProps={{ min: 500 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStreamDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleStartStream}
              disabled={loading || !streamConfig.serverUrl || !streamConfig.streamKey}
              sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Start Stream
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSnackbar({ open: true, message: 'Test stream initiated (placeholder).' })}
            >
              Test Stream
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Box>
    </Box>
  );
};

export default EnhancedLeagueManagement;