"use client"

import { useState } from "react"

export default function AddTokenButtons({ token, addToast }) {
  const [isAdding, setIsAdding] = useState(false)

  const addTokenToMetaMask = async () => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      addToast("MetaMask not detected. Please install MetaMask extension.", "error", 5000)
      return
    }

    // Check if we're on the correct network (BSC)
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      if (chainId !== "0x38") {
        // BSC Mainnet chain ID
        addToast("Please switch to BSC Mainnet in MetaMask", "warning", 5000)
        return
      }
    } catch (error) {
      console.error("Error checking network:", error)
    }

    try {
      setIsAdding(true)
      addToast(`Adding ${token.symbol} to MetaMask...`, "info", 2000)

      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.logoURI,
          },
        },
      })

      if (wasAdded) {
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
      } else {
        addToast("Token addition was cancelled by user", "warning", 3000)
      }
    } catch (error) {
      console.error("Error adding token:", error)

      // Handle specific error cases
      if (error.code === 4001) {
        addToast("User rejected the request", "warning", 3000)
      } else if (error.code === -32602) {
        addToast("Invalid token parameters", "error", 3000)
      } else {
        addToast(`Failed to add ${token.symbol}: ${error.message}`, "error", 5000)
      }
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
