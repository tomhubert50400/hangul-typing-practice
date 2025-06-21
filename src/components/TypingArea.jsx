import "./TypingArea.css";

function TypingArea({ currentItem, userInput, feedback, jamos = [] }) {
  if (!currentItem) return null;

  return (
    <div className="typing-area">
      <div className="word-display">
        <h2 className="hangul-text">{currentItem.hangul}</h2>
        <p className="english-text">{currentItem.english}</p>
        <p className="romanized-text">({currentItem.romanized})</p>
      </div>

      <div className="input-display">
        <div className="feedback-text">
          {feedback.map((item, index) => (
            <span
              key={index}
              className={`feedback-char ${
                item.correct ? "correct" : "incorrect"
              }`}
            >
              {item.char}
            </span>
          ))}
          <span className="cursor">|</span>
        </div>

        {jamos.length > 0 && (
          <div className="jamo-display">
            <span className="jamo-label">Jamos:</span>
            <span className="jamo-text">
              {jamos.map((jamo, index) => (
                <span key={index} className="jamo-char">
                  {jamo}
                </span>
              ))}
              {jamos.length > 20 && <span className="jamo-char">...</span>}
            </span>
          </div>
        )}
      </div>

      <div className="progress">
        <span className="progress-text">
          {userInput.length} / {currentItem.hangul.length} characters
        </span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(userInput.length / currentItem.hangul.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default TypingArea;
