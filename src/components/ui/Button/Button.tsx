import type { FC, ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  style,
  disabled,
  ...rest
}) => {
  const variantClass = styles[variant] ?? styles.primary;

  return (
    <button
      disabled={disabled}
      className={`${styles.button} ${variantClass} ${className}`.trim()}
      style={style as CSSProperties}
      {...rest}
    >
      {children}
    </button>
  );
};
