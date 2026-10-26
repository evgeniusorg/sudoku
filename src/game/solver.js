// Logical Sudoku solver that measures the hardest technique required to solve
// a puzzle. This is used to grade puzzles honestly (not just by clue count).
//
// Score levels (hardest technique used):
//   1 = naked single
//   2 = hidden single
//   3 = locked candidates (pointing / claiming)
//   4 = naked pair / hidden pair
//   5 = naked triple
//   6 = X-Wing
//   Infinity = no logical technique can finish it (requires guessing)
//
// `analyze(givens, diagonal)` returns { score, solved }.

const N = 9;
const ALL = 0b111111111; // digits 1..9 as bits 0..8

function popcount(m) {
  let n = 0;
  while (m) {
    m &= m - 1;
    n++;
  }
  return n;
}

function digitOf(m) {
  for (let d = 1; d <= N; d++) if (m & (1 << (d - 1))) return d;
  return 0;
}

function buildUnits() {
  const rows = [];
  const cols = [];
  const boxes = [];
  for (let i = 0; i < N; i++) {
    rows.push([]);
    cols.push([]);
    boxes.push([]);
  }
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      rows[r].push([r, c]);
      cols[c].push([r, c]);
      boxes[Math.floor(r / 3) * 3 + Math.floor(c / 3)].push([r, c]);
    }
  }
  return { rows, cols, boxes, units: [...rows, ...cols, ...boxes] };
}

const { rows: ROWS, cols: COLS, boxes: BOXES, units: UNITS } = buildUnits();

function computeCandidates(grid, diagonal) {
  const cand = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c] !== 0) {
        cand[r][c] = 0;
        continue;
      }
      let m = ALL;
      for (let i = 0; i < N; i++) {
        if (grid[r][i]) m &= ~(1 << (grid[r][i] - 1));
        if (grid[i][c]) m &= ~(1 << (grid[i][c] - 1));
      }
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let i = br; i < br + 3; i++) {
        for (let j = bc; j < bc + 3; j++) {
          if (grid[i][j]) m &= ~(1 << (grid[i][j] - 1));
        }
      }
      if (diagonal) {
        if (r === c) for (let i = 0; i < N; i++) if (grid[i][i]) m &= ~(1 << (grid[i][i] - 1));
        if (r + c === N - 1) for (let i = 0; i < N; i++) if (grid[i][N - 1 - i]) m &= ~(1 << (grid[i][N - 1 - i] - 1));
      }
      cand[r][c] = m;
    }
  }
  return cand;
}

// Place digit d at (r, c), removing it from all peers' candidates.
function place(cand, grid, r, c, d, diagonal) {
  grid[r][c] = d;
  cand[r][c] = 0;
  const bit = 1 << (d - 1);
  for (let i = 0; i < N; i++) {
    cand[r][i] &= ~bit;
    cand[i][c] &= ~bit;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      cand[i][j] &= ~bit;
    }
  }
  if (diagonal) {
    if (r === c) for (let i = 0; i < N; i++) cand[i][i] &= ~bit;
    if (r + c === N - 1) for (let i = 0; i < N; i++) cand[i][N - 1 - i] &= ~bit;
  }
}

