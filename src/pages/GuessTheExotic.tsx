// GuessTheExotic.tsx
import React, { useState, useEffect, SyntheticEvent } from "react";
import weaponsData from "../data/ExoticWeapons.json";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  Autocomplete,
  createFilterOptions,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Define the shape of an exotic weapon
interface Weapon {
  name: string;
  weaponType: string;
  element: string;
  slot: string;
  ammoType: string;
  image: string;
}

// Props for the trait card component
interface TraitCardProps {
  label: string;
  value: string;
  isCorrect: boolean;
}

// Autocomplete filter: only show after 2 characters
const filter = createFilterOptions<string>({
  matchFrom: "start",
  stringify: (option) => option,
});

// Individual trait display
const TraitCard: React.FC<TraitCardProps> = ({ label, value, isCorrect }) => (
  <Card
    sx={{
      backgroundColor: isCorrect ? "success.main" : "grey.600",
      color: "common.white",
      textAlign: "center",
      p: 2,
    }}
  >
    <Typography variant="subtitle2">{label}</Typography>
    <Typography variant="h6">{value}</Typography>
  </Card>
);

const MAX_GUESSES = 10;

const GuessTheExotic: React.FC = () => {
  const [target, setTarget] = useState<Weapon | null>(null);
  const [guessInput, setGuessInput] = useState<string>("");
  const [guesses, setGuesses] = useState<Weapon[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [openWinPopup, setOpenWinPopup] = useState<boolean>(false);

  // On mount, pick a random target
  useEffect(() => {
    const list: Weapon[] = weaponsData;
    const random = list[Math.floor(Math.random() * list.length)];
    setTarget(random);
  }, []);

  const handleGuess = () => {
    if (gameOver) return;
    const guessed = weaponsData.find(
      (w) => w.name.toLowerCase() === guessInput.toLowerCase()
    );
    if (!guessed) return;

    setGuesses((prev) => [guessed, ...prev]);
    setGuessInput("");

    if (target && guessed.name === target.name) {
      setHasWon(true);
      setGameOver(true);
      setOpenWinPopup(true);
    } else if (guesses.length + 1 >= MAX_GUESSES) {
      setGameOver(true);
    }
  };

  // Render the 4 trait cards in a row
  const renderComparison = (guess: Weapon) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 2,
        mb: 2,
      }}
    >
      <TraitCard
        label="Weapon Type"
        value={guess.weaponType}
        isCorrect={!!(target && guess.weaponType === target.weaponType)}
      />
      <TraitCard
        label="Damage Type"
        value={guess.element}
        isCorrect={!!(target && guess.element === target.element)}
      />
      <TraitCard
        label="Slot"
        value={guess.slot}
        isCorrect={!!(target && guess.slot === target.slot)}
      />
      <TraitCard
        label="Ammo Type"
        value={guess.ammoType}
        isCorrect={!!(target && guess.ammoType === target.ammoType)}
      />
    </Box>
  );

  if (!target) return null;

  return (
    <Box maxWidth={600} mx="auto" p={4}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "common.white" }}
      >
        Guess the Exotic
      </Typography>

      {/* Autocomplete input, shows options after 1 chars */}
      <Box mb={4}>
        <Autocomplete
          freeSolo
          options={weaponsData.map((w) => w.name)}
          filterOptions={(options, state) =>
            state.inputValue.length >= 1 ? filter(options, state) : []
          }
          inputValue={guessInput}
          onInputChange={(_e: SyntheticEvent, newVal: string) =>
            setGuessInput(newVal)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Type a weapon name..."
              variant="outlined"
              fullWidth
              disabled={hasWon}
              sx={{ mb: 2 }}
            />
          )}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleGuess}
          disabled={guessInput.length < 1 || hasWon}
        >
          Submit Guess
        </Button>
      </Box>

      {/* Show correct answer on loss */}
      {gameOver && !hasWon && (
        <Box textAlign="center" mb={4}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Box
              component="img"
              src={target.image}
              alt={target.name}
              sx={{ width: 400, height: 400, mr: 3 }}
            />
            <Typography
              variant="h5"
              sx={{ color: "common.white", fontWeight: "bold" }}
            >
              {target.name}
            </Typography>
          </Box>
          <Typography variant="h5" gutterBottom sx={{ color: "common.white" }}>
            Out of guesses!
          </Typography>
          {renderComparison(target)}
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Play Again
          </Button>
        </Box>
      )}

      {/* List of past guesses */}
      {guesses.map((guess, idx) => (
        <Box key={idx} mb={2}>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <Box
              component="img"
              src={guess.image}
              alt={guess.name}
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Typography variant="h6" sx={{ color: "common.white" }}>
              {guess.name}
            </Typography>
          </Box>
          {renderComparison(guess)}
        </Box>
      ))}

      {/* Win dialog */}
      <Dialog
        open={openWinPopup}
        onClose={() => setOpenWinPopup(false)}
        aria-labelledby="win-dialog-title"
      >
        <DialogTitle id="win-dialog-title" sx={{ m: 0, p: 2 }}>
          You guessed the exotic!
          <IconButton
            aria-label="close"
            onClick={() => setOpenWinPopup(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography display="flex" alignItems="center">
            <Box
              component="img"
              src={target.image}
              alt={target.name}
              sx={{ width: 40, height: 40, mr: 1 }}
            />
            Congrats! You correctly identified <strong>{target.name}</strong>.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GuessTheExotic;
