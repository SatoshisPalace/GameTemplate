import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LeaderboardEntry, PlayerData, GameStats, TotalGameStats } from '../types/leaderboard';
import { getTopPlayers, getPlayerHistory, getGameStats, getRecentPlayers, getTotalGameStats } from '../utils/leaderboard';
import WalletConnection from './WalletConnection';

const LeaderboardContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 400px;
  height: 100vh;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5vh;
  color: white;
  overflow-y: auto;
  z-index: 1000;
  backdrop-filter: blur(10px);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const Section = styled.div`
  padding: 1.5vh;
  background: rgba(20, 20, 20, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 1.5vh;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: #fff;
  font-size: 1.2em;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 1vh;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ScrollableList = styled.div`
  height: 25vh;
  overflow-y: auto;
  padding-right: 0.5vh;
  margin: 0.5vh 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const PlayerEntry = styled.div<{ $highlight?: boolean }>`
  display: flex;
  align-items: center;
  padding: 1vh;
  background: ${props => props.$highlight 
    ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)'
    : 'linear-gradient(90deg, rgba(40, 40, 40, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%)'};
  border-radius: 6px;
  margin-bottom: 0.5vh;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    transform: translateX(2px);
    background: ${props => props.$highlight 
      ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%)'
      : 'linear-gradient(90deg, rgba(60, 60, 60, 0.9) 0%, rgba(50, 50, 50, 0.9) 100%)'};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; /* For text truncation */
`;

const PlayerName = styled.span`
  font-weight: 600;
  color: #fff;
  margin-right: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const PlayerAddress = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
  font-family: monospace;
`;

const PlayerScore = styled.span`
  font-weight: 600;
  color: #fff;
  text-align: right;
  margin-left: auto;
  padding-left: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const RankCell = styled.td`
  padding: 8px;
  text-align: center;
`;

const ScoreCell = styled.td`
  padding: 8px;
  text-align: right;
`;

const UsernameCell = styled.td`
  padding: 8px;
  text-align: left;
`;

const BadgeSpan = styled.span`
  margin-left: 8px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatBox = styled.div`
  background: linear-gradient(180deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 20, 0.9) 100%);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:last-child {
    grid-column: span 3;
  }

  .value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .label {
    font-size: 0.9rem;
    color: #888;
    text-transform: uppercase;
  }

  /* Special styling for total score box */
  &:last-child .value {
    font-size: 1.4rem;
    padding: 8px 0;
  }
`;

const RecentActivityContainer = styled.div`
  background: rgba(20, 20, 20, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5vh;

  h3 {
    font-size: 1.2em;
    font-weight: 600;
    margin: 0 0 1vh 0;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

const RecentPlayer = styled.div<{ $isNew?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh;
  background: linear-gradient(90deg, rgba(40, 40, 40, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%);
  border-radius: 6px;
  margin-bottom: 0.5vh;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  ${props => props.$isNew && `
    animation: glowingGold 3s ease-out forwards;
    @keyframes glowingGold {
      0% {
        background: linear-gradient(90deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0.3) 100%);
        border-color: rgba(255, 215, 0, 0.6);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
        transform: translateX(0);
      }
      10% {
        transform: translateX(4px);
      }
      20% {
        transform: translateX(0);
      }
      100% {
        background: linear-gradient(90deg, rgba(40, 40, 40, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%);
        border-color: rgba(255, 255, 255, 0.05);
        box-shadow: none;
        transform: translateX(0);
      }
    }
  `}

  &:hover {
    transform: translateX(2px);
    background: linear-gradient(90deg, rgba(60, 60, 60, 0.9) 0%, rgba(50, 50, 50, 0.9) 100%);
  }

  &:last-child {
    margin-bottom: 0;
  }

  .username {
    font-weight: 600;
    color: #fff;
    margin-right: 12px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .score {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  .time {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9em;
  }
`;

const Rank = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  color: ${props => props.color || '#fff'};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-right: 1vh;
  min-width: 2em;
