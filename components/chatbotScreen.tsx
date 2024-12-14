"use client"

import { useRouter } from 'next/navigation';
import '@/app/globals.css'
import { useEthereum } from "@/app/EthereumContext";
import { useState } from 'react';


interface ChatbotProps {
  children: React.ReactNode
}

interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}


export default function Chatbot({ children }: ChatbotProps) {

  const { ethereumState, address, connected, handleConnect } = useEthereum();
  const [currentDemoText, setCurrentDemoText] = useState("File Sharing Demo"); 
  const router = useRouter();

  const handleRoutingButton = ()=>{
    if (window.location.pathname != "/file-share"){
      router.push('/file-share')
      setCurrentDemoText("Chatbot Demo")
    }
    else{
      router.push('/')
      setCurrentDemoText("File Sharing Demo")
    }
  }
  return (
    <>
      {!connected &&
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <button className="hover-black-button" onClick={handleConnect}>Click here to Connect to UXUY Wallet 😎😎</button>
        </div>}
      {
        connected &&
        <div>
          <h2 style={{ textAlign: "center", padding: "0px 0px" }}>Connected Account {address}</h2>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" , height:"auto"}}>
            <button className="hover-black-button" onClick={handleRoutingButton}>{currentDemoText}</button>
          </div>
          <hr></hr>
          {children}
        </div>
      }
    </>
  )
}
