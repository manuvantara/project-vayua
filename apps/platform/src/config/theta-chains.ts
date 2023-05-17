import { Chain } from "wagmi";

export const thetaTestnet = {
  id: 365,
  name: "Theta Testnet",
  network: "Theta Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Theta Fuel",
    symbol: "TFUEL",
  },
  rpcUrls: {
    public: { http: ["https://eth-rpc-api-testnet.thetatoken.org/rpc"] },
    default: { http: ["https://eth-rpc-api-testnet.thetatoken.org/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "Theta Testnet explorer",
      url: "https://testnet-explorer.thetatoken.org/",
    },
  },
} as const satisfies Chain;

export const thetaMainnet = {
  id: 361,
  name: "Theta Mainnet",
  network: "Theta Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Theta Fuel",
    symbol: "TFUEL",
  },
  rpcUrls: {
    public: { http: ["https://eth-rpc-api.thetatoken.org/rpc"] },
    default: { http: ["https://eth-rpc-api.thetatoken.org/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "Theta Mainnet explorer",
      url: "https://explorer.thetatoken.org/",
    },
  },
} as const satisfies Chain;
