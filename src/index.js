import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a3c34', // Dark green
    },
    secondary: {
      main: '#f4a261', // Orange
    },
    error: {
      main: '#e63946', // Red for status
    },
  },
  typography: {
    h1: { fontSize: '2.5rem', fontWeight: 'bold' },
    h2: { fontSize: '2rem', fontWeight: 'bold' },
    h3: { fontSize: '1.5rem', fontWeight: 'bold' },
    h4: { fontSize: '1.25rem', fontWeight: 'bold' },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);