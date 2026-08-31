import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated, initializing } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Identity is no longer seeded synchronously from storage - it is restored
  // by exchanging the httpOnly refresh cookie on boot. Without this branch a
  // returning user with a valid session sees the login form flash for the
  // length of that round trip before being redirected away from it.
  if (initializing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    // No imperative navigate() here - once login() resolves, isAuthenticated
    // flips true and the branch above re-renders into a declarative
    // <Navigate>. Racing an imperative navigate() against that (and against
    // RootRedirect's own <Navigate> at "/") caused an intermittent blank
    // landing page.
    login(username, password)
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={0.5} sx={{ alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, width: 48, height: 48, mb: 1 }}>
              A
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Accusharp HRMS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="User ID"
                placeholder="e.g. HR001"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                fullWidth
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
