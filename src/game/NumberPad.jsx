export const NumberPad = ({ disabledDigits, onNumber }) => {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="numpad">
      <div className="numpad-digits">
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            className="num-btn"
            disabled={disabledDigits.has(d)}
            onClick={() => onNumber(d)}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};
