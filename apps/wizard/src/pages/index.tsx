import { Title } from "@mantine/core";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { thetaTestnet, thetaMainnet } from "@/config/theta-chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import Stepper from "@/components/Stepper";
import Link from "next/link";
import dynamic from "next/dynamic";
const WagmiWalletConnect = dynamic(
  () => import("@/components/WagmiWalletConnect"),
  {
    ssr: false,
  }
);

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
          <div className="flex justify-between items-center">
            <Title order={1} size="h3">
              Vayua Wizard
            </Title>
            <WagmiWalletConnect />
          </div>
          <Stepper />
        </div>
      </WagmiConfig>
    </div>
  );
}
