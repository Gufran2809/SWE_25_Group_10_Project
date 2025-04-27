import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Cricket Score</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/matches">Matches</Link></li>
        <li><Link to="/leagues">Leagues</Link></li>
        <li><Link to="/live-stream">Live Stream</Link></li>
        <li><Link to="/player-stats">Player Stats</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;