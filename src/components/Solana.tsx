"use client";

import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import * as dotenv from "dotenv";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const mainnetRPC = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC;

  const networkSelection = process.env.NEXT_PUBLIC_NETWORK_SELECTION;
  let network: any;
  if (networkSelection == "MAINNET") {
    network = WalletAdapterNetwork.Mainnet;
  } else if (networkSelection == "DEVNET") {
    network = WalletAdapterNetwork.Devnet;
  }

  const endpoint = useMemo(() => {
    if (network === WalletAdapterNetwork.Mainnet) {
      return mainnetRPC;
    }
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint || ""}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};