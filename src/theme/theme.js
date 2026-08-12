import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F9D8B',
      dark: '#0B7C6E',
      light: '#3FBCAC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2F6FED',
    },
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1B2430',
      secondary: '#5C6B7A',
    },
    success: { main: '#1BA97E' },
    warning: { main: '#E2A400' },
    error: { main: '#E0483F' },
    info: { main: '#2F6FED' },
    divider: '#E4E9EE',
    sidebar: {
      background: '#152238',
      backgroundActive: '#0F9D8B',
      text: '#AEBBC9',
      textActive: '#FFFFFF',
      sectionLabel: '#5E7186',
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: 'none' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
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
          border: '1px solid #E4E9EE',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700, color: '#5C6B7A' } },
    },
  },
});

export default theme;
