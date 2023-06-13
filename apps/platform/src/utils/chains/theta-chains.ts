import type { Chain } from 'wagmi';

export const thetaTestnet = {
  blockExplorers: {
    default: {
      name: 'Theta Testnet explorer',
      url: 'https://testnet-explorer.thetatoken.org/',
    },
  },
  id: 365,
  name: 'Theta Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Theta Fuel',
    symbol: 'TFUEL',
  },
  network: 'Theta Testnet',
  rpcUrls: {
    default: { http: ['https://eth-rpc-api-testnet.thetatoken.org/rpc'] },
    public: { http: ['https://eth-rpc-api-testnet.thetatoken.org/rpc'] },
  },
} as const satisfies Chain;

export const thetaMainnet = {
  blockExplorers: {
    default: {
      name: 'Theta Mainnet explorer',
      url: 'https://explorer.thetatoken.org/',
    },
  },
  id: 361,
  name: 'Theta Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Theta Fuel',
    symbol: 'TFUEL',
  },
  network: 'Theta Mainnet',
  rpcUrls: {
    default: { http: ['https://eth-rpc-api.thetatoken.org/rpc'] },
    public: { http: ['https://eth-rpc-api.thetatoken.org/rpc'] },
  },
} as const satisfies Chain;
