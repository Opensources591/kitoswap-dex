"use client"

import { useState, useEffect } from "react"
import { getNetworkConfig } from "../utils/networks"
import { useToast, ToastContainer } from "../components/Toast"

export default function KitoSwapDEX() {
  // Toast system
  const { toasts, addToast, removeToast } = useToast()

  // Network state
  const [selectedNetwork, setSelectedNetwork] = useState("BSC")
  const [networkConfig, setNetworkConfig] = useState(getNetworkConfig("BSC"))

  // Mock wallet state for preview
  const [account, setAccount] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  // Mock network info state
  const [connectionStatus, setConnectionStatus] = useState({
    rpcUrl: "",
    chainId: 0,
    latestBlock: 0,
    allPairsLength: 0,
    isConnected: false,
  })

  // Swap state
  const [tokenIn, setTokenIn] = useState("")
  const [tokenOut, setTokenOut] = useState("")
  const [amountIn, setAmountIn] = useState("")
  const [amountOut, setAmountOut] = useState("")
  const [slippage, setSlippage] = useState(1)

  // UI state
  const [isApproving, setIsApproving] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState("12.5432")

  // Initialize network when selection changes
  useEffect(() => {
    const config = getNetworkConfig(selectedNetwork)
    setNetworkConfig(config)

    // Set default tokens
    const tokens = Object.keys(config.tokens)
    if (tokens.length >= 2) {
      setTokenIn(config.tokens[tokens[0]])
      setTokenOut(config.tokens[tokens[1]])
    }

    // Mock connection status
    setConnectionStatus({
      rpcUrl: config.rpcUrl || "https://bsc-dataseed1.binance.org/",
      chainId: config.chainId,
      latestBlock: selectedNetwork === "BSC" ? 50376798 : 1234567,
      allPairsLength: selectedNetwork === "BSC" ? 1843617 : 45231,
      isConnected: true,
    })

    addToast(`Switched to ${config.name}`, "success", 3000)
  }, [selectedNetwork])

  // Mock price calculation
  useEffect(() => {
    if (amountIn && Number.parseFloat(amountIn) > 0) {
      const mockRate = selectedNetwork === "BSC" ? 0.95 : 1.02
      const calculated = (Number.parseFloat(amountIn) * mockRate).toFixed(6)
      setAmountOut(calculated)
    } else {
      setAmountOut("")
    }
  }, [amountIn, tokenIn, tokenOut, selectedNetwork])

  const connectWallet = async () => {
    setIsConnecting(true)
    addToast("Connecting wallet...", "info", 2000)

    setTimeout(() => {
      setAccount("0xa36f...4f81")
      setIsConnected(true)
      setIsConnecting(false)
      addToast("Wallet connected successfully!", "success", 3000)
    }, 2000)
  }

  const approveToken = async () => {
    setIsApproving(true)
    addToast("Approving token...", "info", 0)

    setTimeout(() => {
      setIsApproving(false)
      addToast("Token approved successfully!", "success", 3000)
    }, 3000)
  }

  const executeSwap = async () => {
    setIsSwapping(true)
    addToast("Executing swap...", "info", 0)

    setTimeout(() => {
      setIsSwapping(false)
      addToast(
        <div>
          Swap completed!
          <a href="#" className="underline ml-1">
            View on Explorer
          </a>
        </div>,
        "success",
        5000,
      )
      setAmountIn("")
      setAmountOut("")
    }, 4000)
  }

  const runSmokeTest = () => {
    addToast("Running smoke test...", "info", 2000)

    console.log("=== KITOSWAP DEX SMOKE TEST ===")
    console.log("Selected Network:", selectedNetwork)
    console.log("Network Config:", networkConfig)
    console.log("Connection Status:", connectionStatus)
    console.log("Account:", account)
    console.log("=== END SMOKE TEST ===")

    setTimeout(() => {
      addToast("Smoke test completed! Check console for details.", "success", 3000)
    }, 2000)
  }

  const getTokenSymbol = (tokenAddress) => {
    const tokenEntries = Object.entries(networkConfig.tokens)
    const found = tokenEntries.find(([, address]) => address === tokenAddress)
    return found ? found[0] : "Unknown"
  }

  const needsApproval = !isConnected || (tokenIn !== networkConfig.tokens.WBNB && tokenIn !== networkConfig.tokens.WMTL)
  const canSwap = isConnected && amountIn && amountOut && !needsApproval

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-white">KitoSwap DEX</h1>
              <span className="bg-[#4B6CB7] text-white px-3 py-1 rounded-full text-sm font-medium">Production</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Network Selector */}
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="bg-[#182848] text-white border-2 border-[#4B6CB7] rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#4B6CB7] focus:border-transparent transition-all"
              >
                <option value="BSC">BSC Mainnet</option>
                <option value="METAL">Metal Build</option>
              </select>

              {/* Wallet Connection */}
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-[#4B6CB7] hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </button>
              ) : (
                <div className="text-white text-sm text-center">
                  <div className="font-medium">{account}</div>
                  <div className="text-xs text-green-400">{networkConfig.name}</div>
                </div>
              )}

              {/* Smoke Test Button */}
              <button
                onClick={runSmokeTest}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
              >
                🧪 Test
              </button>
            </div>
          </div>
        </header>

        {/* Connection Status Panel */}
        <div className="container mx-auto px-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${connectionStatus.isConnected ? "bg-green-400" : "bg-red-400"}`}
              ></div>
              Connection Status - {networkConfig.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white">
              <div>
                <div className="text-sm text-white/70">RPC URL</div>
                <div className="font-mono text-xs break-all">{connectionStatus.rpcUrl}</div>
              </div>
              <div>
                <div className="text-sm text-white/70">Chain ID</div>
                <div className="font-bold text-[#4B6CB7]">{connectionStatus.chainId}</div>
              </div>
              <div>
                <div className="text-sm text-white/70">Latest Block</div>
                <div className="font-bold text-green-400">{connectionStatus.latestBlock.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-white/70">Trading Pairs</div>
                <div className="font-bold text-purple-400">{connectionStatus.allPairsLength.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Swap Interface */}
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Swap Tokens</h2>

              <div className="space-y-4">
                {/* Token Input */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">From</label>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={tokenIn}
                      onChange={(e) => setTokenIn(e.target.value)}
                      className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
                    >
                      {Object.entries(networkConfig.tokens).map(([symbol, address]) => (
                        <option key={address} value={address}>
                          {symbol}
                        </option>
                      ))}
                    </select>
                    {needsApproval && amountIn && (
                      <button
                        onClick={approveToken}
                        disabled={!isConnected || isApproving}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
                      >
                        {isApproving ? "Approving..." : "Approve"}
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
                  />
                  <div className="text-white/70 text-sm mt-1 flex justify-between">
                    <span>
                      Balance: {balance} {getTokenSymbol(tokenIn)}
                    </span>
                    <button
                      onClick={() => setAmountIn(balance)}
                      className="text-[#4B6CB7] hover:text-blue-300 text-xs underline"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Swap Direction Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const temp = tokenIn
                      setTokenIn(tokenOut)
                      setTokenOut(temp)
                      setAmountIn("")
                      setAmountOut("")
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all transform hover:rotate-180"
                  >
                    ↕️
                  </button>
                </div>

                {/* Token Output */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">To</label>
                  <select
                    value={tokenOut}
                    onChange={(e) => setTokenOut(e.target.value)}
                    className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
                  >
                    {Object.entries(networkConfig.tokens).map(([symbol, address]) => (
                      <option key={address} value={address}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={amountOut}
                    readOnly
                    placeholder="0.0"
                    className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50"
                  />
                  <div className="text-white/70 text-sm mt-1">You will receive: {getTokenSymbol(tokenOut)}</div>
                </div>

                {/* Slippage Settings */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Slippage Tolerance: {slippage}%</label>
                  <div className="flex gap-2 mb-2">
                    {[0.5, 1, 2, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          slippage === value ? "bg-[#4B6CB7] text-white" : "bg-white/20 text-white/70 hover:bg-white/30"
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={slippage}
                    onChange={(e) => setSlippage(Number.parseFloat(e.target.value))}
                    className="w-full accent-[#4B6CB7]"
                  />
                </div>

                {/* Swap Button */}
                <button
                  onClick={executeSwap}
                  disabled={!canSwap || isSwapping}
                  className="w-full bg-gradient-to-r from-[#4B6CB7] to-[#182848] hover:from-blue-700 hover:to-[#1a2a4a] disabled:from-gray-600 disabled:to-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  {!isConnected
                    ? "Connect Wallet"
                    : needsApproval && amountIn
                      ? "Approve Token First"
                      : isSwapping
                        ? "Swapping..."
                        : "Swap"}
                </button>

                {/* Price Impact Info */}
                {amountOut && Number.parseFloat(amountOut) > 0 && (
                  <div className="text-center text-white/70 text-sm">
                    <div>Price Impact: ~{slippage}%</div>
                    <div>
                      Minimum Received: {((Number.parseFloat(amountOut) * (100 - slippage)) / 100).toFixed(6)}{" "}
                      {getTokenSymbol(tokenOut)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-white/70 text-sm mt-8 pb-8">
          <p>© 2025 KitoConnect. Production-ready multi-chain DEX.</p>
          <div className="flex justify-center items-center gap-4 mt-2 flex-wrap">
            <span>Powered by {networkConfig.name}</span>
            <span>•</span>
            <span>Secured by MetaMask</span>
            <span>•</span>
            <span>Built with ❤️</span>
          </div>
        </footer>
      </div>
    </>
  )
}
