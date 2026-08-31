import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import shiftsApi from '../../api/shifts';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  shiftCode: '',
  shiftName: '',
  startTime: dayjs('2000-01-01T09:00:00'),
  endTime: dayjs('2000-01-01T18:00:00'),
  workingHours: 8,
  breakMinutes: 30,
  graceMinutes: 10,
  overtimeWindowMinutes: 240,
};

function ShiftFormDialog({ open, editing, onClose, onSaved }) {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (!open) return;
    setWarnings([]);
    if (editing) {
      setForm({
        shiftCode: editing.shiftCode,
        shiftName: editing.shiftName,
        startTime: dayjs(`2000-01-01T${editing.startTime}`),
        endTime: dayjs(`2000-01-01T${editing.endTime}`),
        workingHours: editing.workingHours,
        breakMinutes: editing.breakMinutes,
        graceMinutes: editing.graceMinutes,
        overtimeWindowMinutes: editing.overtimeWindowMinutes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editing]);

  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  // Identical start and end times are rejected by the backend: the shift would
  // silently become 24 hours long, and every day worked would book sixteen
  // hours of overtime. Compared on the formatted values actually sent, so this
  // agrees with the server rather than tripping over picker precision.
  const sameTime =
    form.startTime &&
    form.endTime &&
    form.startTime.format('HH:mm:ss') === form.endTime.format('HH:mm:ss');

  const isValid =
    form.shiftCode && form.shiftName && form.startTime && form.endTime
    && form.workingHours > 0 && !sameTime;

  // Mirrors the backend's Shift.crossesMidnight() for the times the backend
  // actually accepts: end strictly before start. Equal times satisfy the
  // backend's `!endTime.isAfter(startTime)` too, but they are a mistake rather
  // than an overnight shift - saying "crosses midnight" there would confirm the
  // very thing about to be rejected, so they are flagged separately below.
  // Shown proactively, before saving, per the redesign brief's overnight-shift
  // example - not just after the fact.
  const crossesMidnight =
    form.startTime && form.endTime && form.endTime.isBefore(form.startTime);

  const handleSubmit = () => {
    setSaving(true);
    const payload = {
      shiftCode: form.shiftCode,
      shiftName: form.shiftName,
      startTime: form.startTime.format('HH:mm:ss'),
      endTime: form.endTime.format('HH:mm:ss'),
      workingHours: Number(form.workingHours),
      breakMinutes: Number(form.breakMinutes),
      graceMinutes: Number(form.graceMinutes),
      overtimeWindowMinutes: Number(form.overtimeWindowMinutes),
    };
    const action = editing ? shiftsApi.update(editing.id, payload) : shiftsApi.create(payload);
    action
      .then((res) => {
        enqueueSnackbar(`Shift ${editing ? 'updated' : 'created'}`, { variant: 'success' });
        if (res.warnings?.length) setWarnings(res.warnings);
        else {
          onSaved();
          onClose();
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
      <DialogContent>
        {warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => { setWarnings([]); onSaved(); onClose(); }}>
            {warnings.join(' ')}
          </Alert>
        )}
        {warnings.length === 0 && sameTime && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Start and end times are identical, so this shift would span a full 24 hours. For an
            overnight shift set an end time earlier than the start — for example 18:00 to 08:00.
          </Alert>
        )}
        {warnings.length === 0 && crossesMidnight && (
          <Alert severity="info" icon={<WarningAmberRoundedIcon fontSize="inherit" />} sx={{ mb: 2 }}>
            Overnight shift — this shift crosses midnight. Please confirm the start and end times.
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Shift Code"
              required
              disabled={!!editing}
              value={form.shiftCode}
              onChange={(e) => set('shiftCode', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Shift Name"
              required
              value={form.shiftName}
              onChange={(e) => set('shiftName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TimePicker
              label="Start time"
              value={form.startTime}
              onChange={(v) => set('startTime', v)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TimePicker
              label="End time"
              value={form.endTime}
              onChange={(v) => set('endTime', v)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Working hours"
              required
              value={form.workingHours}
              onChange={(e) => set('workingHours', e.target.value.replace(/[^0-9.]/g, ''))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Break (min)"
              value={form.breakMinutes}
              onChange={(e) => set('breakMinutes', e.target.value.replace(/[^0-9]/g, ''))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Grace (min)"
              value={form.graceMinutes}
              onChange={(e) => set('graceMinutes', e.target.value.replace(/[^0-9]/g, ''))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="OT window (min)"
              value={form.overtimeWindowMinutes}
              onChange={(e) => set('overtimeWindowMinutes', e.target.value.replace(/[^0-9]/g, ''))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ShiftList() {
  const { enqueueSnackbar } = useSnackbar();
  const { can } = useAuth();
  const canManage = can('SHIFT_MANAGE');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    shiftsApi
      .list()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    shiftsApi
      .remove(deleteTarget.id)
      .then(() => {
        enqueueSnackbar('Shift deleted', { variant: 'success' });
        setDeleteTarget(null);
        load();
      })
      .catch(() => {})
      .finally(() => setDeleting(false));
  };

  const columns = [
    { field: 'shiftCode', headerName: 'Code', width: 120 },
    { field: 'shiftName', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'startTime', headerName: 'Start', width: 100 },
    { field: 'endTime', headerName: 'End', width: 100 },
    { field: 'workingHours', headerName: 'Hours', width: 90 },
    { field: 'breakMinutes', headerName: 'Break', width: 90 },
    { field: 'graceMinutes', headerName: 'Grace', width: 90 },
    { field: 'overtimeWindowMinutes', headerName: 'OT window', width: 100 },
    {
      field: 'crossesMidnight',
      headerName: 'Crosses midnight',
      width: 150,
      renderCell: (params) =>
        params.value ? <Chip label="Overnight" size="small" color="info" /> : null,
    },
    {
      field: 'warnings',
      headerName: 'Warnings',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.value?.length > 0 ? (
          <Tooltip title={params.value.join(' ')}>
            <WarningAmberRoundedIcon fontSize="small" color="warning" />
          </Tooltip>
        ) : null,
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 100,
      renderCell: (params) =>
        canManage && (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(params.row);
                  setFormOpen(true);
                }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => setDeleteTarget(params.row)}>
                <DeleteRoundedIcon fontSize="small" color="error" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Shifts"
        subtitle="Shift master — timing, break, grace and overtime window"
        actions={
          canManage && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add Shift
            </Button>
          )
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        height={520}
        emptyState={{
          title: 'No shifts configured',
          description: canManage
            ? 'Create shifts to start scheduling attendance and rosters.'
            : 'No shifts have been configured for this company yet.',
          action: canManage && (
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add Shift
            </Button>
          ),
        }}
      />

      <ShiftFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={load}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete shift?"
        description={`"${deleteTarget?.shiftName}" will be permanently removed.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
