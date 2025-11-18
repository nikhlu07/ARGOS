import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import aggregatorArtifact from '@/contracts/AggregatorCore.json';
import contractAddressJson from '@/contracts/contract-address.json';

// Minimal EIP-1193 types
interface EthereumProvider {
  request: (args: { method: string; params?: any[] | object }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

interface Web3ContextType {
  isWalletConnected: boolean;
  address: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getContractCallConfig: () => { address: `0x${string}`; abi: any[] } | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<EthereumProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Detect injected provider
  useEffect(() => {
    const eth = (window as any).ethereum as EthereumProvider | undefined;
    if (eth) {
      setProvider(eth);

      const handleAccountsChanged = (accounts: string[]) => {
        setAddress(accounts && accounts.length > 0 ? accounts[0] : null);
      };
      const handleChainChanged = (hexChainId: string) => {
        const id = parseInt(hexChainId, 16);
        setChainId(id);
      };

      eth.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          setAddress(accounts && accounts.length > 0 ? accounts[0] : null);
        })
        .catch(() => setAddress(null));

      eth.request({ method: 'eth_chainId' })
        .then((hex: string) => setChainId(parseInt(hex, 16)))
        .catch(() => setChainId(null));

      if (eth.on) {
        eth.on('accountsChanged', handleAccountsChanged);
        eth.on('chainChanged', handleChainChanged);
      }

      return () => {
        if (eth && eth.removeListener) {
          eth.removeListener('accountsChanged', handleAccountsChanged);
          eth.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) throw new Error('No wallet provider found. Please install MetaMask.');
    const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
    setAddress(accounts && accounts.length > 0 ? accounts[0] : null);
    const hex: string = await provider.request({ method: 'eth_chainId' });
    setChainId(parseInt(hex, 16));
  };

  const disconnectWallet = () => {
    // No explicit disconnect in EIP-1193; we just clear local state.
    setAddress(null);
  };

  const contractConfig = useMemo(() => {
    try {
      const addr = (contractAddressJson as any).address as string;
      const abi = (aggregatorArtifact as any).abi as any[];
      if (!addr || !abi) return null;
      return { address: addr as `0x${string}`, abi };
    } catch (e) {
      return null;
    }
  }, []);

  const getContractCallConfig = () => contractConfig;

  const value: Web3ContextType = {
    isWalletConnected: !!address,
    address,
    chainId,
    connectWallet,
    disconnectWallet,
    getContractCallConfig,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
};