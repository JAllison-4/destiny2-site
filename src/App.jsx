import React from 'react';
import { Button, Container, Typography } from '@mui/material';

export default function App() {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h3" gutterBottom align="center">
        Welcome to Destiny 2 Fan Site!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => alert('Let’s play!')}
      >
        Launch Quiz
      </Button>
    </Container>
  );
}