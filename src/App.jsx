import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import VirtualKeyboard from "./components/VirtualKeyboard";
import TypingArea from "./components/TypingArea";
import GameSummary from "./components/GameSummary";
import { koreanWords, koreanPhrases } from "./data/koreanData";
import { latinToJamo, composeHangul } from "./utils/hangulComposer";

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

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

function App() {
  const [mode, setMode] = useState("training");

  const [keyboardLayout, setKeyboardLayout] = useState("QWERTY");
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [jamos, setJamos] = useState([]);

  const [gameStatus, setGameStatus] = useState("not-started");
  const [gameLength, setGameLength] = useState(10);
  const [gameWords, setGameWords] = useState([]);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [resetCount, setResetCount] = useState(0);
  const [wordStartTime, setWordStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wordTimes, setWordTimes] = useState([]);
  const trainingAdvanceTimeout = useRef(null);

  const [trainingWords, setTrainingWords] = useState(() =>
    shuffleArray([...koreanWords, ...koreanPhrases])
  );

  const allItems = mode === "training" ? trainingWords : gameWords;
  const currentItem = allItems[currentWordIndex] || {};

  // Clearing input is independent of mode and game state. Keeping it stable
  // prevents the mode-switch effect from restarting a game when status changes.
  const clearCurrentWord = useCallback(() => {
    clearTimeout(trainingAdvanceTimeout.current);
    trainingAdvanceTimeout.current = null;
    setUserInput("");
    setFeedback([]);
    setJamos([]);
    setWordStartTime(null);
    setElapsedTime(0);
  }, []);

  useEffect(() => () => clearTimeout(trainingAdvanceTimeout.current), []);

  const resetCurrentWord = useCallback((isManual = true) => {
    clearCurrentWord();
    if (mode === "rank" && isManual && gameStatus === "in-progress") {
      setResetCount((prev) => prev + 1);
    }
  }, [clearCurrentWord, mode, gameStatus]);

  const startGame = useCallback(() => {
    setGameStatus("in-progress");
    setCurrentWordIndex(0);
    setBackspaceCount(0);
    setResetCount(0);
    setWordTimes([]);
    const shuffledWords = shuffleArray([...koreanWords, ...koreanPhrases]);
    setGameWords(shuffledWords.slice(0, gameLength));
    clearCurrentWord();
  }, [clearCurrentWord, gameLength]);

  useEffect(() => {
    clearCurrentWord();
    setCurrentWordIndex(0);

    if (mode === "training") {
      setTrainingWords(shuffleArray([...koreanWords, ...koreanPhrases]));
    } else {
      setGameWords([]);
      setGameStatus("not-started");
    }
  }, [mode, clearCurrentWord]);

  useEffect(() => {
    let interval;
    if (gameStatus === "in-progress" && wordStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - wordStartTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [wordStartTime, gameStatus]);

  const handleKeyPress = useCallback((jamo) => {
    if (mode === "rank" && gameStatus !== "in-progress") return;

    if (userInput.length === 0 && jamo !== " ") {
      setWordStartTime(Date.now());
    }

    const newJamos = [...jamos, jamo];
    setJamos(newJamos);
    const composedHangul = composeHangul(newJamos);
    setUserInput(composedHangul);

    const newFeedback = [];
    for (let i = 0; i < composedHangul.length; i++) {
      if (i < currentItem.hangul.length) {
        newFeedback.push({
          char: composedHangul[i],
          correct: composedHangul[i] === currentItem.hangul[i],
        });
      }
    }
    setFeedback(newFeedback);

    if (composedHangul === currentItem.hangul) {
      if (mode === "rank") {
        const timeTaken = Date.now() - wordStartTime;
        setWordTimes((prev) => [...prev, timeTaken]);
        setWordStartTime(null);
        setElapsedTime(0);

        if (currentWordIndex === gameLength - 1) {
          setGameStatus("finished");
        } else {
          setCurrentWordIndex((prev) => prev + 1);
          clearCurrentWord();
        }
      } else {
        clearTimeout(trainingAdvanceTimeout.current);
        trainingAdvanceTimeout.current = setTimeout(() => {
          trainingAdvanceTimeout.current = null;
          setCurrentWordIndex((prev) => (prev + 1) % allItems.length);
          clearCurrentWord();
        }, 500);
      }
    }
  }, [
    mode, gameStatus, userInput.length, jamos, currentItem.hangul,
    wordStartTime, currentWordIndex, gameLength, allItems.length, clearCurrentWord,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        if (
          mode === "rank" &&
          gameStatus === "in-progress" &&
          userInput.length > 0
        ) {
          setBackspaceCount((prev) => prev + 1);
        }

        const newJamos = jamos.slice(0, -1);
        const composedHangul = composeHangul(newJamos);

        const newFeedback = [];
        for (let i = 0; i < composedHangul.length; i++) {
          if (i < currentItem.hangul.length) {
            newFeedback.push({
              char: composedHangul[i],
              correct: composedHangul[i] === currentItem.hangul[i],
            });
          }
        }

        setJamos(newJamos);
        setUserInput(composedHangul);
        setFeedback(newFeedback);
      } else if (event.key.length === 1) {
        event.preventDefault();
        const shift = event.shiftKey;
        const jamo = latinToJamo(event.key, keyboardLayout, shift);
        if (jamo) {
          handleKeyPress(jamo);
        }
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (mode === "rank" && gameStatus !== "in-progress") {
          startGame();
        } else {
          resetCurrentWord();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    jamos, currentItem.hangul, keyboardLayout, mode, gameStatus, userInput.length,
    handleKeyPress, resetCurrentWord, startGame,
  ]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Korean Typing Practice</h1>
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === "training" ? "active" : ""}`}
            onClick={() => setMode("training")}
          >
            Training
          </button>
          <button
            className={`mode-btn ${mode === "rank" ? "active" : ""}`}
            onClick={() => setMode("rank")}
          >
            Rank
          </button>
        </div>
        <div className="controls">
          <div className="layout-selector">
            <label>Keyboard Layout:</label>
            <select
              value={keyboardLayout}
              onChange={(e) => setKeyboardLayout(e.target.value)}
            >
              <option value="QWERTY">QWERTY</option>
              <option value="AZERTY">AZERTY</option>
            </select>
          </div>
          <button
            className="toggle-keyboard-btn"
            onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
          >
            {showVirtualKeyboard ? "Hide" : "Show"} Virtual Keyboard
          </button>
          <button className="reset-btn" onClick={resetCurrentWord}>
            Reset Word
          </button>
        </div>
      </header>

      <main className="app-main">
        {mode === "training" && (
          <TypingArea
            currentItem={currentItem}
            userInput={userInput}
            feedback={feedback}
            jamos={jamos}
          />
        )}

        {mode === "rank" && gameStatus === "not-started" && (
          <div className="rank-start-screen">
            <h2>Rank Mode</h2>
            <p>Test your speed and accuracy!</p>
            <div className="game-length-selector">
              <label>Words/Sentences:</label>
              <select
                value={gameLength}
                onChange={(e) => setGameLength(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <button className="start-game-btn" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}

        {mode === "rank" && gameStatus === "in-progress" && (
          <div className="rank-game-container">
            <div className="word-counter">
              {currentWordIndex + 1} / {gameLength}
            </div>
            <TypingArea
              currentItem={currentItem}
              userInput={userInput}
              feedback={feedback}
              jamos={jamos}
            />
            <div className="timer-display">
              Word Time: {formatTime(elapsedTime / 1000)}
            </div>
          </div>
        )}

        {mode === "rank" && gameStatus === "finished" && (
          <GameSummary
            wordTimes={wordTimes}
            backspaceCount={backspaceCount}
            resetCount={resetCount}
            onPlayAgain={startGame}
          />
        )}

        {showVirtualKeyboard && (
          <VirtualKeyboard
            layout={keyboardLayout}
            onKeyPress={handleKeyPress}
            pressedKey={jamos[jamos.length - 1]}
          />
        )}
      </main>
    </div>
  );
}

export default App;
