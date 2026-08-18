import { useState } from 'react';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import EmployeePicker from './EmployeePicker';
import leavesApi from '../api/leaves';
import { LEAVE_TYPE, LEAVE_DURATION, labelize } from '../constants/enums';

/**
 * HR/ADMIN entering an already-approved leave directly - for backfilling a
 * day that already happened (an employee took time off informally and HR
 * wants attendance/payroll to reflect it), not for a forward-looking
 * request. Skips apply/supervisor-endorse entirely; the leave is APPROVED
 * the moment this succeeds, same as the balance it consumes immediately.
 */
export default function AddLeaveDialog({ open, onClose, onCreated }) {
  const { enqueueSnackbar } = useSnackbar();
  const [userId, setUserId] = useState(null);
  const [leaveType, setLeaveType] = useState('CASUAL_LEAVE');
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [duration, setDuration] = useState('FULL_DAY');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const isHalfDayInvalid = duration !== 'FULL_DAY' && fromDate && toDate && !fromDate.isSame(toDate, 'day');
  const isValid = userId && leaveType && fromDate && toDate && duration && !isHalfDayInvalid;

  const reset = () => {
    setUserId(null);
    setLeaveType('CASUAL_LEAVE');
    setFromDate(dayjs());
    setToDate(dayjs());
    setDuration('FULL_DAY');
    setReason('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    setSaving(true);
    leavesApi
      .hrDirectCreate({
        userId,
        leaveType,
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: toDate.format('YYYY-MM-DD'),
        duration,
        reason,
      })
      .then(() => {
        enqueueSnackbar('Leave added and approved', { variant: 'success' });
        onCreated?.();
        handleClose();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add leave</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Enters the leave already approved — for backfilling a day that already happened, not for
          a forward-looking request. Skips supervisor endorsement and consumes balance immediately.
        </Alert>
        <Grid container spacing={2}>
          <Grid size={12}>
            <EmployeePicker label="Employee" value={userId} onChange={setUserId} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Leave type"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              {LEAVE_TYPE.map((t) => (
                <MenuItem key={t} value={t}>
                  {labelize(t)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {LEAVE_DURATION.map((d) => (
                <MenuItem key={d} value={d}>
                  {labelize(d)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="From date"
              value={fromDate}
              onChange={setFromDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="To date"
              value={toDate}
              onChange={setToDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          {isHalfDayInvalid && (
            <Grid size={12}>
              <Alert severity="warning">
                A half day is only valid when the from and to dates are the same.
              </Alert>
            </Grid>
          )}
          <Grid size={12}>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || saving}>
          Add leave
        </Button>
      </DialogActions>
    </Dialog>
  );
}
