import "@/styles/globals.css";
import "@/styles/quill.css";
import "@/styles/filepond.css";
import "@rainbow-me/rainbowkit/styles.css";

import type { AppProps } from "next/app";
import {
  GeistProvider,
  CssBaseline,
  Themes,
  GeistUIThemes,
} from "@geist-ui/core";
import Navbar from "@/components/modules/Navbar";
import { useCallback, useEffect, useState } from "react";
import { PrefersContext, themes, ThemeType } from "@/shared/hooks/usePrefers";

import {
  connectorsForWallets,
  getDefaultWallets,
  lightTheme,
  midnightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
// import {arbitrum} from 'wagmi/chains'
import Footer from "@/components/modules/Footer";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import {
  argentWallet,
  injectedWallet,
  ledgerWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  trustWallet,
  uniswapWallet,
  zerionWallet,
} from "@rainbow-me/rainbowkit/wallets";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import colors from "tailwindcss/colors";
import {
  NEXT_PUBLIC_BLOCK_EXPLORER,
  NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_MULTICALL_CONTRACT,
  NEXT_PUBLIC_RPC,
} from "@/shared/helpers/constants";
import { usePrefersColorScheme } from "@/shared/hooks/usePreferColorScheme";
import { create } from "lodash";

dayjs.extend(relativeTime);

const eosChain: any = {
  id: Number(NEXT_PUBLIC_CHAIN_ID),
  name: "EOS EVM",
  network: "eos",
  iconUrl:
    "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/eos.svg",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "EOS",
    symbol: "EOS",
  },
  rpcUrls: {
    default: {
      http: [NEXT_PUBLIC_RPC],
    },
    public: {
      http: [NEXT_PUBLIC_RPC],
    },
  },
  blockExplorers: {
    default: { name: "TrustOne", url: NEXT_PUBLIC_BLOCK_EXPLORER },
    etherscan: {
      name: "TrustOne",
      url: NEXT_PUBLIC_BLOCK_EXPLORER,
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: NEXT_PUBLIC_MULTICALL_CONTRACT,
      blockCreated: 0,
    },
  },
};

const { chains, publicClient } = configureChains(
  [eosChain],
  [
    jsonRpcProvider({
      rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);

const projectId = "7ae5586a4ce03c8281f3c346214fa7b1";

const { wallets } = getDefaultWallets({
  appName: "Neutroswap",
  projectId,
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Others",
    wallets: [
      ledgerWallet({ projectId, chains }),
      okxWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      uniswapWallet({ projectId, chains }),
      zerionWallet({ projectId, chains }),
      phantomWallet({ chains }),
      rabbyWallet({ chains }),
    ],
  },
]);

const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  const [themeType, setThemeType] = useState<ThemeType>("nlight");
  const preferredColorScheme = usePrefersColorScheme();

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
    if (themes.includes(theme)) return switchTheme(theme);
    if (preferredColorScheme === "dark") return switchTheme("ndark");
  }, [switchTheme, preferredColorScheme]);

  const geistLightTheme = Themes.createFromLight({
    type: "nlight",
  });
  const geistDarkTheme: GeistUIThemes = Themes.createFromDark({
    type: "ndark",
    palette: {
      error: colors.red[500],
      selection: `hsl(15deg 55.99% 15.48%)`,
    },
  });

  return (
    // <GeistProvider themes={[myTheme1]} themeType={'coolTheme'}>
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={themeType === "ndark" ? midnightTheme() : lightTheme()}
      >
        <GeistProvider
          themes={[geistDarkTheme, geistLightTheme]}
          themeType={themeType}
        >
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
