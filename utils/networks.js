export const NETWORKS = {
  BSC: {
    name: "BSC Mainnet",
    chainId: Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "56"),
    rpcUrl: process.env.NEXT_PUBLIC_RPC_BSC,
    factoryAddress: process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
    routerAddress: process.env.NEXT_PUBLIC_ROUTER_ADDRESS,
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    blockExplorer: "https://bscscan.com",
    tokens: {
      WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      KBC: "0x553a0d5074b5f57b90594c9c5db3289a17ee8b9c",
      KBB: "0x386c66a0a3d452b7296c0763296fc7d9124e62f8",
    },
  },
  METAL: {
    name: "Metal Build",
    chainId: Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID_METAL || "1750"),
    rpcUrl: process.env.NEXT_PUBLIC_RPC_METAL,
    factoryAddress: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_METAL,
    routerAddress: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_METAL,
    nativeCurrency: {
      name: "MTL",
      symbol: "MTL",
      decimals: 18,
    },
    blockExplorer: "https://metalscan.io",
    tokens: {
      WMTL: "0x0000000000000000000000000000000000000000",
      USDT: "0x0000000000000000000000000000000000000001",
      USDC: "0x0000000000000000000000000000000000000002",
      DAI: "0x0000000000000000000000000000000000000003",
    },
  },
}

export const getNetworkConfig = (networkKey) => {
  return NETWORKS[networkKey] || NETWORKS.BSC
}
