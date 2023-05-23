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

export default function Home() {
  return (
    <div className="gap-4 p-5">
      <WagmiConfig config={config}>
        <div className="max-w-screen-xl m-auto">
          <div className="flex justify-end">
            <WagmiWalletConnect />
          </div>
          <Stepper />
        </div>
      </WagmiConfig>
    </div>
  );
}
