"use client"

import { useState } from "react"

export default function AddToMetaMaskButton({ token }) {
  const [isAdding, setIsAdding] = useState(false)

  const addTokenToMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask extension.")
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
        alert(`${token.symbol} successfully added to MetaMask!`)
      } else {
        alert("Token addition was cancelled by user")
      }
    } catch (error) {
      console.error("Error adding token:", error)
      alert(`Failed to add ${token.symbol}: ${error.message}`)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      onClick={addTokenToMetaMask}
      disabled={isAdding}
      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-xs font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-1"
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
