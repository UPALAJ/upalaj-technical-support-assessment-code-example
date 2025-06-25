"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const WalletConnection = () => {
  const { publicKey, connected } = useWallet();

  return (
    <div className="flex flex-col items-center space-y-4">
      <WalletMultiButton />
      {connected && publicKey && (
        <div className="text-center">
          <p className="text-lg mb-2">Connected Wallet:</p>
          <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {publicKey.toString()}
          </p>
        </div>
      )}
    </div>
  );
}; 