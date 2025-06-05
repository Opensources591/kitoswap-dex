class QuidaxClient {
  constructor() {
    this.baseURL = "/api/quidax"
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

  async getMarkets() {
    return await this.makeRequest("/markets")
  }

  async getTickers() {
    return await this.makeRequest("/tickers")
  }

  async getOrderBook(market) {
    return await this.makeRequest(`/orderbook?market=${market}`)
  }

  async getRecentTrades(market, limit = 50) {
    return await this.makeRequest(`/trades?market=${market}&limit=${limit}`)
  }

  async get24hStats() {
    return await this.makeRequest("/stats")
  }

  async getTokenPrice(baseToken, quoteToken = "ngn") {
    return await this.makeRequest(`/price?base=${baseToken}&quote=${quoteToken}`)
  }

  async buyAsset(asset, amount, currency = "ngn") {
    return await this.makeRequest("/buy", {
      method: "POST",
      body: JSON.stringify({ asset, amount, currency }),
    })
  }

  async sellAsset(asset, amount, currency = "ngn") {
    return await this.makeRequest("/sell", {
      method: "POST",
      body: JSON.stringify({ asset, amount, currency }),
    })
  }
}

// Create an instance of the client
export const quidaxClient = new QuidaxClient()

// Make sure to export both the class and the instance
export default quidaxClient