`;

const Score = styled.div`
  font-size: 1.1em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Username = styled.div`
  flex: 1;
  margin: 0 1vh;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Badge = styled.span<{ type: 'gold' | 'silver' | 'bronze' }>`
  color: ${props => ({
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32'
  }[props.type])};
  margin-right: 8px;
`;

const PlayerNameAndWallet = styled.div`
  display: flex;
  align-items: center;
`;

const ConnectWalletPrompt = styled.div`
  text-align: center;
  padding: 20px;
  background: rgba(108, 92, 231, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;

  p {
    color: #a8a8b3;
    margin-bottom: 15px;
  }
`;

const NoScoresMessage = styled.div`
  text-align: center;
  padding: 15px;
  color: #a8a8b3;
  font-size: 0.9em;
  background: rgba(108, 92, 231, 0.05);
  border-radius: 8px;
  margin: 10px 0;
`;

const TotalStats = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: rgba(108, 92, 231, 0.1);
  border-radius: 8px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8vh 1vh;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 6px;
  margin-bottom: 0.5vh;
  border: 1px solid rgba(255, 255, 255, 0.03);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(2px);
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  }

  &:last-child {
    margin-bottom: 0;
  }

  span {
    &:first-child {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9em;
      font-weight: 500;
    }

    &:last-child {
      color: #fff;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
`;

interface LeaderboardProps {
  gameId: string;
  currentAddress?: string;
  currentScore?: number;
  isWalletConnected: boolean;
  onConnect: (connected: boolean) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  gameId, 
  currentAddress,
  currentScore,
  isWalletConnected,
  onConnect
}) => {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [recentPlayers, setRecentPlayers] = useState<LeaderboardEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerData | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [totalStats, setTotalStats] = useState<TotalGameStats>({
    totalGames: 0,
    totalPlayers: 0,
    totalScore: 0
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const shortenWalletAddress = (address: string) => {
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  const formatScore = (score: number) => {
    return score.toLocaleString('en-US');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Address copied to clipboard');
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const fetchData = async () => {
    try {
      console.log('Fetching leaderboard data with address:', currentAddress);
      const [players, recent, stats, totalStatsData] = await Promise.all([
        getTopPlayers(gameId),
        getRecentPlayers(gameId),
        getGameStats(gameId),
        getTotalGameStats(gameId)
      ]);

      console.log('Recent players data from API:', recent);

      if (currentAddress) {
        console.log('Fetching player history for address:', currentAddress);
        const playerData = await getPlayerHistory(currentAddress, gameId);
        console.log('Player history:', playerData);
        setPlayerStats(playerData);
      }

      setTopPlayers(players);
      setRecentPlayers(recent);
      setGameStats(stats);
      setTotalStats(totalStatsData);
      setLastUpdate(Date.now());
      setError(null);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getBadgeType = (index: number): "gold" | "silver" | "bronze" | undefined => {
    if (index < 3) {
      return ['gold', 'silver', 'bronze'][index] as "gold" | "silver" | "bronze";
    }
    return undefined;
  };

  // Fetch data when wallet connects or changes
  useEffect(() => {
    if (currentAddress) {
      console.log('Wallet address changed, fetching new data:', currentAddress);
      fetchData();
    }
  }, [currentAddress]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchData();
      setInitialLoading(false);
    };
    loadInitialData();
  }, []);

  // Regular updates for data and time display
  useEffect(() => {
    const fetchInterval = setInterval(fetchData, 10000); // Fetch every 10 seconds
    const updateInterval = setInterval(() => setLastUpdate(Date.now()), 1000); // Update time display every second
    
    return () => {
      clearInterval(fetchInterval);
      clearInterval(updateInterval);
    };
  }, []);

  if (error) {
    return <LeaderboardContainer>Error: {error}</LeaderboardContainer>;
  }

  if (initialLoading) {
    return <LeaderboardContainer>Loading leaderboard...</LeaderboardContainer>;
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 15) {
      return 'just now';
    }
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  };

  const RecentActivity: React.FC<{ recent: LeaderboardEntry[], gameStats: GameStats | null, topPlayers: LeaderboardEntry[] }> = ({ recent, gameStats, topPlayers }) => {
    const [, forceUpdate] = useState({});

    // Force update every second to keep time displays current
    useEffect(() => {
      const timer = setInterval(() => {
        forceUpdate({});
      }, 1000);
      
      return () => clearInterval(timer);
    }, []);

    const recentEntries = Object.values(recent)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return (
      <RecentActivityContainer>
        <h3>Recent Activity</h3>
        <StatsContainer>
          <StatBox>
            <div className="value">{totalStats.totalGames.toLocaleString()}</div>
            <div className="label">Total Games</div>
          </StatBox>
          <StatBox>
            <div className="value">{totalStats.totalPlayers.toLocaleString()}</div>
            <div className="label">Total Players</div>
          </StatBox>
          <StatBox>
            <div className="value">{totalStats.totalScore.toLocaleString()}</div>
            <div className="label">Total Score</div>
          </StatBox>
        </StatsContainer>
        {recentEntries.length > 0 ? (
          recentEntries.map((player) => {
            const entryDate = new Date(player.timestamp);
            const timeAgo = formatTimeAgo(entryDate);
            const isJustNow = timeAgo === 'just now';
            
            return (
              <RecentPlayer 
                key={`${player.walletAddress}-${player.timestamp}`}
                $isNew={isJustNow}
              >
                <div>
                  <span className="username">{player.username}</span>
                  <span className="score">Score: {formatScore(player.score)}</span>
                </div>
                <div className="time">{timeAgo}</div>
              </RecentPlayer>
            );
          })
        ) : (
          <div>No recent activity</div>
        )}
      </RecentActivityContainer>
    );
  };

  return (
    <LeaderboardContainer>
      <Section>
        <SectionTitle>Your Stats</SectionTitle>
        {!isWalletConnected ? (
          <ConnectWalletPrompt>
            <p>Connect your wallet to track your scores and compete on the leaderboard!</p>
            <WalletConnection 
              isConnected={isWalletConnected}
              onConnect={onConnect}
            />
          </ConnectWalletPrompt>
        ) : (
          <>
            {!playerStats || playerStats.scores.length === 0 ? (
              <NoScoresMessage>
                No scores found yet. Play your first game to join the leaderboard!
              </NoScoresMessage>
            ) : (
              <>
                <StatRow>
                  <span>Games Played:</span>
                  <span>{playerStats.scores.length}</span>
                </StatRow>
                <StatRow>
                  <span>Highest Score:</span>
                  <span>{formatScore(Math.max(...playerStats.scores.map(s => s.score)))}</span>
                </StatRow>
                <StatRow>
                  <span>Total Score:</span>
                  <span>{formatScore(playerStats.totalScore)}</span>
                </StatRow>
              </>
            )}
          </>
        )}
      </Section>

      <Section>
        <SectionTitle>Top Players</SectionTitle>
        <ScrollableList>
          {topPlayers.map((player, index) => (
            <PlayerEntry key={index} $highlight={player.walletAddress === currentAddress}>
              <PlayerInfo>
                <PlayerName>{player.username || 'Anonymous'}</PlayerName>
                <PlayerAddress onClick={() => copyToClipboard(player.walletAddress)}>{shortenWalletAddress(player.walletAddress)}</PlayerAddress>
              </PlayerInfo>
              <PlayerScore>{formatScore(player.score)}</PlayerScore>
            </PlayerEntry>
          ))}
        </ScrollableList>
      </Section>

      <RecentActivity 
        recent={recentPlayers} 
        gameStats={gameStats}
        topPlayers={topPlayers}
      />
    </LeaderboardContainer>
  );
};

export default Leaderboard;
