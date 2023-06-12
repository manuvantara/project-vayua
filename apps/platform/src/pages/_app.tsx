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
import ProgressBar from "@badrap/bar-of-progress";
import Router from "next/router";
import { DefaultSeo } from "next-seo";
import SEO from "@/utils/next-seo.config";
import { fantom, fantomTestnet } from "wagmi/chains";

const progress = new ProgressBar({
  size: 4,
  className: "progress-bar",
  color: "hsl(var(--foreground))",
  delay: 100,
});

Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [thetaTestnet, thetaMainnet, fantom, fantomTestnet],
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
    <>
      <DefaultSeo {...SEO} />
      <div className={`font-sans ${inter.variable} min-h-screen flex flex-col`}>
        <WagmiConfig config={config}>
          <Header />
          <div className="px-4 sm:container flex-1">
            <Component {...pageProps} />
          </div>
          <Footer />
        </WagmiConfig>
        <Toaster />
      </div>
    </>
  );
}
