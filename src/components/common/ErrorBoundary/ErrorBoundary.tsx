import { Component, type ErrorInfo, type ReactNode } from 'react';
import { getTranslationDictionary } from '@/i18n';
import { useAppSettings } from '@/store';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const language = useAppSettings.getState().language;
      const t = getTranslationDictionary(language);

      return (
        <div
          role="alert"
          style={{
            padding: '2rem',
            margin: '2rem auto',
            maxWidth: '600px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>
            {t.common.errorHeading}
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            {this.state.error?.message || t.common.errorFallback}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--button-primary-text)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            {t.common.tryAgain}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
