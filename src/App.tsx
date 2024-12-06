import React, { useState } from 'react';
import styled from 'styled-components';
import Game from './components/Game';
import HUD from './components/HUD';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: white;
  padding-bottom: 40px;
  padding-top: 160px;
`;

function App() {
  const [currentScore, setCurrentScore] = useState(0);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>('');

  const handleScoreUpdate = (newScore: number) => {
    setCurrentScore(newScore);
  };

  return (
    <AppContainer>
      <HUD 
        score={currentScore}
        currentAddress={currentWalletAddress}
      />
      <Game onScoreUpdate={handleScoreUpdate} />
    </AppContainer>
  );
}

export default App;
