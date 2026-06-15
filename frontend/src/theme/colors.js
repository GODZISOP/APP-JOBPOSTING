
// ─── Light Colors ─────────────────────────────────────────────────────────────
export const LIGHT_COLORS = {
  bgPrimary: '#D4EAD7',
  bgSecondary: '#E8F5E9',
  bgCard: '#FFFFFF',
  bgDark: '#1A1A1A',

  accentYellow: '#E8F542',
  accentYellowDark: '#C8D900',
  accentGreen: '#5C9E6A',

  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',

  success: '#4CAF50',
  error: '#EF4444',
  warning: '#F59E0B',

  border: '#D1D5DB',
  borderLight: '#E5E7EB',

  toggleOff: '#CBD5E1',
  toggleOn: '#E8F542',

  shadow: 'rgba(0,0,0,0.08)',
};

// ─── Dark Colors (Glassmorphism Glowing Orange Theme) ─────────────────────────
export const DARK_COLORS = {
  bgPrimary: '#111111', // Deep black background
  bgSecondary: '#1A1A1A', // Slightly lighter dark
  bgCard: 'rgba(30, 30, 30, 0.7)', // Transparent glass effect
  bgDark: '#050505',

  accentYellow: '#FF8C00', // Glowing orange accent
  accentYellowDark: '#E65C00',
  accentGreen: '#FF8C00', // Using orange instead of green for the dark theme

  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textLight: '#737373',
  textWhite: '#FFFFFF',

  success: '#4CAF50',
  error: '#EF4444',
  warning: '#FF8C00',

  border: 'rgba(255, 255, 255, 0.12)', // Glass rim
  borderLight: 'rgba(255, 255, 255, 0.05)',

  toggleOff: '#333333',
  toggleOn: '#FF8C00',

  shadow: 'rgba(255, 140, 0, 0.15)', // Subtle glowing orange shadow
};

// ─── Backward-compat export (still used by App.js tab bar init) ───────────────
export const COLORS = LIGHT_COLORS;

// ─── Helper ───────────────────────────────────────────────────────────────────
export const getColors = (isDark) => isDark ? DARK_COLORS : LIGHT_COLORS;


export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 36,
  },
};
