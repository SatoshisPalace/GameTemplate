import React, { useCallback } from 'react';
import styled from 'styled-components';
import WalletConnection from './WalletConnection';

const HUDContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  z-index: 100;
`;

const WalletContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
`;

const ScoreDisplay = styled.div`
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
  z-index: 90;
`;

interface HUDProps {
  score: number;
  currentAddress: string;
  onWalletUpdate?: (wallet: any) => void;
}

const HUD: React.FC<HUDProps> = React.memo(({ score, currentAddress, onWalletUpdate }) => {
  const handleWalletUpdate = useCallback((wallet: any) => {
    onWalletUpdate?.(wallet);
  }, [onWalletUpdate]);
  
  return (
    <HUDContainer>
      <WalletContainer>
        <WalletConnection 
          fixed 
          onWalletUpdate={handleWalletUpdate}
          isConnected={!!currentAddress}
        />
      </WalletContainer>
      <ScoreDisplay>Score: {score.toLocaleString()}</ScoreDisplay>
    </HUDContainer>
  );
}, (prevProps, nextProps) => {
  return prevProps.score === nextProps.score && 
         prevProps.currentAddress === nextProps.currentAddress;
});

export default HUD;
