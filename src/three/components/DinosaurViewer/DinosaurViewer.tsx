import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ErrorInfo,
  type FC,
  type ReactNode,
} from 'react';
import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useAppSettings, type GraphicsQuality } from '@/store';
import { preloadDinosaurModel } from '../../loaders';
import { DinosaurViewerScene } from '../../scenes/DinosaurViewerScene';
import type { SpecimenAnimationAction } from '../../utils';
import { ScenePlaceholder } from '../ScenePlaceholder';
import { ThreeCanvas } from '../ThreeCanvas';
import styles from './DinosaurViewer.module.css';

export interface DinosaurViewerProps {
  name: string;
  modelPath: string;
}

interface ViewerErrorBoundaryProps {
  children: ReactNode;
  resetKey: string;
  onRetry: () => void;
  errorEyebrow: string;
  errorDescription: string;
  retryLabel: string;
}

interface ViewerErrorBoundaryState {
  hasError: boolean;
}

class ViewerErrorBoundary extends Component<ViewerErrorBoundaryProps, ViewerErrorBoundaryState> {
  public state: ViewerErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ViewerErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidUpdate(prevProps: ViewerErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[DinosaurViewer] Failed to load 3D specimen:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.statusOverlay} role="alert">
          <span className={styles.statusEyebrow}>{this.props.errorEyebrow}</span>
          <p className={styles.statusDescription}>{this.props.errorDescription}</p>
          <button type="button" className={styles.controlButton} onClick={this.handleRetry}>
            {this.props.retryLabel}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const SpecimenLoadingOverlay: FC = () => {
  const { active, progress } = useProgress();
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={styles.statusOverlay}
          role="status"
          aria-live="polite"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.statusEyebrow}>{t.viewer.loadingEyebrow}</span>
          <p className={styles.statusDescription}>{t.viewer.loadingDescription}</p>
          <span className={styles.progressValue}>{Math.round(progress)}%</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function getDprForQuality(quality: GraphicsQuality): number | [number, number] {
  switch (quality) {
    case 'low':
      return 1;
    case 'medium':
      return [1, 1.5];
    case 'high':
    default:
      return [1, 2];
  }
}

export const DinosaurViewer: FC<DinosaurViewerProps> = ({ name, modelPath }) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { t } = useTranslation();
  const graphicsQuality = useAppSettings((state) => state.graphicsQuality);
  const theme = useAppSettings((state) => state.theme);

  const [availableActions, setAvailableActions] = useState<SpecimenAnimationAction[]>([]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    preloadDinosaurModel(modelPath);
  }, [modelPath]);

  const handleAnimationsAvailable = useCallback(
    (actions: SpecimenAnimationAction[]) => {
      setAvailableActions(actions);
      if (actions.length === 0) {
        setSelectedClip(null);
        return;
      }

      if (prefersReducedMotion) {
        setSelectedClip(null);
        return;
      }

      const defaultAction = actions.find((a) => a.label === 'IDLE') ?? actions[0];
      setSelectedClip((current) =>
        current && actions.some((a) => a.clipName === current)
          ? current
          : (defaultAction?.clipName ?? null)
      );
    },
    [prefersReducedMotion]
  );

  const handleResetView = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const dpr = getDprForQuality(graphicsQuality);
  const shadowsEnabled = graphicsQuality !== 'low';

  return (
    <div
      className={styles.viewer}
      role="region"
      aria-label={`${t.viewer.regionAriaPrefix} ${name}`}
    >
      <ViewerErrorBoundary
        resetKey={`${modelPath}-${retryCount}`}
        onRetry={handleRetry}
        errorEyebrow={t.viewer.errorEyebrow}
        errorDescription={t.viewer.errorDescription}
        retryLabel={t.viewer.retryButton}
      >
        <div className={styles.topBar}>
          <span className={styles.microInstruction}>{t.viewer.microInstruction}</span>
        </div>

        <SpecimenLoadingOverlay />

        <ThreeCanvas
          style={{ width: '100%', height: '100%', minHeight: '100%' }}
          cameraPosition={[3.2, 2.0, 3.8]}
          cameraFov={40}
          dpr={dpr}
          shadows={shadowsEnabled}
          fallback={<ScenePlaceholder color="#d0a35d" />}
        >
          <DinosaurViewerScene
            key={`${modelPath}-${retryCount}`}
            modelPath={modelPath}
            activeClipName={selectedClip}
            resetTrigger={resetTrigger}
            quality={graphicsQuality}
            theme={theme}
            reducedMotion={prefersReducedMotion}
            onAnimationsAvailable={handleAnimationsAvailable}
          />
        </ThreeCanvas>

        <div className={styles.bottomBar}>
          {availableActions.length > 0 ? (
            <div
              className={styles.animationGroup}
              role="group"
              aria-label={t.viewer.motionGroupAria}
            >
              <span className={styles.groupLabel}>{t.viewer.motionLabel}</span>
              {availableActions.map((action) => {
                const isActive = selectedClip === action.clipName;
                const actionKey = action.label as keyof typeof t.viewer.actionLabels;
                const localizedActionLabel = t.viewer.actionLabels[actionKey] ?? action.label;

                return (
                  <button
                    key={action.clipName}
                    type="button"
                    className={`${styles.controlButton} ${isActive ? styles.controlButtonActive : ''}`}
                    aria-pressed={isActive}
                    onClick={() =>
                      setSelectedClip((current) =>
                        current === action.clipName ? null : action.clipName
                      )
                    }
                  >
                    {localizedActionLabel}
                  </button>
                );
              })}
            </div>
          ) : (
            <span />
          )}

          <button
            type="button"
            className={styles.controlButton}
            onClick={handleResetView}
            aria-label={t.viewer.resetViewAria}
          >
            {t.viewer.resetView}
          </button>
        </div>
      </ViewerErrorBoundary>
    </div>
  );
};
