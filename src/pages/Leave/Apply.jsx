import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import leavesApi from '../../api/leaves';
import { LEAVE_TYPE, LEAVE_DURATION, labelize } from '../../constants/enums';
import { useActingAs } from '../../context/ActingAsContext';

export default function Apply() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState('CASUAL_LEAVE');
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [duration, setDuration] = useState('FULL_DAY');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const isHalfDayInvalid = duration !== 'FULL_DAY' && fromDate && toDate && !fromDate.isSame(toDate, 'day');
  const isValid = actingAs && leaveType && fromDate && toDate && duration && !isHalfDayInvalid;

  const totalDays = useMemo(() => {
    if (!fromDate || !toDate || isHalfDayInvalid) return null;
    if (duration !== 'FULL_DAY') return 0.5;
    return toDate.diff(fromDate, 'day') + 1;
  }, [fromDate, toDate, duration, isHalfDayInvalid]);

  const handleSubmit = () => {
    setSaving(true);
    leavesApi
      .apply({
        userId: actingAs.userId,
        leaveType,
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: toDate.format('YYYY-MM-DD'),
        duration,
        reason,
      })
      .then(() => {
        enqueueSnackbar('Leave request submitted', { variant: 'success' });
        navigate('/leave/my');
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader
        title="Apply for leave"
        subtitle={actingAs ? `Requesting as ${actingAs.employeeName} (${actingAs.userId})` : ''}
      />
      <Card sx={{ maxWidth: 640 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                required
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
                required
                label="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                helperText="Half day only applies when From and To are the same day"
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
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="To date"
                value={toDate}
                onChange={setToDate}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            {isHalfDayInvalid ? (
              <Grid size={12}>
                <Alert severity="warning">
                  A half day request needs the same From and To date.
                </Alert>
              </Grid>
            ) : (
              totalDays != null && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    This request covers <strong>{totalDays}</strong> day{totalDays === 1 ? '' : 's'}.
                  </Typography>
                </Grid>
              )
            )}
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Reason"
                placeholder="Let your manager know why you're taking leave"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubmit}
                disabled={!isValid || saving}
                data-testid="leave-submit-button"
              >
                {saving ? 'Submitting…' : 'Submit request'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
