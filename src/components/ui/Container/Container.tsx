import type { FC, ReactNode, CSSProperties } from 'react';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxWidth?: string;
}

export const Container: FC<ContainerProps> = ({
  children,
  className,
  style,
  maxWidth = 'var(--max-content-width)',
}) => {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
