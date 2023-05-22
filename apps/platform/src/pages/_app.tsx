import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { publicProvider } from "wagmi/providers/public";
import { useEffect } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import Toaster from "@/components/ui/Toaster";
import { thetaMainnet, thetaTestnet } from "@/utils/chains/theta-chains";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`font-sans px-4 sm:container ${inter.variable}`}>
      <WagmiConfig config={config}>
        <Component {...pageProps} />
        <Toaster />
      </WagmiConfig>
    </div>
  );
}
