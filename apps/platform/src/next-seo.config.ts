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
  defaultTitle: 'Vayua DAO',
  description:
    'Vayua DAO is a platform designed to provide an intuitive tool for creating DAOs, where users can easily create and manage DAOs, and actively participate in voting.',
  openGraph: {
    images: [
      {
        alt: 'Vayua DAO',
        height: 630,
        url: 'https://vayua.vercel.app/og.jpg',
        width: 1200,
      },
    ],
  },
  titleTemplate: '%s | Vayua',
};

export default config;
