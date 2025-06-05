import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/components/web3-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KitoSwap Dex - Decentralized Exchange",
  description: "Connect your MetaMask wallet and perform test swaps on KitoSwap Dex",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
