import { ThemeMode, ThemeName } from 'lib/types';
import isString from 'lodash/isString';
import partial from 'lodash/partial';
import isFunction from 'lodash/isFunction';
import mapKeys from 'lodash/mapKeys';
import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import { selectors } from 'lib/constants/selectors';
import { namespaceVar } from './createSetVarFn';
import { colorTokens } from 'lib/themes/colorTokens';
import {
  ColorFn,
  ComponentName,
  PartialThemeFnMacos,
  PartialThemeFnWindows,
} from './themeUtils.types';

// namespace vars like '--foo' to {'--rd-componentName-foo': ... }
const transformVarNamesHof =
  (componentName: ComponentName) => (obj: Record<string, string>) =>
    mapKeys(pickVars(obj), (_value, key) => namespaceVar(componentName, key));

const pickVars = (obj: Record<string, string>) =>
  pickBy(obj, (_value, key) => key.startsWith('--'));

// partition variables and properties, since the `colors`-property can hold both
const partitionVarsAndProperties = (
  componentName: ComponentName,
  obj: Record<string, string>,
) => {
  const vars = transformVarNamesHof(componentName)(pickVars(obj));
  const properties = pickBy(obj, (_value, key) => !key.startsWith('--'));

  return {
    ...(Object.keys(vars).length ? { vars } : {}),
    ...properties,
  };
};

function themeFn(...args: [ThemeName, ComponentName]): any;
function themeFn(...args: any[]): any {
  const [themeName, componentName] = args as [ThemeName, string];
  const mode = isString(args[2]) ? (args[2] as ThemeMode) : undefined;

  // TODO: implement selector override
  const selector = isString(args[3]) ? args[3] : undefined;
  const styleObj = args[4] || args[3] || args[2];
  const colorFn = styleObj.colors as ColorFn;
  const transformVarNames = transformVarNamesHof(componentName);

  const transformColorsProperty = (colorFn: ColorFn, mode: ThemeMode) => {
    if (!colorFn) return {};

    const objWithColors = colorFn(colorTokens[themeName][mode]);
    return partitionVarsAndProperties(componentName, objWithColors);
  };

  const filterVars = (obj: Record<string, string>) =>
    omitBy(obj, (_value, key) => key.startsWith('--') || key === 'colors');

  // 2. filter vars
  const styleObjWithoutVarsAndColorsProperty = filterVars(styleObj);

  return {
    selectors: {
      // this also works when themeName is undefined, because
      // `selectors[undefined]` defaults to the toString()-method
      [`${selectors[themeName]}`]: {
        vars: transformVarNames(styleObj),
        ...styleObjWithoutVarsAndColorsProperty,
      },

      // colors are populated with the appropriate tokens and output per theme.
      // If mode is specified, colors are only output for this particular mode (light or dark)
      ...(isFunction(colorFn) && (!mode || mode === 'light')
        ? {
            // else output colors for both light & dark
            [selectors[themeName].light]: {
              ...transformColorsProperty(colorFn, 'light'),
            },
          }
        : {}),
      ...(isFunction(colorFn) && (!mode || mode === 'dark')
        ? {
            [selectors[themeName].dark]: {
              ...transformColorsProperty(colorFn, 'dark'),
            },
          }
        : {}),
    },
  };
}

// eslint-disable-next-line prettier/prettier
export function themeUtils (themeName: 'windows', componentName: string): { theme: PartialThemeFnWindows };
// eslint-disable-next-line prettier/prettier
export function themeUtils (themeName: 'macos', componentName: string): { theme: PartialThemeFnMacos };
// eslint-disable-next-line prettier/prettier
export function themeUtils(themeName: ThemeName, componentName: string): { theme: PartialThemeFnWindows } {
  return {
    theme: partial(themeFn, themeName, componentName),
  };
}