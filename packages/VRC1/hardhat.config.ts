import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    fantom_mainnet: {
      url: `https://rpcapi.fantom.network`,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 250,
    },
    fantom_testnet: {
      url: `https://rpc.ankr.com/fantom_testnet`,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 4002,
    },
    fantom_localnet: {
      url: `http://localhost:18545`,
      accounts: [
        "ee60ae4a9ef7093f654fbee5f82a988d8aaed375972b199317ad2a6612bfc80f",
        "193797fc9173c4449517c27e098ffc5e4b72d661a87d88e7c2134365ab6bee9e",
        "d58a399d16035036f70830bb25dfe6312f578f8895708e11c53b563f526734ea",
        "605d59030c374d54abca05631a1d231b7ad4cce6821a9e7270c236cbe61d23e3",
      ], // feel free to use those private keys
      chainId: 4003,
    },
  },
};

export default config;
