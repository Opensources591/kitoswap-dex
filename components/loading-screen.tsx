"use client"

import { useEffect, useState } from "react"

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 2
      })
    }, 60)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-12">
        {/* Enhanced Kito Bears Logo */}
        <div className="relative group">
          <div className="absolute -inset-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
          <div className="relative">
            <div className="w-80 h-80 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-4 border-gradient-to-r from-cyan-400 to-purple-500 p-4 shadow-2xl">
              <img
                src="/kito-bears-logo.jpg"
                alt="Kito Bears Mascot"
                className="w-full h-full object-cover rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-spin-slow opacity-50"></div>
          </div>
        </div>

        {/* Enhanced Title */}
        <div className="text-center space-y-6">
          <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
            KitoSwap DEX v27
          </h1>
          <p className="text-2xl text-cyan-200 font-medium animate-bounce">Loading advanced trading platform...</p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-96 space-y-6">
          <div className="relative h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-cyan-400/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="text-center text-cyan-300 text-lg font-bold">{progress}% Complete</div>
        </div>

        {/* Feature Loading Indicators */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="text-cyan-300 text-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto mb-2 animate-pulse"></div>
            QuidaxClient
          </div>
          <div className="text-purple-300 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full mx-auto mb-2 animate-pulse"></div>
            RevEth Engine
          </div>
          <div className="text-blue-300 text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mb-2 animate-pulse"></div>
            Live Charts
          </div>
          <div className="text-green-300 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
            Wallet Integration
          </div>
        </div>
      </div>
    </div>
  )
}
