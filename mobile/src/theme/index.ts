export const Theme = {
    colors: {
        // New Palette
        primary: '#FF9F1C',   // Golden Orange
        secondary: '#FFD700', // Yellow
        navy: '#0F172A',      // Dark Navy
        softGrey: '#E2E8F0',  // Soft Grey

        // Mapped Keys (updated to match new scheme)
        brandOrange: '#FF9F1C', // Golden Orange (was Navy)
        buttonPeach: '#FF9F1C', // Mapped to Primary (Golden Orange) for buttons
        background: '#FFFFFF',  // Pure White
        inputBg: '#F8FAFC',     // Light background (keep slightly lighter than softGrey for inputs)
        textDark: '#0F172A',    // Dark Navy Text
        textLight: '#64748B',   // Muted Slate
        border: '#E2E8F0',      // Soft Grey Border
        searchBg: '#F1F5F9',
        cardBg: '#FFFFFF',
        iconGray: '#0F172A',    // Dark Navy Icons
        activeTab: '#FF9F1C',   // Golden Orange Active Tab
        inactiveTab: '#94A3B8',
    },
    typography: {
        fontFamily: {
            bold: 'System',
            semiBold: 'System',
            medium: 'System',
            regular: 'System',
            mono: 'monospace',
        },
        weights: {
            bold: '700' as const,
            semiBold: '600' as const,
            medium: '500' as const,
            regular: '400' as const,
        },
        letterSpacing: {
            tight: -0.5,
            normal: 0,
            wide: 0.5,
        }
    }
};