import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { useSnackbar } from 'notistack';

// Shows a one-time temporary password returned by the backend on employee
// create, employee password reset, or company onboarding. The password is
// never returned again after this response, so this is the only chance to
// relay it to whoever needs it.
export default function TempPasswordDialog({
  open,
  onClose,
  title = 'One-time temporary password',
  userId,
  temporaryPassword,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const copy = () => {
    navigator.clipboard?.writeText(temporaryPassword || '');
    enqueueSnackbar('Password copied to clipboard', { variant: 'success' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            This password will not be shown again. Relay it to {userId || 'the account holder'} out
            of band now.
          </Alert>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              User ID
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
              {userId}
            </Typography>
          </Stack>
          <TextField
            label="Temporary password"
            value={temporaryPassword || ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                sx: { fontFamily: 'monospace' },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy">
                      <IconButton onClick={copy} edge="end" size="small">
                        <ContentCopyRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
