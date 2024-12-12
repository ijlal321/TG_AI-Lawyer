"use client"

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/app/globals.css'
import { cn } from '@/lib/utils'
// import { ThemeToggle } from '@/components/theme-toggle'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { useState } from 'react'

import { WalletTgSdk } from '@uxuycom/web3-tg-sdk'

interface ChatbotProps {
  children: React.ReactNode
}

interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}


export default function Chatbot({ children }: ChatbotProps) {
  const [ethereumState, setEthereum] = useState<Ethereum | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);



  async function handleConnect(): Promise<string | undefined> {
    // setConnected(true);
    // return;
    try {
      const { ethereum }: { ethereum: Ethereum } = new WalletTgSdk({
        injected: true, // default: false
        // metaData: {
        //   name: "UXUY Wallet", // Custom name
        //   icon: "https://uxuy.com/logo.png", // Custom icon
        // },
      });

      // Assuming `setEthereum`, `setAddress`, `setConnected` are hooks/functions in your component.


      setEthereum(ethereum);

      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected account:", accounts[0]);
      setAddress(accounts[0]);
      setConnected(true);

      // await switchNetworkToBNBTestnet(ethereum);

      return accounts[0];
    } catch (error: unknown) {
      console.error("Failed to connect wallet:", error);
      alert(`Failed to connect wallet: ${(error as Error).message}`);
    }
  }


  return (
    <>
      {!connected &&
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <button  className="hover-black-button" onClick={handleConnect}>Click here to Connect to UXUY Wallet 😎😎</button>
        </div>}
      {
        connected &&
        <div>
          <h2 style={{textAlign:"center", padding:"0px 20px"}}>Connected Account {address}</h2>
          <hr></hr>
          {children}
        </div>
      }
    </>
  )
}
