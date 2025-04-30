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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import GroupIcon from '@mui/icons-material/Group';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import InsightsIcon from '@mui/icons-material/Insights';
import { AuthContext } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0288d1, #01579b)',
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#ffffff',
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Matches', path: '/matches', icon: <SportsCricketIcon /> },
    { text: 'Leagues', path: '/leagues', icon: <GroupIcon /> },
    { text: 'Live Stream', path: '/live-stream', icon: <LiveTvIcon /> },
    { text: 'Player Stats', path: '/player-stats', icon: <InsightsIcon /> },
  ];

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold' }}
          >
            Live Cricket Score
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
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
            {user && (
              <NavButton onClick={logout}>Logout</NavButton>
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
            {user && (
              <ListItem button onClick={logout}>
                <ListItemText primary="Logout" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;