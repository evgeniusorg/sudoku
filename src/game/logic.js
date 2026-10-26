// Validation and state helpers for the Sudoku board.

export const N = 9;

// A cell is { value: number|null, notes: number[] }.
export function createEmptyGrid() {
  return Array.from({ length: N }, () =>
    Array.from({ length: N }, () => ({ value: null, notes: [] }))
  );
}

export function initGrid(givens) {
  return givens.map((row) =>
    row.map((v) => ({ value: v !== 0 ? v : null, notes: [] }))
  );
}

export function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ value: cell.value, notes: cell.notes.slice() })));
}

export function isGiven(givens, r, c) {
  return givens[r][c] !== 0;
}

// Returns a Set of cell keys ("r*N+c") that are wrong: user-entered cells that
// duplicate another value in their row, column, box or (optionally) diagonals.
export function findConflicts(grid, givens, diagonal) {
  const conflicts = new Set();

  const mark = (cells) => {
    const byVal = new Map();
    for (const [r, c] of cells) {
      const v = grid[r][c].value;
      if (v === null) continue;
      if (!byVal.has(v)) byVal.set(v, []);
      byVal.get(v).push([r, c]);
    }
    for (const pos of byVal.values()) {
      if (pos.length > 1) {
        for (const [r, c] of pos) {
          if (givens[r][c] === 0) conflicts.add(r * N + c);
        }
      }
    }
  };

  // Rows.
  for (let r = 0; r < N; r++) {
    const row = [];
    for (let c = 0; c < N; c++) row.push([r, c]);
    mark(row);
  }
  // Columns.
  for (let c = 0; c < N; c++) {
    const col = [];
    for (let r = 0; r < N; r++) col.push([r, c]);
    mark(col);
  }
  // Boxes.
  for (let br = 0; br < N; br += 3) {
    for (let bc = 0; bc < N; bc += 3) {
      const box = [];
      for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) box.push([r, c]);
      }
      mark(box);
    }
  }
  // Diagonals.
  if (diagonal) {
    const d1 = [];
    const d2 = [];
    for (let i = 0; i < N; i++) {
      d1.push([i, i]);
      d2.push([i, N - 1 - i]);
    }
    mark(d1);
    mark(d2);
  }

  return conflicts;
}

export function isSolved(grid, givens, diagonal) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c].value === null) return false;
    }
  }
  return findConflicts(grid, givens, diagonal).size === 0;
}

// Digits that can no longer be placed in the selected cell because they already
// appear in its row, column, box (and diagonals, if enabled).
export function disabledDigitsForCell(grid, selected, diagonal) {
  const disabled = new Set();
  if (!selected) return disabled;
  const [r, c] = selected;

  for (let i = 0; i < N; i++) {
    const rv = grid[r][i].value;
    if (rv !== null && i !== c) disabled.add(rv);
    const cv = grid[i][c].value;
    if (cv !== null && i !== r) disabled.add(cv);
  }

  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if (i === r && j === c) continue;
      const v = grid[i][j].value;
      if (v !== null) disabled.add(v);
    }
  }

  if (diagonal) {
    if (r === c) {
      for (let i = 0; i < N; i++) {
        if (i === r) continue;
        const v = grid[i][i].value;
        if (v !== null) disabled.add(v);
      }
    }
    if (r + c === N - 1) {
      for (let i = 0; i < N; i++) {
        if (i === r) continue;
        const v = grid[i][N - 1 - i].value;
        if (v !== null) disabled.add(v);
      }
    }
  }

  return disabled;
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
