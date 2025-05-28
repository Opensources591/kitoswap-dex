"use client"

import { useState, useEffect } from "react"
import { getMarketData, get24hStats } from "../lib/quidaxClient"

export default function QuidaxMarketData({ addToast }) {
  const [marketData, setMarketData] = useState([])
  const [stats24h, setStats24h] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMarket, setSelectedMarket] = useState("btcngn")

  // Fetch market data on component mount
  useEffect(() => {
    fetchMarketData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMarketData = async () => {
    try {
      setError(null)
      const [marketsResponse, statsResponse] = await Promise.all([getMarketData(), get24hStats()])

      setMarketData(marketsResponse.data || [])
      setStats24h(statsResponse)

      if (!isLoading) {
        addToast("Market data updated", "success", 2000)
      }
    } catch (err) {
      setError(err.message)
      addToast(`Failed to fetch market data: ${err.message}`, "error", 5000)
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

  const formatVolume = (volume) => {
    const numVolume = Number.parseFloat(volume)
    return numVolume.toFixed(4)
  }

  const getChangeColor = (change) => {
    const numChange = Number.parseFloat(change)
    if (numChange > 0) return "text-green-400"
    if (numChange < 0) return "text-red-400"
    return "text-white/70"
  }

  const getAssetIcon = (symbol) => {
    const icons = {
      btc: "₿",
      eth: "Ξ",
      usdt: "💵",
      ada: "🔷",
      dot: "⚫",
    }
    return icons[symbol] || "💰"
  }

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
          Quidax Market Data
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                <div className="h-3 bg-white/10 rounded animate-pulse w-2/3"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 bg-white/20 rounded animate-pulse w-20"></div>
                <div className="h-3 bg-white/10 rounded animate-pulse w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${error ? "bg-red-400" : "bg-green-400"}`}></div>
          Quidax Market Data
        </h3>
        <button
          onClick={fetchMarketData}
          className="text-white/70 hover:text-white transition-colors text-sm"
          title="Refresh market data"
        >
          🔄
        </button>
      </div>

      {/* 24h Stats */}
      {stats24h && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/70">24h Volume</div>
            <div className="font-bold text-[#4B6CB7]">{formatPrice(stats24h.totalVolume)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/70">Markets</div>
            <div className="font-bold text-purple-400">{stats24h.totalMarkets}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/70">Top Gainer</div>
            <div className="font-bold text-green-400">{stats24h.topGainer.name}</div>
            <div className="text-xs text-green-400">{stats24h.topGainer.ticker.change}%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/70">Top Loser</div>
            <div className="font-bold text-red-400">{stats24h.topLoser.name}</div>
            <div className="text-xs text-red-400">{stats24h.topLoser.ticker.change}%</div>
          </div>
        </div>
      )}

      {/* Market List */}
      {marketData.length > 0 ? (
        <div className="space-y-3">
          {marketData.map((market) => (
            <div
              key={market.id}
              className={`flex justify-between items-center p-4 rounded-lg border transition-all cursor-pointer ${
                selectedMarket === market.id
                  ? "bg-[#4B6CB7]/20 border-[#4B6CB7]/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              onClick={() => setSelectedMarket(market.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getAssetIcon(market.base_unit)}</span>
                  <span className="font-bold text-white text-lg">{market.name}</span>
                  <span className="text-xs bg-[#4B6CB7] text-white px-2 py-1 rounded-full">
                    {market.base_unit.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-white/70">
                  Vol: {formatVolume(market.ticker.volume)} {market.base_unit.toUpperCase()}
                </div>
                <div className="text-xs text-white/50">
                  H: {formatPrice(market.ticker.high)} L: {formatPrice(market.ticker.low)}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-white text-lg">{formatPrice(market.ticker.last)}</div>
                <div className={`text-sm font-medium ${getChangeColor(market.ticker.change)}`}>
                  {Number.parseFloat(market.ticker.change) > 0 ? "+" : ""}
                  {market.ticker.change}%
                </div>
                <div className="text-xs text-white/50">{formatPrice(market.ticker.volume_quote)} vol</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-white/70 py-8">
          <div className="text-lg mb-2">📈</div>
          <div>No market data available</div>
          <button onClick={fetchMarketData} className="mt-2 text-[#4B6CB7] hover:text-blue-300 text-sm underline">
            Try again
          </button>
        </div>
      )}

      {/* Last updated timestamp */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-white/50 text-center">
          Last updated: {new Date().toLocaleTimeString()} • Powered by Quidax
        </div>
      </div>
    </div>
  )
}
