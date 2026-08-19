import { createTheme } from '@mui/material/styles';

// ---------------------------------------------------------------------------
// Design tokens
//
// Single source of truth for color, spacing, radius, elevation and motion
// primitives. The MUI theme below is assembled from these tokens rather than
// hardcoding values inline, so the whole app can be re-tuned from one place.
// The palette itself is NOT new — these are the app's existing colors
// (teal accent, navy sidebar) organized into a systematic scale, per the
// redesign brief's instruction to derive tokens from what already exists.
// ---------------------------------------------------------------------------

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const tokens = {
  color: {
    neutral: {
      bg: '#F4F6F8',
      surface: '#FFFFFF',
      border: '#E4E9EE',
      borderStrong: '#D7DEE5',
    },
    text: {
      primary: '#1B2430',
      secondary: '#5C6B7A',
      tertiary: '#8B98A5',
      disabled: '#B3BCC5',
      inverse: '#FFFFFF',
    },
    accent: {
      main: '#0F9D8B',
      dark: '#0B7C6E',
      light: '#3FBCAC',
      soft: '#E3F5F2',
    },
    secondary: {
      main: '#2F6FED',
      soft: '#E8EFFE',
    },
    success: { main: '#1BA97E', soft: '#E3F6EE' },
    // Darkened from the prior #E2A400 so warning text/icons on a white
    // surface clear WCAG AA (4.5:1) for normal-size text; "soft" keeps the
    // lighter tone for tinted chip/banner backgrounds.
    warning: { main: '#B76E00', soft: '#FDF1DC' },
    error: { main: '#D0392F', soft: '#FBEAE8' },
    info: { main: '#2F6FED', soft: '#E8EFFE' },
    sidebar: {
      background: '#152238',
      backgroundActive: '#0F9D8B',
      text: '#AEBBC9',
      textActive: '#FFFFFF',
      sectionLabel: '#5E7186',
    },
  },
  radius: {
    sm: 8,
    md: 10,
    lg: 14,
    card: 12,
    dialog: 16,
    pill: 999,
  },
  elevation: {
    card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 1px rgba(16, 24, 40, 0.03)',
    raised: '0 4px 12px rgba(16, 24, 40, 0.08)',
    dialog: '0 12px 28px rgba(16, 24, 40, 0.14)',
  },
};

// MUI requires exactly 25 shadow levels. The stock theme's defaults are
// heavy/dark; this replaces them with a calm, low-contrast scale so every
// component that elevates (Menu, Popover, Select, Snackbar, Dialog, Drawer)
// gets subtle depth automatically instead of per-component overrides.
const shadow = (y, blur, spread, alpha) =>
  `0 ${y}px ${blur}px ${spread}px rgba(16, 24, 40, ${alpha})`;
const softShadowSteps = [
  'none',
  shadow(1, 2, 0, 0.04),
  shadow(1, 3, 0, 0.06),
  shadow(2, 6, 0, 0.06),
  shadow(4, 10, 0, 0.07),
  shadow(6, 14, -2, 0.08),
  shadow(8, 18, -2, 0.08),
  shadow(10, 22, -2, 0.09),
  shadow(12, 28, -4, 0.1),
];
const shadows = Array.from({ length: 25 }, (_, i) =>
  softShadowSteps[Math.min(i, softShadowSteps.length - 1)]
);

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.color.accent.main,
      dark: tokens.color.accent.dark,
      light: tokens.color.accent.light,
      contrastText: tokens.color.text.inverse,
    },
    secondary: { main: tokens.color.secondary.main },
    background: {
      default: tokens.color.neutral.bg,
      paper: tokens.color.neutral.surface,
    },
    text: {
      primary: tokens.color.text.primary,
      secondary: tokens.color.text.secondary,
      disabled: tokens.color.text.disabled,
    },
    success: tokens.color.success,
    warning: tokens.color.warning,
    error: tokens.color.error,
    info: tokens.color.info,
    divider: tokens.color.neutral.border,
    sidebar: tokens.color.sidebar,
  },
  shape: { borderRadius: tokens.radius.md },
  shadows,
  typography: {
    fontFamily,
    // Type scale — Display / Page Title / Section Heading / Card Heading /
    // Body / Secondary / Caption map onto MUI's stock variants below so
    // every page uses the same handful of variants instead of ad hoc sizes.
    h1: { fontSize: '2.5rem', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em' }, // Display
    h2: { fontSize: '2rem', lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', lineHeight: 1.25, fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.5rem', lineHeight: 1.3, fontWeight: 700 }, // Page Title
    h5: { fontSize: '1.25rem', lineHeight: 1.35, fontWeight: 700 }, // Section Heading
    h6: { fontSize: '1.0625rem', lineHeight: 1.4, fontWeight: 700 }, // Dense Card Heading
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600 }, // Card Heading
    subtitle2: { fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.55, fontWeight: 400 }, // Body
    body2: { fontSize: '0.8125rem', lineHeight: 1.5, fontWeight: 400 }, // Secondary
    caption: { fontSize: '0.75rem', lineHeight: 1.4, fontWeight: 500 }, // Caption / Helper / Error
    overline: {
      fontSize: '0.6875rem',
      lineHeight: 1.4,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    button: { fontWeight: 600, textTransform: 'none', fontSize: '0.875rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.001ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.001ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: `2px solid ${tokens.color.accent.main}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.sm, boxShadow: 'none' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        sizeLarge: { minHeight: 48 }, // touch-target friendly for employee-facing screens
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.sm },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
      defaultProps: { elevation: 0 },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.card,
          border: `1px solid ${tokens.color.neutral.border}`,
          boxShadow: tokens.elevation.card,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.dialog,
          boxShadow: tokens.elevation.dialog,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: tokens.radius.pill },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.sm },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.sm },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: tokens.color.text.secondary },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.color.text.primary,
          borderRadius: tokens.radius.sm,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
