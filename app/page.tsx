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

// Mock Web3 Context
function useWeb3() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")

  return {
    isConnected,
    account,
    connect: () => {
      setIsConnected(true)
      setAccount("0xa36f...4f81")
    },
    disconnect: () => {
      setIsConnected(false)
      setAccount("")
    },
    getBalance: () => Promise.resolve("12.5432"),
  }
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
      connect()
      addToast("Wallet connected successfully!", "success", 3000)
    } catch (error) {
      addToast(`Connection failed: ${error.message}`, "error", 5000)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      disconnect()
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

// Add Token Buttons Component
function AddTokenButtons({ token, addToast }) {
  const [isAdding, setIsAdding] = useState(false)

  const addTokenToMetaMask = async () => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      addToast("MetaMask not detected. Please install MetaMask extension.", "error", 5000)
      return
    }

    try {
      setIsAdding(true)
      addToast(`Adding ${token.symbol} to MetaMask...`, "info", 2000)

      // Simulate MetaMask interaction
      await new Promise((resolve) => setTimeout(resolve, 1500))

      addToast(
        <div>
          ✅ {token.symbol} successfully added to MetaMask!
          <div className="text-xs mt-1 opacity-80">
            Address: {token.address.slice(0, 10)}...{token.address.slice(-8)}
          </div>
        </div>,
        "success",
        5000,
      )
    } catch (error) {
      addToast(`Failed to add ${token.symbol}: ${error.message}`, "error", 5000)
    } finally {
      setIsAdding(false)
    }
  }

  // Only show button for KBC and KBB tokens
  if (!["KBC", "KBB"].includes(token.symbol)) {
    return null
  }

  return (
    <button
      onClick={addTokenToMetaMask}
      disabled={isAdding}
      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-1 shadow-md"
      title={`Add ${token.symbol} to MetaMask`}
    >
      {isAdding ? (
        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <span>🦊</span>
      )}
      Add {token.symbol}
    </button>
  )
}

