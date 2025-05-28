# KitoSwap DEX

A complete decentralized exchange built on BNB Smart Chain with Web3Auth integration and Quidax on/off-ramp functionality.

## Features

- 🔐 **Web3Auth Integration** - Seamless wallet connection
- 💱 **Token Swapping** - Trade KBC, KBB, and other BEP-20 tokens
- 📤📥 **Send & Receive** - Transfer BNB with QR code support
- 🏦 **Quidax On/Off Ramp** - Buy/sell crypto with Nigerian Naira
- 📊 **Live Market Data** - Real-time prices from Quidax
- 🔄 **Price Comparison** - DEX vs CEX rate comparison
- 🦊 **MetaMask Integration** - Add custom tokens to MetaMask

## Environment Variables

Set these in your Vercel project:

\`\`\`bash
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org/
QUIDAX_API_KEY=your_quidax_api_key
\`\`\`

## Local Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Deployment

\`\`\`bash
# Commit changes
git add .
git commit -m "Complete KitoSwap DEX with Web3Auth & Quidax"
git push origin main

# Deploy to Vercel
vercel --prod
\`\`\`

## Token Addresses

- **KBC Gospel Token**: `0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c`
- **KBB Family Token**: `0x386c66a0a3d452b7296c0763296fc7d9124e62f8`

## Live Demo

Visit: [https://www.manamix.space](https://www.manamix.space)

## Tech Stack

- Next.js 14
- Web3Auth
- Ethers.js
- Tailwind CSS
- Quidax API
- Vercel
\`\`\`

## 🚀 **Complete KitoSwap DEX Ready!**

Your production-ready DEX is now complete with:

### ✅ **Core Features:**
- **Web3Auth Integration** - Seamless wallet connection
- **Send & Receive** - BNB transfers with QR codes
- **Token Swapping** - KBC, KBB, and major tokens
- **MetaMask Integration** - Add custom tokens
- **Quidax On/Off Ramp** - NGN to crypto conversion
- **Live Market Data** - Real-time price feeds
- **Price Comparison** - DEX vs CEX rates

### 🔧 **Deployment Steps:**

1. **Set Environment Variables in Vercel:**
   \`\`\`bash
   NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_client_id
   NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org/
   QUIDAX_API_KEY=your_quidax_api_key
   \`\`\`

2. **Deploy:**
   \`\`\`bash
   git add .
   git commit -m "Complete KitoSwap DEX with Web3Auth & Quidax"
   git push origin main
   vercel --prod
   \`\`\`

Your KitoSwap DEX is now ready for production at `https://www.manamix.space`! 🎉
