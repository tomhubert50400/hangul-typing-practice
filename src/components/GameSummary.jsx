import "./GameSummary.css";

function formatTime(seconds) {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}

function GameSummary({ wordTimes, backspaceCount, resetCount, onPlayAgain }) {
  const totalWords = wordTimes.length;
  const totalTime = wordTimes.reduce((acc, time) => acc + time, 0);
  const totalTimeSeconds = totalTime / 1000;
  const averageTime =
    totalWords > 0 ? (totalTime / totalWords / 1000).toFixed(2) : 0;

  // Words Per Minute (WPM) calculation
  // Assuming average word length is 5 characters (standard for WPM)
  const averageWordLength = 5;
  const totalChars = totalWords * averageWordLength;
  const wpm = totalTime > 0 ? totalChars / 5 / (totalTime / 1000 / 60) : 0;

  return (
    <div className="game-summary">
      <h2>Game Over!</h2>
      <p>Here are your results:</p>

      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">Words Per Minute (WPM)</span>
          <span className="stat-value">{wpm.toFixed(1)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Time</span>
          <span className="stat-value">{formatTime(totalTimeSeconds)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Time per Word</span>
          <span className="stat-value">{averageTime}s</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Words</span>
          <span className="stat-value">{totalWords}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Corrections Made</span>
          <span className="stat-value">{backspaceCount + resetCount}</span>
          <span className="stat-detail">
            ({backspaceCount} backspaces, {resetCount} resets)
          </span>
        </div>
      </div>

      <button className="play-again-btn" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  );
}

export default GameSummary;
