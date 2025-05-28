import "./globals.css"
import Web3Provider from "../contexts/Web3Provider"

export const metadata = {
  title: "KitoSwap DEX",
  description: "Decentralized Exchange on BNB Smart Chain",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
