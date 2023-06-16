import type { AppProps } from 'next/app';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Toaster from '@/components/ui/Toaster';
import '@/styles/globals.css';
import SEO from '@/utils/next-seo.config';
import ProgressBar from '@badrap/bar-of-progress';
import { Inter } from 'next/font/google';
import Router from 'next/router';
import { DefaultSeo } from 'next-seo';
import { useEffect } from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { fantom, fantomTestnet } from 'wagmi/chains';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

const progress = new ProgressBar({
  className: 'progress-bar',
  color: 'hsl(var(--foreground))',
  delay: 100,
  size: 4,
});

Router.events.on('routeChangeStart', progress.start);
Router.events.on('routeChangeComplete', progress.finish);
Router.events.on('routeChangeError', progress.finish);

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [fantom, fantomTestnet],
  [publicProvider()],
);

const config = createConfig({
  // May cause hydration error, see https://github.com/wagmi-dev/wagmi/issues/542
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Vayua',
        chainId: fantomTestnet.id,
      },
    }),
    new WalletConnectConnector({
      options: {
        projectId: '906d0696e4075d7b83f9e01c8f78156e',
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.style.setProperty('--font-inter', inter.variable);
  }, []);

  return (
    <>
      <DefaultSeo {...SEO} />
      <div className={`font-sans ${inter.variable} flex min-h-screen flex-col`}>
        <WagmiConfig config={config}>
          <Header />
          <div className="flex-1 px-4 sm:container">
            <Component {...pageProps} />
          </div>
          <Footer />
        </WagmiConfig>
        <Toaster />
      </div>
    </>
  );
}
