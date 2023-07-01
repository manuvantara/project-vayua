import type { NextSeoProps } from 'next-seo';

const config: NextSeoProps = {
  additionalLinkTags: [
    {
      href: '/favicon.ico',
      rel: 'icon',
    },
    {
      href: '/favicon-32x32.png',
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      href: '/favicon-16x16.png',
      rel: 'icon',
      sizes: '16x16',
      type: 'image/png',
    },
    {
      href: '/apple-touch-icon.png',
      rel: 'apple-touch-icon',
      sizes: '180x180',
    },
  ],
  defaultTitle: 'Vayua',
  description:
    'Vayua is a platform for the future of funding that is built on top of the Binance Smart Chain. It accelerates growth of start-up companies by offering tools and services that save both time and resources.',
  titleTemplate: '%s | Vayua',
};

export default config;
