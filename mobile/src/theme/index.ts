export const Theme = {
    colors: {
        brandOrange: '#0F172A', // Deep Navy (Primary Branding)
        buttonPeach: '#D4AF37', // Gold (Action/Accent)
        background: '#FFFFFF',  // Pure White
        inputBg: '#F8FAFC',
        textDark: '#0F172A',    // Deep Navy Text
        textLight: '#64748B',   // Muted Slate
        border: '#E2E8F0',
        searchBg: '#F1F5F9',
        cardBg: '#FFFFFF',
        iconGray: '#0F172A',
        activeTab: '#0F172A',
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