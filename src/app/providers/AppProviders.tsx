import type { FC, ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};
