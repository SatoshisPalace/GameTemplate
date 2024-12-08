import React, { useState, useCallback, memo } from 'react';
import styled from 'styled-components';
import { submitScore } from '../utils/leaderboard';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: calc(100vh - 200px);
  position: relative;
  z-index: 2;
  padding: 20px;
  margin-top: 60px;
`;

const ContentArea = styled.div`
  border: 2px solid #6c5ce7;
  background-color: black;
  box-shadow: 0 0 20px rgba(108, 92, 231, 0.3);
  width: 100%;
  max-width: 800px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c5ce7;
  font-size: 24px;
  padding: 40px;
  position: relative;
  margin: 20px;
  border-radius: 12px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #6c5ce7;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 16px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #8f7ff7;
    box-shadow: 0 0 10px rgba(108, 92, 231, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #6c5ce7;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 16px;
  width: 100%;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #8f7ff7;
    box-shadow: 0 0 10px rgba(108, 92, 231, 0.2);
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
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

const GAME_ID = 'Test_id';

interface GameProps {
  onScoreUpdate: (score: number) => void;
  wallet?: any;
}

const Game: React.FC<GameProps> = memo(({ onScoreUpdate, wallet }) => {
  const [username, setUsername] = useState('ADMIN');
  const [score, setScore] = useState('50000');
  const [otherInfo, setOtherInfo] = useState('{}');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      setError('Please connect your wallet first!');
      return;
    }

    if (!wallet.address) {
      setError('Invalid wallet state. Please reconnect your wallet.');
      return;
    }

    setIsSubmitting(true);
    try {
      const scoreNumber = parseInt(score);
      if (isNaN(scoreNumber)) {
        throw new Error('Invalid score');
      }

      const { gameId } = JSON.parse(otherInfo);

      const result = await submitScore(
        {
          ...wallet,
          kty: wallet.address  // Use address as kty
        },
        GAME_ID,
        scoreNumber,
        username
      );
      
      onScoreUpdate(scoreNumber);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [score, otherInfo, wallet, onScoreUpdate]);

  return (
    <GameContainer>
      <ContentArea>
        <h2>Game Template</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <TextArea
            placeholder="Other Info (JSON format)"
            value={otherInfo}
            onChange={(e) => setOtherInfo(e.target.value)}
          />
          <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6c5ce7' }}>
            Wallet Status: {wallet ? 'Connected' : 'Not Connected'}
          </div>
          {error && (
            <div style={{ color: '#ff6b6b', marginBottom: '10px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <SubmitButton type="submit" disabled={!wallet || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Score'}
          </SubmitButton>
        </Form>
      </ContentArea>
    </GameContainer>
  );
});

export default Game;
