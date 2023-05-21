import type { Chain } from "wagmi";

export const thetaTestnet: Chain = {
  id: 365,
  name: "Theta Testnet",
  network: "Theta Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Theta Fuel",
    symbol: "TFUEL",
  },
  rpcUrls: {
    public: {
      http: ["https://theta-testnet.rpc.thirdweb.com"],
    },
    default: {
      http: ["https://theta-testnet.rpc.thirdweb.com"],
    },
  },
  blockExplorers: {
    ThetaExplorer: {
      name: "Theta Explorer",
      url: "https://testnet-explorer.thetatoken.org/",
    },
    default: {
      name: "Theta Explorer",
      url: "https://testnet-explorer.thetatoken.org/",
    },
  },
} as const satisfies Chain;
