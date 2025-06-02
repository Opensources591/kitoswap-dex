"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "../contexts/Web3Provider"
import tokensConfig from "../src/config/tokens.json"

// Router ABI for liquidity functions
const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
]

// Factory ABI
const FACTORY_ABI = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"]

// Pair ABI
const PAIR_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
]

export default function Liquidity() {
  const { signer, account, isConnected, currentNetwork } = useWeb3()
  const [tokenA, setTokenA] = useState("")
  const [tokenB, setTokenB] = useState("")
  const [amountA, setAmountA] = useState("")
  const [amountB, setAmountB] = useState("")
  const [lpBalance, setLpBalance] = useState("0")
  const [poolShare, setPoolShare] = useState("0")
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [activeTab, setActiveTab] = useState("add")

  const chainId = currentNetwork === "BSC" ? "56" : "1750"
  const tokens = tokensConfig[chainId]?.tokens || []
  const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS
  const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS

  useEffect(() => {
    if (tokens.length >= 2) {
      setTokenA(tokens[0].address)
      setTokenB(tokens[1].address)
    }
  }, [chainId])

  useEffect(() => {
    if (tokenA && tokenB && account && signer) {
      fetchLPBalance()
    }
  }, [tokenA, tokenB, account, signer])

  const fetchLPBalance = async () => {
    try {
      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer)
      const pairAddress = await factory.getPair(tokenA, tokenB)

      if (pairAddress !== "0x0000000000000000000000000000000000000000") {
        const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer)
        const balance = await pair.balanceOf(account)
        const totalSupply = await pair.totalSupply()

        setLpBalance(ethers.formatEther(balance))
        setPoolShare(totalSupply > 0 ? ((balance * 100n) / totalSupply).toString() : "0")
      }
    } catch (error) {
      console.error("Error fetching LP balance:", error)
      setLpBalance("0")
      setPoolShare("0")
    }
  }

  const addLiquidity = async () => {
    try {
      setIsAdding(true)

      const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer)
      const amountAWei = ethers.parseEther(amountA)
      const amountBWei = ethers.parseEther(amountB)
      const amountAMin = (amountAWei * 95n) / 100n // 5% slippage
      const amountBMin = (amountBWei * 95n) / 100n
      const deadline = Math.floor(Date.now() / 1000) + 1200 // 20 minutes

      const tx = await router.addLiquidity(
        tokenA,
        tokenB,
        amountAWei,
        amountBWei,
        amountAMin,
        amountBMin,
        account,
        deadline,
      )

      await tx.wait()
      alert(`Liquidity added successfully! Transaction hash: ${tx.hash}`)

      // Reset form and refresh balance
      setAmountA("")
      setAmountB("")
      await fetchLPBalance()
    } catch (error) {
      console.error("Add liquidity error:", error)
      alert(`Failed to add liquidity: ${error.message}`)
    } finally {
      setIsAdding(false)
    }
  }

  const removeLiquidity = async () => {
    try {
      setIsRemoving(true)

      const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer)
      const liquidityWei = ethers.parseEther(lpBalance)
      const amountAMin = 0n // Accept any amount of tokens back
      const amountBMin = 0n
      const deadline = Math.floor(Date.now() / 1000) + 1200

      const tx = await router.removeLiquidity(tokenA, tokenB, liquidityWei, amountAMin, amountBMin, account, deadline)

      await tx.wait()
      alert(`Liquidity removed successfully! Transaction hash: ${tx.hash}`)

      await fetchLPBalance()
    } catch (error) {
      console.error("Remove liquidity error:", error)
      alert(`Failed to remove liquidity: ${error.message}`)
    } finally {
      setIsRemoving(false)
    }
  }

  const getTokenByAddress = (address) => {
    return tokens.find((token) => token.address === address)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Liquidity Pools</h2>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            activeTab === "add" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
          }`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setActiveTab("remove")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            activeTab === "remove" ? "bg-white text-red-600 shadow-sm" : "text-gray-600"
          }`}
        >
          Remove Liquidity
        </button>
      </div>

      {activeTab === "add" ? (
        <div className="space-y-4">
          {/* Token A */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Token A</label>
            <select
              value={tokenA}
              onChange={(e) => setTokenA(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              placeholder="0.0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Token B */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Token B</label>
            <select
              value={tokenB}
              onChange={(e) => setTokenB(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              placeholder="0.0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={addLiquidity}
            disabled={!isConnected || isAdding || !amountA || !amountB}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100"
          >
            {!isConnected ? "Connect Wallet" : isAdding ? "Adding Liquidity..." : "Add Liquidity"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* LP Balance Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Your LP Position</div>
            <div className="text-lg font-bold text-gray-800">{Number.parseFloat(lpBalance).toFixed(6)} LP Tokens</div>
            <div className="text-sm text-gray-600">Pool Share: {Number.parseFloat(poolShare).toFixed(4)}%</div>
          </div>

          {/* Token Pair Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Token A</label>
              <select
                value={tokenA}
                onChange={(e) => setTokenA(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Token B</label>
              <select
                value={tokenB}
                onChange={(e) => setTokenB(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={removeLiquidity}
            disabled={!isConnected || isRemoving || Number.parseFloat(lpBalance) === 0}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100"
          >
            {!isConnected ? "Connect Wallet" : isRemoving ? "Removing Liquidity..." : "Remove All Liquidity"}
          </button>
        </div>
      )}
    </div>
  )
}
