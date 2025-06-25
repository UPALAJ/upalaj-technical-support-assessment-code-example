"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export const WalletInfo = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await connection.getVersion();
        setIsConnected(true);
        setError(null);
      } catch (error) {
        console.error("Connection failed:", error);
        setIsConnected(false);
        setError("Failed to connect to network. Please check your connection.");
      }
    };

    checkConnection();
  }, [connection]);

  useEffect(() => {
    const getNetworkInfo = async () => {
      try {
        const endpoint = connection.rpcEndpoint;
        // OPTIONAL: FOR MASKING RPC ENDPOINT
        const maskedEndpoint = endpoint.replace(
          /https:\/\/solana-mainnet\.g\.alchemy\.com\/v2\/[^/]+/,
          'https://solana-mainnet.g.alchemy.com/v2/XXXXXX'
        );
        setNetwork(maskedEndpoint);
        // END OF MASKING RPC
      } catch (error) {
        console.error("Error getting network info:", error);
        setNetwork("Unknown");
      }
    };

    getNetworkInfo();
  }, [connection]);

  useEffect(() => {
    const getBalance = async () => {
      if (!connected || !publicKey || !isConnected) {
        setBalance(null);
        return;
      }

      try {
        setError(null);
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error getting balance:", error);
        setBalance(null);
        setError("Failed to fetch balance. Please try again.");
      }
    };

    getBalance();

    const refreshInterval = connection.rpcEndpoint.includes("mainnet") ? 30000 : 10000;
    const interval = setInterval(getBalance, refreshInterval);
    
    return () => clearInterval(interval);
  }, [connection, publicKey, connected, isConnected]);

  if (!isConnected) {
    return (
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-red-600">Network Connection Failed</h2>
        <p className="text-gray-600">{error || "Unable to connect to Solana network"}</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Connect your wallet first</h2>
        <p className="text-gray-600">Connect your wallet to see balance</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-2">
      <h2 className="text-xl font-semibold">Network RPC Endpoint: {network}</h2>
      {error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : (
        <h2 className="text-xl font-semibold">
          Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
        </h2>
      )}
    </div>
  );
}; 