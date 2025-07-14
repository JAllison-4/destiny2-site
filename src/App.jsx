import React from 'react';
import Box from '@mui/material/Box';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import GuessTheExotic from './pages/GuessTheExotic.jsx';

export default function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <GuessTheExotic />
      </Box>
      <Footer />
    </Box>
  );
}
