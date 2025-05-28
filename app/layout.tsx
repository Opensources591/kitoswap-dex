import "./globals.css"

export const metadata = {
  title: "KitoSwap DEX",
  description: "Decentralized Exchange on BNB Smart Chain",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
