"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/Web3Provider"

export default function AuthButtons() {
  const { isConnected, account, balance, connect, disconnect, isLoading } = useWeb3()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await connect()
    } catch (error) {
      console.error("Connection error:", error)
      alert(`Connection failed: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error("Disconnect error:", error)
      alert(`Disconnect failed: ${error.message}`)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (bal) => {
    return Number.parseFloat(bal).toFixed(4)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-gray-600 text-sm">Initializing...</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center gap-2"
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
      <div className="text-gray-700 text-sm">
        <div className="font-medium">{formatAddress(account)}</div>
        <div className="text-xs text-green-600">{formatBalance(balance)} BNB</div>
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
