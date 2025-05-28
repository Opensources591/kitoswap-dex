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
}

export const quidaxClient = new QuidaxClient()
export default quidaxClient
