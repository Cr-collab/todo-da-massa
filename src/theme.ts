import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Equivalent to Tailwind blue-500
    },
    background: {
      default: '#0f172a', // Slate-900 (Dark background)
      paper: '#1e293b', // Slate-800 (Card background)
    },
    text: {
      primary: '#f8fafc', // Slate-50
      secondary: '#94a3b8', // Slate-400
    },
  },
  typography: {
    fontFamily: '"Inter", "system-ui", "Avenir", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Disable uppercase transform
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none', // Disable default elevation overlay in dark mode for cleaner look
        },
      },
    },
  },
});
