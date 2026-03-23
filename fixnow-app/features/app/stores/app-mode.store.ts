import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppMode = 'customer' | 'provider';

interface AppModeState {
  activeMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const useAppModeStore = create<AppModeState>()(
  persist(
    (set) => ({
      activeMode: 'customer',
      setMode: (mode) => set({ activeMode: mode }),
    }),
    {
      name: 'app-mode-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useActiveMode = () => useAppModeStore((s) => s.activeMode);
export const useSetMode = () => useAppModeStore((s) => s.setMode);
