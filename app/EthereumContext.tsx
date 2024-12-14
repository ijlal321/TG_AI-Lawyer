"use client"

import React, { createContext, useContext, useState } from "react";
import { WalletTgSdk } from '@uxuycom/web3-tg-sdk'

type Ethereum = any; // Replace `any` with the appropriate type for Ethereum

interface EthereumContextProps {
  ethereumState: Ethereum | null;
  address: string | null;
  connected: boolean;
  handleConnect: () => Promise<string | undefined>;
}

const EthereumContext = createContext<EthereumContextProps | undefined>(undefined);

export const EthereumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ethereumState, setEthereum] = useState<Ethereum | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  async function handleConnect(): Promise<string | undefined> {
    // setConnected(true);
    // return;
    try {
      const { ethereum }: { ethereum: Ethereum } = new WalletTgSdk({
        injected: true,
      });

      setEthereum(ethereum);

      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected account:", accounts[0]);
      setAddress(accounts[0]);
      setConnected(true);

      return accounts[0];
    } catch (error: unknown) {
      console.error("Failed to connect wallet:", error);
      alert(`Failed to connect wallet: ${(error as Error).message}`);
    }
  }

  return (
    <EthereumContext.Provider value={{ ethereumState, address, connected, handleConnect }}>
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = (): EthereumContextProps => {
  const context = useContext(EthereumContext);
  if (!context) {
    throw new Error("useEthereum must be used within an EthereumProvider");
  }
  return context;
};
