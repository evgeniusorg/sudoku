import { N } from './logic';

// Renders the 9x9 Sudoku grid: 3x3 box boundaries are drawn with per-cell
// top/left borders (the outer frame comes from .sud-board). Given cells are
// fixed; the diagonal cells are highlighted when the option is enabled.
export const Board = ({ puzzle, grid, selected, conflicts, onCellClick }) => {
  const { givens, diagonal } = puzzle;

  const sel = selected;
  const selValue = sel ? grid[sel[0]][sel[1]].value : null;
  const selBoxR = sel ? Math.floor(sel[0] / 3) * 3 : -1;
  const selBoxC = sel ? Math.floor(sel[1] / 3) * 3 : -1;

  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const isSelected = sel && sel[0] === r && sel[1] === c;
      const isGiven = givens[r][c] !== 0;
      const cell = grid[r][c];

      const isPeerRowCol = sel && !isSelected && (r === sel[0] || c === sel[1]);
      const isPeerBox =
        sel &&
        !isSelected &&
        Math.floor(r / 3) * 3 === selBoxR &&
        Math.floor(c / 3) * 3 === selBoxC;
      const isSameValue =
        !isSelected &&
        cell.value !== null &&
        selValue !== null &&
        cell.value === selValue;
      const isDiagonal = diagonal && (r === c || r + c === N - 1);
      const isConflict = conflicts.has(r * N + c);

      const style = {
        borderTopWidth: r === 0 ? 0 : r % 3 === 0 ? 2 : 1,
        borderTopColor: r % 3 === 0 ? 'var(--thick-line)' : 'var(--thin-line)',
        borderLeftWidth: c === 0 ? 0 : c % 3 === 0 ? 2 : 1,
        borderLeftColor: c % 3 === 0 ? 'var(--thick-line)' : 'var(--thin-line)',
      };

      const cls = [
        'sud-cell',
        isSelected && 'selected',
        isPeerRowCol && 'peer-rowcol',
        isPeerBox && 'peer-box',
        isSameValue && 'same-value',
        isDiagonal && 'diagonal',
        isConflict && 'conflict',
        isGiven && 'given',
      ]
        .filter(Boolean)
        .join(' ');

      cells.push(
        <div key={r * N + c} className={cls} style={style} onClick={() => onCellClick(r, c)}>
          {cell.value !== null ? (
            <span className="cell-value">{cell.value}</span>
          ) : cell.notes.length > 0 ? (
            <Notes notes={cell.notes} />
          ) : null}
        </div>
      );
    }
  }

  return (
    <div className="sud-board" data-diagonal={diagonal ? '1' : '0'}>
      {cells}
    </div>
  );
};

const Notes = ({ notes }) => {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <span className="notes">
      {digits.map((d) => (
        <span key={d} className={notes.includes(d) ? 'note-on' : 'note-empty'}>
          {d}
        </span>
      ))}
    </span>
  );
};
