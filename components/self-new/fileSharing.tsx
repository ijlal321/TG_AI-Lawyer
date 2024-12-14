"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useEthereum } from "@/app/EthereumContext";
import { useEffect } from 'react';
import { previousDay } from 'date-fns';

// import {PadoNetworkContractClient} from '@padolabs/pado-network-sdk'


export default function fileSharing() {
    const router = useRouter();
    const [uploadData, setUploadData] = useState({
        "3749182650": "This is your confidential case data. Handle with care.",
        "1847265093": "Please ensure the privacy of this sensitive legal information.",
        "5067298134": "This document contains privileged attorney-client communications.",
        "9283746102": "Keep this file secure as it contains confidential legal material.",
        "6138492057": "This data is for authorized legal personnel only. Do not disclose."
    });

    const [curInput, setInput] = useState("");
    const [newlyGeneratedId, setNewlyGeneratedId] = useState<number | null>(null);

    const [getDataInput, setGetDataInput] = useState<string>("");
    const [loadedData, setLoadedData] = useState("");


    const handleUploadData = () => {
        if (curInput == "") {
            alert("No data");
            return;
        }
        const newNumber = getRandom10DigitNumber();
        setNewlyGeneratedId(newNumber);
        setUploadData((prevData) => {
            return {
                ...prevData,
                [newNumber]: curInput
            }
        });
        alert("Data Saved Successfully");
    }

    const handleGetData = () => {
        if (getDataInput in uploadData) {
            setLoadedData(uploadData[getDataInput]);
        }
    }
    return (
        <>
            {/* <button onClick={() => router.push('/')}>123</button>
            <div>fileSharing</div> */}
            <div style={{ display: "grid", gridTemplateColumns: "50% 50%", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", margin: "20px", gap: "20px" }}>
                    <h1 style={{ textAlign: "center", fontSize: "35px", fontWeight: "bold" }}>
                        Lawyer Section
                    </h1>
                    <h3 style={{ textAlign: "center" }}>As a Lawyer, you will Provide some data only accessible by client. Also only when he pays (Optional)</h3>
                    <input type="text"
                        value={curInput} onChange={(e) => setInput(e.target.value)}
                        style={{ border: "solid grey 2px", borderRadius: "5px", padding: "5px", textAlign: "center" }} placeholder='Enter Data to upload' />
                    <button className='hover-black-button' style={{ padding: "10px 20px" }} onClick={handleUploadData}>Upload</button>
                    {newlyGeneratedId && <h3>Newly Generated Id: {newlyGeneratedId}</h3>}
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", margin: "20px", gap: "20px" }} >
                    <h1 style={{ textAlign: "center", fontSize: "35px", fontWeight: "bold" }}>
                        Client Section
                    </h1>
                    <h3 style={{ textAlign: "center" }}></h3>
                    <input type="text"
                        value={getDataInput} onChange={(e) => setGetDataInput(e.target.value)}
                        style={{ border: "solid grey 2px", borderRadius: "5px", padding: "5px", textAlign: "center" }} placeholder='Enter Data Id' />
                    <button className='hover-black-button' style={{ padding: "10px 20px" }} onClick={handleGetData}>Upload</button>
                    <label>{loadedData ? loadedData : "Decoded Text Will show here"}</label>
                </div>
            </div>
        </>
    )
}

function getRandom10DigitNumber() {
    // Generates a 10-digit random number
    return Math.floor(1000000000 + Math.random() * 9000000000);
}