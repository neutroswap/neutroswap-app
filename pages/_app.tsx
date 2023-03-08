import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { GeistProvider, CssBaseline, Themes } from '@geist-ui/core'
import { useState } from 'react'
import Navbar from '@/components/modules/Navbar'

export default function App({ Component, pageProps }: AppProps) {
  // const [themeType, setThemeType] = useState('light')
  // const switchThemes = () => {
  //   setThemeType(last => (last === 'dark' ? 'light' : 'dark'))
  // }
  const myTheme1 = Themes.createFromDark({
    type: 'coolTheme',
    palette: {
      background: "hsl(40, 54%, 2%, 100%)",
      accents_1: "hsl(40, 54%, 4%, 100%)",
      accents_2: "hsl(40, 54%, 60%, 20%)",
      accents_3: "hsl(40, 54%, 60%, 50%)",
      accents_4: "hsl(47, 54%, 50%)",
      accents_5: "hsl(47, 54%, 60%)",
      accents_6: "hsl(47, 54%, 70%)",
      accents_7: "hsl(47, 54%, 80%)",
      accents_8: "hsl(47, 54%, 85%)",
      foreground: "hsl(47, 54%, 95%)",
      border: "hsl(46, 54%, 11%, 100%)",
    },
  })
  return (
    // <GeistProvider themes={[myTheme1]} themeType={'coolTheme'}>
    <GeistProvider themeType={'dark'}>
      <CssBaseline />
      <Navbar />
      <Component {...pageProps} />
    </GeistProvider>
  )
}
