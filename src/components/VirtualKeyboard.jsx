import "./VirtualKeyboard.css";
import {
  getKeyboardLayout,
  getLatinLabels,
  getHangulChars,
} from "../utils/hangulComposer";

function VirtualKeyboard({ layout, onKeyPress, pressedKey }) {
  const keyboardLayout = getKeyboardLayout(layout);
  const latinLabels = getLatinLabels(layout);

  const handleKeyClick = (latinChar, shift = false) => {
    const physicalKey = getPhysicalKey(keyboardLayout, latinChar);
    if (physicalKey) {
      const hangulChars = getHangulChars(physicalKey.row, physicalKey.col);
      if (hangulChars) {
        const jamo = shift ? hangulChars.shift : hangulChars.normal;
        if (jamo) {
          onKeyPress(jamo, shift);
        }
      }
    }
  };

  const getPhysicalKey = (layout, latinChar) => {
    for (let rowIndex = 0; rowIndex < layout.length; rowIndex++) {
      const row = layout[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        if (row[colIndex] === latinChar) {
          return { row: rowIndex, col: colIndex };
        }
      }
    }
    return null;
  };

  return (
    <div className="virtual-keyboard">
      <div className="keyboard-layout">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((latinChar) => {
              const physicalKey = getPhysicalKey(keyboardLayout, latinChar);
              const hangulChars = physicalKey
                ? getHangulChars(physicalKey.row, physicalKey.col)
                : null;
              const isPressed =
                pressedKey === (hangulChars?.normal || latinChar) ||
                pressedKey === (hangulChars?.shift || latinChar);

              return (
                <button
                  key={latinChar}
                  className={`keyboard-key ${isPressed ? "pressed" : ""} ${
                    latinChar === " " ? "space-key" : ""
                  }`}
                  onClick={() => handleKeyClick(latinChar, false)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleKeyClick(latinChar, true);
                  }}
                  title={
                    hangulChars?.shift
                      ? `Click: ${hangulChars.normal}, Right-click: ${hangulChars.shift}`
                      : `Click: ${hangulChars?.normal || latinChar}`
                  }
                >
                  <div className="key-latin">{latinChar}</div>
                  <div className="key-hangul">
                    {hangulChars ? (
                      hangulChars.shift ? (
                        <span className="hangul-dual">
                          <span className="hangul-normal">
                            {hangulChars.normal}
                          </span>
                          <span className="hangul-separator">/</span>
                          <span className="hangul-shift">
                            {hangulChars.shift}
                          </span>
                        </span>
                      ) : (
                        <span className="hangul-single">
                          {hangulChars.normal}
                        </span>
                      )
                    ) : (
                      <span className="hangul-single">{latinChar}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="keyboard-help">
        <p>
          💡 <strong>Tip:</strong> Press shift or right-click keys for shift
          variants (ㅃ, ㅉ, ㄸ, etc.)
        </p>
      </div>
    </div>
  );
}

export default VirtualKeyboard;
