import { create } from "zustand";
import type { CaptureTag, ThemeMode } from "../types";

interface AppState {
  selectedTag: CaptureTag;
  hotkey: string;
  capturesToday: number;
  lastSyncLabel: string;
  theme: ThemeMode;
  setSelectedTag: (tag: CaptureTag) => void;
  setHotkey: (hotkey: string) => void;
  setCapturesToday: (count: number) => void;
  setLastSyncLabel: (label: string) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedTag: "untagged",
  hotkey: "",
  capturesToday: 0,
  lastSyncLabel: "Never",
  theme: "dark",
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setHotkey: (hotkey) => set({ hotkey }),
  setCapturesToday: (capturesToday) => set({ capturesToday }),
  setLastSyncLabel: (lastSyncLabel) => set({ lastSyncLabel }),
  setTheme: (theme) => set({ theme }),
}));
