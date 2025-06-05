"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import EnhancedMainDex from "@/components/enhanced-main-dex"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Auto-transition after 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return <div className="min-h-screen">{isLoading ? <LoadingScreen /> : <EnhancedMainDex />}</div>
}
