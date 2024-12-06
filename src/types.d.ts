declare module "@arweave/arweave-wallet" {
    interface ArweaveWalletApi {
        connect: (permissions: string[]) => Promise<void>;
        disconnect: () => Promise<void>;
        getActiveAddress: () => Promise<string>;
        getPermissions: () => Promise<string[]>;
        sign: (transaction: Transaction) => Promise<{ id: string }>;
        dispatch: (transaction: Transaction) => Promise<{ id: string }>;
    }
}

interface Transaction {
    addTag: (name: string, value: string) => void;
}

interface Tag {
    name: string;
    value: string;
}

interface TransactionEdge {
    node: {
        id: string;
        tags: Tag[];
    };
}

interface GraphQLResponse {
    data: {
        transactions: {
            edges: TransactionEdge[];
        };
    };
}

declare global {
    interface Window {
        arweaveWallet: import("@arweave/arweave-wallet").ArweaveWalletApi;
    }
}

export { Transaction, Tag, TransactionEdge, GraphQLResponse };
