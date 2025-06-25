"use client";

import {
    Keypair,
    LAMPORTS_PER_SOL,
    StakeProgram,
    Authorized,
    Lockup,
    PublicKey,
    Transaction,
  } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";

export const Staking = () => {
    const { publicKey, wallet, connected, sendTransaction, signTransaction } = useWallet();
    const { connection } = useConnection();
    const [inputValidatorPubkey, setInputValidatorPubkey] = useState("");
    const [inputAmountToStake, setInputAmountToStake] = useState(0.003);
    const [inputStakeAccountToUnstake, setInputStakeAccountToUnstake] = useState("");
    const [minimumStakeAmount, setMinimumStakeAmount] = useState(0);
    const [stakeAndDelegateSignatureResponse, setStakeAndDelegateSignatureResponse] = useState("");
    const [stakeAccountDisplay, setStakeAccountDisplay] = useState("");
    const [unstakeSignatureResponse, setUnstakeSignatureResponse] = useState("");
    const [withdrawSignatureResponse, setWithdrawSignatureResponse] = useState("");
    let blockExplorerSuffix: any;
    const networkSelection = process.env.NEXT_PUBLIC_NETWORK_SELECTION;
    if (networkSelection == "MAINNET") {
        blockExplorerSuffix = "";
    } else if (networkSelection == "DEVNET") {
        blockExplorerSuffix = "?cluster=devnet";
    }

    async function handleRefreshMinimumStake() {
        const stakeAccountSpace = StakeProgram.space;
        const minimumStakeLamports = await connection.getMinimumBalanceForRentExemption(stakeAccountSpace);
        setMinimumStakeAmount(minimumStakeLamports);
    }
    
    async function handleStakeAndDelegateTx() {
        // STAKE + DELEGATE
        if (inputValidatorPubkey === "") {
            alert("Error: Please input a validator public key");
            return;
        }
        
        const stakeAccountSpace = StakeProgram.space;
        const minimumStakeLamports = await connection.getMinimumBalanceForRentExemption(stakeAccountSpace);
        setMinimumStakeAmount(minimumStakeLamports);
        if (inputAmountToStake < minimumStakeLamports / LAMPORTS_PER_SOL) {
            alert("Error: Amount to stake is less than the minimum stake amount");
            return;
        }
        const amountToStake = inputAmountToStake * LAMPORTS_PER_SOL;
        // CREATE KEYPAIR FOR STAKE ACCOUNT
        const stakeAccount = Keypair.generate();
        
        if (!publicKey || !sendTransaction || !signTransaction) {
            console.error("Wallet not connected or sendTransaction/signTransaction not available");
            return;
        }
        
        const createStakeAccountTx = StakeProgram.createAccount({
            authorized: new Authorized(publicKey, publicKey),
            fromPubkey: publicKey,
            lamports: amountToStake,
            lockup: new Lockup(0, 0, publicKey),
            stakePubkey: stakeAccount.publicKey,
        });
        const delegateTx = StakeProgram.delegate({
            stakePubkey: stakeAccount.publicKey,
            authorizedPubkey: publicKey,
            votePubkey: new PublicKey(inputValidatorPubkey),
        });


        try {
            const combinedTx = new Transaction().add(
                createStakeAccountTx,
                delegateTx
            );

            // BLOCKHASH AND FEE PAYER
            const latestBlockhash = await connection.getLatestBlockhash();
            combinedTx.recentBlockhash = latestBlockhash.blockhash;
            combinedTx.feePayer = publicKey;

            combinedTx.sign(stakeAccount);
            
            const combinedSignature = await sendTransaction(combinedTx, connection);
            console.log("combined siganature:", combinedSignature);
            setStakeAndDelegateSignatureResponse(combinedSignature);
            setStakeAccountDisplay(stakeAccount.publicKey.toString());
        } catch (error) {
            console.error("Transaction failed:", error);
        }
        // END OF STAKE + DELEGATE
    }
    
    async function handleUnstakeTx() {
        // UNSTAKE
        if (!publicKey) {
            console.error("Wallet not connected");
            return;
        }
        const selectedStakeAccount = new PublicKey(inputStakeAccountToUnstake);
        
        const deactivateTx = StakeProgram.deactivate({
            stakePubkey: selectedStakeAccount,
            authorizedPubkey: publicKey,
        });

        try {
            // BLOCKHASH AND FEE PAYER
            const latestBlockhash = await connection.getLatestBlockhash();
            deactivateTx.recentBlockhash = latestBlockhash.blockhash;
            deactivateTx.feePayer = publicKey;
            
            const combinedUnstakeSignature = await sendTransaction(deactivateTx, connection);
            console.log("unstake signature:", combinedUnstakeSignature);
            setUnstakeSignatureResponse(combinedUnstakeSignature);
        } catch (error) {
            console.error("Transaction failed:", error);
        }
        // END OF UNSTAKE
    }

    async function handleWithdrawTx() {

        // WITHDRAW
        if (!publicKey) {
            console.error("Wallet not connected");
            return;
        }
        const selectedStakeAccount = new PublicKey(inputStakeAccountToUnstake);

        // DYNAMIC WITHDRAW AMOUNT BASE ON THE TOTAL AMOUNT OF SOL IN THE STAKE ACCOUNT
        const stakeBalance = await connection.getBalance(selectedStakeAccount);

        const withdrawTx = StakeProgram.withdraw({
            stakePubkey: selectedStakeAccount,
            authorizedPubkey: publicKey,
            toPubkey: publicKey,
            lamports: stakeBalance,
        });

        try {
            // BLOCKHASH AND FEE PAYER
            const latestBlockhash = await connection.getLatestBlockhash();
            withdrawTx.recentBlockhash = latestBlockhash.blockhash;
            withdrawTx.feePayer = publicKey;

            const withdrawSignature = await sendTransaction(withdrawTx, connection);
            console.log("withdraw signature:", withdrawSignature);
            setWithdrawSignatureResponse(withdrawSignature);
        } catch (error) {
            console.error("Transaction failed:", error);
        }

        // END OF WITHDRAW
        return;
    }

        
        return (
            <div>
            <hr className="border-3 border-black mt-20" />
            <h1 className="text-4xl font-bold mt-8">Staking Component</h1>
            <h2>
                <br/>
                <p className="italic">Hint: You may copy and paste the validator pubkey from the toggle lists button above.</p>
                <br/>

                <p className="font-bold">Enter validator pubkey from the above validator list</p>
                <input
                className="bg-white border border-black rounded-md p-2 w-100"
                type="text" placeholder="Enter validator pubkey from the above validator list"
                value={inputValidatorPubkey}
                onChange={(e) => setInputValidatorPubkey(e.target.value)}
                />
                <br/>
                <p className="font-bold">Enter amount to stake</p>
                <div className="border border-black rounded-md p-2 bg-white">
                <p className="font-bold">Caution: Minimum amount to stake is {minimumStakeAmount / LAMPORTS_PER_SOL} SOL</p>
                <button className="bg-[#7fff7e] text-black p-2 rounded-md border border-black cursor-pointer" onClick={() => handleRefreshMinimumStake()}>
                    Refresh minimum stake amount
                </button>
                </div>
                <br/>
                <input
                className="bg-white border border-black rounded-md p-2 w-100"
                type="number" placeholder="Enter amount to stake"
                value={inputAmountToStake}
                onChange={(e) => setInputAmountToStake(Number(e.target.value))}
                />
                
                <br/>

                <button
                className="bg-[#512da8] text-white p-2 rounded-md mt-2 cursor-pointer"
                onClick={() => handleStakeAndDelegateTx()}>
                    Stake + Delegate
                </button>

                {stakeAndDelegateSignatureResponse && (
                    <div className="font-bold">
                        <p>Stake and Delegate Transaction Signature: {stakeAndDelegateSignatureResponse}</p>
                        <p><a href={`https://explorer.solana.com/tx/${stakeAndDelegateSignatureResponse}${blockExplorerSuffix}`} target="_blank" rel="noopener noreferrer">
                        https://explorer.solana.com/tx/{stakeAndDelegateSignatureResponse}{blockExplorerSuffix}
                        </a></p>
                        <br/>
                        <p>Stake account public key: {stakeAccountDisplay}</p>
                    </div>
                )}
            </h2>

            <hr className="border-3 border-black mt-20" />
            <h1 className="text-4xl font-bold mt-8">Unstake Component</h1>
            <h2 className="mb-20">
                <p className="font-bold">Enter the staked stake account public key that you want to unstake</p>
                <input
                className="bg-white border border-black rounded-md p-2 w-150"
                type="text" placeholder="Enter the staked stake account public key that you want to unstake"
                value={inputStakeAccountToUnstake}
                onChange={(e) => setInputStakeAccountToUnstake(e.target.value)}
                />
                <br/>
                <button className="bg-[#512da8] text-white p-2 rounded-md mt-2 cursor-pointer" onClick={() => handleUnstakeTx()}>
                    Undelegate
                </button>
                <br/>
                {unstakeSignatureResponse && (
                    <div className="font-bold">
                        <p>Unstake Transaction Signature: {unstakeSignatureResponse}</p>
                        <p><a href={`https://explorer.solana.com/tx/${unstakeSignatureResponse}${blockExplorerSuffix}`} target="_blank" rel="noopener noreferrer">
                        https://explorer.solana.com/tx/{unstakeSignatureResponse}{blockExplorerSuffix}
                        </a></p>
                    </div>
                )}

                <br/>
                <p className="font-bold">Withdraw can be done if the stake account is not delegated to a validator. You can use the same input box above.</p>
                <button className="bg-[#512da8] text-white p-2 rounded-md mt-2 cursor-pointer" onClick={() => handleWithdrawTx()}>
                    Withdraw
                </button>
                <br/>
                {withdrawSignatureResponse && (
                    <div className="font-bold">
                        <p>Withdraw Transaction Signature: {withdrawSignatureResponse}</p>
                        <p><a href={`https://explorer.solana.com/tx/${withdrawSignatureResponse}${blockExplorerSuffix}`} target="_blank" rel="noopener noreferrer">
                        https://explorer.solana.com/tx/{withdrawSignatureResponse}{blockExplorerSuffix}
                        </a></p>
                    </div>
                )}

            </h2>
        </div>
    )
}