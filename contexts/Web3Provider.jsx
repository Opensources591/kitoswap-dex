"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { Web3Auth } from "@web3auth/web3auth"
import { EthereumPrivateKeyProvider } from "@web3auth/evm-adapters"
import { CHAIN_NAMESPACES } from "@web3auth/base"
import { ethers } from "ethers"

const Web3Context = createContext()

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

export default function Web3Provider({ children }) {
  const [web3Auth, setWeb3Auth] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentNetwork, setCurrentNetwork] = useState("BSC")
  const [balance, setBalance] = useState("0")

  const networks = {
    BSC: {
      chainId: "0x38", // 56
      rpcTarget: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed1.binance.org/",
      displayName: "BNB Smart Chain",
      blockExplorer: "https://bscscan.com",
      ticker: "BNB",
      tickerName: "BNB",
    },
    METAL: {
      chainId: "0x6d6", // 1750
      rpcTarget: process.env.NEXT_PUBLIC_METALBUILD_RPC_URL || "https://rpc.metall2.com",
      displayName: "Metal Build",
      blockExplorer: "https://metalscan.io",
      ticker: "MTL",
      tickerName: "Metal",
    },
  }

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          ...networks[currentNetwork],
        }

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        })

        const web3AuthInstance = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
          web3AuthNetwork: "mainnet",
          chainConfig,
          privateKeyProvider,
        })

        await web3AuthInstance.initModal()
        setWeb3Auth(web3AuthInstance)

        if (web3AuthInstance.connected) {
          const web3authProvider = web3AuthInstance.provider
          const ethersProvider = new ethers.BrowserProvider(web3authProvider)
          const ethersSigner = await ethersProvider.getSigner()
          const address = await ethersSigner.getAddress()

          setProvider(ethersProvider)
          setSigner(ethersSigner)
          setAccount(address)
          setIsConnected(true)

          // Get balance
          const bal = await ethersProvider.getBalance(address)
          setBalance(ethers.formatEther(bal))
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initWeb3Auth()
  }, [currentNetwork])

  const connect = async () => {
    if (!web3Auth) {
      throw new Error("Web3Auth not initialized")
    }

    try {
      const web3authProvider = await web3Auth.connect()
      const ethersProvider = new ethers.BrowserProvider(web3authProvider)
      const ethersSigner = await ethersProvider.getSigner()
      const address = await ethersSigner.getAddress()

      setProvider(ethersProvider)
      setSigner(ethersSigner)
      setAccount(address)
      setIsConnected(true)

      // Get balance
      const bal = await ethersProvider.getBalance(address)
      setBalance(ethers.formatEther(bal))

      return { provider: ethersProvider, signer: ethersSigner, account: address }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  const disconnect = async () => {
    if (!web3Auth) {
      throw new Error("Web3Auth not initialized")
    }

    try {
      await web3Auth.logout()
      setProvider(null)
      setSigner(null)
      setAccount("")
      setIsConnected(false)
      setBalance("0")
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      throw error
    }
  }

  const switchNetwork = async (networkKey) => {
    setCurrentNetwork(networkKey)
    if (web3Auth && web3Auth.connected) {
      await disconnect()
    }
  }

  const refreshBalance = async () => {
    if (provider && account) {
      try {
        const bal = await provider.getBalance(account)
        setBalance(ethers.formatEther(bal))
      } catch (error) {
        console.error("Error refreshing balance:", error)
      }
    }
  }

  const value = {
    web3Auth,
    provider,
    signer,
    account,
    isConnected,
    isLoading,
    currentNetwork,
    networks,
    balance,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
