import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';

export const WalletConnectButton = styled.button<{ $fixed?: boolean }>`
  ${props => props.$fixed ? `
    position: fixed;
    top: 20px;
    right: 20px;
  ` : ''}
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

const WalletAddress = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  background: rgba(108, 92, 231, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;

  &:hover {
    background: rgba(108, 92, 231, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface WalletConnectionProps {
  onConnect?: (connected: boolean) => void;
  isConnected?: boolean;
  fixed?: boolean;
  onWalletUpdate?: (wallet: any) => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  onConnect, 
  isConnected,
  fixed = true,
  onWalletUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(isConnected || false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Address copied to clipboard');
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const updateWalletState = useCallback((walletAddress: string) => {
    setConnected(true);
    setAddress(walletAddress);
    onConnect?.(true);
    onWalletUpdate?.({ address: walletAddress });
  }, [onConnect, onWalletUpdate]);

  useEffect(() => {
    let mounted = true;
    
    const checkWalletConnection = async () => {
      if (window.arweaveWallet) {
        try {
          const address = await window.arweaveWallet.getActiveAddress();
          if (address && mounted) {
            updateWalletState(address);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();
    return () => { mounted = false; };
  }, [updateWalletState]);

  const connectWallet = useCallback(async () => {
    if (!window.arweaveWallet) {
      setError('ArConnect not found. Please install ArConnect extension.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
      const address = await window.arweaveWallet.getActiveAddress();
      
      if (address) {
        updateWalletState(address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [updateWalletState]);

  const disconnectWallet = useCallback(async () => {
    if (window.arweaveWallet) {
      try {
        await window.arweaveWallet.disconnect();
        setConnected(false);
        onConnect?.(false);
        onWalletUpdate?.(null);
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
  }, [onConnect, onWalletUpdate]);

  return (
    <>
      <WalletConnectButton
        $fixed={fixed}
        onClick={connected ? disconnectWallet : connectWallet}
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : connected ? 'Disconnect' : 'Connect Wallet'}
      </WalletConnectButton>
      {connected && address && (
        <WalletAddress onClick={() => copyToClipboard(address)} title="Click to copy">
          {shortenAddress(address)}
        </WalletAddress>
      )}
      {error && (
        <WalletStatus>
          {error}
        </WalletStatus>
      )}
    </>
  );
};

export default WalletConnection;
