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
import { useReducedMotion } from 'framer-motion';
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
          <span className={styles.statusEyebrow}>Digital Specimen Unavailable</span>
          <p className={styles.statusDescription}>
            The 3D fossil reconstruction could not be loaded from the archive.
          </p>
          <button type="button" className={styles.controlButton} onClick={this.handleRetry}>
            Retry Reconstruction
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const SpecimenLoadingOverlay: FC = () => {
  const { active, progress } = useProgress();

  if (!active) {
    return null;
  }

  return (
    <div className={styles.statusOverlay} role="status" aria-live="polite">
      <span className={styles.statusEyebrow}>Specimen Loading</span>
      <p className={styles.statusDescription}>Preparing digital reconstruction...</p>
      <span className={styles.progressValue}>{Math.round(progress)}%</span>
    </div>
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
  const graphicsQuality = useAppSettings((state) => state.graphicsQuality);

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
      aria-label={`Interactive 3D specimen viewer for ${name}`}
    >
      <ViewerErrorBoundary resetKey={`${modelPath}-${retryCount}`} onRetry={handleRetry}>
        <div className={styles.topBar}>
          <span className={styles.microInstruction}>Drag to Rotate • Scroll to Inspect</span>
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
            reducedMotion={prefersReducedMotion}
            onAnimationsAvailable={handleAnimationsAvailable}
          />
        </ThreeCanvas>

        <div className={styles.bottomBar}>
          {availableActions.length > 0 ? (
            <div className={styles.animationGroup} role="group" aria-label="Specimen motion states">
              <span className={styles.groupLabel}>Motion</span>
              {availableActions.map((action) => {
                const isActive = selectedClip === action.clipName;
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
                    {action.label}
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
            aria-label="Reset camera view"
          >
            Reset View
          </button>
        </div>
      </ViewerErrorBoundary>
    </div>
  );
};
