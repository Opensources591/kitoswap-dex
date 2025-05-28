"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/Web3Provider"

export default function AuthButtons({ addToast }) {
  const { isConnected, account, connect, disconnect, isLoading } = useWeb3()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      addToast("Connecting wallet...", "info", 2000)
      await connect()
      addToast("Wallet connected successfully!", "success", 3000)
    } catch (error) {
      console.error("Connection error:", error)
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
      console.error("Disconnect error:", error)
      addToast(`Disconnect failed: ${error.message}`, "error", 3000)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span className="text-white/70 text-sm">Initializing...</span>
      </div>
    )
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
