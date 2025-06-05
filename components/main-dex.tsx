"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Wallet,
  ArrowLeftRight,
  Shield,
  TrendingUp,
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
  Activity,
} from "lucide-react"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function MainDexComponent() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [rpcUrl, setRpcUrl] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allPairsLength, setAllPairsLength] = useState<number | null>(null)

  useEffect(() => {
    // Get RPC URL from environment
    const bscRpc = process.env.NEXT_PUBLIC_RPC_BSC || "https://bsc-dataseed1.binance.org/"
    setRpcUrl(bscRpc)
    console.log("BSC RPC:", bscRpc)

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

  const fetchFactoryData = async () => {
    try {
      if (!rpcUrl) return

      // PancakeSwap V2 Factory address on BSC
      const factoryAddress = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"

      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: factoryAddress,
              data: "0x574f2ba3", // allPairsLength() function selector
            },
            "latest",
          ],
          id: 1,
        }),
      })

      const data = await response.json()
      if (data.result) {
        const pairsCount = Number.parseInt(data.result, 16)
        setAllPairsLength(pairsCount)
        console.log("PancakeSwap Pairs Count:", pairsCount)
      }
    } catch (error) {
      console.error("Error fetching factory data:", error)
    }
  }

  useEffect(() => {
    if (rpcUrl) {
      fetchFactoryData()
    }
  }, [rpcUrl])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)

          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          setChainId(chainId)

          // Switch to BSC if not already on it
          if (chainId !== "0x38") {
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x38" }],
              })
            } catch (switchError: any) {
              // If BSC is not added, add it
              if (switchError.code === 4902) {
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
              }
            }
          }
        }
      } else {
        setError("MetaMask is not installed. Please install MetaMask to continue.")
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setError(error.message || "Failed to connect wallet")
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

  const getNetworkName = (chainId: string) => {
    switch (chainId) {
      case "0x1":
        return "Ethereum Mainnet"
      case "0x38":
        return "BNB Smart Chain"
      case "0x89":
        return "Polygon"
      default:
        return `Unknown (${chainId})`
    }
  }

  const getNetworkColor = (chainId: string) => {
    switch (chainId) {
      case "0x38":
        return "text-yellow-400"
      case "0x1":
        return "text-blue-400"
      case "0x89":
        return "text-purple-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-400/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-lg w-full space-y-8">
          {/* Header with HUGE Round Logo */}
          <div className="text-center space-y-8">
            <div className="flex flex-col items-center space-y-6 group">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 animate-pulse"></div>
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border-4 border-cyan-400 p-2 shadow-2xl">
                  <img
                    src="/kito-bears-logo.jpg"
                    alt="Kito Bears Logo"
                    className="w-full h-full object-cover rounded-full shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-gradient-to-r from-cyan-400 to-purple-600 animate-spin-slow opacity-60"></div>
              </div>

              <div>
                <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                  KitoSwap
                </h1>
                <p className="text-2xl text-cyan-300 font-bold">Dex</p>
              </div>
            </div>

            <p className="text-cyan-200 text-xl font-medium">Connect your MetaMask wallet and perform test swaps.</p>
          </div>

          {/* Connection Status Card - SMOKE TEST HEALTH CHECK */}
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-xl border-2 border-green-400/30 p-6 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-bold text-lg">Connection Status</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">RPC URL:</span>
                  <span className="text-green-400 font-mono text-xs">
                    {rpcUrl ? `${rpcUrl.slice(0, 30)}...` : "Loading..."}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Chain ID:</span>
                  <span className={`font-bold ${chainId ? getNetworkColor(chainId) : "text-gray-400"}`}>
                    {chainId ? `${Number.parseInt(chainId, 16)} (${getNetworkName(chainId)})` : "Not connected"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Latest Block:</span>
                  <span className="text-blue-400 font-bold">
                    {blockNumber ? blockNumber.toLocaleString() : "Loading..."}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">PancakeSwap Pairs:</span>
                  <span className="text-purple-400 font-bold">
                    {allPairsLength !== null ? allPairsLength.toLocaleString() : "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Wallet Card */}
          <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border-2 border-cyan-400/30 p-8 hover:border-cyan-400/60 transition-all duration-300 group shadow-2xl">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-cyan-400/50 transition-shadow duration-300">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">Wallet</h3>
                {isConnected ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 text-sm font-bold">
                        {account?.slice(0, 6)}...{account?.slice(-4)}
                      </p>
                    </div>
                    {chainId && <p className="text-cyan-300 text-xs">{getNetworkName(chainId)}</p>}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <p className="text-orange-400 text-sm font-medium">Not connected</p>
                  </div>
                )}
              </div>
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-white border-cyan-400/50 hover:bg-cyan-400/20 hover:border-cyan-400 transition-all duration-300 font-bold"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border-2 border-red-400/30 p-4 shadow-2xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </Card>
          )}

          {/* Connect Button */}
          {!isConnected ? (
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black font-black py-8 text-xl rounded-3xl shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105 border-2 border-yellow-400"
            >
              <Shield className="w-8 h-8 mr-4" />
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
              <Zap className="w-8 h-8 ml-4" />
            </Button>
          ) : (
            <div className="space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white font-black py-8 text-xl rounded-3xl shadow-2xl hover:shadow-green-400/50 transition-all duration-300 transform hover:scale-105 border-2 border-green-400"
                onClick={() => alert("Swap functionality ready for testing!")}
              >
                <ArrowLeftRight className="w-8 h-8 mr-4" />
                Start Swapping
                <TrendingUp className="w-8 h-8 ml-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full border-2 border-purple-400/50 text-purple-300 hover:bg-purple-400/20 hover:border-purple-400 py-6 rounded-2xl transition-all duration-300 font-bold text-lg"
                onClick={() => alert("Advanced settings coming soon!")}
              >
                <Settings className="w-6 h-6 mr-3" />
                Advanced Settings
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="text-center space-y-3">
            <div className="text-cyan-300 text-sm font-medium">
              © 2025 KitoConnect. For demonstration purposes only.
            </div>
            <div className="flex justify-center space-x-4 text-sm text-cyan-400 font-medium">
              <span>Powered by BSC</span>
              <span>•</span>
              <span>Secured by MetaMask</span>
              <span>•</span>
              <span>Built with ❤️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainDexComponent
