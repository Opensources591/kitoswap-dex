"use client"

import { useState, useEffect } from "react"

// Mock hook for swap rate calculation
export function useSwapRate(tokenIn, tokenOut, amountIn) {
  const [swapRate, setSwapRate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!tokenIn || !tokenOut || !amountIn || Number.parseFloat(amountIn) <= 0) {
      setSwapRate(null)
      return
    }

    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Mock swap rate calculation
      const mockRate = 0.95 + Math.random() * 0.1 // Random rate between 0.95 and 1.05
      setSwapRate(mockRate)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [tokenIn, tokenOut, amountIn])

  return { swapRate, isLoading }
}
