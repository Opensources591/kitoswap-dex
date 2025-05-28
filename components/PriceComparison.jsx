"use client"

import { useState, useEffect } from "react"
import { getTokenPrice } from "../lib/quidaxClient"

export default function PriceComparison({ tokenIn, tokenOut, networkConfig, dexPrice, addToast }) {
  const [quidaxPrices, setQuidaxPrices] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [priceComparison, setPriceComparison] = useState(null)

  // Get token symbol from address
  const getTokenSymbol = (tokenAddress) => {
    const tokenEntries = Object.entries(networkConfig.tokens)
    const found = tokenEntries.find(([, address]) => address === tokenAddress)
    return found ? found[0] : "Unknown"
  }

  // Fetch Quidax prices for comparison
  useEffect(() => {
    if (!tokenIn || !tokenOut) return

    const fetchPrices = async () => {
      setIsLoading(true)
      try {
        const tokenInSymbol = getTokenSymbol(tokenIn).toLowerCase()
        const tokenOutSymbol = getTokenSymbol(tokenOut).toLowerCase()

        // Only fetch if tokens are supported by Quidax
        const supportedTokens = ["btc", "eth", "usdt", "bnb", "ada", "dot"]

        const pricePromises = []

        if (supportedTokens.includes(tokenInSymbol)) {
          pricePromises.push(getTokenPrice(tokenInSymbol).then((price) => ({ token: tokenInSymbol, ...price })))
        }

        if (supportedTokens.includes(tokenOutSymbol)) {
          pricePromises.push(getTokenPrice(tokenOutSymbol).then((price) => ({ token: tokenOutSymbol, ...price })))
        }

        const prices = await Promise.allSettled(pricePromises)
        const newPrices = {}

        prices.forEach((result) => {
          if (result.status === "fulfilled") {
            newPrices[result.value.token] = result.value
          }
        })

        setQuidaxPrices(newPrices)

        // Calculate price comparison if we have both prices
        if (dexPrice && newPrices[tokenInSymbol] && newPrices[tokenOutSymbol]) {
          const quidaxRate =
            Number.parseFloat(newPrices[tokenOutSymbol].price) / Number.parseFloat(newPrices[tokenInSymbol].price)
          const dexRate = Number.parseFloat(dexPrice)
          const difference = ((dexRate - quidaxRate) / quidaxRate) * 100

          setPriceComparison({
            quidaxRate,
            dexRate,
            difference,
            arbitrageOpportunity: Math.abs(difference) > 1, // 1% threshold
          })
        }
      } catch (error) {
        console.error("Error fetching Quidax prices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
  }, [tokenIn, tokenOut, networkConfig, dexPrice])

  const formatPrice = (price) => {
    const numPrice = Number.parseFloat(price)
    if (numPrice >= 1000000) {
      return `₦${(numPrice / 1000000).toFixed(2)}M`
    } else if (numPrice >= 1000) {
      return `₦${(numPrice / 1000).toFixed(2)}K`
    }
    return `₦${numPrice.toFixed(2)}`
  }

  const formatPercentage = (value) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}%`
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
        <h4 className="text-white font-medium text-sm">Quidax Price Reference</h4>
        {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
      </div>

      <div className="space-y-3">
        {/* Individual Token Prices */}
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

        {/* Price Comparison */}
        {priceComparison && (
          <div className="pt-3 border-t border-white/10">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">DEX Rate</span>
                <span className="text-white text-sm">{priceComparison.dexRate.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Quidax Rate</span>
                <span className="text-white text-sm">{priceComparison.quidaxRate.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Difference</span>
                <span
                  className={`text-sm font-medium ${
                    priceComparison.difference >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatPercentage(priceComparison.difference)}
                </span>
              </div>

              {priceComparison.arbitrageOpportunity && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    <span className="text-yellow-400 text-xs font-medium">Arbitrage Opportunity Detected!</span>
                  </div>
                  <div className="text-yellow-300 text-xs mt-1">
                    {priceComparison.difference > 0
                      ? "DEX price is higher - consider selling on DEX"
                      : "Quidax price is higher - consider buying on DEX"}
                  </div>
                </div>
              )}
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
