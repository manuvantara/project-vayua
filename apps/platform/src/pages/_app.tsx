import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { publicProvider } from "wagmi/providers/public";
import { useEffect } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import Toaster from "@/components/ui/Toaster";
import { thetaMainnet, thetaTestnet } from "@/utils/chains/theta-chains";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        chainId: thetaTestnet.id,
        appName: "Vayua",
      },
    }),
    new WalletConnectConnector({
      options: {
        projectId: "906d0696e4075d7b83f9e01c8f78156e",
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.style.setProperty("--font-inter", inter.variable);
  }, []);

  return (
    <div className={`font-sans ${inter.variable} bg-stone-50`}>
      <WagmiConfig config={config}>
        <Header />
        <div className="px-4 sm:container">
          <Component {...pageProps} />
        </div>
        <Footer />
      </WagmiConfig>
      <Toaster />
    </div>
  );
}
