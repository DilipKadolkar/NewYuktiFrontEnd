import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
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
        enqueueSnackbar('Leave applied', { variant: 'success' });
        navigate('/leave/my');
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader
        title="Apply Leave"
        subtitle={actingAs ? `Applying as ${actingAs.employeeName} (${actingAs.userId})` : ''}
        actions={
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid || saving}>
            Submit
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Grid container spacing={2}>
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
        </CardContent>
      </Card>
    </>
  );
}
