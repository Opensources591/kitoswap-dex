"use client"

import { useState, useEffect } from "react"

// Toast system
function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "info", duration = 5000) => {
    const id = Date.now()
    const toast = { id, message, type, duration }
    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return { toasts, addToast, removeToast }
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const { id, message, type } = toast

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500/90 border-green-400 text-green-100"
      case "error":
        return "bg-red-500/90 border-red-400 text-red-100"
      case "warning":
        return "bg-yellow-500/90 border-yellow-400 text-yellow-100"
      default:
        return "bg-blue-500/90 border-blue-400 text-blue-100"
    }
  }

  return (
    <div className={`${getToastStyles()} border backdrop-blur-md rounded-lg p-4 max-w-sm shadow-lg`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium">{message}</p>
        <button onClick={() => onRemove(id)} className="ml-2 text-white/70 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}

// Mock Web3 Context with token balances
function useWeb3() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("BSC")
  const [tokenBalances, setTokenBalances] = useState({})

  // Mock token balances for different networks
  const mockBalances = {
    BSC: {
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": "12.5432", // WBNB
      "0x55d398326f99059fF775485246999027B3197955": "8,456.78", // USDT
      "0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c": "1,234,567.89", // KBC
      "0x386c66a0a3d452b7296c0763296fc7d9124e62f8": "987,654.32", // KBB
    },
    METAL: {
      "0x0000000000000000000000000000000000000000": "45.6789", // WMTL
      "0x0000000000000000000000000000000000000001": "12,345.67", // USDT
      "0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c": "2,345,678.90", // KBC
      "0x386c66a0a3d452b7296c0763296fc7d9124e62f8": "1,876,543.21", // KBB
    },
  }

  useEffect(() => {
    if (isConnected) {
      setTokenBalances(mockBalances[selectedNetwork])
    }
  }, [isConnected, selectedNetwork])

  const getTokenBalance = (tokenAddress) => {
    if (!isConnected || !tokenBalances[tokenAddress]) return "0.00"
    return tokenBalances[tokenAddress]
  }

  const updateTokenBalance = (tokenAddress, newBalance) => {
    setTokenBalances((prev) => ({
      ...prev,
      [tokenAddress]: newBalance,
    }))
  }

  return {
    isConnected,
    account,
    selectedNetwork,
    setSelectedNetwork,
    tokenBalances,
    getTokenBalance,
    updateTokenBalance,
    connect: () => {
      setIsConnected(true)
      setAccount("0xa36f...4f81")
      setTokenBalances(mockBalances[selectedNetwork])
      return Promise.resolve({ provider: {}, account: "0xa36f...4f81" })
    },
    disconnect: () => {
      setIsConnected(false)
      setAccount("")
      setTokenBalances({})
      return Promise.resolve()
    },
    getBalance: () => Promise.resolve("12.5432"),
    getSigner: () => Promise.resolve({}),
  }
}

// Network configurations
const NETWORKS = {
  BSC: {
    name: "BSC Mainnet",
    chainId: 56,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_BSC,
    tokens: {
      WBNB: { symbol: "WBNB", name: "Wrapped BNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" },
      USDT: { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955" },
      KBC: { symbol: "KBC", name: "KBC Gospel Token", address: "0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c" },
      KBB: { symbol: "KBB", name: "KBB Family Token", address: "0x386c66a0a3d452b7296c0763296fc7d9124e62f8" },
    },
  },
  METAL: {
    name: "Metal Build",
    chainId: 1750,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_METAL,
    tokens: {
      WMTL: { symbol: "WMTL", name: "Wrapped Metal", address: "0x0000000000000000000000000000000000000000" },
      USDT: { symbol: "USDT", name: "Tether USD", address: "0x0000000000000000000000000000000000000001" },
      KBC: { symbol: "KBC", name: "KBC Gospel Token", address: "0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c" },
      KBB: { symbol: "KBB", name: "KBB Family Token", address: "0x386c66a0a3d452b7296c0763296fc7d9124e62f8" },
    },
  },
}

// Token Balance Display Component
function TokenBalanceCard({ selectedNetwork, getTokenBalance, addToast }) {
  const networkConfig = NETWORKS[selectedNetwork]
  const tokens = Object.values(networkConfig.tokens)

  const refreshBalances = async () => {
    addToast("Refreshing token balances...", "info", 2000)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    addToast("Token balances updated!", "success", 2000)
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>💰</span>
          Token Balances - {networkConfig.name}
        </h3>
        <button
          onClick={refreshBalances}
          className="text-white/70 hover:text-white transition-colors text-sm"
          title="Refresh balances"
        >
          🔄
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tokens.map((token) => {
          const balance = getTokenBalance(token.address)
          const isKitoToken = ["KBC", "KBB"].includes(token.symbol)

          return (
            <div
              key={token.address}
              className={`bg-white/5 rounded-lg p-4 border transition-all ${
                isKitoToken ? "border-yellow-500/30 bg-yellow-500/10" : "border-white/10"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{token.symbol}</span>
                    {isKitoToken && <span className="text-yellow-400 text-xs">⭐ KITO</span>}
                  </div>
                  <div className="text-white/70 text-sm">{token.name}</div>
                  <div className="text-white/50 text-xs font-mono">
                    {token.address.slice(0, 8)}...{token.address.slice(-6)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-xl ${isKitoToken ? "text-yellow-400" : "text-white"}`}>{balance}</div>
                  <div className="text-white/70 text-sm">{token.symbol}</div>
                </div>
              </div>

              {/* USD Value (mock) */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">USD Value:</span>
                  <span className="text-green-400 font-medium">
                    $
                    {isKitoToken
                      ? (Number.parseFloat(balance.replace(/,/g, "")) * 0.001).toFixed(2)
                      : token.symbol === "USDT"
                        ? balance
                        : (Number.parseFloat(balance.replace(/,/g, "")) * 645.23).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total Portfolio Value */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Total Portfolio Value:</span>
            <span className="text-2xl font-bold text-green-400">
              ${selectedNetwork === "BSC" ? "8,123,456.78" : "1,567,890.12"}
            </span>
          </div>
          <div className="text-white/70 text-sm mt-1">
            Across {tokens.length} tokens on {networkConfig.name}
          </div>
        </div>
      </div>
    </div>
  )
}

// Auth Buttons Component
function AuthButtons({ addToast }) {
  const { isConnected, account, connect, disconnect } = useWeb3()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      addToast("Connecting wallet...", "info", 2000)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await connect()
      addToast("Wallet connected successfully!", "success", 3000)
    } catch (error) {
      addToast(`Connection failed: ${error.message}`, "error", 5000)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      addToast("Wallet disconnected", "info", 2000)
    } catch (error) {
      addToast(`Disconnect failed: ${error.message}`, "error", 3000)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center gap-2"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Connecting...
          </>
        ) : (
          <>
            <span>🔗</span>
            Connect Wallet
          </>
        )}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-white text-sm">
        <div className="font-medium">{formatAddress(account)}</div>
        <div className="text-xs text-green-400">Connected</div>
      </div>
      <button
        onClick={handleDisconnect}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm shadow-lg"
      >
        Disconnect
      </button>
    </div>
  )
}

// Metal.build Integration Component
function MetalBuildIntegration({ selectedNetwork, addToast }) {
  const [metalStats, setMetalStats] = useState({
    totalVolume: "$13,964,247",
    kbcLiquidity: "$456,789",
    kbbLiquidity: "$234,567",
    isConnected: selectedNetwork === "METAL",
  })

  const connectToMetal = async () => {
    try {
      addToast("Connecting to Metal.build...", "info", 2000)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMetalStats((prev) => ({ ...prev, isConnected: true }))
      addToast("Successfully connected to Metal.build!", "success", 3000)
    } catch (error) {
      addToast("Failed to connect to Metal.build", "error", 3000)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">⚡</div>
          Metal.build Integration
        </h3>
        <div className={`w-3 h-3 rounded-full ${metalStats.isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
          <div className="text-xl font-bold text-yellow-400">{metalStats.totalVolume}</div>
          <div className="text-white/70 text-sm">Total Volume</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
          <div className="text-xl font-bold text-blue-400">{metalStats.kbcLiquidity}</div>
          <div className="text-white/70 text-sm">KBC Liquidity</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
          <div className="text-xl font-bold text-purple-400">{metalStats.kbbLiquidity}</div>
          <div className="text-white/70 text-sm">KBB Liquidity</div>
        </div>
      </div>

      {selectedNetwork === "METAL" ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-300">
            <span>✅</span>
            <span className="font-medium">Connected to Metal.build Network</span>
          </div>
          <div className="text-green-200 text-sm mt-1">
            KBC and KBB tokens are now available for trading and liquidity provision
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-yellow-300 font-medium">Switch to Metal.build Network</div>
              <div className="text-yellow-200 text-sm">Access KBC/KBB liquidity pools</div>
            </div>
            <button
              onClick={connectToMetal}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Swap Interface Component with token balances
function SwapInterface({ selectedNetwork, addToast }) {
  const { isConnected, getTokenBalance, updateTokenBalance } = useWeb3()
  const [selectedTokenIn, setSelectedTokenIn] = useState("")
  const [selectedTokenOut, setSelectedTokenOut] = useState("")
  const [amountIn, setAmountIn] = useState("")
  const [amountOut, setAmountOut] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)

  const networkConfig = NETWORKS[selectedNetwork]
  const tokens = Object.values(networkConfig.tokens)

  useEffect(() => {
    if (tokens.length >= 2) {
      setSelectedTokenIn(tokens[0].address)
      setSelectedTokenOut(tokens[1].address)
    }
  }, [selectedNetwork])

  // Auto-calculate output amount
  useEffect(() => {
    if (amountIn && Number.parseFloat(amountIn) > 0) {
      const mockRate = selectedNetwork === "BSC" ? 0.95 : 1.02
      const calculated = (Number.parseFloat(amountIn) * mockRate).toFixed(6)
      setAmountOut(calculated)
    } else {
      setAmountOut("")
    }
  }, [amountIn, selectedTokenIn, selectedTokenOut, selectedNetwork])

  const handleSwap = async () => {
    if (!amountIn || !amountOut) {
      addToast("Please enter a valid amount", "error", 3000)
      return
    }

    const currentBalance = Number.parseFloat(getTokenBalance(selectedTokenIn).replace(/,/g, ""))
    const swapAmount = Number.parseFloat(amountIn)

    if (swapAmount > currentBalance) {
      addToast("Insufficient balance for this swap", "error", 3000)
      return
    }

    try {
      setIsSwapping(true)
      addToast("Executing swap...", "info", 2000)
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const tokenInSymbol = tokens.find((t) => t.address === selectedTokenIn)?.symbol
      const tokenOutSymbol = tokens.find((t) => t.address === selectedTokenOut)?.symbol

      // Update balances
      const newBalanceIn = (currentBalance - swapAmount).toFixed(4)
      const currentBalanceOut = Number.parseFloat(getTokenBalance(selectedTokenOut).replace(/,/g, ""))
      const newBalanceOut = (currentBalanceOut + Number.parseFloat(amountOut)).toFixed(4)

      updateTokenBalance(selectedTokenIn, newBalanceIn)
      updateTokenBalance(selectedTokenOut, newBalanceOut)

      addToast(
        <div>
          ✅ Swap completed successfully!
          <div className="text-xs mt-1">
            {amountIn} {tokenInSymbol} → {amountOut} {tokenOutSymbol}
          </div>
        </div>,
        "success",
        5000,
      )

      setAmountIn("")
      setAmountOut("")
    } catch (error) {
      addToast(`Swap failed: ${error.message}`, "error", 5000)
    } finally {
      setIsSwapping(false)
    }
  }

  const setMaxAmount = () => {
    const balance = getTokenBalance(selectedTokenIn).replace(/,/g, "")
    setAmountIn(balance)
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6 text-center">Swap Tokens - {networkConfig.name}</h2>

      <div className="space-y-4">
        {/* Token Input */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">From</label>
          <select
            value={selectedTokenIn}
            onChange={(e) => setSelectedTokenIn(e.target.value)}
            className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
          >
            {tokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
          />
          <div className="text-white/70 text-sm mt-1 flex justify-between">
            <span>
              Balance: {getTokenBalance(selectedTokenIn)} {tokens.find((t) => t.address === selectedTokenIn)?.symbol}
            </span>
            <button onClick={setMaxAmount} className="text-[#4B6CB7] hover:text-blue-300 text-xs underline">
              MAX
            </button>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const temp = selectedTokenIn
              setSelectedTokenIn(selectedTokenOut)
              setSelectedTokenOut(temp)
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
            value={selectedTokenOut}
            onChange={(e) => setSelectedTokenOut(e.target.value)}
            className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
          >
            {tokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amountOut}
            placeholder="0.0"
            readOnly
            className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50"
          />
          <div className="text-white/70 text-sm mt-1">
            Balance: {getTokenBalance(selectedTokenOut)} {tokens.find((t) => t.address === selectedTokenOut)?.symbol}
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!isConnected || !amountIn || isSwapping}
          className="w-full bg-gradient-to-r from-[#4B6CB7] to-[#182848] hover:from-blue-700 hover:to-[#1a2a4a] disabled:from-gray-600 disabled:to-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {!isConnected ? "Connect Wallet" : isSwapping ? "Swapping..." : "Swap"}
        </button>
      </div>
    </div>
  )
}

// Main Component
export default function KitoSwapDEX() {
  const { toasts, addToast, removeToast } = useToast()
  const { selectedNetwork, setSelectedNetwork, isConnected, getTokenBalance } = useWeb3()
  const [activeSection, setActiveSection] = useState("balances")

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

            <div className="flex items-center gap-4">
              {/* Network Selector */}
              <select
                value={selectedNetwork}
                onChange={(e) => {
                  setSelectedNetwork(e.target.value)
                  addToast(`Switched to ${NETWORKS[e.target.value].name}`, "success", 3000)
                }}
                className="bg-[#182848] text-white border-2 border-[#4B6CB7] rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#4B6CB7] focus:border-transparent transition-all shadow-md"
              >
                <option value="BSC">BSC Mainnet</option>
                <option value="METAL">Metal Build</option>
              </select>

              <AuthButtons addToast={addToast} />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setActiveSection("balances")}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeSection === "balances" ? "bg-green-600 text-white" : "text-white/70 hover:text-white"
                }`}
              >
                💰 Balances
              </button>
              <button
                onClick={() => setActiveSection("swap")}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeSection === "swap" ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"
                }`}
              >
                🔄 Swap
              </button>
              <button
                onClick={() => setActiveSection("liquidity")}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeSection === "liquidity" ? "bg-purple-600 text-white" : "text-white/70 hover:text-white"
                }`}
              >
                💧 Liquidity
              </button>
            </div>
          </div>
        </header>

        {/* Metal.build Integration */}
        <div className="container mx-auto px-4 mb-8">
          <MetalBuildIntegration selectedNetwork={selectedNetwork} addToast={addToast} />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 mb-8">
          {activeSection === "balances" && isConnected && (
            <TokenBalanceCard selectedNetwork={selectedNetwork} getTokenBalance={getTokenBalance} addToast={addToast} />
          )}

          {activeSection === "balances" && !isConnected && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-white/70 mb-6">Connect your wallet to view token balances</p>
              <AuthButtons addToast={addToast} />
            </div>
          )}

          {activeSection === "swap" && (
            <div className="max-w-lg mx-auto">
              <SwapInterface selectedNetwork={selectedNetwork} addToast={addToast} />
            </div>
          )}

          {activeSection === "liquidity" && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💧</div>
              <h3 className="text-2xl font-bold text-white mb-2">Liquidity Pools</h3>
              <p className="text-white/70">Liquidity functionality coming soon...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-white/70 text-sm mt-8 pb-8">
          <p>© 2025 KitoConnect. Production-ready DEX with Metal.build integration.</p>
          <div className="flex justify-center items-center gap-4 mt-2 flex-wrap">
            <span>Powered by {NETWORKS[selectedNetwork].name}</span>
            <span>•</span>
            <span>KBC & KBB Tokens</span>
            <span>•</span>
            <span>Built with ❤️</span>
          </div>
        </footer>
      </div>
    </>
  )
}
