import React, { useState } from 'react';
import styled from 'styled-components';
import WalletConnection from './WalletConnection';
import Leaderboard from './Leaderboard';

const HUDContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 1000;
`;

const Score = styled.div`
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: #6c5ce7;
  font-size: 36px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(108, 92, 231, 0.5);
  background: rgba(0, 0, 0, 0.8);
  padding: 15px 30px;
  border-radius: 15px;
  border: 2px solid #6c5ce7;
  box-shadow: 0 0 20px rgba(108, 92, 231, 0.3);
`;

const HeaderImage = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 40px;
  img {
    height: 80px;
    width: auto;
  }
`;

const WalletContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
`;

interface HUDProps {
  score: number;
  currentAddress?: string;
}

const HUD: React.FC<HUDProps> = ({ score, currentAddress }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleConnect = () => {
    setIsWalletConnected(true);
  };

  return (
    <HUDContainer>
      <HeaderImage>
        <img src="https://i.ibb.co/tXJCGh5/Head-Liner.png" alt="Game Logo" />
      </HeaderImage>
      <WalletContainer>
        <WalletConnection 
          isConnected={isWalletConnected} 
          onConnect={handleConnect}
        />
      </WalletContainer>
      <Leaderboard 
        currentAddress={currentAddress}
        currentScore={score}
      />
      <Score>Score: {score}</Score>
    </HUDContainer>
  );
};

export default HUD;
