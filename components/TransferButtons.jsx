"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "../contexts/Web3Provider"
import QRCode from "qrcode"

export default function TransferButtons() {
  const { account, signer, isConnected, refreshBalance } = useWeb3()
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  const handleSend = async () => {
    if (!recipient || !amount) {
      alert("Please fill all fields")
      return
    }

    try {
      setIsLoading(true)

      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid recipient address")
      }

      const value = ethers.parseEther(amount)

      const tx = await signer.sendTransaction({
        to: recipient,
        value: value,
      })

      alert("Transaction sent! Waiting for confirmation...")
      const receipt = await tx.wait()
      alert(`Transaction confirmed! Hash: ${receipt.hash}`)

      // Refresh balance
      await refreshBalance()

      setRecipient("")
      setAmount("")
      setShowSendModal(false)
    } catch (error) {
      console.error("Send transaction error:", error)
      alert(`Transaction failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReceive = async () => {
    if (!account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      const qrUrl = await QRCode.toDataURL(account, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      setQrCodeUrl(qrUrl)
      setShowReceiveModal(true)
    } catch (error) {
      console.error("QR code generation error:", error)
      alert("Failed to generate QR code")
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(account)
      alert("Address copied to clipboard!")
    } catch (error) {
      alert("Failed to copy address")
    }
  }

  return (
    <>
      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={() => setShowSendModal(true)}
          disabled={!isConnected}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center gap-2"
        >
          <span>📤</span>
          Send
        </button>
        <button
          onClick={handleReceive}
          disabled={!isConnected}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center gap-2"
        >
          <span>📥</span>
          Receive
        </button>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Send Transaction</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Amount (BNB)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSendModal(false)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 py-2 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !recipient || !amount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-all"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Receive</h3>

            <div className="text-center space-y-4">
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-lg inline-block border">
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="Wallet QR Code" className="w-48 h-48" />
                </div>
              )}

              <div>
                <p className="text-gray-600 text-sm mb-2">Your Wallet Address:</p>
                <div className="bg-gray-100 rounded-lg p-3 break-all text-gray-800 font-mono text-sm">{account}</div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all"
                >
                  Copy Address
                </button>
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
