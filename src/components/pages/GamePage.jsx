import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import GameCanvas from "@/components/organisms/GameCanvas";
import HUD from "@/components/molecules/HUD";
import ControlsGuide from "@/components/molecules/ControlsGuide";
import StartScreen from "@/components/organisms/StartScreen";
import GameOverModal from "@/components/organisms/GameOverModal";
import PauseModal from "@/components/organisms/PauseModal";

const GamePage = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    combo: 0,
    isPaused: false,
    isGameOver: false,
    isStarted: false
  });
  const [health, setHealth] = useState(100);
  const [highScore, setHighScore] = useLocalStorage("skyStrikeHighScore", 0);

  useEffect(() => {
    const level = Math.floor(gameState.score / 1000) + 1;
    if (level !== gameState.level) {
      setGameState(prev => ({ ...prev, level }));
    }
  }, [gameState.score, gameState.level]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && gameState.isStarted && !gameState.isGameOver) {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.isStarted, gameState.isGameOver, gameState.isPaused]);

  const handleStart = useCallback(() => {
    setGameState({
      score: 0,
      level: 1,
      combo: 0,
      isPaused: false,
      isGameOver: false,
      isStarted: true
    });
    setHealth(100);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isGameOver: true, isPaused: true };
      
      if (prev.score > highScore) {
        setHighScore(prev.score);
      }
      
      return newState;
    });
  }, [highScore, setHighScore]);

  const handleRestart = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleResume = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const handleQuit = useCallback(() => {
    setGameState({
      score: 0,
      level: 1,
      combo: 0,
      isPaused: false,
      isGameOver: false,
      isStarted: false
    });
    setHealth(100);
  }, []);

  const isNewHighScore = gameState.isGameOver && gameState.score > 0 && gameState.score >= highScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-4">
      <div className="relative">
        {!gameState.isStarted && (
          <StartScreen onStart={handleStart} highScore={highScore} />
        )}
        
        {gameState.isStarted && (
          <>
            <HUD 
              score={gameState.score}
              health={health}
              combo={gameState.combo}
              level={gameState.level}
            />
            
<GameCanvas 
              gameState={gameState}
              onScoreUpdate={(newScore) => setGameState(prev => ({ ...prev, score: newScore }))}
              onHealthUpdate={setHealth}
              onComboUpdate={(newCombo) => setGameState(prev => ({ ...prev, combo: newCombo }))}
              onGameOver={handleGameOver}
              isPaused={gameState.isPaused}
            />
            
            <ControlsGuide />
            
            {gameState.isPaused && !gameState.isGameOver && (
              <PauseModal onResume={handleResume} onQuit={handleQuit} />
            )}
            
            {gameState.isGameOver && (
              <GameOverModal 
                score={gameState.score}
                highScore={highScore}
                isNewHighScore={isNewHighScore}
                onRestart={handleRestart}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GamePage;