"use client"

import { useState, useEffect } from "react"
import AddTokenButtons from "./AddTokenButtons"
import tokensConfig from "../src/config/tokens.json"

export default function MetaMaskTestPanel({ addToast }) {
  const [metaMaskStatus, setMetaMaskStatus] = useState({
    installed: false,
    connected: false,
    chainId: null,
    account: null,
  })

  const tokens = tokensConfig["56"]?.tokens || []
  const kbcToken = tokens.find((t) => t.symbol === "KBC")
  const kbbToken = tokens.find((t) => t.symbol === "KBB")

  useEffect(() => {
    checkMetaMaskStatus()
  }, [])

  const checkMetaMaskStatus = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        const chainId = await window.ethereum.request({ method: "eth_chainId" })

        setMetaMaskStatus({
          installed: true,
          connected: accounts.length > 0,
          chainId: chainId,
          account: accounts[0] || null,
        })
      } catch (error) {
        console.error("Error checking MetaMask status:", error)
        setMetaMaskStatus({
          installed: true,
          connected: false,
          chainId: null,
          account: null,
        })
      }
    } else {
      setMetaMaskStatus({
        installed: false,
        connected: false,
        chainId: null,
        account: null,
      })
    }
  }

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      addToast("MetaMask not installed", "error", 3000)
      return
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      checkMetaMaskStatus()
      addToast("MetaMask connected successfully!", "success", 3000)
    } catch (error) {
      console.error("Error connecting to MetaMask:", error)
      addToast("Failed to connect to MetaMask", "error", 3000)
    }
  }

  const switchToBSC = async () => {
    if (!window.ethereum) {
      addToast("MetaMask not installed", "error", 3000)
      return
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }], // BSC Mainnet
      })
      checkMetaMaskStatus()
      addToast("Switched to BSC Mainnet", "success", 3000)
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added to MetaMask, add it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x38",
                chainName: "BNB Smart Chain",
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
                rpcUrls: ["https://bsc-dataseed1.binance.org/"],
                blockExplorerUrls: ["https://bscscan.com/"],
              },
            ],
          })
          checkMetaMaskStatus()
          addToast("BSC Mainnet added and switched", "success", 3000)
        } catch (addError) {
          console.error("Error adding BSC network:", addError)
          addToast("Failed to add BSC network", "error", 3000)
        }
      } else {
        console.error("Error switching network:", error)
        addToast("Failed to switch network", "error", 3000)
      }
    }
  }

  const getChainName = (chainId) => {
    switch (chainId) {
      case "0x38":
        return "BSC Mainnet"
      case "0x1":
        return "Ethereum Mainnet"
      case "0x89":
        return "Polygon"
      default:
        return `Unknown (${chainId})`
    }
  }

  const getStatusColor = (status) => {
    return status ? "text-green-400" : "text-red-400"
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🦊</span>
        MetaMask Integration Test
      </h3>

      {/* MetaMask Status */}
      <div className="space-y-3 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-medium mb-3">Connection Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">MetaMask Installed:</span>
              <span className={getStatusColor(metaMaskStatus.installed)}>
                {metaMaskStatus.installed ? "✅ Yes" : "❌ No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Connected:</span>
              <span className={getStatusColor(metaMaskStatus.connected)}>
                {metaMaskStatus.connected ? "✅ Yes" : "❌ No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Network:</span>
              <span className={metaMaskStatus.chainId === "0x38" ? "text-green-400" : "text-yellow-400"}>
                {metaMaskStatus.chainId ? getChainName(metaMaskStatus.chainId) : "Unknown"}
              </span>
            </div>
            {metaMaskStatus.account && (
              <div className="flex justify-between">
                <span className="text-white/70">Account:</span>
                <span className="text-white font-mono text-xs">
                  {metaMaskStatus.account.slice(0, 6)}...{metaMaskStatus.account.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!metaMaskStatus.connected && (
            <button
              onClick={connectMetaMask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
            >
              Connect MetaMask
            </button>
          )}
          {metaMaskStatus.chainId !== "0x38" && (
            <button
              onClick={switchToBSC}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
            >
              Switch to BSC
            </button>
          )}
          <button
            onClick={checkMetaMaskStatus}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Token Addition Tests */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">Test Token Addition</h4>

        {/* KBC Token Test */}
        {kbcToken && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{kbcToken.name}</div>
                <div className="text-white/70 text-sm">Symbol: {kbcToken.symbol}</div>
                <div className="text-white/70 text-xs font-mono">
                  {kbcToken.address.slice(0, 10)}...{kbcToken.address.slice(-8)}
                </div>
              </div>
              <AddTokenButtons token={kbcToken} addToast={addToast} />
            </div>
          </div>
        )}

        {/* KBB Token Test */}
        {kbbToken && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{kbbToken.name}</div>
                <div className="text-white/70 text-sm">Symbol: {kbbToken.symbol}</div>
                <div className="text-white/70 text-xs font-mono">
                  {kbbToken.address.slice(0, 10)}...{kbbToken.address.slice(-8)}
                </div>
              </div>
              <AddTokenButtons token={kbbToken} addToast={addToast} />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <h5 className="text-blue-300 font-medium mb-2">Testing Instructions:</h5>
        <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
          <li>Ensure MetaMask is installed and connected</li>
          <li>Switch to BSC Mainnet if not already connected</li>
          <li>Click "Add KBC" or "Add KBB" buttons</li>
          <li>Approve the token addition in MetaMask popup</li>
          <li>Verify tokens appear in your MetaMask token list</li>
        </ol>
      </div>
    </div>
  )
}
