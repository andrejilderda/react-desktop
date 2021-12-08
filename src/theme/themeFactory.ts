import { createStitches } from '@stitches/react';
import globalStyles from './globalStyles';
import rawThemes from './themes';
import { Theme, ThemeConfig, ThemeFactory, ThemeSlug } from './types';

export const getRawTheme = ({
  theme: themeName,
  mode,
  windowBlur: windowBlurArg,
}: ThemeConfig) => {
  const windowBlur = windowBlurArg ? 'default' : 'blur';

  // for now, only macOS has specific styles for when the window is focused
  return themeName === 'macos'
    ? rawThemes[themeName][mode][windowBlur]
    : rawThemes[themeName][mode].default;
};

export const themeFactory = (config: ThemeFactory[]) => {
  const { createTheme: createStitchesTheme, ...stitches } = createStitches({});

  // change interface of default Stitches createTheme function, so that both the
  // `generateTheme` and `createTheme` have the same simplified interface
  const createTheme = (props: ThemeConfig) =>
    createStitchesTheme(getRawTheme(props).theme);

  const generateTheme = ({
    theme: name,
    mode,
    windowBlur: windowBlurArg,
  }: ThemeConfig) => {
    const windowBlur = windowBlurArg || undefined;
    const generatedTheme = createTheme({ theme: name, mode, windowBlur });
    const slug: ThemeSlug = `${name}-${mode}${windowBlur ? '-blur' : ''}`;
    return {
      name,
      mode,
      ...(windowBlur ? { windowBlur } : {}),
      slug,
      theme: generatedTheme,
    };
  };

  const generatedThemes = config.reduce<Theme[]>(
    (acc, { theme, mode: modeArg, useWindowBlur }) => {
      const mode = typeof modeArg === 'string' ? [modeArg] : modeArg;
      const themeModes = mode.reduce<Theme[]>((acc, mode) => {
        const generatedTheme = generateTheme({ theme, mode });
        if (typeof generatedTheme === 'string') return acc;

        if (!useWindowBlur) return [...acc, generatedTheme];

        const generatedThemeBlur = generateTheme({
          theme,
          mode,
          windowBlur: true,
        });

        return [...acc, generatedTheme, generatedThemeBlur];
      }, []);

      return [...acc, ...themeModes];
    },
    [],
  );

  const getTheme = ({ theme: name, mode, windowBlur = false }: ThemeConfig) => {
    const theme = generatedThemes.find(
      ({
        name: itemName,
        mode: itemMode,
        windowBlur: itemWindowBlur = false,
      }) =>
        itemName === name && itemMode === mode && itemWindowBlur === windowBlur,
    )?.theme;
    if (!theme)
      throw new Error(
        `No theme found for theme with name '${name}', mode '${mode}' and windowBlur ${windowBlur}`,
      );

    return theme;
  };

  return {
    ...stitches,
    createStitchesTheme,
    createTheme,
    globalStyles,
    themes: generatedThemes,
    getTheme,
  };
};

export default themeFactory;
