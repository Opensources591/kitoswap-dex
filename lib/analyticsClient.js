// Mock Analytics Client for KitoSwap DEX
export const analyticsClient = {
  getVolumeHistory: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400))

    // Generate mock volume history for the last 30 days
    const history = []
    const baseDate = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - i)

      // Generate realistic volume data with some variation
      const baseVolume = 15000 + Math.sin(i * 0.2) * 5000
      const randomVariation = (Math.random() - 0.5) * 4000
      const volume = Math.max(1000, baseVolume + randomVariation)

      history.push({
        date: date.toISOString().split("T")[0],
        volume: Math.round(volume),
        tvl: Math.round(volume * 45.2), // Mock TVL calculation
        transactions: Math.round(volume / 12.5), // Mock transaction count
      })
    }

    return history
  },

  getTopTokens: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 300))

    return [
      {
        symbol: "WBNB",
        volume: 8500.45,
        change24h: "+2.3%",
        price: "$645.23",
        tvl: 2847392.45,
      },
      {
        symbol: "USDT",
        volume: 6200.78,
        change24h: "+0.1%",
        price: "$1.00",
        tvl: 1923847.18,
      },
      {
        symbol: "CAKE",
        volume: 4100.32,
        change24h: "-1.2%",
        price: "$2.45",
        tvl: 892347.92,
      },
      {
        symbol: "BUSD",
        volume: 3800.91,
        change24h: "+0.05%",
        price: "$1.00",
        tvl: 756293.84,
      },
      {
        symbol: "ETH",
        volume: 2900.67,
        change24h: "+4.7%",
        price: "$3,245.67",
        tvl: 645829.73,
      },
    ]
  },

  getMarketStats: async (chainId = 56) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 200))

    const isBSC = chainId === 56
    const baseMultiplier = isBSC ? 1 : 0.15

    return {
      volume24h: (2847392.45 * baseMultiplier * (0.9 + Math.random() * 0.2)).toFixed(2),
      tvl: (847293847.92 * baseMultiplier).toFixed(2),
      change24h: isBSC ? "+12.4" : "+8.7",
      transactions24h: Math.round(18429 * baseMultiplier).toString(),
      activePairs: Math.round(1843 * baseMultiplier).toString(),
      totalUsers: Math.round(45892 * baseMultiplier).toString(),
    }
  },

  getPairAnalytics: async (tokenA, tokenB) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300))

    return {
      volume24h: (Math.random() * 50000 + 10000).toFixed(2),
      liquidity: (Math.random() * 500000 + 100000).toFixed(2),
      priceChange24h: ((Math.random() - 0.5) * 20).toFixed(2),
      fees24h: (Math.random() * 1000 + 100).toFixed(2),
      transactions24h: Math.round(Math.random() * 500 + 50),
    }
  },
}

// Legacy exports for backward compatibility with existing v0Client usage
export const getTradeVolume = async (chainId, factoryAddress) => {
  try {
    const stats = await analyticsClient.getMarketStats(chainId)
    return stats
  } catch (error) {
    console.error("Error fetching trade volume:", error)

    // Fallback data
    const isBSC = chainId === 56
    return {
      volume24h: isBSC ? "2,847,392.45" : "156,789.23",
      tvl: isBSC ? "847,293,847.92" : "45,892,347.18",
      change24h: isBSC ? "+12.4" : "+8.7",
      transactions24h: isBSC ? "18,429" : "3,247",
      activePairs: isBSC ? "1,843" : "456",
    }
  }
}

export const getAnalyticsData = async (chainId, factoryAddress) => {
  return await getTradeVolume(chainId, factoryAddress)
}

export default analyticsClient
