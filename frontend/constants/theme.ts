export const colors = {
    background: "#0d0d0d",
    card: "#1a1a1a",
    cardAlt: "#222222",
    foreground: "#ffffff",
    muted: "rgba(255,255,255,0.5)",
    mutedForeground: "rgba(255,255,255,0.3)",
    primary: "#00e676",
    accent: "#00bcd4",
    warning: "#f5c542",
    danger: "#dc2626",
    success: "#16a34a",
    info: "#3b82f6",
    purple: "#7c3aed",
    border: "rgba(255,255,255,0.1)",
} as const;

export const spacing = {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    18: 72,
    20: 80,
} as const;

export const components = {
    tabBar: {
        height: spacing[18],
        horizontalInset: spacing[5],
        radius: spacing[8],
        iconFrame: spacing[12],
    },
} as const;

export const theme = {
    colors,
    spacing,
    components,
} as const;