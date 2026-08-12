import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { registerErrorHandler } from './client';

// Wires the axios error interceptor to the global snackbar so every failed
// API call surfaces the backend's ApiError.message without each page having
// to catch and display it manually.
export default function ApiErrorBridge() {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    registerErrorHandler((error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    });
    return () => registerErrorHandler(null);
  }, [enqueueSnackbar]);

  return null;
}
