import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import './index.css';
import App from './App';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ApiErrorBridge from './api/ApiErrorBridge';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={4000}
        >
          <ApiErrorBridge />
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
