"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "../contexts/Web3Provider"
import tokensConfig from "../src/config/tokens.json"
import AddToMetaMaskButton from "./AddToMetaMaskButton"

// Router ABI (simplified)
const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
]

// ERC20 ABI (simplified)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
]

export default function Swap() {
  const { signer, account, isConnected, currentNetwork } = useWeb3()
  const [tokenIn, setTokenIn] = useState("")
  const [tokenOut, setTokenOut] = useState("")
  const [amountIn, setAmountIn] = useState("")
  const [amountOut, setAmountOut] = useState("")
  const [slippage, setSlippage] = useState(1)
  const [deadline, setDeadline] = useState(20)
  const [isApproving, setIsApproving] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)

  const chainId = currentNetwork === "BSC" ? "56" : "1750"
  const tokens = tokensConfig[chainId]?.tokens || []
  const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS

  useEffect(() => {
    if (tokens.length >= 2) {
      setTokenIn(tokens[0].address)
      setTokenOut(tokens[1].address)
    }
  }, [chainId])

  useEffect(() => {
    if (amountIn && tokenIn && tokenOut && signer) {
      calculateAmountOut()
    }
  }, [amountIn, tokenIn, tokenOut, signer])

  const calculateAmountOut = async () => {
    try {
      if (!amountIn || !tokenIn || !tokenOut || !signer) return

      const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer)
      const amountInWei = ethers.parseEther(amountIn)

      const path = [tokenIn, tokenOut]
      const amounts = await router.getAmountsOut(amountInWei, path)

      setAmountOut(ethers.formatEther(amounts[1]))
    } catch (error) {
      console.error("Error calculating amount out:", error)
      // Fallback to mock calculation
      const mockRate = 0.95 + Math.random() * 0.1
      setAmountOut((Number.parseFloat(amountIn) * mockRate).toFixed(6))
    }
  }

  const checkApproval = async () => {
    if (!tokenIn || !amountIn || !signer || tokenIn === "0x0000000000000000000000000000000000000000") {
      setNeedsApproval(false)
      return
    }

    try {
      const token = new ethers.Contract(tokenIn, ERC20_ABI, signer)
      const allowance = await token.allowance(account, routerAddress)
      const amountInWei = ethers.parseEther(amountIn)

      setNeedsApproval(allowance < amountInWei)
    } catch (error) {
      console.error("Error checking approval:", error)
      setNeedsApproval(true)
    }
  }

  useEffect(() => {
    if (amountIn && tokenIn && account) {
      checkApproval()
    }
  }, [amountIn, tokenIn, account])

  const approveToken = async () => {
    try {
      setIsApproving(true)

      const token = new ethers.Contract(tokenIn, ERC20_ABI, signer)
      const amountInWei = ethers.parseEther(amountIn)

      const tx = await token.approve(routerAddress, amountInWei)
      await tx.wait()

      setNeedsApproval(false)
      alert("Token approved successfully!")
    } catch (error) {
      console.error("Approval error:", error)
      alert(`Approval failed: ${error.message}`)
    } finally {
      setIsApproving(false)
    }
  }

  const executeSwap = async () => {
    try {
      setIsSwapping(true)

      const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer)
      const amountInWei = ethers.parseEther(amountIn)
      const amountOutMin = ethers.parseEther(((Number.parseFloat(amountOut) * (100 - slippage)) / 100).toString())
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline * 60

      let tx
      if (tokenIn === "0x0000000000000000000000000000000000000000") {
        // ETH/BNB to Token
        tx = await router.swapExactETHForTokens(amountOutMin, [tokenIn, tokenOut], account, deadlineTimestamp, {
          value: amountInWei,
        })
      } else if (tokenOut === "0x0000000000000000000000000000000000000000") {
        // Token to ETH/BNB
        tx = await router.swapExactTokensForETH(
          amountInWei,
          amountOutMin,
          [tokenIn, tokenOut],
          account,
          deadlineTimestamp,
        )
      } else {
        // Token to Token
        tx = await router.swapExactTokensForTokens(
          amountInWei,
          amountOutMin,
          [tokenIn, tokenOut],
          account,
          deadlineTimestamp,
        )
      }

      await tx.wait()
      alert(`Swap completed! Transaction hash: ${tx.hash}`)

      // Reset form
      setAmountIn("")
      setAmountOut("")
    } catch (error) {
      console.error("Swap error:", error)
      alert(`Swap failed: ${error.message}`)
    } finally {
      setIsSwapping(false)
    }
  }

  const getTokenByAddress = (address) => {
    return tokens.find((token) => token.address === address)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Swap Tokens</h2>

      <div className="space-y-4">
        {/* Token Input */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">From</label>
          <div className="flex gap-2 mb-2">
            <select
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            {getTokenByAddress(tokenIn) && <AddToMetaMaskButton token={getTokenByAddress(tokenIn)} />}
          </div>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const temp = tokenIn
              setTokenIn(tokenOut)
              setTokenOut(temp)
              setAmountIn("")
              setAmountOut("")
            }}
            className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-all transform hover:rotate-180"
          >
            ↕️
          </button>
        </div>

        {/* Token Output */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">To</label>
          <div className="flex gap-2 mb-2">
            <select
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            {getTokenByAddress(tokenOut) && <AddToMetaMaskButton token={getTokenByAddress(tokenOut)} />}
          </div>
          <input
            type="number"
            value={amountOut}
            readOnly
            placeholder="0.0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Slippage (%)</label>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(Number.parseFloat(e.target.value))}
              min="0.1"
              max="50"
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Deadline (min)</label>
            <input
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(Number.parseInt(e.target.value))}
              min="1"
              max="60"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {needsApproval && (
            <button
              onClick={approveToken}
              disabled={!isConnected || isApproving || !amountIn}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-all"
            >
              {isApproving ? "Approving..." : "Approve Token"}
            </button>
          )}

          <button
            onClick={executeSwap}
            disabled={!isConnected || isSwapping || !amountIn || !amountOut || needsApproval}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100"
          >
            {!isConnected ? "Connect Wallet" : isSwapping ? "Swapping..." : "Swap"}
          </button>
        </div>

        {/* Price Impact Info */}
        {amountOut && (
          <div className="text-center text-gray-600 text-sm">
            <div>Slippage Tolerance: {slippage}%</div>
            <div>Minimum Received: {((Number.parseFloat(amountOut) * (100 - slippage)) / 100).toFixed(6)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
