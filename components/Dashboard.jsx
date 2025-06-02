"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Provider"

export default function Dashboard() {
  const { provider, currentNetwork } = useWeb3()
  const [stats, setStats] = useState({
    totalVolume: "0",
    totalLiquidity: "0",
    kbcPoolTvl: "0",
    kbbPoolTvl: "0",
    totalPairs: "0",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [provider, currentNetwork])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)

      // Mock data - in production, fetch from factory contract
      const mockStats = {
        totalVolume: currentNetwork === "BSC" ? "2,847,392.45" : "156,789.23",
        totalLiquidity: currentNetwork === "BSC" ? "847,293,847.92" : "45,892,347.18",
        kbcPoolTvl: currentNetwork === "BSC" ? "456,789.12" : "234,567.89",
        kbbPoolTvl: currentNetwork === "BSC" ? "234,567.89" : "123,456.78",
        totalPairs: currentNetwork === "BSC" ? "1,843" : "456",
      }

      setStats(mockStats)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return `$${value}`
  }

  const StatCard = ({ title, value, icon, color = "blue" }) => (
    <div className={`bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-xl p-6 border border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium`}>{title}</p>
          <p className={`text-2xl font-bold text-${color}-800 mt-1`}>{value}</p>
        </div>
        <div className={`text-3xl text-${color}-600`}>{icon}</div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">KitoSwap Dashboard</h1>
        <p className="text-gray-600">
          Decentralized exchange on {currentNetwork === "BSC" ? "BNB Smart Chain" : "Metal Build"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Volume (24h)" value={formatCurrency(stats.totalVolume)} icon="📊" color="blue" />

        <StatCard title="Total Liquidity" value={formatCurrency(stats.totalLiquidity)} icon="💧" color="green" />

        <StatCard title="KBC Pool TVL" value={formatCurrency(stats.kbcPoolTvl)} icon="🪙" color="purple" />

        <StatCard title="KBB Pool TVL" value={formatCurrency(stats.kbbPoolTvl)} icon="🪙" color="pink" />

        <StatCard title="Total Pairs" value={stats.totalPairs} icon="🔗" color="indigo" />
      </div>

      {/* Top Pools */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top Pools</h3>
        <div className="space-y-3">
          {[
            { pair: "KBC/WBNB", tvl: "$456,789", apr: "45.67%", volume: "$12,345" },
            { pair: "KBB/WBNB", tvl: "$234,567", apr: "38.92%", volume: "$8,901" },
            { pair: "WBNB/USDT", tvl: "$1,234,567", apr: "12.34%", volume: "$45,678" },
          ].map((pool, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{pool.pair}</div>
                  <div className="text-sm text-gray-600">TVL: {pool.tvl}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{pool.apr}</div>
                <div className="text-sm text-gray-600">Vol: {pool.volume}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
