"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Web3ContextType {
  isConnected: boolean
  account: string | null
  chainId: string | null
  blockNumber: number | null
  rpcUrl: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnecting: boolean
  error: string | null
  isMetaMaskInstalled: boolean
  isWalletDetected: boolean
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [rpcUrl, setRpcUrl] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)
  const [isWalletDetected, setIsWalletDetected] = useState(false)

  useEffect(() => {
    // Get RPC URL from environment
    const bscRpc = process.env.NEXT_PUBLIC_RPC_BSC || "https://bsc-dataseed1.binance.org/"
    setRpcUrl(bscRpc)
    console.log("BSC RPC:", bscRpc)

    // Enhanced wallet detection for web browsers
    detectWallets()

    // Check if wallet is already connected
    checkConnection()

    // Fetch block number on load
    fetchBlockNumber(bscRpc)

    // Set up interval to fetch block number every 10 seconds
    const interval = setInterval(() => {
      fetchBlockNumber(bscRpc)
    }, 10000)

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      clearInterval(interval)
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const detectWallets = () => {
    if (typeof window === "undefined") return

    // Wait a bit for wallet injection
    setTimeout(() => {
      const hasEthereum = typeof window.ethereum !== "undefined"
      const hasMetaMask = hasEthereum && window.ethereum.isMetaMask
      const hasTrustWallet = hasEthereum && window.ethereum.isTrust
      const hasWalletConnect = hasEthereum && window.ethereum.isWalletConnect

      console.log("Wallet Detection:", {
        hasEthereum,
        hasMetaMask,
        hasTrustWallet,
        hasWalletConnect,
        ethereum: window.ethereum,
      })

      setIsWalletDetected(hasEthereum)
      setIsMetaMaskInstalled(hasMetaMask || hasEthereum) // Accept any ethereum provider
    }, 1000)
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
      setIsConnected(true)
    }
  }

  const handleChainChanged = (chainId: string) => {
    setChainId(chainId)
    window.location.reload() // Recommended by MetaMask
  }

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)

          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          setChainId(chainId)
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }

  const fetchBlockNumber = async (rpcUrl: string) => {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      })

      const data = await response.json()
      if (data.result) {
        const blockNum = Number.parseInt(data.result, 16)
        setBlockNumber(blockNum)
        console.log("Latest Block:", blockNum)
      }
    } catch (error) {
      console.error("Error fetching block number:", error)
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Enhanced wallet detection and connection
      if (typeof window === "undefined") {
        throw new Error("Window object not available")
      }

      if (!window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask or use a Web3-enabled browser.")
      }

      console.log("Attempting to connect wallet...")
      console.log("Ethereum object:", window.ethereum)

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      console.log("Accounts received:", accounts)

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)

        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(chainId)

        console.log("Connected to chain:", chainId)

        // Switch to BSC if not already on it
        if (chainId !== "0x38") {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x38" }],
            })
            setChainId("0x38")
          } catch (switchError: any) {
            console.log("Switch error:", switchError)
            // If BSC is not added, add it
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x38",
                      chainName: "BNB Smart Chain",
                      nativeCurrency: {
                        name: "BNB",
                        symbol: "BNB",
                        decimals: 18,
                      },
                      rpcUrls: ["https://bsc-dataseed1.binance.org/"],
                      blockExplorerUrls: ["https://bscscan.com/"],
                    },
                  ],
                })
                setChainId("0x38")
              } catch (addError) {
                console.error("Error adding BSC network:", addError)
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)

      if (error.code === 4001) {
        setError("Connection rejected by user")
      } else if (error.message.includes("No wallet detected")) {
        setError("No wallet detected. Please install MetaMask extension or use a Web3-enabled browser.")
      } else {
        setError(error.message || "Failed to connect wallet")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount(null)
    setChainId(null)
    setError(null)
  }

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        account,
        chainId,
        blockNumber,
        rpcUrl,
        connectWallet,
        disconnectWallet,
        isConnecting,
        error,
        isMetaMaskInstalled,
        isWalletDetected,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
