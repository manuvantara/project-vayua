import dynamic from "next/dynamic";
const WagmiWalletConnect = dynamic(
  () => import("@/components/WagmiWalletConnect"),
  {
    ssr: false,
  }
);

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { thetaTestnet, thetaMainnet } from "@/config/theta-chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import EthersConnect from "@/components/EthersWalletConnect";
import { useState } from "react";
import { getProvider } from "@/config/ethers-connect";

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
  const [walletConnected, setWalletConnected] = useState(getProvider() != null);
  return (
    <>
      <div className="flex gap-4 p-20">
        <WagmiConfig config={config}>
          <MantineProvider withGlobalStyles withNormalizeCSS>
            <Notifications />
            <EthersConnect
              walletConnected={walletConnected}
              setWalletConnected={setWalletConnected}
            />
            <WagmiWalletConnect />
          </MantineProvider>
        </WagmiConfig>
      </div>
    </>
  );
};

export default Wizard;
