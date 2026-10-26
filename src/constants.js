export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];
export const DEFAULT_DIFFICULTY = 'easy';

// Target number of given clues per difficulty (9x9 grid).
// Every 3x3 box is capped at MAX_GIVENS_PER_BOX (4), so the total can never
// exceed 36 — that keeps the clue distribution uniform across the board.
export const CLUES_BY_DIFFICULTY = {
  easy: 36,
  medium: 33,
  hard: 29,
  expert: 25,
};

export const MAX_GIVENS_PER_BOX = 4;

// Difficulty bands keyed by the hardest solving technique required (see
// solver.js). A puzzle is graded by measuring which techniques a logical
// solver needs, then matched to one of these bands.
export const DIFF_BANDS = {
  easy: { min: 1, max: 2 }, // naked + hidden singles
  medium: { min: 3, max: 3 }, // locked candidates
  hard: { min: 4, max: 5 }, // pairs / triples
  expert: { min: 6, max: Infinity }, // X-Wing / requires guessing
};

export const LS_BEST_KEY = 'sudoku:best';
export const LS_SOUND_KEY = 'sudoku:sound';
export const LS_LANG_KEY = 'sudoku:lang';
export const LS_LIGHT_KEY = 'sudoku:light';
export const LS_HINTS_KEY = 'sudoku:hints';
export const LS_DIFFICULTY_KEY = 'sudoku:difficulty';
export const LS_DIAGONAL_KEY = 'sudoku:diagonal';
export const LS_INSTALL_SHOWN_KEY = 'sudoku:installShown';

export const SHARE_URL = 'https://euchu.ru/sudoku';

export const GAME_STATUS = {
  PLAYING: 'playing',
  WON: 'won',
};
