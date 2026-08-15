import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import EmployeePicker from '../../components/EmployeePicker';
import attendanceApi from '../../api/attendance';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_COLOR } from '../../constants/enums';
import { useActingAs } from '../../context/ActingAsContext';

function CorrectionDialog({ open, record, userId, onClose, onSaved }) {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const [firstIn, setFirstIn] = useState(null);
  const [lastOut, setLastOut] = useState(null);
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !record) return;
    setFirstIn(record.firstIn ? dayjs(record.firstIn) : null);
    setLastOut(record.lastOut ? dayjs(record.lastOut) : null);
    setStatus('');
    setRemarks('');
  }, [open, record]);

  // Mirrors the backend's own rule (AttendanceCorrectionRequest): both times together,
  // or neither - a lone firstIn/lastOut would be silently dropped server-side otherwise.
  const bothTimesGiven = !!firstIn && !!lastOut;
  const noTimesGiven = !firstIn && !lastOut;
  const timesConsistent = noTimesGiven || (bothTimesGiven && lastOut.isAfter(firstIn));
  const isValid = remarks.trim().length > 0 && timesConsistent && (bothTimesGiven || !!status);

  const handleSubmit = () => {
    setSaving(true);
    const payload = { remarks, updatedBy: actingAs?.userId };
    if (bothTimesGiven) {
      payload.firstIn = firstIn.format('YYYY-MM-DDTHH:mm:ss');
      payload.lastOut = lastOut.format('YYYY-MM-DDTHH:mm:ss');
    }
    if (status) {
      payload.status = status;
    }
    attendanceApi
      .correct(userId, record.attendanceDate, payload)
      .then(() => {
        enqueueSnackbar('Attendance corrected', { variant: 'success' });
        onSaved();
        onClose();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  if (!record) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Correct {dayjs(record.attendanceDate).format('DD MMM YYYY')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Supply the real punch times, declare a status outright, or both - an explicit status
          always labels the day, but hours/overtime are only ever computed from real times.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DateTimePicker
              label="First in"
              value={firstIn}
              onChange={setFirstIn}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  InputProps: firstIn
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setFirstIn(null)} edge="end">
                              <ClearRoundedIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    : undefined,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DateTimePicker
              label="Last out"
              value={lastOut}
              onChange={setLastOut}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  InputProps: lastOut
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setLastOut(null)} edge="end">
                              <ClearRoundedIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    : undefined,
                },
              }}
            />
          </Grid>
        </Grid>
        {!timesConsistent && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {noTimesGiven || bothTimesGiven
              ? 'Last out must be after first in.'
              : 'Provide both first in and last out, or clear both and declare a status instead.'}
          </Typography>
        )}
        <TextField
          select
          fullWidth
          size="small"
          label={bothTimesGiven ? 'Declare status (optional override)' : 'Declare status'}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          helperText={
            bothTimesGiven
              ? 'Leave unset to let the status follow the times above.'
              : 'Required when no punch times are supplied - hours will follow the shift, not real punches.'
          }
          sx={{ mt: 2 }}
        >
          <MenuItem value="">
            <em>{bothTimesGiven ? 'No override - use computed status' : 'Select a status'}</em>
          </MenuItem>
          {ATTENDANCE_STATUS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          required
          label="Remarks (required)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || saving}>
          Save correction
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Records() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const [userId, setUserId] = useState(null);
  const [month, setMonth] = useState(dayjs());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [correcting, setCorrecting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!userId || !month) {
      setRows([]);
      return;
    }
    setLoading(true);
    attendanceApi
      .records(userId, month.format('YYYY-MM'))
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [userId, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUnlock = () => {
    if (!userId || !month) return;
    setBusy(true);
    attendanceApi
      .unlock(userId, month.format('YYYY-MM'), actingAs?.userId)
      .then((res) => {
        enqueueSnackbar(`Unlocked ${res.unlockedDays} day(s)`, { variant: 'success' });
        load();
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const handleRefresh = () => {
    if (!month) return;
    setBusy(true);
    attendanceApi
      .refreshSummaries(month.format('YYYY-MM'))
      .then(() => enqueueSnackbar('Summaries refreshed', { variant: 'success' }))
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const columns = [
    {
      field: 'attendanceDate',
      headerName: 'Date',
      width: 130,
      valueFormatter: (v) => (v ? dayjs(v).format('DD MMM YYYY') : ''),
    },
    { field: 'shiftCode', headerName: 'Shift', width: 90 },
    {
      field: 'firstIn',
      headerName: 'In',
      width: 130,
      valueFormatter: (v) => (v ? dayjs(v).format('HH:mm') : '-'),
    },
    {
      field: 'lastOut',
      headerName: 'Out',
      width: 130,
      valueFormatter: (v) => (v ? dayjs(v).format('HH:mm') : '-'),
    },
    { field: 'workingHours', headerName: 'Hours', width: 90 },
    { field: 'overtimeHours', headerName: 'OT', width: 80 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => <StatusChip value={params.value} colorMap={ATTENDANCE_STATUS_COLOR} />,
    },
    {
      field: 'recordStatus',
      headerName: 'Source',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'MANUAL' ? 'secondary' : 'default'}
        />
      ),
    },
    {
      field: 'locked',
      headerName: 'Locked',
      width: 90,
      renderCell: (params) => (params.value ? <Chip label="Locked" size="small" color="error" /> : null),
    },
    { field: 'remarks', headerName: 'Remarks', flex: 1, minWidth: 160 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 70,
      renderCell: (params) => (
        <Tooltip title={params.row.locked ? 'Unlock the month first' : 'Correct'}>
          <span>
            <IconButton size="small" disabled={params.row.locked} onClick={() => setCorrecting(params.row)}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Attendance Records"
        subtitle="Review generated days, fix device misses, and manage locks before payroll"
        actions={
          <>
            <EmployeePicker label="Employee" value={userId} onChange={setUserId} />
            <DatePicker
              label="Month"
              views={['year', 'month']}
              value={month}
              onChange={setMonth}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button startIcon={<LockOpenRoundedIcon />} onClick={handleUnlock} disabled={!userId || busy}>
              Unlock month
            </Button>
            <Button startIcon={<RefreshRoundedIcon />} onClick={handleRefresh} disabled={busy}>
              Refresh summaries
            </Button>
          </>
        }
      />
      {!userId ? (
        <Alert severity="info">Pick an employee to see their attendance records.</Alert>
      ) : rows.length === 0 && !loading ? (
        <Alert severity="info">
          No records for this month yet — generate attendance first from the Generate tab.
        </Alert>
      ) : (
        <DataTable rows={rows} columns={columns} loading={loading} height={560} density="compact" />
      )}

      <CorrectionDialog
        open={!!correcting}
        record={correcting}
        userId={userId}
        onClose={() => setCorrecting(null)}
        onSaved={load}
      />
    </>
  );
}
