import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: "dark",
    isDark: true,

    toggleTheme: () =>
        set((state) => ({
            theme: state.theme === "dark" ? "light" : "dark",
            isDark: state.theme === "dark" ? false : true,
        })),

    setTheme: (theme) =>
        set({
            theme,
            isDark: theme === "dark",
        }),
}));