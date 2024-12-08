import { message, createDataItemSigner, dryrun } from "@permaweb/aoconnect";
import { LeaderboardEntry, LeaderboardState, PlayerData, GameStats, TotalGameStats } from "../types/leaderboard";
import { rateLimiter } from "./rateLimiter";

const PROCESS_ID = "iI1AHVB85pQ9_Y67TDPS52PXOjxZOxwNV55JZemYpxM";

export const submitScore = async (
    wallet: any,
    gameId: string,
    score: number,
    username?: string
): Promise<{ id: string }> => {
    try {
        const timestamp = new Date().toISOString();
        const result = await message({
            process: PROCESS_ID,
            tags: [
                { name: "Action", value: "submit-score" },
                { name: "Score", value: score.toString() },
                { name: "GameId", value: gameId },
                { name: "Username", value: username || "Anonymous" },
                { name: "WalletAddress", value: wallet.address },
                { name: "Timestamp", value: timestamp }
            ],
            signer: createDataItemSigner(window.arweaveWallet),
            data: "Submit score"
        });

        return { id: result };
    } catch (error) {
        console.error("Error submitting score:", error);
        throw error;
    }
};

export const getTopPlayers = async (
    gameId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<LeaderboardEntry[]> => {
    return rateLimiter.executeWithRateLimit(`topPlayers-${gameId}-${page}-${pageSize}`, async () => {
        try {
            const result = await dryrun({
                process: PROCESS_ID,
                tags: [
                    { name: "Action", value: "query-top-players" },
                    { name: "GameId", value: gameId },
                    { name: "Page", value: page.toString() },
                    { name: "PageSize", value: pageSize.toString() }
                ],
                data: ""
            });

            if (!result.Messages?.[0]?.Data) {
                throw new Error("Invalid response from leaderboard");
            }

            const response = JSON.parse(result.Messages[0].Data);
            if (!response.success) {
                throw new Error(response.error || "Failed to get top players");
            }

            const scores = Array.isArray(response.data) ? response.data : [];
            return scores.map((entry: any, index: number) => ({
                rank: index + 1,
                walletAddress: entry.walletAddress,
                username: entry.username || "Anonymous",
                score: Number(entry.score),
                timestamp: entry.timestamp,
                badge: index < 3 ? ["gold", "silver", "bronze"][index] as "gold" | "silver" | "bronze" : undefined
            }));
        } catch (error) {
            console.error("Error getting top players:", error);
            return [];
        }
    });
};

export const getPlayerHistory = async (
    walletAddress: string,
    gameId?: string,
    sortBy: string = "timestamp",
    page: number = 1,
    pageSize: number = 10
): Promise<PlayerData> => {
    return rateLimiter.executeWithRateLimit(
        `playerHistory-${walletAddress}-${gameId}-${page}-${pageSize}`,
        async () => {
            try {
                console.log('Getting player history for wallet:', walletAddress);
                console.log('Game ID:', gameId);
                const result = await dryrun({
                    process: PROCESS_ID,
                    tags: [
                        { name: "Action", value: "query-player-history" },
                        { name: "WalletAddress", value: walletAddress },
                        ...(gameId ? [{ name: "GameId", value: gameId }] : []),
                        { name: "SortBy", value: sortBy },
                        { name: "Page", value: page.toString() },
                        { name: "PageSize", value: pageSize.toString() }
                    ],
                    data: ""
                });

                if (!result.Messages?.[0]?.Data) {
                    console.warn('No messages received from leaderboard query');
                    throw new Error("Invalid response from leaderboard");
                }

                const response = JSON.parse(result.Messages[0].Data);
                console.log('Raw leaderboard response:', response);
                
                if (!response.success) {
                    console.error('Leaderboard query failed:', response.error);
                    throw new Error(response.error || "Failed to get player history");
                }

                const scores = Object.values(response.data || {});
                console.log('Retrieved scores:', scores);
                if (!Array.isArray(scores)) {
                    return {
                        walletAddress,
                        username: 'Unknown Player',
                        scores: [],
                        totalScore: 0
                    };
                }

                const playerScores = scores.map((entry: any) => ({
                    score: Number(entry.score),
                    timestamp: entry.timestamp
                }));

                return {
                    walletAddress,
                    username: scores[0]?.username || 'Unknown Player',
                    scores: playerScores,
                    totalScore: playerScores.reduce((sum, entry) => sum + entry.score, 0)
                };
            } catch (error) {
                console.error("Error getting player history:", error);
                return {
                    walletAddress,
                    username: 'Unknown Player',
                    scores: [],
                    totalScore: 0
                };
            }
        }
    );
};

export const getLeaderboardState = async (): Promise<LeaderboardState> => {
    try {
        const result = await dryrun({
            process: PROCESS_ID,
            tags: [{ name: "Action", value: "get-leaderboard-state" }],
            data: ""
        });

        if (!result.Messages?.[0]?.Data) {
            throw new Error("Invalid response from leaderboard");
        }

        const response = JSON.parse(result.Messages[0].Data);
        if (!response.success) {
            throw new Error(response.error || "Failed to get leaderboard state");
        }

        return {
            isLocked: response.data.isLocked,
            scoreCount: response.data.scoreCount,
            entries: [],
            lastUpdate: Date.now()
        };
    } catch (error) {
        console.error("Error getting leaderboard state:", error);
        return {
            isLocked: false,
            scoreCount: 0,
            entries: [],
            lastUpdate: Date.now()
        };
    }
};

export const getTotalPlayers = async (gameId: string): Promise<number> => {
    return rateLimiter.executeWithRateLimit(`totalPlayers-${gameId}`, async () => {
        try {
            const result = await dryrun({
                process: PROCESS_ID,
                tags: [
                    { name: "Action", value: "get-total-players" },
                    { name: "GameId", value: gameId }
                ],
                data: ""
            });

            if (!result.Messages?.[0]?.Data) {
                throw new Error("Invalid response from leaderboard");
            }

            const response = JSON.parse(result.Messages[0].Data);
            if (!response.success) {
                throw new Error(response.error || "Failed to get total players");
            }

            return response.data.totalPlayers;
        } catch (error) {
            console.error("Error getting total players:", error);
            return 0;
        }
    });
};

export const getGameStats = async (gameId: string): Promise<GameStats> => {
    try {
        console.log('Fetching game stats for gameId:', gameId);
        const result = await rateLimiter.executeWithRateLimit(`gameStats-${gameId}`, async () => {
            const res = await dryrun({
                process: PROCESS_ID,
                tags: [
                    { name: 'Action', value: 'query-game-stats' },
                    { name: 'GameId', value: gameId }
                ]
            });

            if (!res.Messages?.[0]?.Data) {
                console.error('Invalid game stats response:', res);
                throw new Error('Invalid response from leaderboard');
            }

            const data = JSON.parse(res.Messages[0].Data);
            console.log('Parsed response:', data);

            if (!data.success) {
                throw new Error(data.error || 'Failed to get game stats');
            }

            // The stats are in data.data, not data.stats
            const statsData = data.data || {};
            console.log('Stats data:', statsData);
            
            const result = {
                totalScore: statsData.totalScore || 0,
                totalplayers: statsData.totalplayers || 0,
                submissionCount: statsData.submissionCount || 0
            };
            
            console.log('Final result:', result);
            return result;
        });

        return result;
    } catch (error) {
        console.error('Error getting game stats:', error);
        return {
            totalScore: 0,
            totalplayers: 0,
            submissionCount: 0
        };
    }
};

export const getTotalGameStats = async (gameId: string): Promise<TotalGameStats> => {
    try {
        console.log('Fetching total game stats for gameId:', gameId);
        const result = await rateLimiter.executeWithRateLimit(`totalStats-${gameId}`, async () => {
            const res = await dryrun({
                process: PROCESS_ID,
                tags: [
                    { name: 'Action', value: 'query-game-stats' },
                    { name: 'GameId', value: gameId }
                ]
            });

            console.log('Raw total stats response:', res);
            
            if (!res.Messages?.[0]?.Data) {
                console.error('Invalid total stats response:', res);
                throw new Error('Invalid response from leaderboard');
            }

            const data = JSON.parse(res.Messages[0].Data);
            console.log('Parsed total stats data:', data);

            if (!data.success) {
                throw new Error(data.error || 'Failed to get total stats');
            }

            const stats = data.data || {};
            return {
                totalGames: stats.totalGames || 0,
                totalPlayers: stats.totalPlayers || 0,
                totalScore: stats.totalScore || 0
            };
        });

        console.log('Processed total game stats:', result);
        return result;
    } catch (error) {
        console.error('Error getting total game stats:', error);
        return {
            totalGames: 0,
            totalPlayers: 0,
            totalScore: 0
        };
    }
};

export const getRecentPlayers = async (
    gameId: string,
    limit: number = 5
): Promise<LeaderboardEntry[]> => {
    return rateLimiter.executeWithRateLimit(`recentPlayers-${gameId}-${limit}`, async () => {
        try {
            const result = await dryrun({
                process: PROCESS_ID,
                tags: [
                    { name: "Action", value: "query-last-players" },
                    { name: "GameId", value: gameId },
                    { name: "Limit", value: limit.toString() }
                ],
                data: ""
            });

            if (!result.Messages?.[0]?.Data) {
                throw new Error("Invalid response from leaderboard");
            }

            const response = JSON.parse(result.Messages[0].Data);
            if (!response.success) {
                throw new Error(response.error || "Failed to get recent players");
            }

            const entries = Object.values(response.data || {});
            const mappedEntries = entries.map((entry: any) => ({
                walletAddress: entry.walletAddress,
                username: entry.username || "Anonymous",
                score: Number(entry.score),
                timestamp: entry.timestamp,
                rank: 0 // Not relevant for recent players
            }));

            return mappedEntries;
        } catch (error) {
            console.error("Error getting recent players:", error);
            return [];
        }
    });
};
