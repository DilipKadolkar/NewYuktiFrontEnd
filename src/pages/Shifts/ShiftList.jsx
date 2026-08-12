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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import shiftsApi from '../../api/shifts';

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

  const isValid = form.shiftCode && form.shiftName && form.startTime && form.endTime && form.workingHours > 0;

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
        params.value ? <Chip label="Yes" size="small" color="info" /> : null,
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 100,
      renderCell: (params) => (
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
        }
      />
      <DataTable rows={rows} columns={columns} loading={loading} height={520} />

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
