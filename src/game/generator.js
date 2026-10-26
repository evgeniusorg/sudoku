// Sudoku puzzle generation.
//
// A puzzle is:
//   { solution, givens, diagonal, difficulty }
// where:
//   solution  — the solved 9x9 grid (digits 1-9)
//   givens    — 9x9 grid with the pre-filled clues (0 = blank)
//   diagonal  — whether both main diagonals must also be unique (X-Sudoku)
//   difficulty — 'easy' | 'medium' | 'hard' | 'expert'

import { CLUES_BY_DIFFICULTY, MAX_GIVENS_PER_BOX, DIFF_BANDS } from '../constants';
import { analyze } from './solver';

const N = 9;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cloneGrid(g) {
  return g.map((row) => row.slice());
}

// Candidates for an empty cell (0 = empty), respecting row/column/box and
// optionally both diagonals.
function candidates(grid, r, c, diagonal) {
  const used = new Array(N + 1).fill(false);
  for (let i = 0; i < N; i++) {
    used[grid[r][i]] = true;
    used[grid[i][c]] = true;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      used[grid[i][j]] = true;
    }
  }
  if (diagonal) {
    if (r === c) {
      for (let i = 0; i < N; i++) used[grid[i][i]] = true;
    }
    if (r + c === N - 1) {
      for (let i = 0; i < N; i++) used[grid[i][N - 1 - i]] = true;
    }
  }
  const res = [];
  for (let d = 1; d <= N; d++) if (!used[d]) res.push(d);
  return res;
}

// Find the empty cell with the fewest candidates (MRV heuristic).
// Returns { dead: true } if some cell has none, { r, c, cands } otherwise,
// or null when the grid is full.
function bestEmpty(grid, diagonal) {
  let bestR = -1;
  let bestC = -1;
  let bestCands = null;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c] !== 0) continue;
      const cands = candidates(grid, r, c, diagonal);
      if (cands.length === 0) return { dead: true };
      if (bestCands === null || cands.length < bestCands.length) {
        bestR = r;
        bestC = c;
        bestCands = cands;
        if (cands.length === 1) return { dead: false, r, c, cands };
      }
    }
  }
  if (bestCands === null) return null;
  return { dead: false, r: bestR, c: bestC, cands: bestCands };
}

// Count solutions up to `limit`.
function countSolutions(grid, diagonal, limit) {
  const cell = bestEmpty(grid, diagonal);
  if (cell === null) return 1;
  if (cell.dead) return 0;
  const { r, c, cands } = cell;
  let count = 0;
  for (const d of shuffle(cands)) {
    grid[r][c] = d;
    count += countSolutions(grid, diagonal, limit);
    grid[r][c] = 0;
    if (count >= limit) return count;
  }
  return count;
}

// Solve the grid in place (one solution), returning the grid or null.
function solveOne(grid, diagonal) {
  const cell = bestEmpty(grid, diagonal);
  if (cell === null) return grid;
  if (cell.dead) return null;
  const { r, c, cands } = cell;
  for (const d of shuffle(cands)) {
    grid[r][c] = d;
    if (solveOne(grid, diagonal)) return grid;
    grid[r][c] = 0;
  }
  return null;
}

// Generate a full randomized solution.
function generateSolution(diagonal) {
  const grid = Array.from({ length: N }, () => Array(N).fill(0));
  solveOne(grid, diagonal);
  return grid;
}

// Remove cells while preserving a unique solution, down to targetClues.
// Also guarantees each 3x3 box ends with at most MAX_GIVENS_PER_BOX givens so
// the clues are spread evenly across the whole board (no box stays full).
function digHoles(solution, diagonal, targetClues) {
  const grid = cloneGrid(solution);
  const boxCount = new Array(9).fill(9);
  const boxIdx = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

  const allCells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) allCells.push([r, c]);
  }

  let clues = N * N;

  // Pass 1: bring every 3x3 box down to at most MAX_GIVENS_PER_BOX givens.
  for (const [r, c] of shuffle(allCells)) {
    const b = boxIdx(r, c);
    if (boxCount[b] <= MAX_GIVENS_PER_BOX) continue;
    const backup = grid[r][c];
    grid[r][c] = 0;
    if (countSolutions(grid, diagonal, 2) === 1) {
      clues--;
      boxCount[b]--;
    } else {
      grid[r][c] = backup;
    }
  }

  // Pass 2: keep removing uniformly down to the target clue count.
  for (const [r, c] of shuffle(allCells)) {
    if (clues <= targetClues) break;
    if (grid[r][c] === 0) continue;
    const backup = grid[r][c];
    grid[r][c] = 0;
    if (countSolutions(grid, diagonal, 2) === 1) {
      clues--;
    } else {
      grid[r][c] = backup;
    }
  }

  return grid;
}

// Dig holes incrementally, stopping as soon as the hardest required technique
// falls into the target band. Returns the givens grid, or null if the band
// could not be hit for this solution (caller retries with a fresh solution).
function digForBand(solution, diagonal, band) {
  const grid = cloneGrid(solution);
  const boxCount = new Array(9).fill(9);
  const boxIdx = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

  const allCells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) allCells.push([r, c]);
  }

  // Pass 1: bring every 3x3 box down to at most MAX_GIVENS_PER_BOX givens.
  for (const [r, c] of shuffle(allCells)) {
    const b = boxIdx(r, c);
    if (boxCount[b] <= MAX_GIVENS_PER_BOX) continue;
    const backup = grid[r][c];
    grid[r][c] = 0;
    if (countSolutions(grid, diagonal, 2) === 1) {
      boxCount[b]--;
    } else {
      grid[r][c] = backup;
    }
  }

  // If the base grid is already in band (e.g. easy), return it.
  let score = analyze(grid, diagonal).score;
  if (score >= band.min && score <= band.max) return grid;
  if (score > band.max) return null; // base is already too hard

  // Pass 2: keep removing cells until the score reaches the band.
  for (const [r, c] of shuffle(allCells)) {
    if (grid[r][c] === 0) continue;
    const backup = grid[r][c];
    grid[r][c] = 0;
    if (countSolutions(grid, diagonal, 2) !== 1) {
      grid[r][c] = backup;
      continue;
    }
    score = analyze(grid, diagonal).score;
    if (score >= band.min && score <= band.max) return grid;
    if (score > band.max) grid[r][c] = backup; // overshoot: undo, try another cell
    // else: score < band.min, keep the removal and keep digging
  }

  return null; // could not reach the band for this solution
}

export function generatePuzzle(difficulty, diagonal = false) {
  const band = DIFF_BANDS[difficulty] || DIFF_BANDS.medium;
  for (let attempt = 0; attempt < 60; attempt++) {
    const solution = generateSolution(diagonal);
    const givens = digForBand(solution, diagonal, band);
    if (givens) return { solution, givens, diagonal, difficulty };
  }
  // Fallback (rare): dig to the base clue count without grading.
  const solution = generateSolution(diagonal);
  const givens = digHoles(solution, diagonal, CLUES_BY_DIFFICULTY[difficulty]);
  return { solution, givens, diagonal, difficulty };
}

export function countGivens(givens) {
  let count = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (givens[r][c] !== 0) count++;
    }
  }
  return count;
}
