import React, { ReactNode } from 'react';
import * as styles from './component_name.css';
// import * as RadixCheckbox from '@radix-ui/react-checkbox';

// export type COMPONENT_NAMEProps = Stitches.ComponentProps<typeof RadixCheckbox.Root> & {}
export type COMPONENT_NAMEProps = {
  children: ReactNode;
};

const COMPONENT_NAME = ({ children, ...props }: COMPONENT_NAMEProps) => {
  return <div className={styles.base}>{children}</div>;
};

export default COMPONENT_NAME;
