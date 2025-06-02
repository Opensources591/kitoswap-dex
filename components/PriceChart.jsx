"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function PriceChart({ symbol = "BTC" }) {
  const [chartData, setChartData] = useState([])
  const [timeframe, setTimeframe] = useState("24h")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateMockData()
  }, [symbol, timeframe])

  const generateMockData = () => {
    setIsLoading(true)

    // Generate mock price data
    const dataPoints = timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : 30
    const basePrice = symbol === "BTC" ? 45000000 : symbol === "ETH" ? 2800000 : 1580
    const data = []

    for (let i = 0; i < dataPoints; i++) {
      const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
      const price = basePrice * (1 + variation)
      const timestamp = new Date()

      if (timeframe === "24h") {
        timestamp.setHours(timestamp.getHours() - (dataPoints - i))
      } else if (timeframe === "7d") {
        timestamp.setDate(timestamp.getDate() - (dataPoints - i))
      } else {
        timestamp.setDate(timestamp.getDate() - (dataPoints - i))
      }

      data.push({
        time: timestamp.toISOString(),
        price: price,
        formattedTime:
          timeframe === "24h"
            ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : timestamp.toLocaleDateString([], { month: "short", day: "numeric" }),
      })
    }

    setChartData(data)
    setIsLoading(false)
  }

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(2)}M`
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(2)}K`
    }
    return `₦${price.toFixed(2)}`
  }

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : currentPrice
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{symbol}/NGN</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-800">{formatPrice(currentPrice)}</span>
            <span className={`text-sm font-medium ${priceChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
              {priceChangePercent >= 0 ? "+" : ""}
              {priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {["24h", "7d", "30d"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                timeframe === tf ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="formattedTime" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} tickFormatter={formatPrice} />
            <Tooltip formatter={(value) => [formatPrice(value), "Price"]} labelStyle={{ color: "#666" }} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3B82F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
