import React from 'react';
import { Button, Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth={false} sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Banshee's Terminal!
      </Typography>
      <Typography variant="h5" gutterBottom>
        Eye's Up, Guardian!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => alert('Coming Soon!')}
      >
        Launch Quiz
      </Button>
    </Container>
  );
}
