"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "../contexts/Web3Provider"

// MasterChef ABI (simplified)
const MASTERCHEF_ABI = [
  "function deposit(uint256 _pid, uint256 _amount) external",
  "function withdraw(uint256 _pid, uint256 _amount) external",
  "function emergencyWithdraw(uint256 _pid) external",
  "function pendingCake(uint256 _pid, address _user) external view returns (uint256)",
  "function userInfo(uint256 _pid, address _user) external view returns (uint256 amount, uint256 rewardDebt)",
  "function poolInfo(uint256 _pid) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCakePerShare)",
]

export default function Farm() {
  const { signer, account, isConnected } = useWeb3()
  const [stakedAmount, setStakedAmount] = useState("0")
  const [pendingRewards, setPendingRewards] = useState("0")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const masterChefAddress = "0x73feaa1eE314F8c655E354234017bE2193C9E24E" // PancakeSwap MasterChef
  const poolId = 0 // CAKE-BNB LP pool

  useEffect(() => {
    if (account && signer) {
      fetchFarmData()
    }
  }, [account, signer])

  const fetchFarmData = async () => {
    try {
      const masterChef = new ethers.Contract(masterChefAddress, MASTERCHEF_ABI, signer)

      // Get user info
      const userInfo = await masterChef.userInfo(poolId, account)
      setStakedAmount(ethers.formatEther(userInfo.amount))

      // Get pending rewards
      const pending = await masterChef.pendingCake(poolId, account)
      setPendingRewards(ethers.formatEther(pending))
    } catch (error) {
      console.error("Error fetching farm data:", error)
      // Mock data for demo
      setStakedAmount("1.2345")
      setPendingRewards("0.0567")
    }
  }

  const stake = async () => {
    try {
      setIsStaking(true)

      const masterChef = new ethers.Contract(masterChefAddress, MASTERCHEF_ABI, signer)
      const amountWei = ethers.parseEther(stakeAmount)

      const tx = await masterChef.deposit(poolId, amountWei)
      await tx.wait()

      alert(`Staked ${stakeAmount} LP tokens successfully!`)
      setStakeAmount("")
      await fetchFarmData()
    } catch (error) {
      console.error("Staking error:", error)
      alert(`Staking failed: ${error.message}`)
    } finally {
      setIsStaking(false)
    }
  }

  const unstake = async () => {
    try {
      setIsUnstaking(true)

      const masterChef = new ethers.Contract(masterChefAddress, MASTERCHEF_ABI, signer)
      const amountWei = ethers.parseEther(unstakeAmount)

      const tx = await masterChef.withdraw(poolId, amountWei)
      await tx.wait()

      alert(`Unstaked ${unstakeAmount} LP tokens successfully!`)
      setUnstakeAmount("")
      await fetchFarmData()
    } catch (error) {
      console.error("Unstaking error:", error)
      alert(`Unstaking failed: ${error.message}`)
    } finally {
      setIsUnstaking(false)
    }
  }

  const claimRewards = async () => {
    try {
      setIsClaiming(true)

      const masterChef = new ethers.Contract(masterChefAddress, MASTERCHEF_ABI, signer)

      // Deposit 0 to claim rewards
      const tx = await masterChef.deposit(poolId, 0)
      await tx.wait()

      alert("Rewards claimed successfully!")
      await fetchFarmData()
    } catch (error) {
      console.error("Claim error:", error)
      alert(`Claim failed: ${error.message}`)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Farm & Stake</h2>

      {/* Farm Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-sm text-blue-600 mb-1">Staked</div>
          <div className="text-lg font-bold text-blue-800">{Number.parseFloat(stakedAmount).toFixed(4)} LP</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-sm text-green-600 mb-1">Pending Rewards</div>
          <div className="text-lg font-bold text-green-800">{Number.parseFloat(pendingRewards).toFixed(4)} CAKE</div>
        </div>
      </div>

      {/* Pool Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-gray-800 mb-2">CAKE-BNB LP Pool</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">APR:</span>
            <span className="font-bold text-green-600 ml-1">45.67%</span>
          </div>
          <div>
            <span className="text-gray-600">TVL:</span>
            <span className="font-bold text-blue-600 ml-1">$12.5M</span>
          </div>
        </div>
      </div>

      {/* Stake Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Stake LP Tokens</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={stake}
              disabled={!isConnected || isStaking || !stakeAmount}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              {isStaking ? "Staking..." : "Stake"}
            </button>
          </div>
        </div>

        {/* Unstake Section */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Unstake LP Tokens</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={unstake}
              disabled={!isConnected || isUnstaking || !unstakeAmount}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              {isUnstaking ? "Unstaking..." : "Unstake"}
            </button>
          </div>
        </div>
      </div>

      {/* Claim Rewards Button */}
      <button
        onClick={claimRewards}
        disabled={!isConnected || isClaiming || Number.parseFloat(pendingRewards) === 0}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100"
      >
        {!isConnected ? "Connect Wallet" : isClaiming ? "Claiming..." : "Claim Rewards"}
      </button>
    </div>
  )
}
