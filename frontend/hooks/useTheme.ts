import { useThemeStore } from "@/store/themeStore";
import { darkColors, lightColors, spacing, components } from "@/constants/theme";

export const useTheme = () => {
    const { isDark, theme, toggleTheme, setTheme } = useThemeStore();

    const colors = isDark ? darkColors : lightColors;

    return {
        colors,
        spacing,
        components,
        isDark,
        theme,
        toggleTheme,
        setTheme,
    };
};