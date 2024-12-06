import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const WalletButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(108, 92, 231, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(108, 92, 231, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: rgba(168, 168, 168, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const WalletStatus = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  color: #a8a8a8;
  font-size: 0.8rem;
  z-index: 1000;
`;

interface WalletConnectionProps {
  onConnect: () => void;
  isConnected: boolean;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnect, isConnected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.arweaveWallet) {
        try {
          const address = await window.arweaveWallet.getActiveAddress();
          if (address) {
            setWalletAddress(address);
            onConnect();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();
  }, [onConnect]);

  const connectWallet = async () => {
    if (!window.arweaveWallet) {
      alert('Please install ArConnect to play!');
      window.open('https://arconnect.io', '_blank');
      return;
    }

    setIsLoading(true);
    try {
      await window.arweaveWallet.connect([
        'ACCESS_ADDRESS',
        'SIGN_TRANSACTION',
        'DISPATCH'
      ]);
      
      const address = await window.arweaveWallet.getActiveAddress();
      setWalletAddress(address);
      onConnect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (window.arweaveWallet) {
      try {
        await window.arweaveWallet.disconnect();
        setWalletAddress('');
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
  };

  return (
    <>
      <WalletButton 
        onClick={isConnected ? disconnectWallet : connectWallet}
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
      </WalletButton>
      {walletAddress && (
        <WalletStatus>
          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </WalletStatus>
      )}
    </>
  );
};

export default WalletConnection;
