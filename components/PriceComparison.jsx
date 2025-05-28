"use client"

import { useState, useEffect } from "react"
import { quidaxClient } from "../lib/quidaxClient"
import { useSwapRate } from "../hooks/useSwapRate"

export default function PriceComparison({ tokenIn, tokenOut, amountIn, addToast }) {
  const [quidaxPrices, setQuidaxPrices] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { swapRate, isLoading: swapLoading } = useSwapRate(tokenIn, tokenOut, amountIn)

  // Mock token symbol mapping
  const getTokenSymbol = (tokenAddress) => {
    const tokenMap = {
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": "WBNB",
      "0x55d398326f99059fF775485246999027B3197955": "USDT",
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56": "BUSD",
      "0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c": "KBC",
      "0x386c66a0a3d452b7296c0763296fc7d9124e62f8": "KBB",
    }
    return tokenMap[tokenAddress] || "Unknown"
  }

  useEffect(() => {
    if (!tokenIn || !tokenOut) return

    const fetchPrices = async () => {
      setIsLoading(true)
      try {
        const tokenInSymbol = getTokenSymbol(tokenIn).toLowerCase()
        const tokenOutSymbol = getTokenSymbol(tokenOut).toLowerCase()

        const supportedTokens = ["btc", "eth", "usdt", "bnb"]
        const newPrices = {}

        for (const symbol of [tokenInSymbol, tokenOutSymbol]) {
          if (supportedTokens.includes(symbol)) {
            try {
              const priceData = await quidaxClient.getTokenPrice(symbol)
              newPrices[symbol] = priceData
            } catch (error) {
              console.log(`Price not available for ${symbol}`)
            }
          }
        }

        setQuidaxPrices(newPrices)
      } catch (error) {
        console.error("Error fetching Quidax prices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
  }, [tokenIn, tokenOut])

  const formatPrice = (price) => {
    const numPrice = Number.parseFloat(price)
    if (numPrice >= 1000000) {
      return `₦${(numPrice / 1000000).toFixed(2)}M`
    } else if (numPrice >= 1000) {
      return `₦${(numPrice / 1000).toFixed(2)}K`
    }
    return `₦${numPrice.toFixed(2)}`
  }

  const tokenInSymbol = getTokenSymbol(tokenIn).toLowerCase()
  const tokenOutSymbol = getTokenSymbol(tokenOut).toLowerCase()
  const hasQuidaxData = quidaxPrices[tokenInSymbol] || quidaxPrices[tokenOutSymbol]

  if (!hasQuidaxData && !isLoading) {
    return null
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium text-sm">Price Comparison</h4>
        {(isLoading || swapLoading) && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        )}
      </div>

      <div className="space-y-3">
        {/* Quidax Prices */}
        <div className="space-y-2">
          {quidaxPrices[tokenInSymbol] && (
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">{getTokenSymbol(tokenIn)} (Quidax)</span>
              <div className="text-right">
                <div className="text-white font-medium text-sm">{formatPrice(quidaxPrices[tokenInSymbol].price)}</div>
                <div
                  className={`text-xs ${
                    Number.parseFloat(quidaxPrices[tokenInSymbol].change) >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {quidaxPrices[tokenInSymbol].change}%
                </div>
              </div>
            </div>
          )}

          {quidaxPrices[tokenOutSymbol] && (
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">{getTokenSymbol(tokenOut)} (Quidax)</span>
              <div className="text-right">
                <div className="text-white font-medium text-sm">{formatPrice(quidaxPrices[tokenOutSymbol].price)}</div>
                <div
                  className={`text-xs ${
                    Number.parseFloat(quidaxPrices[tokenOutSymbol].change) >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {quidaxPrices[tokenOutSymbol].change}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DEX Rate */}
        {swapRate && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">DEX Rate</span>
              <span className="text-white text-sm">{swapRate.toFixed(6)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-white/50 text-center">Live prices from Quidax Exchange</div>
      </div>
    </div>
  )
}
