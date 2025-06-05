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
  Download,
  ExternalLink,
} from "lucide-react"
import { useWeb3 } from "./web3-provider"

export function MainDexComponent() {
  const {
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
  } = useWeb3()

  const [allPairsLength, setAllPairsLength] = useState<number | null>(null)

  useEffect(() => {
    // Fetch PancakeSwap factory data for smoke test
    if (rpcUrl) {
      fetchFactoryData()
    }
  }, [rpcUrl])

  const fetchFactoryData = async () => {
    try {
      // PancakeSwap V2 Factory address on BSC
      const factoryAddress = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"

      const response = await fetch(rpcUrl!, {
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

          {/* Wallet Detection Status */}
          <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 backdrop-blur-xl border-2 border-blue-400/30 p-6 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-bold text-lg">Wallet Detection</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Browser Wallet:</span>
                  <div className="flex items-center space-x-2">
                    {isWalletDetected ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">Detected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 font-bold">Not Found</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">MetaMask Extension:</span>
                  <div className="flex items-center space-x-2">
                    {isMetaMaskInstalled ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">Ready</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-bold">Install Needed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!isWalletDetected && (
                <div className="mt-4 p-4 bg-orange-500/20 rounded-lg border border-orange-400/30">
                  <p className="text-orange-300 text-sm font-medium mb-3">
                    No wallet detected. Please install MetaMask extension:
                  </p>
                  <Button
                    onClick={() => window.open("https://metamask.io/download/", "_blank")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install MetaMask
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </Card>

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
              disabled={isConnecting || !isWalletDetected}
              className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black font-black py-8 text-xl rounded-3xl shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105 border-2 border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-8 h-8 mr-4" />
              {isConnecting ? "Connecting..." : isWalletDetected ? "Connect Wallet" : "Install MetaMask First"}
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
              <span>Works with Any Browser</span>
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
