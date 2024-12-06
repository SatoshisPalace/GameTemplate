import { useState } from 'react';
import Arweave from 'arweave';

// Initialize Arweave
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

interface GameMetadata {
    gameType: string;
    finalScore: number;
    timestamp: number;
}

export const useArweaveScore = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dispatchGameScore = async (score: number, metadata: GameMetadata): Promise<string | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // Create the transaction with the game score data
            const tx = await arweave.createTransaction({
                data: JSON.stringify({
                    ...metadata,
                    score
                })
            });

            // Add tags to identify this transaction
            tx.addTag('App-Name', 'ArPong');
            tx.addTag('Content-Type', 'application/json');
            tx.addTag('Type', 'game-score');
            tx.addTag('Game-Type', metadata.gameType);
            tx.addTag('Score', score.toString());
            tx.addTag('Version', '1.0.0');

            // Use the browser wallet to dispatch the transaction
            const result = await window.arweaveWallet.dispatch(tx);
            
            setIsLoading(false);
            return result.id;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to dispatch score';
            setError(errorMessage);
            setIsLoading(false);
            return null;
        }
    };

    return {
        dispatchGameScore,
        isLoading,
        error
    };
};