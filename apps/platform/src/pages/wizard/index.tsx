import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { thetaTestnet, thetaMainnet } from "@/config/theta-chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import dynamic from "next/dynamic";
const WagmiWalletConnect = dynamic(
  () => import("@/components/WagmiWalletConnect"),
  {
    ssr: false,
  }
);

// import EthersConnect from "@/components/EthersWalletConnect";
// import { useState } from "react";
// import { getProvider } from "@/config/ethers-connect";
import Stepper from "@/components/Stepper";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [thetaTestnet, thetaMainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});

const Wizard = () => {
  // const [walletConnected, setWalletConnected] = useState(getProvider() != null);
  return (
    <>
      <div className="gap-4 px-20 py-5">
        <WagmiConfig config={config}>
          <WagmiWalletConnect />
          <Stepper />
        </WagmiConfig>
      </div>
    </>
  );
};

export default Wizard;
