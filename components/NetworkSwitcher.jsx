"use client"

import { useWeb3 } from "../contexts/Web3Provider"

export default function NetworkSwitcher() {
  const { currentNetwork, networks, switchNetwork, isConnected } = useWeb3()

  const handleNetworkChange = async (networkKey) => {
    if (networkKey !== currentNetwork) {
      await switchNetwork(networkKey)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Network:</span>
      <select
        value={currentNetwork}
        onChange={(e) => handleNetworkChange(e.target.value)}
        className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(networks).map(([key, network]) => (
          <option key={key} value={key}>
            {network.displayName}
          </option>
        ))}
      </select>
      <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
    </div>
  )
}
