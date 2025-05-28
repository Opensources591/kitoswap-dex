"use client"

import { useState } from "react"

export default function AddTokenButtons({ token, addToast }) {
  const [isAdding, setIsAdding] = useState(false)

  const addTokenToMetaMask = async () => {
    if (!window.ethereum) {
      addToast("MetaMask not detected", "error", 3000)
      return
    }

    try {
      setIsAdding(true)

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
        addToast(`${token.symbol} added to MetaMask!`, "success", 3000)
      } else {
        addToast("Token addition cancelled", "warning", 2000)
      }
    } catch (error) {
      console.error("Error adding token:", error)
      addToast(`Failed to add ${token.symbol}: ${error.message}`, "error", 3000)
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
      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-1"
      title={`Add ${token.symbol} to MetaMask`}
    >
      {isAdding ? (
        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <span>🦊</span>
      )}
      Add to MetaMask
    </button>
  )
}
