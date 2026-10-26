import type { FC, ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  /**
   * Render an animated trailing arrow.
   *
   * Kept as a separate element (rather than a glyph inside the translation
   * string) so it can travel on hover without moving the label text.
   */
  arrow?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  style,
  disabled,
  arrow = false,
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
      <span className={styles.label}>{children}</span>
      {arrow && (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      )}
    </button>
  );
};
