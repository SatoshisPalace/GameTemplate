import React, { useState } from 'react';
import styled from 'styled-components';
import GameOver from './GameOver';
import { useArweaveScore } from './dispatch';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 120px auto 20px;
  width: fit-content;
  position: relative;
`;

const ContentArea = styled.div`
  border: 2px solid #6c5ce7;
  background-color: black;
  box-shadow: 0 0 20px rgba(108, 92, 231, 0.3);
  width: 600px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c5ce7;
  font-size: 24px;
  overflow: hidden;
`;

interface GameState {
  currentScore: number;
  gameStarted: boolean;
  isGameOver: boolean;
}

const Game: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentScore: 0,
    gameStarted: false,
    isGameOver: false
  });
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | undefined>(undefined);
  const { dispatchGameScore } = useArweaveScore();

  const handleGameOver = async () => {
    if (!isSavingScore && gameState.currentScore > 0) {
      setIsSavingScore(true);
      try {
        const metadata = {
          gameType: 'template',
          finalScore: gameState.currentScore,
          timestamp: Date.now()
        };
        const txId = await dispatchGameScore(gameState.currentScore, metadata);
        if (txId) {
          setLastTxId(txId);
        }
      } catch (error) {
        console.error('Failed to save score:', error);
      }
      setIsSavingScore(false);
    }
  };

  const resetGame = () => {
    setGameState({
      currentScore: 0,
      gameStarted: false,
      isGameOver: false
    });
    setLastTxId(undefined);
  };

  const updateScore = (points: number) => {
    setGameState(prev => {
      const newScore = prev.currentScore + points;
      onScoreUpdate(newScore);
      return { ...prev, currentScore: newScore };
    });
  };

  if (gameState.isGameOver) {
    return (
      <GameOver
        score={gameState.currentScore}
        onRestart={resetGame}
        txId={lastTxId}
        isSavingScore={isSavingScore}
      />
    );
  }

  return (
    <GameContainer>
      <ContentArea>
        Game Template
      </ContentArea>
    </GameContainer>
  );
};

export default Game;
