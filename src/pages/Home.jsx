import React from 'react';
import { Button, Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Destiny 2 Fan Site!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => alert('Let\u2019s play!')}
      >
        Launch Quiz
      </Button>
    </Container>
  );
}
