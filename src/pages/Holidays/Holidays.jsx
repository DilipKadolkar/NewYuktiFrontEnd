import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import holidaysApi from '../../api/holidays';
import companiesApi from '../../api/companies';

const emptyForm = {
  companyId: '',
  holidayName: '',
  holidayDate: dayjs(),
  optionalHoliday: false,
  description: '',
};

export default function Holidays() {
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    companiesApi.list().then(setCompanies);
  }, []);

  const load = () => {
    setLoading(true);
    holidaysApi
      .list(fromDate ? fromDate.format('YYYY-MM-DD') : undefined, toDate ? toDate.format('YYYY-MM-DD') : undefined)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [fromDate, toDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, companyId: companies[0]?.id ?? '' });
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      companyId: row.company?.id ?? '',
      holidayName: row.holidayName,
      holidayDate: dayjs(row.holidayDate),
      optionalHoliday: !!row.optionalHoliday,
      description: row.description || '',
    });
    setFormOpen(true);
  };

  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const isValid = form.companyId && form.holidayName && form.holidayDate;

  const handleSubmit = () => {
    setSaving(true);
    const payload = {
      companyId: Number(form.companyId),
      holidayName: form.holidayName,
      holidayDate: form.holidayDate.format('YYYY-MM-DD'),
      optionalHoliday: form.optionalHoliday,
      description: form.description || null,
    };
    const action = editing ? holidaysApi.update(editing.id, payload) : holidaysApi.create(payload);
    action
      .then(() => {
        enqueueSnackbar(`Holiday ${editing ? 'updated' : 'created'}`, { variant: 'success' });
        setFormOpen(false);
        load();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    holidaysApi
      .remove(deleteTarget.id)
      .then(() => {
        enqueueSnackbar('Holiday deleted', { variant: 'success' });
        setDeleteTarget(null);
        load();
      })
      .catch(() => {})
      .finally(() => setDeleting(false));
  };

  const columns = [
    { field: 'holidayName', headerName: 'Holiday', flex: 1, minWidth: 200 },
    {
      field: 'holidayDate',
      headerName: 'Date',
      width: 130,
      valueFormatter: (v) => (v ? dayjs(v).format('DD MMM YYYY') : ''),
    },
    {
      field: 'company',
      headerName: 'Company',
      width: 160,
      valueGetter: (value, row) => row.company?.companyName || '',
    },
    {
      field: 'optionalHoliday',
      headerName: 'Type',
      width: 130,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Optional" size="small" color="warning" />
        ) : (
          <Chip label="Mandatory" size="small" color="success" />
        ),
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 100,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(params.row)}>
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
        title="Holidays"
        subtitle="A mandatory holiday is removed from working days; optional holidays stay working days unless taken as leave"
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
            Add Holiday
          </Button>
        }
      />
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <DatePicker label="From" value={fromDate} onChange={setFromDate} slotProps={{ textField: { size: 'small' } }} />
        <DatePicker label="To" value={toDate} onChange={setToDate} slotProps={{ textField: { size: 'small' } }} />
      </Stack>
      <DataTable rows={rows} columns={columns} loading={loading} height={520} />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Company"
                required
                value={form.companyId}
                onChange={(e) => set('companyId', e.target.value)}
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.companyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Holiday date"
                value={form.holidayDate}
                onChange={(v) => set('holidayDate', v)}
                slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="Holiday name"
                required
                value={form.holidayName}
                onChange={(e) => set('holidayName', e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                label="Description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.optionalHoliday}
                    onChange={(e) => set('optionalHoliday', e.target.checked)}
                  />
                }
                label="Optional holiday (stays a working day unless taken as leave)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!isValid || saving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete holiday?"
        description={`"${deleteTarget?.holidayName}" will be permanently removed.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
