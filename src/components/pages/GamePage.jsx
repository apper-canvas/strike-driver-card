import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import gameStateService from "@/services/api/gameStateService";
import GameCanvas from "@/components/organisms/GameCanvas";
import HUD from "@/components/molecules/HUD";
import ControlsGuide from "@/components/molecules/ControlsGuide";
import StartScreen from "@/components/organisms/StartScreen";
import GameOverModal from "@/components/organisms/GameOverModal";
import PauseModal from "@/components/organisms/PauseModal";
import { toast } from "react-toastify";

const GamePage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    combo: 0,
    isPaused: false,
    isGameOver: false,
    isStarted: false
  });
  const [health, setHealth] = useState(100);
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(true);
// Load user's high score when authenticated
  useEffect(() => {
    const loadHighScore = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      
      try {
        const userGameState = await gameStateService.getUserGameState();
        if (userGameState) {
          setHighScore(userGameState.high_score_c || 0);
        }
      } catch (error) {
        console.error("Failed to load high score:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHighScore();
  }, [isAuthenticated, user]);

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

const handleGameOver = useCallback(async () => {
    setGameState(prev => {
      const newState = { ...prev, isGameOver: true, isPaused: true };
      
      // Save high score to database if authenticated
      if (isAuthenticated && prev.score > highScore) {
        const saveHighScore = async () => {
          try {
            await gameStateService.updateHighScore(prev.score);
            setHighScore(prev.score);
            toast.success("New high score saved!");
          } catch (error) {
            console.error("Failed to save high score:", error);
            toast.error("Failed to save high score");
          }
        };
        saveHighScore();
      } else if (prev.score > highScore) {
        setHighScore(prev.score);
      }
      
      return newState;
    });
  }, [highScore, isAuthenticated]);

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

if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-background">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Loading game data...</p>
        </div>
      </div>
    );
  }

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