import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import GroupIcon from '@mui/icons-material/Group';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import InsightsIcon from '@mui/icons-material/Insights';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AuthContext } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1b5e20, #4caf50)',
  boxShadow: theme.shadows[2],
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#ffffff',
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  [theme.breakpoints.down('md')]: {
    margin: theme.spacing(0, 0.5),
  },
}));

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications] = useState([]); // Placeholder for notifications

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Live Matches', path: '/live-matches', icon: <SportsCricketIcon /> },
    { text: 'Tournaments', path: '/tournaments', icon: <GroupIcon /> },
    { text: 'Teams', path: '/teams', icon: <GroupIcon /> },
    { text: 'Players', path: '/players', icon: <InsightsIcon /> },
    { text: 'Statistics', path: '/statistics', icon: <InsightsIcon /> },
    { text: 'Live Stream', path: '/live-stream', icon: <LiveTvIcon /> },
  ];

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: { xs: '1.2rem', md: '1.5rem' } }}
          >
            Live Cricket Score
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {menuItems.map((item) => (
              <NavButton
                key={item.text}
                component={Link}
                to={item.path}
                startIcon={item.icon}
              >
                {item.text}
              </NavButton>
            ))}
            {user ? (
              <>
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <Avatar src={user.photoURL} alt={user.displayName} sx={{ width: 32, height: 32 }} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose} component={Link} to="/organizer">
                    Organizer Dashboard
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      logout();
                      handleMenuClose();
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <NavButton component={Link} to="/login">
                Login
              </NavButton>
            )}
          </Box>
          <IconButton
            color="inherit"
            edge="end"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </StyledAppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {menuItems.map((item) => (
              <ListItem button component={Link} to={item.path} key={item.text}>
                {item.icon}
                <ListItemText primary={item.text} sx={{ ml: 2 }} />
              </ListItem>
            ))}
            {user ? (
              <>
                <ListItem button component={Link} to="/profile">
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button component={Link} to="/organizer">
                  <ListItemText primary="Organizer Dashboard" />
                </ListItem>
                <ListItem button onClick={logout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <ListItem button component={Link} to="/login">
                <ListItemText primary="Login" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;