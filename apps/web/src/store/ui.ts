import { create } from "zustand";
import { LayoutMode, ItemSize, FitBoxMode } from "../types";

interface UiState {
  editMode: boolean;
  search: string;
  commandPalette: boolean;
  layoutMode: LayoutMode;
  itemSize: ItemSize;
  fitBoxMode: FitBoxMode;
  setEditMode: (val: boolean) => void;
  setSearch: (val: string) => void;
  setCommandPalette: (val: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setItemSize: (size: ItemSize) => void;
  setFitBoxMode: (mode: FitBoxMode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  editMode: false,
  search: "",
  commandPalette: false,
  layoutMode: "auto",
  itemSize: "medium",
  fitBoxMode: "auto",
  setEditMode: (val) => set({ editMode: val }),
  setSearch: (val) => set({ search: val }),
  setCommandPalette: (val) => set({ commandPalette: val }),
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setItemSize: (size) => set({ itemSize: size }),
  setFitBoxMode: (mode) => set({ fitBoxMode: mode })
}));
