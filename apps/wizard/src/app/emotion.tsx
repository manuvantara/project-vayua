"use client";

import { CacheProvider } from "@emotion/react";
import {
  MantineProvider,
  MantineThemeOverride,
  useEmotionCache,
} from "@mantine/core";
import { useServerInsertedHTML } from "next/navigation";

const theme: MantineThemeOverride = {
  colorScheme: "light",
  fontFamily: "var(--font-inter)",
  headings: {
    sizes: {
      h1: {
        fontSize: "3rem",
        fontWeight: 700,
        lineHeight: "3.5rem",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
        lineHeight: "2.5rem",
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: "2rem",
      },
      h4: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: "1.5rem",
      },
    },
  },
};

export default function RootStyleRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = useEmotionCache();
  cache.compat = true;

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(" "),
      }}
    />
  ));

  return (
    <CacheProvider value={cache}>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
        {children}
      </MantineProvider>
    </CacheProvider>
  );
}
