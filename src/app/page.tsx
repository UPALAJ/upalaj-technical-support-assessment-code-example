"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletConnection } from "../components/WalletConnection";
import { WalletInfo } from "../components/WalletInfo";
import { ValidatorLists } from "../components/ValidatorLists";
import { useState } from "react";
import { Staking } from "../components/Staking";

export default function Home() {
  const { connected } = useWallet();
  const [toggleValidatorList, setToggleValidatorList] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Solana Staking dApp Demo</h1>
      <WalletConnection />
      <div className="mt-8">
        <WalletInfo />
      </div>
      {connected && (<button className="bg-[#512da8] text-white p-2 rounded-md mt-8 cursor-pointer"
      onClick={() => setToggleValidatorList(!toggleValidatorList)}>
        Click here to toggle validator lists
      </button>)}
      {connected && toggleValidatorList && (
        <div className="fixed right-0 top-0 h-screen w-1/3 overflow-y-auto p-4 bg-white shadow-lg">
          <ValidatorLists />
        </div>
      )}

      <div>
        {connected && (
          <Staking />
        )}
      </div>
    </div>
  );
}