"use client"

import { useState } from "react"
import { ethers } from "ethers"
import QRCode from "qrcode"

export default function TransferButtons({ account, signer, addToast }) {
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  const handleSend = async () => {
    if (!recipient || !amount || !signer) {
      addToast("Please fill all fields and connect wallet", "error", 3000)
      return
    }

    try {
      setIsLoading(true)
      addToast("Preparing transaction...", "info", 2000)

      // Validate recipient address
      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid recipient address")
      }

      // Convert amount to wei
      const value = ethers.parseEther(amount)

      // Send transaction
      const tx = await signer.sendTransaction({
        to: recipient,
        value: value,
      })

      addToast("Transaction sent! Waiting for confirmation...", "info", 0)

      // Wait for confirmation
      const receipt = await tx.wait()

      addToast(
        <div>
          Transaction confirmed!
          <a
            href={`https://bscscan.com/tx/${receipt.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            View on BSCScan
          </a>
        </div>,
        "success",
        5000,
      )

      // Reset form
      setRecipient("")
      setAmount("")
      setShowSendModal(false)
    } catch (error) {
      console.error("Send transaction error:", error)
      addToast(`Transaction failed: ${error.message}`, "error", 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReceive = async () => {
    if (!account) {
      addToast("Please connect your wallet first", "error", 3000)
      return
    }

    try {
      // Generate QR code for the wallet address
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
      addToast("Failed to generate QR code", "error", 3000)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(account)
      addToast("Address copied to clipboard!", "success", 2000)
    } catch (error) {
      addToast("Failed to copy address", "error", 2000)
    }
  }

  return (
    <>
      {/* Transfer Buttons */}
      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={() => setShowSendModal(true)}
          disabled={!account}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center gap-2"
        >
          <span>📤</span>
          Send BNB
        </button>
        <button
          onClick={handleReceive}
          disabled={!account}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center gap-2"
        >
          <span>📥</span>
          Receive
        </button>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Send BNB</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Amount (BNB)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSendModal(false)}
                  disabled={isLoading}
                  className="flex-1 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white py-2 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !recipient || !amount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all"
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
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Receive BNB</h3>

            <div className="text-center space-y-4">
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="Wallet QR Code" className="w-48 h-48" />
                </div>
              )}

              <div>
                <p className="text-white/70 text-sm mb-2">Your Wallet Address:</p>
                <div className="bg-white/20 rounded-lg p-3 break-all text-white font-mono text-sm">{account}</div>
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
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-medium transition-all"
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
