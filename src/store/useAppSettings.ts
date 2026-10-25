import { create } from 'zustand';

export type GraphicsQuality = 'low' | 'medium' | 'high';

interface AppSettingsState {
  soundEnabled: boolean;
  graphicsQuality: GraphicsQuality;
  toggleSound: () => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
}

export const useAppSettings = create<AppSettingsState>((set) => ({
  soundEnabled: true,
  graphicsQuality: 'high',
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
}));
