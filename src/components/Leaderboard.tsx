import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const LeaderboardContainer = styled.div`
  position: fixed;
  top: 80px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 8px;
  color: white;
  z-index: 1000;
  min-width: 250px;
`;

const LeaderboardTitle = styled.h2`
  text-align: center;
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
  color: #4CAF50;
`;

const ScoreList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ScoreItem = styled.li<{ isCurrentPlayer: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 5px 0;
  background-color: ${props => props.isCurrentPlayer ? '#34495e' : 'transparent'};
  border-radius: 5px;
`;

const Address = styled.span`
  font-family: monospace;
`;

const Score = styled.span`
  font-weight: bold;
`;

interface Score {
  address: string;
  score: number;
  isCurrentPlayer: boolean;
}

interface LeaderboardProps {
  currentAddress?: string;
  currentScore?: number;
}

const GRAPHQL_ENDPOINT = 'https://arweave.net/graphql';

const Leaderboard: React.FC<LeaderboardProps> = ({ currentAddress, currentScore }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchScores = async () => {
    // Prevent too frequent refreshes (minimum 2 seconds between refreshes)
    const now = Date.now();
    if (now - lastFetchTime < 2000) return;
    setLastFetchTime(now);

    try {
      const query = `
        query {
          transactions(
            tags: [
              { name: "App-Name", values: ["ArPacMan"] },
              { name: "Type", values: ["game-score"] }
            ],
            first: 100
          ) {
            edges {
              node {
                owner {
                  address
                }
                tags {
                  name
                  value
                }
              }
            }
          }
        }
      `;

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          variables: {} 
        }),
      });

      const data = await response.json();

      if (data.errors) {
        setError('GraphQL query failed');
        setLoading(false);
        return;
      }

      if (!data.data?.transactions?.edges) {
        setError('Invalid data format received');
        setLoading(false);
        return;
      }

      // Process and aggregate scores
      const scoreMap = new Map<string, number>();
      
      try {
        data.data.transactions.edges.forEach((edge: any) => {
          if (!edge?.node?.owner?.address || !edge?.node?.tags) {
            return;
          }

          const address = edge.node.owner.address;
          const scoreTag = edge.node.tags.find((tag: any) => tag.name === 'Score');
          
          if (!scoreTag?.value) {
            return;
          }

          const score = parseInt(scoreTag.value, 10);
          if (isNaN(score)) {
            return;
          }

          // Sum up all scores for each address
          scoreMap.set(address, (scoreMap.get(address) || 0) + score);
        });

        // Add current score if it exists
        if (currentAddress && currentScore && currentScore > 0) {
          const totalScore = (scoreMap.get(currentAddress) || 0) + currentScore;
          scoreMap.set(currentAddress, totalScore);
        }

        // Convert to array and sort
        const sortedScores = Array.from(scoreMap.entries())
          .map(([address, score]) => ({
            address,
            score,
            isCurrentPlayer: currentAddress ? address === currentAddress : false
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        setScores(sortedScores);
        setLoading(false);
      } catch (err) {
        setError('Error processing scores');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load leaderboard');
      setLoading(false);
    }
  };

  // Fetch scores initially and when currentScore changes
  useEffect(() => {
    fetchScores();
  }, [currentScore]);

  // Also refresh periodically (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(fetchScores, 10000);
    return () => clearInterval(interval);
  }, []);

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (loading && scores.length === 0) return <LeaderboardContainer>Loading...</LeaderboardContainer>;
  if (error) return <LeaderboardContainer>{error}</LeaderboardContainer>;

  return (
    <LeaderboardContainer>
      <LeaderboardTitle>Leaderboard</LeaderboardTitle>
      <ScoreList>
        {scores.map((score, index) => (
          <ScoreItem key={score.address} isCurrentPlayer={score.isCurrentPlayer}>
            <span>{index + 1}. <Address>{truncateAddress(score.address)}</Address></span>
            <Score>{score.score}</Score>
          </ScoreItem>
        ))}
      </ScoreList>
    </LeaderboardContainer>
  );
};

export default Leaderboard;
