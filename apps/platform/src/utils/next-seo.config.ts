import type { NextSeoProps } from "next-seo";

const config: NextSeoProps = {
  defaultTitle: "Vayua",
  titleTemplate: "%s | Vayua",
  description:
    "Vayua is a platform for the future of funding that is built on top of the Binance Smart Chain. It accelerates growth of start-up companies by offering tools and services that save both time and resources.",
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
    },
  ],
};

export default config;
