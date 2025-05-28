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
  const [account, setAccount] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x38", // BSC Mainnet
          rpcTarget: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed1.binance.org/",
          displayName: "BNB Smart Chain",
          blockExplorer: "https://bscscan.com",
          ticker: "BNB",
          tickerName: "BNB",
        }

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        })

        const web3AuthInstance = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
          web3AuthNetwork: "mainnet", // Use "testnet" for testing
          chainConfig,
          privateKeyProvider,
        })

        await web3AuthInstance.initModal()
        setWeb3Auth(web3AuthInstance)

        // Check if already connected
        if (web3AuthInstance.connected) {
          const web3authProvider = web3AuthInstance.provider
          const ethersProvider = new ethers.BrowserProvider(web3authProvider)
          const signer = await ethersProvider.getSigner()
          const address = await signer.getAddress()

          setProvider(ethersProvider)
          setAccount(address)
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initWeb3Auth()
  }, [])

  const connect = async () => {
    if (!web3Auth) {
      console.error("Web3Auth not initialized")
      return
    }

    try {
      const web3authProvider = await web3Auth.connect()
      const ethersProvider = new ethers.BrowserProvider(web3authProvider)
      const signer = await ethersProvider.getSigner()
      const address = await signer.getAddress()

      setProvider(ethersProvider)
      setAccount(address)
      setIsConnected(true)

      return { provider: ethersProvider, account: address }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  const disconnect = async () => {
    if (!web3Auth) {
      console.error("Web3Auth not initialized")
      return
    }

    try {
      await web3Auth.logout()
      setProvider(null)
      setAccount("")
      setIsConnected(false)
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      throw error
    }
  }

  const getSigner = async () => {
    if (!provider) {
      throw new Error("Provider not available")
    }
    return await provider.getSigner()
  }

  const getBalance = async (address = account) => {
    if (!provider || !address) {
      return "0"
    }
    try {
      const balance = await provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error("Error getting balance:", error)
      return "0"
    }
  }

  const value = {
    web3Auth,
    provider,
    account,
    isConnected,
    isLoading,
    connect,
    disconnect,
    getSigner,
    getBalance,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
