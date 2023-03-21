import '@/styles/globals.css'
import '@/styles/quill.css'
import '@/styles/filepond.css'
import '@rainbow-me/rainbowkit/styles.css';

import type { AppProps } from 'next/app'
import { GeistProvider, CssBaseline, Themes } from '@geist-ui/core'
import Navbar from '@/components/modules/Navbar'
import { useCallback, useEffect, useState } from 'react'
import { PrefersContext, themes, ThemeType } from '@/shared/hooks/usePrefers';

import {
  getDefaultWallets,
  lightTheme,
  midnightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import Footer from '@/components/modules/Footer';

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Protostar App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export default function App({ Component, pageProps }: AppProps) {
  const [themeType, setThemeType] = useState<"dark" | "light">('light')

  // const switchThemes = () => {
  //   setThemeType((last) => (last === 'dark' ? 'light' : 'dark'))
  //   if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  //     document.documentElement.classList.add('dark')
  //   } else {
  //     document.documentElement.classList.remove('dark')
  //   }
  // }
  //
  const switchTheme = useCallback((theme: ThemeType) => {
    setThemeType(theme);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');

    const theme = window.localStorage.getItem('theme') as ThemeType;
    if (themes.includes(theme)) switchTheme(theme);
  }, [switchTheme]);

  // const myTheme1 = Themes.createFromDark({
  //   type: 'coolTheme',
  //   palette: {
  //     background: "hsl(40, 54%, 2%, 100%)",
  //     accents_1: "hsl(40, 54%, 4%, 100%)",
  //     accents_2: "hsl(40, 54%, 60%, 20%)",
  //     accents_3: "hsl(40, 54%, 60%, 50%)",
  //     accents_4: "hsl(47, 54%, 50%)",
  //     accents_5: "hsl(47, 54%, 60%)",
  //     accents_6: "hsl(47, 54%, 70%)",
  //     accents_7: "hsl(47, 54%, 80%)",
  //     accents_8: "hsl(47, 54%, 85%)",
  //     foreground: "hsl(47, 54%, 95%)",
  //     border: "hsl(46, 54%, 11%, 100%)",
  //   },
  // })
  return (
    // <GeistProvider themes={[myTheme1]} themeType={'coolTheme'}>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={themeType === "dark" ? midnightTheme() : lightTheme()}>
        <GeistProvider themeType={themeType}>
          <CssBaseline />
          <PrefersContext.Provider value={{ themeType, switchTheme }}>
            <Navbar />
            <div className="bg-neutral-50 dark:bg-neutral-900/50 min-h-[86vh] mt-16">
              <div className="max-w-7xl px-4 mx-auto">
                <Component {...pageProps} />
              </div>
            </div>
            <Footer handleThemeSwitch={() => switchTheme(themeType === 'dark' ? 'light' : 'dark')} />
          </PrefersContext.Provider>
        </GeistProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
