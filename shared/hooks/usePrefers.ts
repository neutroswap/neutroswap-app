import { createContext, useContext } from 'react';

export const themes = ['nlight', 'ndark'] as const;
export type ThemeType = typeof themes[number];

interface Prefers {
  themeType: ThemeType;
  switchTheme: (type: ThemeType) => void;
}

export const PrefersContext = createContext<Prefers>({
  themeType: 'ndark',
  switchTheme: () => { }
});

export const usePrefers = (): Prefers => useContext(PrefersContext);
