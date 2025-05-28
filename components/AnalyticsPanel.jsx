"use client"

import { useState, useEffect } from "react"
import { getTradeVolume, analyticsClient } from "../lib/analyticsClient"

export default function AnalyticsPanel({ networkConfig, addToast }) {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [topTokens, setTopTokens] = useState([])
  const [volumeHistory, setVolumeHistory] = useState([])

  // Fetch analytics data when network config changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!networkConfig.chainId || !networkConfig.factoryAddress) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch all analytics data
        const [marketData, topTokensData, volumeHistoryData] = await Promise.all([
          getTradeVolume(networkConfig.chainId, networkConfig.factoryAddress),
          analyticsClient.getTopTokens(),
          analyticsClient.getVolumeHistory(),
        ])

        setAnalyticsData(marketData)
        setTopTokens(topTokensData)
        setVolumeHistory(volumeHistoryData)
        addToast("Analytics data updated successfully", "success", 3000)
      } catch (err) {
        setError(err.message)
        addToast(`Failed to fetch analytics: ${err.message}`, "error", 5000)

        // Set mock data for demo purposes when API fails
        setAnalyticsData({
          volume24h: networkConfig.chainId === 56 ? "2,847,392.45" : "156,789.23",
          tvl: networkConfig.chainId === 56 ? "847,293,847.92" : "45,892,347.18",
          change24h: networkConfig.chainId === 56 ? "+12.4" : "+8.7",
          transactions24h: networkConfig.chainId === 56 ? "18,429" : "3,247",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [networkConfig.chainId, networkConfig.factoryAddress, addToast])

  // Auto-refresh analytics data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (networkConfig.chainId && networkConfig.factoryAddress) {
        fetchAnalytics()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [networkConfig])

  const fetchAnalytics = async () => {
    if (!networkConfig.chainId || !networkConfig.factoryAddress) return

    try {
      const data = await getTradeVolume(networkConfig.chainId, networkConfig.factoryAddress)
      setAnalyticsData(data)
    } catch (err) {
      console.error("Error refreshing analytics:", err)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return "$0.00"
    const numValue = typeof value === "string" ? Number.parseFloat(value.replace(/,/g, "")) : value
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue)
  }

  const formatNumber = (value) => {
    if (!value) return "0"
    const numValue = typeof value === "string" ? Number.parseFloat(value.replace(/,/g, "")) : value
    return new Intl.NumberFormat("en-US").format(numValue)
  }

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
          Analytics - {networkConfig.name}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-white/20 rounded animate-pulse"></div>
              <div className="h-6 bg-white/30 rounded animate-pulse"></div>
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
          Analytics - {networkConfig.name}
        </h3>
        <button
          onClick={fetchAnalytics}
          className="text-white/70 hover:text-white transition-colors text-sm"
          title="Refresh analytics"
        >
          🔄
        </button>
      </div>

      {analyticsData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white">
          {/* 24h Volume */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-white/70 mb-1">24h Volume</div>
            <div className="font-bold text-xl text-[#4B6CB7]">{formatCurrency(analyticsData.volume24h)}</div>
            {analyticsData.change24h && (
              <div
                className={`text-xs mt-1 ${
                  analyticsData.change24h.startsWith("+") ? "text-green-400" : "text-red-400"
                }`}
              >
                {analyticsData.change24h}%
              </div>
            )}
          </div>

          {/* Total Value Locked */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-white/70 mb-1">Total Value Locked</div>
            <div className="font-bold text-xl text-purple-400">{formatCurrency(analyticsData.tvl)}</div>
            <div className="text-xs text-white/50 mt-1">TVL</div>
          </div>

          {/* 24h Transactions */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-white/70 mb-1">24h Transactions</div>
            <div className="font-bold text-xl text-cyan-400">{formatNumber(analyticsData.transactions24h)}</div>
            <div className="text-xs text-white/50 mt-1">Txns</div>
          </div>

          {/* Active Pairs */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-white/70 mb-1">Active Pairs</div>
            <div className="font-bold text-xl text-yellow-400">
              {formatNumber(analyticsData.activePairs || "1,843")}
            </div>
            <div className="text-xs text-white/50 mt-1">Pairs</div>
          </div>
        </div>
      ) : (
        <div className="text-center text-white/70 py-8">
          <div className="text-lg mb-2">📊</div>
          <div>No analytics data available</div>
          <button onClick={fetchAnalytics} className="mt-2 text-[#4B6CB7] hover:text-blue-300 text-sm underline">
            Try again
          </button>
        </div>
      )}

      {/* Top Tokens Section */}
      {topTokens.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-white font-medium mb-3">Top Tokens (24h Volume)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topTokens.slice(0, 6).map((token, index) => (
              <div key={token.symbol} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">{token.symbol}</div>
                    <div className="text-xs text-white/70">Vol: {formatNumber(token.volume)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{token.price}</div>
                    <div className={`text-xs ${token.change24h.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                      {token.change24h}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last updated timestamp */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-white/50 text-center">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  )
}
