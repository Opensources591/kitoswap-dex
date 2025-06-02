"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Provider"

export default function TxHistory() {
  const { account, isConnected } = useWeb3()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (isConnected && account) {
      fetchTransactions()
    }
  }, [isConnected, account])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)

      // Mock transaction data - in production, fetch from subgraph or Etherscan API
      const mockTxs = [
        {
          id: "1",
          type: "swap",
          hash: "0x1234...5678",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          tokenIn: "WBNB",
          tokenOut: "USDT",
          amountIn: "1.5",
          amountOut: "967.5",
          status: "confirmed",
        },
        {
          id: "2",
          type: "liquidity_add",
          hash: "0x2345...6789",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          tokenA: "KBC",
          tokenB: "WBNB",
          amountA: "1000",
          amountB: "0.5",
          status: "confirmed",
        },
        {
          id: "3",
          type: "farm_stake",
          hash: "0x3456...7890",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          pool: "CAKE-BNB LP",
          amount: "2.5",
          status: "confirmed",
        },
        {
          id: "4",
          type: "swap",
          hash: "0x4567...8901",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          tokenIn: "USDT",
          tokenOut: "KBB",
          amountIn: "500",
          amountOut: "125000",
          status: "failed",
        },
      ]

      setTransactions(mockTxs)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) => filter === "all" || tx.type === filter)

  const getTypeIcon = (type) => {
    switch (type) {
      case "swap":
        return "🔄"
      case "liquidity_add":
        return "💧"
      case "liquidity_remove":
        return "💧"
      case "farm_stake":
        return "🌾"
      case "farm_unstake":
        return "🌾"
      default:
        return "📝"
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "swap":
        return "Swap"
      case "liquidity_add":
        return "Add Liquidity"
      case "liquidity_remove":
        return "Remove Liquidity"
      case "farm_stake":
        return "Farm Stake"
      case "farm_unstake":
        return "Farm Unstake"
      default:
        return "Transaction"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "failed":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Transaction History</h3>
        <div className="text-center text-gray-600 py-8">
          <div className="text-lg mb-2">🔗</div>
          <div>Connect your wallet to view transaction history</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Transaction History</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="swap">Swaps</option>
          <option value="liquidity_add">Liquidity</option>
          <option value="farm_stake">Farming</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getTypeIcon(tx.type)}</span>
                <div>
                  <div className="font-medium text-gray-800">{getTypeLabel(tx.type)}</div>
                  <div className="text-sm text-gray-600">
                    {tx.type === "swap" && `${tx.amountIn} ${tx.tokenIn} → ${tx.amountOut} ${tx.tokenOut}`}
                    {tx.type === "liquidity_add" && `${tx.amountA} ${tx.tokenA} + ${tx.amountB} ${tx.tokenB}`}
                    {tx.type === "farm_stake" && `${tx.amount} ${tx.pool}`}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </div>
                <div className="text-xs text-gray-500">{formatTime(tx.timestamp)}</div>
                <a
                  href={`https://bscscan.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View on BSCScan
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">
          <div className="text-lg mb-2">📝</div>
          <div>No transactions found</div>
        </div>
      )}
    </div>
  )
}
