import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/auth';

export default function ChangePassword() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    currentPassword && newPassword.length >= 8 && newPassword === confirmPassword && !saving;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    authApi
      .changePassword(currentPassword, newPassword)
      .then(() => {
        enqueueSnackbar('Password changed. Please sign in again with your new password.', {
          variant: 'success',
        });
        return logout();
      })
      .then(() => navigate('/login', { replace: true }))
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader title="Change password" subtitle="Changing your password signs you out everywhere else." />
      <Card sx={{ maxWidth: 480 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Alert severity="info">
                This ends every other signed-in session for your account — you'll need to sign in
                again here too.
              </Alert>
              <TextField
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="At least 8 characters"
                required
                fullWidth
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={mismatch}
                helperText={mismatch ? 'Passwords do not match' : ' '}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={!canSubmit}>
                Change password
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
