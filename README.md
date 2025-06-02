# KitoSwap DEX

A complete production-ready decentralized exchange built on BNB Smart Chain with Metal.build integration, featuring Web3Auth, WalletConnect, and comprehensive DeFi functionality.

## 🚀 Features

- **🔐 Multi-Wallet Support** - Web3Auth, WalletConnect, MetaMask integration
- **💱 Token Swapping** - Trade RGT, JT, LLT, KBC, KBB, and other BEP-20 tokens
- **💧 Liquidity Pools** - Add/remove liquidity and earn fees
- **🌾 Yield Farming** - Stake LP tokens and earn rewards
- **📤📥 Send & Receive** - Transfer tokens with QR code support
- **📊 Market Data** - Live prices and charts from Quidax
- **📈 Price Charts** - Interactive candlestick and line charts
- **📝 Transaction History** - Track all your DeFi activities
- **🦊 MetaMask Integration** - Add custom tokens with one click
- **🌐 Multi-Network** - BSC Mainnet and Metal.build support

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Web3**: Ethers.js, Web3Auth, WalletConnect
- **Charts**: Recharts
- **APIs**: Quidax integration for market data
- **Deployment**: Vercel

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/kitoswap-dex.git
cd kitoswap-dex

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`bash
# Web3Auth
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id

# Network RPCs
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org/
NEXT_PUBLIC_METALBUILD_RPC_URL=https://rpc.metall2.com

# Contract Addresses
NEXT_PUBLIC_ROUTER_ADDRESS=0x10ED43C718714eb63d5aA57B78B54704E256024E
NEXT_PUBLIC_FACTORY_ADDRESS=0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73
NEXT_PUBLIC_CHAIN_ID=56

# Quidax API
QUIDAX_API_KEY=your_quidax_api_key
\`\`\`

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub:**
\`\`\`bash
git add .
git commit -m "Complete decentralized KitoSwap DEX"
git push origin main
\`\`\`

2. **Deploy to Vercel:**
\`\`\`bash
vercel --prod
\`\`\`

3. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from `.env.local`

### Environment Variables in Vercel

Set these in your Vercel project settings:

- `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`
- `NEXT_PUBLIC_BSC_RPC_URL`
- `NEXT_PUBLIC_METALBUILD_RPC_URL`
- `NEXT_PUBLIC_ROUTER_ADDRESS`
- `NEXT_PUBLIC_FACTORY_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`
- `QUIDAX_API_KEY`

## 📱 Usage

### 1. Connect Wallet
- Click "Connect Wallet" to connect via Web3Auth or MetaMask
- Switch between BSC Mainnet and Metal.build networks

### 2. Swap Tokens
- Select tokens from the dropdown
- Enter amount and adjust slippage tolerance
- Approve tokens if needed and execute swap

### 3. Provide Liquidity
- Choose token pair
- Enter amounts for both tokens
- Add liquidity to earn fees

### 4. Farm & Stake
- Stake LP tokens in farms
- Earn rewards in CAKE tokens
- Claim rewards anytime

### 5. View Market Data
- Check live prices and 24h changes
- View interactive price charts
- Monitor trading volumes

## 🪙 Supported Tokens

### BSC Mainnet
- **WBNB** - Wrapped BNB
- **USDT** - Tether USD
- **BUSD** - Binance USD
- **RGT** - Rari Governance Token
- **JT** - Jito Token
- **LLT** - Liquid Loans Token
- **KBC** - KBC Gospel Token
- **KBB** - KBB Family Token

### Metal.build
- **WMTL** - Wrapped Metal
- **USDT** - Tether USD
- **KBC** - KBC Gospel Token
- **KBB** - KBB Family Token

## 🔗 Contract Addresses

### BSC Mainnet
- **Router**: `0x10ED43C718714eb63d5aA57B78B54704E256024E`
- **Factory**: `0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73`
- **KBC Token**: `0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c`
- **KBB Token**: `0x386c66a0a3d452b7296c0763296fc7d9124e62f8`

## 📊 API Endpoints

### Quidax Integration
- `GET /api/quidax/markets` - Get all markets
- `GET /api/quidax/tickers` - Get price tickers
- `GET /api/quidax/orderbook?market=btcngn` - Get orderbook
- `GET /api/quidax/trades?market=btcngn` - Get recent trades
- `POST /api/quidax/buy` - Place buy order
- `POST /api/quidax/sell` - Place sell order

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@kitoconnect.com or join our Discord community.

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Cross-chain bridge integration
- [ ] NFT marketplace
- [ ] Governance token launch
- [ ] Advanced trading features
- [ ] Portfolio analytics

---

**Built with ❤️ by the KitoConnect team**
