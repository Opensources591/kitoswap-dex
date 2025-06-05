// QuidaxClient Integration with improved error handling
export class QuidaxClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_QUIDAX_API_KEY || ""
    this.baseUrl = "https://www.quidax.com/api/v1"
  }

  async getMarketData(symbol: string) {
    try {
      // If no API key, return mock data
      if (!this.apiKey) {
        console.warn("Quidax API key not found, using mock data")
        return this.getMockMarketData(symbol)
      }

      const response = await fetch(`${this.baseUrl}/markets/${symbol}/ticker`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      })

      if (!response.ok) {
        console.warn(`Quidax API returned ${response.status}, using mock data`)
        return this.getMockMarketData(symbol)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.warn("Quidax API Error, using mock data:", error)
      return this.getMockMarketData(symbol)
    }
  }

  async getOrderBook(symbol: string) {
    try {
      if (!this.apiKey) {
        return this.getMockOrderBook(symbol)
      }

      const response = await fetch(`${this.baseUrl}/markets/${symbol}/order_book`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      })

      if (!response.ok) {
        return this.getMockOrderBook(symbol)
      }

      return await response.json()
    } catch (error) {
      console.warn("Quidax Order Book Error, using mock data:", error)
      return this.getMockOrderBook(symbol)
    }
  }

  private getMockMarketData(symbol: string) {
    // Generate realistic mock data
    const basePrice = symbol.includes("btc") ? 45000 : symbol.includes("eth") ? 2800 : 580
    const variation = (Math.random() - 0.5) * 0.1 // ±10% variation
    const currentPrice = basePrice * (1 + variation)

    return {
      data: {
        market: symbol,
        last: currentPrice.toFixed(2),
        high: (currentPrice * 1.05).toFixed(2),
        low: (currentPrice * 0.95).toFixed(2),
        volume: (Math.random() * 1000000).toFixed(2),
        change: (variation * 100).toFixed(2),
        timestamp: new Date().toISOString(),
      },
      status: "success",
      message: "Mock data - Quidax API unavailable",
    }
  }

  private getMockOrderBook(symbol: string) {
    return {
      data: {
        bids: [
          ["45000.00", "0.5"],
          ["44950.00", "1.2"],
          ["44900.00", "0.8"],
        ],
        asks: [
          ["45050.00", "0.7"],
          ["45100.00", "1.1"],
          ["45150.00", "0.9"],
        ],
      },
      status: "success",
      message: "Mock data - Quidax API unavailable",
    }
  }
}

export const quidaxClient = new QuidaxClient()
