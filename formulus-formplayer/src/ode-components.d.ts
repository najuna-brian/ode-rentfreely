/**
 * Type declaration for @ode/components/react-web so that we can import
 * without pulling the package's source into our type-check (the package
 * is source-only and type-checks in its own repo).
 */
declare module '@ode/components/react-web' {
  import type { FC } from 'react';

  export interface ODEButtonProps {
    variant?: 'primary' | 'secondary' | 'neutral' | 'danger';
    size?: 'small' | 'medium' | 'large';
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
  }

  export const Button: FC<ODEButtonProps>;
  export const ButtonGroup: FC<unknown>;
  export const Input: FC<unknown>;
  export const Card: FC<unknown>;
  export const Badge: FC<unknown>;
}
