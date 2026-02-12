import React, { createContext, useContext, useEffect, useState } from "react";
import { getBrowserProvider } from "./web3";
import { BrowserProvider } from "ethers";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    // Attempt to restore from session
    const stored = sessionStorage.getItem("wallet_address");
    if (stored) setAddress(stored);

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccounts = (accounts) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          sessionStorage.setItem("wallet_address", accounts[0]);
        } else {
          setAddress(null);
          sessionStorage.removeItem("wallet_address");
        }
      };

      const handleChain = (chain) => {
        setChainId(chain);
      };

      window.ethereum.on("accountsChanged", handleAccounts);
      window.ethereum.on("chainChanged", handleChain);

      return () => {
        try { window.ethereum.removeListener("accountsChanged", handleAccounts); } catch {}
        try { window.ethereum.removeListener("chainChanged", handleChain); } catch {}
      };
    }
  }, []);

  async function connect(options = {}) {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      if (options.force) {
        try {
          await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch {}
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();

      setAddress(addr);
      sessionStorage.setItem("wallet_address", addr);

      const network = await provider.getNetwork();
      setChainId(network.chainId);

      return addr;
    } catch (e) {
      console.error("Connection Error:", e);
      throw e;
    }
  }

  async function switchWallet() {
    return connect({ force: true });
  }

  function disconnect() {
    setAddress(null);
    sessionStorage.removeItem("wallet_address");
  }

  return (
    <WalletContext.Provider value={{ address, chainId, connect, disconnect, switchWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

export default WalletProvider;
