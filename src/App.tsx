import React, { useState, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Game from './components/Game';
import HUD from './components/HUD';
import Leaderboard from './components/Leaderboard';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: black;
  position: relative;
  overflow: hidden;
`;

const BannerImage = styled.img`
  width: 100%;
  max-width: 400px;
  height: auto;
  margin-top: 20px;
  position: relative;
  z-index: 3;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 400px);
  max-width: 1400px;
  padding: 20px;
  margin-left: 400px;
  position: relative;
  z-index: 2;
  height: calc(100vh - 120px);
  overflow: hidden;
`;

const GAME_ID = 'Test_id';

function App() {
  const [currentScore, setCurrentScore] = useState(0);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  const handleScoreUpdate = useCallback((score: number) => {
    setCurrentScore(score);
  }, []);

  const handleWalletConnection = useCallback((connected: boolean) => {
    setIsWalletConnected(connected);
    if (!connected) {
      setWallet(null);
      setCurrentWalletAddress('');
    }
  }, []);

  const handleWalletUpdate = useCallback((newWallet: any) => {
    setWallet(newWallet);
    setCurrentWalletAddress(newWallet?.address || '');
    setIsWalletConnected(!!newWallet);
  }, []);

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <BannerImage src="/Head-Liner.png" alt="Banner" />
        <Leaderboard
          gameId={GAME_ID}
          currentAddress={currentWalletAddress}
          currentScore={currentScore}
          isWalletConnected={isWalletConnected}
          onConnect={handleWalletConnection}
        />
        <HUD
          score={currentScore}
          currentAddress={currentWalletAddress}
          onWalletUpdate={handleWalletUpdate}
        />
        <MainContent>
          <Game 
            onScoreUpdate={handleScoreUpdate}
            wallet={wallet}
          />
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;
