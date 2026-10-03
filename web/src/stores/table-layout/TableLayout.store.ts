import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TableColumnLayout, TableLayoutState } from "@/stores/table-layout/TableLayout.types";

const EMPTY: TableColumnLayout = { order: [], widths: {} };

export const useTableLayoutStore = create<TableLayoutState>()(
  persist(
    (set) => ({
      layouts: {},
      setOrder: (id, order) => {
        set((state) => ({
          layouts: { ...state.layouts, [id]: { ...(state.layouts[id] ?? EMPTY), order } },
        }));
      },
      setWidth: (id, columnKey, width) => {
        set((state) => {
          const current = state.layouts[id] ?? EMPTY;
          return {
            layouts: {
              ...state.layouts,
              [id]: { ...current, widths: { ...current.widths, [columnKey]: width } },
            },
          };
        });
      },
      reset: (id) => {
        set((state) => {
          if (!state.layouts[id]) return state;
          const layouts = { ...state.layouts };
          delete layouts[id];
          return { layouts };
        });
      },
    }),
    {
      name: "tinglet-table-layout",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ layouts: state.layouts }),
    },
  ),
);
