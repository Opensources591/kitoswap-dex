"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Provider"
import AuthButtons from "../components/AuthButtons"
import TransferButtons from "../components/TransferButtons"
import QuidaxRamp from "../components/QuidaxRamp"
import QuidaxMarketData from "../components/QuidaxMarketData"
import PriceComparison from "../components/PriceComparison"
import AddTokenButtons from "../components/AddTokenButtons"
import tokensConfig from "../src/config/tokens.json"

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

export default function KitoSwapDEX() {
  const { isConnected, account, getBalance } = useWeb3()
  const { toasts, addToast, removeToast } = useToast()
  const [balance, setBalance] = useState("0")
  const [selectedTokenIn, setSelectedTokenIn] = useState("")
  const [selectedTokenOut, setSelectedTokenOut] = useState("")
  const [amountIn, setAmountIn] = useState("")

  const tokens = tokensConfig["56"]?.tokens || []

  useEffect(() => {
    if (tokens.length >= 2) {
      setSelectedTokenIn(tokens[0].address)
      setSelectedTokenOut(tokens[1].address)
    }
  }, [tokens])

  useEffect(() => {
    if (isConnected && account) {
      getBalance().then(setBalance)
    }
  }, [isConnected, account, getBalance])

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

              {/* Price Comparison */}
              <PriceComparison
                tokenIn={selectedTokenIn}
                tokenOut={selectedTokenOut}
                amountIn={amountIn}
                addToast={addToast}
              />

              {/* Swap Button */}
              <button
                disabled={!isConnected || !amountIn}
                className="w-full bg-gradient-to-r from-[#4B6CB7] to-[#182848] hover:from-blue-700 hover:to-[#1a2a4a] disabled:from-gray-600 disabled:to-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
              >
                {!isConnected ? "Connect Wallet" : "Swap"}
              </button>
            </div>
          </div>

          {/* Quidax Ramp */}
          <QuidaxRamp addToast={addToast} />
        </div>

        {/* Market Data */}
        <div className="container mx-auto px-4 mb-8">
          <QuidaxMarketData addToast={addToast} />
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