// Try the logical techniques in increasing difficulty order. Apply the first
// move found and return its score, or null when nothing applies.
function step(grid, cand, diagonal) {
  // 1. Naked single.
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const m = cand[r][c];
      if (m && popcount(m) === 1) {
        place(cand, grid, r, c, digitOf(m), diagonal);
        return 1;
      }
    }
  }

  // 2. Hidden single.
  for (const unit of UNITS) {
    for (let d = 1; d <= N; d++) {
      const bit = 1 << (d - 1);
      let pos = null;
      let cnt = 0;
      for (const [r, c] of unit) {
        if (cand[r][c] & bit) {
          cnt++;
          pos = [r, c];
        }
      }
      if (cnt === 1) {
        place(cand, grid, pos[0], pos[1], d, diagonal);
        return 2;
      }
    }
  }

  // 3. Locked candidates — pointing (box -> row/col).
  for (const box of BOXES) {
    for (let d = 1; d <= N; d++) {
      const bit = 1 << (d - 1);
      const cells = box.filter(([r, c]) => cand[r][c] & bit);
      if (cells.length < 2) continue;
      const r0 = cells[0][0];
      const c0 = cells[0][1];
      if (cells.every(([r]) => r === r0)) {
        const boxCols = new Set(box.map(([, c]) => c));
        let any = false;
        for (let c = 0; c < N; c++) if (!boxCols.has(c) && (cand[r0][c] & bit)) { any = true; break; }
        if (any) {
          for (let c = 0; c < N; c++) if (!boxCols.has(c)) cand[r0][c] &= ~bit;
          return 3;
        }
      } else if (cells.every(([, c]) => c === c0)) {
        const boxRows = new Set(box.map(([r]) => r));
        let any = false;
        for (let r = 0; r < N; r++) if (!boxRows.has(r) && (cand[r][c0] & bit)) { any = true; break; }
        if (any) {
          for (let r = 0; r < N; r++) if (!boxRows.has(r)) cand[r][c0] &= ~bit;
          return 3;
        }
      }
    }
  }

  // 3. Locked candidates — claiming (row/col -> box).
  for (let r = 0; r < N; r++) {
    for (let d = 1; d <= N; d++) {
      const bit = 1 << (d - 1);
      const cells = ROWS[r].filter(([rr, c]) => cand[rr][c] & bit);
      if (cells.length < 2) continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(cells[0][1] / 3);
      if (cells.every(([, c]) => Math.floor(c / 3) === b % 3 && Math.floor(r / 3) * 3 + Math.floor(c / 3) === b)) {
        let any = false;
        for (const [br2, bc2] of BOXES[b]) if (br2 !== r && (cand[br2][bc2] & bit)) { any = true; break; }
        if (any) {
          for (const [br2, bc2] of BOXES[b]) if (br2 !== r) cand[br2][bc2] &= ~bit;
          return 3;
        }
      }
    }
  }
  for (let c = 0; c < N; c++) {
    for (let d = 1; d <= N; d++) {
      const bit = 1 << (d - 1);
      const cells = COLS[c].filter(([r, cc]) => cand[r][cc] & bit);
      if (cells.length < 2) continue;
      const b = Math.floor(cells[0][0] / 3) * 3 + Math.floor(c / 3);
      if (cells.every(([r]) => Math.floor(r / 3) === Math.floor(b / 3) && Math.floor(r / 3) * 3 + Math.floor(c / 3) === b)) {
        let any = false;
        for (const [br2, bc2] of BOXES[b]) if (bc2 !== c && (cand[br2][bc2] & bit)) { any = true; break; }
        if (any) {
          for (const [br2, bc2] of BOXES[b]) if (bc2 !== c) cand[br2][bc2] &= ~bit;
          return 3;
        }
      }
    }
  }

  // 4. Naked pair.
  for (const unit of UNITS) {
    for (let i = 0; i < unit.length; i++) {
      const [r1, c1] = unit[i];
      const m1 = cand[r1][c1];
      if (popcount(m1) !== 2) continue;
      for (let j = i + 1; j < unit.length; j++) {
        const [r2, c2] = unit[j];
        if (cand[r2][c2] !== m1) continue;
        let any = false;
        for (let k = 0; k < unit.length; k++) {
          if (k === i || k === j) continue;
          if (cand[unit[k][0]][unit[k][1]] & m1) { any = true; break; }
        }
        if (any) {
          for (let k = 0; k < unit.length; k++) {
            if (k === i || k === j) continue;
            cand[unit[k][0]][unit[k][1]] &= ~m1;
          }
          return 4;
        }
      }
    }
  }

  // 4. Hidden pair.
  for (const unit of UNITS) {
    for (let d1 = 1; d1 <= N; d1++) {
      const bit1 = 1 << (d1 - 1);
      const cells1 = unit.filter(([r, c]) => cand[r][c] & bit1);
      if (cells1.length !== 2) continue;
      for (let d2 = d1 + 1; d2 <= N; d2++) {
        const bit2 = 1 << (d2 - 1);
        const cells2 = unit.filter(([r, c]) => cand[r][c] & bit2);
        if (cells2.length !== 2) continue;
        if (
          cells1[0][0] === cells2[0][0] && cells1[0][1] === cells2[0][1] &&
          cells1[1][0] === cells2[1][0] && cells1[1][1] === cells2[1][1]
        ) {
          const comb = bit1 | bit2;
          let any = false;
          for (const [r, c] of cells1) if (cand[r][c] & ~comb) { any = true; break; }
          if (any) {
            for (const [r, c] of cells1) cand[r][c] &= comb;
            return 4;
          }
        }
      }
    }
  }

  // 5. Naked triple.
  for (const unit of UNITS) {
    const L = unit.length;
    for (let i = 0; i < L; i++) {
      const m1 = cand[unit[i][0]][unit[i][1]];
      if (!m1) continue;
      for (let j = i + 1; j < L; j++) {
        const m2 = cand[unit[j][0]][unit[j][1]];
        if (!m2) continue;
        for (let k = j + 1; k < L; k++) {
          const m3 = cand[unit[k][0]][unit[k][1]];
          if (!m3) continue;
          const union = m1 | m2 | m3;
          if (popcount(union) !== 3) continue;
          let any = false;
          for (let x = 0; x < L; x++) {
            if (x === i || x === j || x === k) continue;
            if (cand[unit[x][0]][unit[x][1]] & union) { any = true; break; }
          }
          if (any) {
            for (let x = 0; x < L; x++) {
              if (x === i || x === j || x === k) continue;
              cand[unit[x][0]][unit[x][1]] &= ~union;
            }
            return 5;
          }
        }
      }
    }
  }

  // 6. X-Wing (rows and columns).
  for (let d = 1; d <= N; d++) {
    const bit = 1 << (d - 1);
    for (let r1 = 0; r1 < N; r1++) {
      const cols1 = [];
      for (let c = 0; c < N; c++) if (cand[r1][c] & bit) cols1.push(c);
      if (cols1.length !== 2) continue;
      for (let r2 = r1 + 1; r2 < N; r2++) {
        const cols2 = [];
        for (let c = 0; c < N; c++) if (cand[r2][c] & bit) cols2.push(c);
        if (cols2.length !== 2) continue;
        if (cols1[0] === cols2[0] && cols1[1] === cols2[1]) {
          const [ca, cb] = cols1;
          let any = false;
          for (let r = 0; r < N; r++) {
            if (r === r1 || r === r2) continue;
            if ((cand[r][ca] & bit) || (cand[r][cb] & bit)) { any = true; break; }
          }
          if (any) {
            for (let r = 0; r < N; r++) {
              if (r === r1 || r === r2) continue;
              cand[r][ca] &= ~bit;
              cand[r][cb] &= ~bit;
            }
            return 6;
          }
        }
      }
    }
    for (let c1 = 0; c1 < N; c1++) {
      const rows1 = [];
      for (let r = 0; r < N; r++) if (cand[r][c1] & bit) rows1.push(r);
      if (rows1.length !== 2) continue;
      for (let c2 = c1 + 1; c2 < N; c2++) {
        const rows2 = [];
        for (let r = 0; r < N; r++) if (cand[r][c2] & bit) rows2.push(r);
        if (rows2.length !== 2) continue;
        if (rows1[0] === rows2[0] && rows1[1] === rows2[1]) {
          const [ra, rb] = rows1;
          let any = false;
          for (let c = 0; c < N; c++) {
            if (c === c1 || c === c2) continue;
            if ((cand[ra][c] & bit) || (cand[rb][c] & bit)) { any = true; break; }
          }
          if (any) {
            for (let c = 0; c < N; c++) {
              if (c === c1 || c === c2) continue;
              cand[ra][c] &= ~bit;
              cand[rb][c] &= ~bit;
            }
            return 6;
          }
        }
      }
    }
  }

  return null;
}

export function analyze(givens, diagonal = false) {
  const grid = givens.map((row) => row.slice());
  const cand = computeCandidates(grid, diagonal);
  let score = 0;
  for (;;) {
    const s = step(grid, cand, diagonal);
    if (s === null) break;
    if (s > score) score = s;
  }
  const solved = grid.every((row) => row.every((v) => v !== 0));
  return { score: solved ? score : Infinity, solved };
}
