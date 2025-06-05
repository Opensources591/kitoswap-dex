"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MarketChart } from "./market-chart"
import { quidaxClient } from "@/lib/quidax-client"
import { revEthEngine, type RevEthToken } from "@/lib/reveth-engine"
import {
  Wallet,
  ArrowLeftRight,
  CheckCircle,
  AlertCircle,
  Activity,
  Search,
  Coins,
  BarChart3,
  Layers,
} from "lucide-react"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function EnhancedMainDex() {
  // Wallet states
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [rpcUrl, setRpcUrl] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Market data states
  const [marketData, setMarketData] = useState<any>(null)
  const [tokenInfo, setTokenInfo] = useState<RevEthToken | null>(null)
  const [tokenAddress, setTokenAddress] = useState("")
  const [isLoadingToken, setIsLoadingToken] = useState(false)

  useEffect(() => {
    // Initialize
    const bscRpc = process.env.NEXT_PUBLIC_RPC_BSC || "https://bsc-dataseed1.binance.org/"
    setRpcUrl(bscRpc)

    checkConnection()
    fetchBlockNumber(bscRpc)
    fetchMarketData()

    // Set up intervals
    const blockInterval = setInterval(() => fetchBlockNumber(bscRpc), 10000)
    const marketInterval = setInterval(fetchMarketData, 30000)

    // Wallet event listeners
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      clearInterval(blockInterval)
      clearInterval(marketInterval)
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
    window.location.reload()
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
        headers: { "Content-Type": "application/json" },
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
      }
    } catch (error) {
      console.error("Error fetching block number:", error)
    }
  }

  const fetchMarketData = async () => {
    try {
      console.log("Fetching market data...")
      const data = await quidaxClient.getMarketData("btcngn")
      console.log("Market data received:", data)
      setMarketData(data)
    } catch (error) {
      console.warn("Market data fetch failed:", error)
      // Set fallback market data
      setMarketData({
        data: {
          market: "btcngn",
          last: "45000.00",
          high: "47000.00",
          low: "43000.00",
          volume: "1234567.89",
          change: "2.5",
          timestamp: new Date().toISOString(),
        },
        status: "fallback",
        message: "Using fallback data",
      })
    }
  }

  const searchToken = async () => {
    if (!tokenAddress.trim()) return

    setIsLoadingToken(true)
    setError(null)

    try {
      const info = await revEthEngine.getTokenInfo(tokenAddress)
      if (info) {
        const price = await revEthEngine.getTokenPrice(tokenAddress)
        setTokenInfo({ ...info, price: price || undefined })
      } else {
        setError("Token not found or invalid address")
      }
    } catch (error) {
      setError("Error fetching token information")
    } finally {
      setIsLoadingToken(false)
    }
  }

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

          // Switch to BSC if needed
          if (chainId !== "0x38") {
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x38" }],
              })
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x38",
                      chainName: "BNB Smart Chain",
                      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-400/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 p-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center space-y-4 group">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border-4 border-cyan-400 p-2 shadow-2xl">
                <img
                  src="/kito-bears-logo.jpg"
                  alt="Kito Bears Logo"
                  className="w-full h-full object-cover rounded-full shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                KitoSwap DEX v27
              </h1>
              <p className="text-xl text-cyan-300 font-bold">Advanced Trading Platform</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet & Controls */}
          <div className="space-y-6">
            {/* Wallet Card */}
            <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border-2 border-cyan-400/30 p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-white font-bold text-lg">Wallet Connection</h3>
                </div>

                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-bold">
                        {account?.slice(0, 6)}...{account?.slice(-4)}
                      </span>
                    </div>
                    {chainId && <p className="text-cyan-300 text-xs">{getNetworkName(chainId)}</p>}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disconnectWallet}
                      className="w-full text-white border-cyan-400/50 hover:bg-cyan-400/20"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-sm">Not connected</span>
                    </div>
                    <Button
                      onClick={connectWallet}
                      disabled={isConnecting}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
                    >
                      {isConnecting ? "Connecting..." : "Connect MetaMask"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Token Search */}
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl border-2 border-purple-400/30 p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6 text-purple-400" />
                  <h3 className="text-white font-bold text-lg">Token Explorer</h3>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Enter token contract address..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className="bg-white/10 border-purple-400/30 text-white placeholder-gray-400"
                  />
                  <Button
                    onClick={searchToken}
                    disabled={isLoadingToken || !tokenAddress.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoadingToken ? "Searching..." : "Search Token"}
                  </Button>
                </div>

                {tokenInfo && (
                  <div className="mt-4 p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Name:</span>
                        <span className="text-white font-bold">{tokenInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Symbol:</span>
                        <span className="text-purple-400 font-bold">{tokenInfo.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Decimals:</span>
                        <span className="text-white">{tokenInfo.decimals}</span>
                      </div>
                      {tokenInfo.price && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Price:</span>
                          <span className="text-green-400 font-bold">${tokenInfo.price.toFixed(6)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Network Status */}
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-xl border-2 border-green-400/30 p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-green-400" />
                  <h3 className="text-white font-bold text-lg">Network Status</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Latest Block:</span>
                    <span className="text-blue-400 font-bold">
                      {blockNumber ? blockNumber.toLocaleString() : "Loading..."}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Network:</span>
                    <span className="text-yellow-400 font-bold">BSC Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className="text-green-400 font-bold">Connected</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Market Data Card */}
            <Card className="bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-xl border-2 border-orange-400/30 p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-orange-400" />
                  <h3 className="text-white font-bold text-lg">Market Data</h3>
                </div>

                {marketData ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">BTC/NGN:</span>
                      <span className="text-orange-400 font-bold">₦{marketData.data?.last || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">24h Change:</span>
                      <span
                        className={`font-bold ${
                          Number.parseFloat(marketData.data?.change || "0") >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {marketData.data?.change || "0"}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Volume:</span>
                      <span className="text-blue-400 font-bold">
                        ₦{Number.parseFloat(marketData.data?.volume || "0").toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span
                        className={`font-bold ${
                          marketData.status === "success" ? "text-green-400" : "text-yellow-400"
                        }`}
                      >
                        {marketData.status === "success" ? "Live" : "Mock"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Loading market data...</div>
                )}
              </div>
            </Card>
          </div>

          {/* Center Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            <MarketChart symbol="BNB/USDT" />

            {/* Trading Interface */}
            <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 backdrop-blur-xl border-2 border-blue-400/30 p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <ArrowLeftRight className="w-6 h-6 text-blue-400" />
                  <h3 className="text-white font-bold text-lg">Swap Interface</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">From</label>
                    <div className="bg-white/10 rounded-lg p-4 border border-blue-400/30">
                      <div className="flex justify-between items-center">
                        <Input
                          placeholder="0.0"
                          className="bg-transparent border-none text-2xl font-bold text-white p-0 h-auto"
                        />
                        <Button variant="outline" size="sm" className="text-white border-blue-400/50">
                          BNB
                        </Button>
                      </div>
                      <div className="text-gray-400 text-sm mt-2">Balance: 0.0</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">To</label>
                    <div className="bg-white/10 rounded-lg p-4 border border-blue-400/30">
                      <div className="flex justify-between items-center">
                        <Input
                          placeholder="0.0"
                          className="bg-transparent border-none text-2xl font-bold text-white p-0 h-auto"
                        />
                        <Button variant="outline" size="sm" className="text-white border-blue-400/50">
                          USDT
                        </Button>
                      </div>
                      <div className="text-gray-400 text-sm mt-2">Balance: 0.0</div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white font-bold py-4 text-lg"
                  disabled={!isConnected}
                >
                  {isConnected ? "Swap Tokens" : "Connect Wallet to Swap"}
                </Button>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border-2 border-cyan-400/30 p-4">
                <div className="flex items-center space-x-3">
                  <Coins className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">1,234</div>
                    <div className="text-cyan-300 text-sm">Total Pairs</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-xl border-2 border-green-400/30 p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">$2.4M</div>
                    <div className="text-green-300 text-sm">24h Volume</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl border-2 border-purple-400/30 p-4">
                <div className="flex items-center space-x-3">
                  <Layers className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">$12.8M</div>
                    <div className="text-purple-300 text-sm">TVL</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border-2 border-red-400/30 p-4 shadow-2xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center space-y-3">
          <div className="text-cyan-300 text-sm font-medium">© 2025 KitoSwap DEX v27 - Advanced Trading Platform</div>
          <div className="flex justify-center space-x-4 text-sm text-cyan-400 font-medium">
            <span>QuidaxClient ✓</span>
            <span>•</span>
            <span>RevEth Engine ✓</span>
            <span>•</span>
            <span>Live Charts ✓</span>
            <span>•</span>
            <span>BSC Network ✓</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedMainDex
