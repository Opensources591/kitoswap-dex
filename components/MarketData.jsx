"use client"

import { useState, useEffect } from "react"

export default function MarketData() {
  const [marketData, setMarketData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMarketData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMarketData = async () => {
    try {
      setError(null)
      const response = await fetch("/api/quidax/markets")
      const data = await response.json()
      setMarketData(data.data || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching market data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price) => {
    const numPrice = Number.parseFloat(price)
    if (numPrice >= 1000000) {
      return `₦${(numPrice / 1000000).toFixed(2)}M`
    } else if (numPrice >= 1000) {
      return `₦${(numPrice / 1000).toFixed(2)}K`
    }
    return `₦${numPrice.toFixed(2)}`
  }

  const getChangeColor = (change) => {
    const numChange = Number.parseFloat(change)
    if (numChange > 0) return "text-green-600"
    if (numChange < 0) return "text-red-600"
    return "text-gray-600"
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Market Data</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Market Data</h3>
        <div className="text-center text-red-600 py-8">
          <div className="text-lg mb-2">⚠️</div>
          <div>Failed to load market data</div>
          <button onClick={fetchMarketData} className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Market Data</h3>
        <button
          onClick={fetchMarketData}
          className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          title="Refresh market data"
        >
          🔄
        </button>
      </div>

      {marketData.length > 0 ? (
        <div className="space-y-3">
          {marketData.map((market) => (
            <div
              key={market.id}
              className="flex justify-between items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-lg">{market.name}</div>
                <div className="text-sm text-gray-600">
                  Vol: {Number.parseFloat(market.ticker.volume).toFixed(4)} {market.base_unit.toUpperCase()}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-800 text-lg">{formatPrice(market.ticker.last)}</div>
                <div className={`text-sm font-medium ${getChangeColor(market.ticker.change)}`}>
                  {Number.parseFloat(market.ticker.change) > 0 ? "+" : ""}
                  {market.ticker.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">
          <div className="text-lg mb-2">📈</div>
          <div>No market data available</div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleTimeString()} • Powered by Quidax
        </div>
      </div>
    </div>
  )
}
