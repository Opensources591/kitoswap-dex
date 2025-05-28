// Client-side Quidax API wrapper - uses server-side API routes
class QuidaxClient {
  constructor() {
    this.baseURL = "/api/quidax" // Use our server-side API routes
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Quidax API request failed:", error)
      throw error
    }
  }

  // Get all available markets
  async getMarkets() {
    try {
      return await this.makeRequest("/markets")
    } catch (error) {
      console.error("Error fetching markets:", error)
      // Return enhanced mock data
      return {
        data: [
          {
            id: "btcngn",
            name: "BTC/NGN",
            base_unit: "btc",
            quote_unit: "ngn",
            ticker: {
              last: "45000000.0",
              high: "46000000.0",
              low: "44000000.0",
              change: "+2.3",
              volume: "12.45",
              volume_quote: "558750000.0",
            },
          },
          {
            id: "ethngn",
            name: "ETH/NGN",
            base_unit: "eth",
            quote_unit: "ngn",
            ticker: {
              last: "2800000.0",
              high: "2850000.0",
              low: "2750000.0",
              change: "+1.8",
              volume: "156.78",
              volume_quote: "438984000.0",
            },
          },
          {
            id: "usdtngn",
            name: "USDT/NGN",
            base_unit: "usdt",
            quote_unit: "ngn",
            ticker: {
              last: "1580.0",
              high: "1585.0",
              low: "1575.0",
              change: "+0.3",
              volume: "45678.90",
              volume_quote: "72172662.0",
            },
          },
          {
            id: "adangn",
            name: "ADA/NGN",
            base_unit: "ada",
            quote_unit: "ngn",
            ticker: {
              last: "890.0",
              high: "920.0",
              low: "870.0",
              change: "-1.1",
              volume: "8934.56",
              volume_quote: "7951768.4",
            },
          },
          {
            id: "dotngn",
            name: "DOT/NGN",
            base_unit: "dot",
            quote_unit: "ngn",
            ticker: {
              last: "12500.0",
              high: "12800.0",
              low: "12200.0",
              change: "+2.1",
              volume: "2345.67",
              volume_quote: "29320875.0",
            },
          },
        ],
      }
    }
  }

  // Get market tickers
  async getTickers() {
    try {
      return await this.makeRequest("/tickers")
    } catch (error) {
      console.error("Error fetching tickers:", error)
      const markets = await this.getMarkets()
      return {
        data: markets.data.reduce((acc, market) => {
          acc[market.id] = market.ticker
          return acc
        }, {}),
      }
    }
  }

  // Get order book for a specific market
  async getOrderBook(market) {
    try {
      return await this.makeRequest(`/orderbook?market=${market}`)
    } catch (error) {
      console.error("Error fetching order book:", error)
      // Return realistic mock order book
      return {
        data: {
          asks: [
            ["45100000.0", "0.5"],
            ["45200000.0", "1.2"],
            ["45300000.0", "0.8"],
            ["45400000.0", "2.1"],
            ["45500000.0", "0.9"],
          ],
          bids: [
            ["44900000.0", "0.7"],
            ["44800000.0", "1.5"],
            ["44700000.0", "2.1"],
            ["44600000.0", "0.6"],
            ["44500000.0", "1.8"],
          ],
        },
      }
    }
  }

  // Get recent trades for a market
  async getRecentTrades(market, limit = 50) {
    try {
      return await this.makeRequest(`/trades?market=${market}&limit=${limit}`)
    } catch (error) {
      console.error("Error fetching recent trades:", error)
      // Return mock trades
      const trades = []
      for (let i = 0; i < limit; i++) {
        trades.push({
          id: Date.now() + i,
          price: (45000000 + (Math.random() - 0.5) * 1000000).toFixed(2),
          volume: (Math.random() * 2).toFixed(4),
          side: Math.random() > 0.5 ? "buy" : "sell",
          created_at: new Date(Date.now() - i * 60000).toISOString(),
        })
      }
      return { data: trades }
    }
  }

  // Get 24h statistics
  async get24hStats() {
    try {
      return await this.makeRequest("/stats")
    } catch (error) {
      console.error("Error fetching 24h stats:", error)
      return {
        totalVolume: 1234567890,
        totalMarkets: 15,
        topGainer: { name: "BTC/NGN", ticker: { change: "+2.3" } },
        topLoser: { name: "ADA/NGN", ticker: { change: "-1.1" } },
      }
    }
  }

  // Get price for a specific token pair
  async getTokenPrice(baseToken, quoteToken = "ngn") {
    try {
      return await this.makeRequest(`/price?base=${baseToken}&quote=${quoteToken}`)
    } catch (error) {
      console.error("Error fetching token price:", error)
      throw error
    }
  }
}

export const quidaxClient = new QuidaxClient()

// Helper functions for easy access
export const getMarketData = () => quidaxClient.getMarkets()
export const getTickers = () => quidaxClient.getTickers()
export const getTokenPrice = (baseToken, quoteToken) => quidaxClient.getTokenPrice(baseToken, quoteToken)
export const getOrderBook = (market) => quidaxClient.getOrderBook(market)
export const getRecentTrades = (market, limit) => quidaxClient.getRecentTrades(market, limit)
export const get24hStats = () => quidaxClient.get24hStats()

export default quidaxClient
