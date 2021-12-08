import React, { createContext, useContext, useRef } from 'react';
import { globalStyles } from '../../reactDesktop.config';
import useColorMode from './hooks/useColorMode';
import Stitches from '@stitches/react/types/stitches';
import useApplyThemeToHTML from './hooks/useApplyTheme';
import { ConditionalWrapper } from '../../utils/helpers';
import { ThemeMode, ThemeName } from 'src/theme/types';
import useTheme from './hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
  theme: ThemeName;
  mode: ThemeMode | 'auto';
  focus?: boolean;
  withGlobalStyles?: boolean;
  enableWindowBlur?: boolean;
  local?: boolean;
}

export const ThemeProviderContext = createContext<
  Stitches['theme'] | undefined
>(undefined);
ThemeProviderContext.displayName = 'ThemeProviderContext';

const ThemeProvider = ({
  children,
  theme: themeName,
  mode: modeProp = 'auto',
  enableWindowBlur = true,
  withGlobalStyles,
  local: localProp,
}: ThemeProviderProps) => {
  // determine the mode automatically based on the user's light/dark system
  // preferences unless mode is explicitly provided as a prop
  const [mode] = useColorMode(modeProp);

  // 1. Most applications will only use one ThemeProvider. By default the
  //    ThemeProvider will add a className for the theme to the <html>-element,
  //    unless a `local` prop is given or the ThemeProvider is wrapped inside
  //    another ThemeProvider. In these cases the children are wrapped in a
  //    <div> with the className.
  const ThemeContext = useContext(ThemeProviderContext);
  const local = !!ThemeContext || localProp;
  const activeTheme = useTheme(themeName, mode, enableWindowBlur);
  useApplyThemeToHTML(!local, activeTheme);

  if (withGlobalStyles) globalStyles();

  return (
    <ThemeProviderContext.Provider value={activeTheme}>
      {/* See 1. */}
      <ConditionalWrapper
        condition={!!local}
        wrapper={(children) => <div className={activeTheme}>{children}</div>}
      >
        <>{children}</>
      </ConditionalWrapper>
    </ThemeProviderContext.Provider>
  );
};

ThemeProviderContext.displayName = 'ThemeProviderContext';

export default ThemeProvider;
