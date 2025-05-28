"use client"

import { useState } from "react"

export default function QuidaxRamp({ addToast }) {
  const [selectedAsset, setSelectedAsset] = useState("usdt")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("ngn")
  const [orderType, setOrderType] = useState("buy") // buy or sell
  const [isLoading, setIsLoading] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)

  const supportedAssets = [
    { symbol: "usdt", name: "Tether USD", icon: "💵" },
    { symbol: "btc", name: "Bitcoin", icon: "₿" },
    { symbol: "eth", name: "Ethereum", icon: "Ξ" },
  ]

  const handleOrder = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      addToast("Please enter a valid amount", "error", 3000)
      return
    }

    try {
      setIsLoading(true)
      addToast(`Placing ${orderType} order...`, "info", 2000)

      const response = await fetch(`/api/quidax/${orderType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset: selectedAsset,
          amount: amount,
          currency: currency,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setLastOrder(data.order)
        addToast(data.message, "success", 5000)
        setAmount("")
      } else {
        throw new Error(data.error || "Order failed")
      }
    } catch (error) {
      console.error("Order error:", error)
      addToast(`Order failed: ${error.message}`, "error", 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value, curr = "ngn") => {
    const numValue = Number.parseFloat(value)
    if (curr === "ngn") {
      return `₦${numValue.toLocaleString()}`
    }
    return `$${numValue.toFixed(2)}`
  }

  const getAssetIcon = (symbol) => {
    const asset = supportedAssets.find((a) => a.symbol === symbol)
    return asset ? asset.icon : "💰"
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🏦</span>
        Quidax NGN On/Off Ramp
      </h3>

      <div className="space-y-4">
        {/* Order Type Toggle */}
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setOrderType("buy")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              orderType === "buy" ? "bg-green-600 text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Buy Crypto
          </button>
          <button
            onClick={() => setOrderType("sell")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              orderType === "sell" ? "bg-red-600 text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Sell Crypto
          </button>
        </div>

        {/* Asset Selection */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">Select Asset</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {supportedAssets.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.icon} {asset.name} ({asset.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Amount ({orderType === "buy" ? "NGN" : selectedAsset.toUpperCase()})
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={orderType === "buy" ? "Enter NGN amount" : "Enter crypto amount"}
              className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 pr-12 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-2 text-white/70 text-sm">
              {orderType === "buy" ? "₦" : getAssetIcon(selectedAsset)}
            </div>
          </div>
        </div>

        {/* Order Button */}
        <button
          onClick={handleOrder}
          disabled={isLoading || !amount}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg ${
            orderType === "buy"
              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          } disabled:from-gray-600 disabled:to-gray-600 text-white`}
        >
          {isLoading ? "Processing..." : `${orderType === "buy" ? "Buy" : "Sell"} ${selectedAsset.toUpperCase()}`}
        </button>

        {/* Last Order Display */}
        {lastOrder && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2">Last Order</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Order ID:</span>
                <span className="text-white font-mono">{lastOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Market:</span>
                <span className="text-white">{lastOrder.market.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Side:</span>
                <span className={`font-medium ${lastOrder.side === "buy" ? "text-green-400" : "text-red-400"}`}>
                  {lastOrder.side.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Amount:</span>
                <span className="text-white">{lastOrder.volume}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Price:</span>
                <span className="text-white">{formatCurrency(lastOrder.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Total:</span>
                <span className="text-white font-bold">{formatCurrency(lastOrder.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Status:</span>
                <span className="text-yellow-400">{lastOrder.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
