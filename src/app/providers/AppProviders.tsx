import { useEffect, type FC, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { syncDocumentPreferences, useAppSettings } from '@/store';

export interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  const language = useAppSettings((state) => state.language);
  const theme = useAppSettings((state) => state.theme);

  useEffect(() => {
    syncDocumentPreferences(language, theme);
  }, [language, theme]);

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
