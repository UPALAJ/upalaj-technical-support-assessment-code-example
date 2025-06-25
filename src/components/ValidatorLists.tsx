import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

export const ValidatorLists = () => {
  const [validators, setValidators] = useState<{ current: any[], delinquent: any[] }>({ current: [], delinquent: [] });
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();

  useEffect(() => {
    const fetchValidators = async () => {
      try {
        const { current, delinquent } = await connection.getVoteAccounts();
        
        setValidators({ current, delinquent });
      } catch (error) {
        console.error("Error fetching validators:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchValidators();
  }, [connection]);

  // SOL amount
  const formatSolAmount = (lamports: number) => {
    const sol = lamports / LAMPORTS_PER_SOL;
    return sol.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (loading) {
    return <div>Loading validators...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">
        Validator List
      </h2>
      <h2 className="text-2xl font-bold mb-4">
        Total: {validators.current.length + validators.delinquent.length} Validators
        <br/>
        Good Validators: {validators.current.length}
      </h2>
        <div>
          <h3 className="text-lg font-semibold mb-2">Below are the good validators</h3>
          <h3 className="text-lg mb-2 italic">Sorted by Staked Amount</h3>
          <ul className="space-y-2">
            {validators.current
              .sort((a, b) => b.activatedStake - a.activatedStake)
              .map((validator, index) => (
              <li key={index} className="text-sm text-green-600 border border-black rounded p-2">
                <div className="font-medium">{validator.votePubkey}</div>
                <div className="text-xs text-gray-600">
                  Staked: {formatSolAmount(validator.activatedStake)} SOL
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
  );
};