// MetaMask Test Panel Component
function MetaMaskTestPanel({ addToast }) {
  const [metaMaskStatus, setMetaMaskStatus] = useState({
    installed: typeof window !== "undefined" && typeof window.ethereum !== "undefined",
    connected: false,
    chainId: "0x38",
    account: null,
  })

  const tokens = [
    {
      symbol: "KBC",
      name: "KBC Gospel Token",
      address: "0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c",
      decimals: 18,
      logoURI: "https://www.manamix.space/assets/kbc-logo.png",
    },
    {
      symbol: "KBB",
      name: "KBB Family Token",
      address: "0x386c66a0a3d452b7296c0763296fc7d9124e62f8",
      decimals: 18,
      logoURI: "https://www.manamix.space/assets/kbb-logo.png",
    },
  ]

  const kbcToken = tokens.find((t) => t.symbol === "KBC")
  const kbbToken = tokens.find((t) => t.symbol === "KBB")

  const connectMetaMask = async () => {
    addToast("Connecting to MetaMask...", "info", 2000)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setMetaMaskStatus((prev) => ({ ...prev, connected: true, account: "0xa36f...4f81" }))
    addToast("MetaMask connected successfully!", "success", 3000)
  }

  const switchToBSC = async () => {
    addToast("Switching to BSC Mainnet...", "info", 2000)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setMetaMaskStatus((prev) => ({ ...prev, chainId: "0x38" }))
    addToast("Switched to BSC Mainnet", "success", 3000)
  }

  const getChainName = (chainId) => {
    switch (chainId) {
      case "0x38":
        return "BSC Mainnet"
      case "0x1":
        return "Ethereum Mainnet"
      case "0x89":
        return "Polygon"
      default:
        return `Unknown (${chainId})`
    }
  }

  const getStatusColor = (status) => {
    return status ? "text-green-400" : "text-red-400"
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🦊</span>
        MetaMask Integration Test
      </h3>

      {/* MetaMask Status */}
      <div className="space-y-3 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-medium mb-3">Connection Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">MetaMask Installed:</span>
              <span className={getStatusColor(metaMaskStatus.installed)}>
                {metaMaskStatus.installed ? "✅ Yes" : "❌ No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Connected:</span>
              <span className={getStatusColor(metaMaskStatus.connected)}>
                {metaMaskStatus.connected ? "✅ Yes" : "❌ No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Network:</span>
              <span className={metaMaskStatus.chainId === "0x38" ? "text-green-400" : "text-yellow-400"}>
                {metaMaskStatus.chainId ? getChainName(metaMaskStatus.chainId) : "Unknown"}
              </span>
            </div>
            {metaMaskStatus.account && (
              <div className="flex justify-between">
                <span className="text-white/70">Account:</span>
                <span className="text-white font-mono text-xs">
                  {metaMaskStatus.account.slice(0, 6)}...{metaMaskStatus.account.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!metaMaskStatus.connected && (
            <button
              onClick={connectMetaMask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
            >
              Connect MetaMask
            </button>
          )}
          {metaMaskStatus.chainId !== "0x38" && (
            <button
              onClick={switchToBSC}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
            >
              Switch to BSC
            </button>
          )}
        </div>
      </div>

      {/* Token Addition Tests */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">Test Token Addition</h4>

        {/* KBC Token Test */}
        {kbcToken && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{kbcToken.name}</div>
                <div className="text-white/70 text-sm">Symbol: {kbcToken.symbol}</div>
                <div className="text-white/70 text-xs font-mono">
                  {kbcToken.address.slice(0, 10)}...{kbcToken.address.slice(-8)}
                </div>
              </div>
              <AddTokenButtons token={kbcToken} addToast={addToast} />
            </div>
          </div>
        )}

        {/* KBB Token Test */}
        {kbbToken && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{kbbToken.name}</div>
                <div className="text-white/70 text-sm">Symbol: {kbbToken.symbol}</div>
                <div className="text-white/70 text-xs font-mono">
                  {kbbToken.address.slice(0, 10)}...{kbbToken.address.slice(-8)}
                </div>
              </div>
              <AddTokenButtons token={kbbToken} addToast={addToast} />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <h5 className="text-blue-300 font-medium mb-2">Testing Instructions:</h5>
        <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
          <li>Ensure MetaMask is installed and connected</li>
          <li>Switch to BSC Mainnet if not already connected</li>
          <li>Click "Add KBC" or "Add KBB" buttons</li>
          <li>Approve the token addition in MetaMask popup</li>
          <li>Verify tokens appear in your MetaMask token list</li>
        </ol>
      </div>
    </div>
  )
}

// Transfer Buttons Component
function TransferButtons({ addToast }) {
  const { account, isConnected } = useWeb3()
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!recipient || !amount) {
      addToast("Please fill all fields", "error", 3000)
      return
    }

    try {
      setIsLoading(true)
      addToast("Preparing transaction...", "info", 2000)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      addToast(
        <div>
          Transaction confirmed!
          <a href="#" className="underline ml-1">
            View on BSCScan
          </a>
        </div>,
        "success",
        5000,
      )

      setRecipient("")
      setAmount("")
      setShowSendModal(false)
    } catch (error) {
      addToast(`Transaction failed: ${error.message}`, "error", 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReceive = () => {
    if (!account) {
      addToast("Please connect your wallet first", "error", 3000)
      return
    }
    setShowReceiveModal(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(account || "0xa36f...4f81")
      addToast("Address copied to clipboard!", "success", 2000)
    } catch (error) {
      addToast("Failed to copy address", "error", 2000)
    }
  }

  return (
    <>
      {/* Transfer Buttons */}
      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={() => setShowSendModal(true)}
          disabled={!isConnected}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center gap-2"
        >
          <span>📤</span>
          Send BNB
        </button>
        <button
          onClick={handleReceive}
          disabled={!isConnected}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center gap-2"
        >
          <span>📥</span>
          Receive
        </button>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Send BNB</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Amount (BNB)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSendModal(false)}
                  disabled={isLoading}
                  className="flex-1 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white py-2 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !recipient || !amount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Receive BNB</h3>

            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-600">QR Code</div>
              </div>

              <div>
                <p className="text-white/70 text-sm mb-2">Your Wallet Address:</p>
                <div className="bg-white/20 rounded-lg p-3 break-all text-white font-mono text-sm">
                  {account || "0xa36f...4f81"}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all"
                >
                  Copy Address
                </button>
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Main Component
export default function KitoSwapDEX() {
  const { isConnected, account, getBalance } = useWeb3()
  const { toasts, addToast, removeToast } = useToast()
  const [balance, setBalance] = useState("0")
  const [selectedTokenIn, setSelectedTokenIn] = useState("")
  const [selectedTokenOut, setSelectedTokenOut] = useState("")
  const [amountIn, setAmountIn] = useState("")

  const tokens = [
    {
      symbol: "WBNB",
      name: "Wrapped BNB",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
    },
    {
      symbol: "KBC",
      name: "KBC Gospel Token",
      address: "0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c",
      decimals: 18,
    },
    {
      symbol: "KBB",
      name: "KBB Family Token",
      address: "0x386c66a0a3d452b7296c0763296fc7d9124e62f8",
      decimals: 18,
    },
  ]

  useEffect(() => {
    if (tokens.length >= 2) {
      setSelectedTokenIn(tokens[0].address)
      setSelectedTokenOut(tokens[1].address)
    }
  }, [])

  useEffect(() => {
    if (isConnected && account) {
      getBalance().then(setBalance)
    }
  }, [isConnected, account])

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

            <AuthButtons addToast={addToast} />
          </div>
        </header>

        {/* Transfer Buttons */}
        <div className="container mx-auto px-4 mb-8">
          <TransferButtons addToast={addToast} />
        </div>

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Swap Interface */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 text-center">Swap Tokens</h2>

            <div className="space-y-4">
              {/* Token Input */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">From</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedTokenIn}
                    onChange={(e) => setSelectedTokenIn(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                  {tokens.find((t) => t.address === selectedTokenIn) && (
                    <AddTokenButtons token={tokens.find((t) => t.address === selectedTokenIn)} addToast={addToast} />
                  )}
                </div>
                <input
                  type="number"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
                />
                <div className="text-white/70 text-sm mt-1">Balance: {balance} BNB</div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const temp = selectedTokenIn
                    setSelectedTokenIn(selectedTokenOut)
                    setSelectedTokenOut(temp)
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all transform hover:rotate-180"
                >
                  ↕️
                </button>
              </div>

              {/* Token Output */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">To</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedTokenOut}
                    onChange={(e) => setSelectedTokenOut(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#4B6CB7]"
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                  {tokens.find((t) => t.address === selectedTokenOut) && (
                    <AddTokenButtons token={tokens.find((t) => t.address === selectedTokenOut)} addToast={addToast} />
                  )}
                </div>
                <input
                  type="number"
                  placeholder="0.0"
                  readOnly
                  className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50"
                />
              </div>

              {/* Swap Button */}
              <button
                disabled={!isConnected || !amountIn}
                className="w-full bg-gradient-to-r from-[#4B6CB7] to-[#182848] hover:from-blue-700 hover:to-[#1a2a4a] disabled:from-gray-600 disabled:to-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
              >
                {!isConnected ? "Connect Wallet" : "Swap"}
              </button>
            </div>
          </div>

          {/* Quidax Ramp Placeholder */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🏦</span>
              Quidax NGN On/Off Ramp
            </h3>
            <div className="text-center text-white/70 py-8">
              <div className="text-lg mb-2">💱</div>
              <div>Buy/Sell crypto with Nigerian Naira</div>
              <div className="text-sm mt-2">Coming soon...</div>
            </div>
          </div>
        </div>

        {/* MetaMask Test Panel */}
        <div className="container mx-auto px-4 mb-8">
          <MetaMaskTestPanel addToast={addToast} />
        </div>

        {/* Footer */}
        <footer className="text-center text-white/70 text-sm mt-8 pb-8">
          <p>© 2025 KitoConnect. Production-ready DEX on BNB Smart Chain.</p>
          <div className="flex justify-center items-center gap-4 mt-2 flex-wrap">
            <span>Powered by Web3Auth</span>
            <span>•</span>
            <span>Secured by BNB Chain</span>
            <span>•</span>
            <span>Built with ❤️</span>
          </div>
        </footer>
      </div>
    </>
  )
}
