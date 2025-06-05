// RevEth Token Engine
export interface RevEthToken {
  address: string
  symbol: string
  name: string
  decimals: number
  totalSupply: string
  price?: number
  change24h?: number
}

export class RevEthEngine {
  private rpcUrl: string
  private chainId: string

  constructor() {
    this.rpcUrl = process.env.NEXT_PUBLIC_RPC_BSC || "https://bsc-dataseed1.binance.org/"
    this.chainId = process.env.NEXT_PUBLIC_CHAIN_ID || "0x38"
  }

  async getTokenInfo(tokenAddress: string): Promise<RevEthToken | null> {
    try {
      // ERC20 function selectors
      const nameSelector = "0x06fdde03"
      const symbolSelector = "0x95d89b41"
      const decimalsSelector = "0x313ce567"
      const totalSupplySelector = "0x18160ddd"

      const [nameResult, symbolResult, decimalsResult, totalSupplyResult] = await Promise.all([
        this.callContract(tokenAddress, nameSelector),
        this.callContract(tokenAddress, symbolSelector),
        this.callContract(tokenAddress, decimalsSelector),
        this.callContract(tokenAddress, totalSupplySelector),
      ])

      if (!nameResult || !symbolResult || !decimalsResult || !totalSupplyResult) {
        return null
      }

      return {
        address: tokenAddress,
        name: this.decodeString(nameResult),
        symbol: this.decodeString(symbolResult),
        decimals: Number.parseInt(decimalsResult, 16),
        totalSupply: Number.parseInt(totalSupplyResult, 16).toString(),
      }
    } catch (error) {
      console.error("RevEth Engine Error:", error)
      return null
    }
  }

  private async callContract(address: string, data: string) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: address, data }, "latest"],
          id: 1,
        }),
      })

      const result = await response.json()
      return result.result
    } catch (error) {
      console.error("Contract call error:", error)
      return null
    }
  }

  private decodeString(hex: string): string {
    try {
      // Remove 0x prefix and decode hex string
      const cleaned = hex.replace("0x", "")
      const bytes = []
      for (let i = 0; i < cleaned.length; i += 2) {
        bytes.push(Number.parseInt(cleaned.substr(i, 2), 16))
      }
      return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, "")
    } catch {
      return "Unknown"
    }
  }

  async getTokenPrice(tokenAddress: string): Promise<number | null> {
    try {
      // Integration with PancakeSwap price oracle
      const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
      const wbnbAddress = "0xbb4CdB9CBd36B01bD1cBaEF07d1c3C4E"

      // Get pair address for token/WBNB
      const pairData = "0xe6a43905" + tokenAddress.slice(2).padStart(64, "0") + wbnbAddress.slice(2).padStart(64, "0")

      const pairResult = await this.callContract(factoryAddress, pairData)

      if (pairResult && pairResult !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        // Get reserves from pair contract
        const reservesData = "0x0902f1ac" // getReserves()
        const reservesResult = await this.callContract(pairResult, reservesData)

        if (reservesResult) {
          // Calculate price from reserves
          const reserve0 = Number.parseInt(reservesResult.slice(2, 66), 16)
          const reserve1 = Number.parseInt(reservesResult.slice(66, 130), 16)

          return reserve1 / reserve0 // Simplified price calculation
        }
      }

      return null
    } catch (error) {
      console.error("Price fetch error:", error)
      return null
    }
  }
}

export const revEthEngine = new RevEthEngine()
