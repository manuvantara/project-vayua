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
  // May cause hydration error, see https://github.com/wagmi-dev/wagmi/issues/542
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.style.setProperty("--font-inter", inter.variable);
  }, []);

  return (
    <div className={`font-sans px-4 sm:container ${inter.variable}`}>
      <WagmiConfig config={config}>
        <Component {...pageProps} />
      </WagmiConfig>
      <Toaster />
    </div>
  );
}
