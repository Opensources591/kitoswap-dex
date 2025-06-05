"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react"

interface PriceData {
  time: string
  price: number
  volume: number
}

interface MarketChartProps {
  symbol?: string
  className?: string
}

export function MarketChart({ symbol = "BNB/USDT", className }: MarketChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  // Add error state and better data generation
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Generate mock data for demonstration
    generateMockData()

    // Set up real-time updates
    const interval = setInterval(() => {
      updatePriceData()
    }, 5000)

    return () => clearInterval(interval)
  }, [symbol])

  // Update the generateMockData function to be more robust:
  const generateMockData = () => {
    try {
      const now = Date.now()
      const data: PriceData[] = []
      let basePrice = 580 // Starting BNB price

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })

        // Add some realistic price movement
        basePrice += (Math.random() - 0.5) * 20
        basePrice = Math.max(500, Math.min(650, basePrice)) // Keep within range

        data.push({
          time,
          price: Number(basePrice.toFixed(2)),
          volume: Math.random() * 1000000,
        })
      }

      setPriceData(data)
      setCurrentPrice(data[data.length - 1].price)
      setPriceChange(((data[data.length - 1].price - data[0].price) / data[0].price) * 100)
      setIsLoading(false)
      setError(null)
    } catch (err) {
      console.error("Error generating chart data:", err)
      setError("Failed to load chart data")
      setIsLoading(false)
    }
  }

  const updatePriceData = () => {
    setPriceData((prev) => {
      const newData = [...prev]
      const lastPrice = newData[newData.length - 1].price
      const newPrice = lastPrice + (Math.random() - 0.5) * 10
      const clampedPrice = Math.max(500, Math.min(650, newPrice))

      // Remove first item and add new one
      newData.shift()
      newData.push({
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: Number(clampedPrice.toFixed(2)),
        volume: Math.random() * 1000000,
      })

      setCurrentPrice(clampedPrice)
      setPriceChange(((clampedPrice - prev[0].price) / prev[0].price) * 100)

      return newData
    })
  }

  // Update the error display in the return statement:
  if (error) {
    return (
      <Card
        className={`bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border-2 border-red-400/30 ${className}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 text-red-400">
            <AlertCircle className="w-8 h-8 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card
        className={`bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl border-2 border-blue-400/30 ${className}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <Activity className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl border-2 border-blue-400/30 ${className}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-bold text-lg">{symbol} Price Chart</CardTitle>
          <div className="flex items-center space-x-2">
            {priceChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-bold ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-3xl font-black text-cyan-400">${currentPrice.toFixed(2)}</div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                domain={["dataMin - 10", "dataMax + 10"]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#06b6d4" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
