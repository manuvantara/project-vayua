import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider, type MantineThemeOverride } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Inter } from "next/font/google";
import { Provider as JProvider } from "jotai";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  fallback: ["system-ui", "-apple-system", "arial", "sans-serif"],
});

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
      <Notifications />
      <main className={inter.variable}>
        <JProvider>
          <Component {...pageProps} />
        </JProvider>
      </main>
    </MantineProvider>
  );
}
