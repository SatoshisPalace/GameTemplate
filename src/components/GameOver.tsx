import React, { useState } from 'react';
import styled from 'styled-components';
import { submitScore } from '../utils/leaderboard';

const GameOverContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #6c5ce7;
`;

const ScoreDisplay = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const GameOverText = styled.h2`
  font-size: 36px;
  margin-bottom: 30px;
`;

const UsernameInput = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #6c5ce7;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 16px;
  width: 100%;
  max-width: 300px;

  &:focus {
    outline: none;
    border-color: #8f7ff7;
    box-shadow: 0 0 10px rgba(108, 92, 231, 0.2);
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  margin: 10px;
  background: rgba(108, 92, 231, 0.2);
  color: white;
  border: 1px solid #6c5ce7;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(108, 92, 231, 0.4);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorText = styled.div`
  color: #ff6b6b;
  margin: 10px 0;
`;

const SuccessText = styled.div`
  color: #51cf66;
  margin: 10px 0;
`;

interface GameOverProps {
  score: number;
  onRestart: () => void;
  wallet?: any;
  gameId: string;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart, wallet, gameId }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string>();
  const [txId, setTxId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!wallet) {
      setError('Please connect your wallet first!');
      return;
    }

    setIsSubmitting(true);
    try {
      setError(undefined);
      const result = await submitScore(wallet, gameId, score, username);
      setTxId(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit score');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GameOverContainer>
      <GameOverText>Game Over!</GameOverText>
      <ScoreDisplay>Score: {score}</ScoreDisplay>
      <UsernameInput
        type="text"
        placeholder="Enter your username (optional)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isSubmitting}
      />
      {error && <ErrorText>{error}</ErrorText>}
      {txId && <SuccessText>Score submitted successfully! Transaction ID: {txId}</SuccessText>}
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
      <Button onClick={onRestart}>Play Again</Button>
    </GameOverContainer>
  );
};

export default GameOver;
