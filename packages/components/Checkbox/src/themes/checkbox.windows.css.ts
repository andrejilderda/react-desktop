import { componentName } from './../index.css';
import { rdStyle as rdStylePartial } from 'packages/private/rdStyle.css';
import { tokens } from 'lib/themes/windows/tokens';

const rdStyle = rdStylePartial({ componentName, theme: 'windows' });

export const root = rdStyle({
  $$size: '20px',
  '$$border-width': tokens.borderWidths.default,
  '$$border-radius': tokens.radii[1],
  fontSize: '14px',

  colors: (c) => ({
    $$text: c.fill_color.text.primary,
  }),
});

export const wrapperVariants = rdStyle({
  colors: (c) => ({
    '$$text-disabled': c.fill_color.text.disabled,
  }),
});
