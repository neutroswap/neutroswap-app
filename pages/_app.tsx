import "@/styles/globals.css";
import "@/styles/quill.css";
import "@/styles/filepond.css";
import "@rainbow-me/rainbowkit/styles.css";

import type { AppProps } from "next/app";
import { GeistProvider, CssBaseline, Themes, GeistUIThemes } from "@geist-ui/core";
import Navbar from "@/components/modules/Navbar";
import { useCallback, useEffect, useState } from "react";
import { PrefersContext, themes, ThemeType } from "@/shared/hooks/usePrefers";

import {
  getDefaultWallets,
  lightTheme,
  midnightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import Footer from "@/components/modules/Footer";
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import colors from 'tailwindcss/colors'

dayjs.extend(relativeTime)

const eosChain: any = {
  id: 15557,
  name: 'EOS EVM',
  network: 'eos',
  iconUrl: 'https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/eos.svg',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'EOS',
    symbol: 'EOS',
  },
  rpcUrls: {
    default: {
      http: ['https://api-testnet2.trust.one/'],
    },
    public: {
      http: ['https://api-testnet2.trust.one/'],
    },
  },
  blockExplorers: {
    default: { name: 'TrustOne', url: 'https://explorer-testnet2.trust.one/' },
    etherscan: { name: 'TrustOne', url: 'https://explorer-testnet2.trust.one/' },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [eosChain],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Neutroswap App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});


export default function App({ Component, pageProps }: AppProps) {
  const [themeType, setThemeType] = useState<ThemeType>("nlight");

  const switchTheme = useCallback((theme: ThemeType) => {
    setThemeType(theme);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("theme", theme);
      if (theme === "ndark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.removeAttribute("style");
    document.body.removeAttribute("style");

    const theme = window.localStorage.getItem("theme") as ThemeType;
    if (themes.includes(theme)) switchTheme(theme);
  }, [switchTheme]);


  const geistLightTheme = Themes.createFromLight({
    type: 'nlight',
  })
  const geistDarkTheme: GeistUIThemes = Themes.createFromDark({
    type: 'ndark',
    palette: {
      error: colors.red[500],
      selection: `hsl(15deg 55.99% 15.48%)`
    },
  })

  return (
    // <GeistProvider themes={[myTheme1]} themeType={'coolTheme'}>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={themeType === "ndark" ? midnightTheme() : lightTheme()}
      >
        <GeistProvider themes={[geistDarkTheme, geistLightTheme]} themeType={themeType}>
          <CssBaseline />
          <PrefersContext.Provider value={{ themeType, switchTheme }}>
            <Navbar />
            <div className="min-h-[86vh] mt-16">
              <div className="max-w-7xl px-4 mx-auto">
                <Component {...pageProps} />
              </div>
            </div>
            <Footer
              handleThemeSwitch={() =>
                switchTheme(themeType === "ndark" ? "nlight" : "ndark")
              }
            />
          </PrefersContext.Provider>
        </GeistProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
