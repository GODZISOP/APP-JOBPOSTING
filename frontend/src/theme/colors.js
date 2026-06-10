
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

// ─── Dark Colors ──────────────────────────────────────────────────────────────
export const DARK_COLORS = {
  bgPrimary: '#0F1610',
  bgSecondary: '#162119',
  bgCard: '#1C2B20',
  bgDark: '#000000',

  accentYellow: '#E8F542',
  accentYellowDark: '#C8D900',
  accentGreen: '#6ABF7B',

  textPrimary: '#EDF5EE',
  textSecondary: '#9DB3A0',
  textLight: '#6B7B6E',
  textWhite: '#FFFFFF',

  success: '#4CAF50',
  error: '#EF4444',
  warning: '#F59E0B',

  border: '#2D3D31',
  borderLight: '#253329',

  toggleOff: '#3A4D3D',
  toggleOn: '#E8F542',

  shadow: 'rgba(0,0,0,0.30)',
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
