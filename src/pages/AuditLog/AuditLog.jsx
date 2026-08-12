import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import auditLogsApi from '../../api/auditLogs';
import { downloadBlob } from '../../utils/download';
import { useAuth } from '../../context/AuthContext';

const OUTCOME_COLOR = { SUCCESS: 'success', FAILURE: 'error' };

export default function AuditLog() {
  const { can } = useAuth();
  const canPurge = can('AUDIT_MANAGE');
  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(dayjs().subtract(30, 'day'));
  const [toDate, setToDate] = useState(dayjs());
  const [exporting, setExporting] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeBefore, setPurgeBefore] = useState(dayjs().subtract(90, 'day'));
  const [purging, setPurging] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    auditLogsApi
      .recent(200)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleExport = () => {
    if (!fromDate || !toDate) return;
    setExporting(true);
    auditLogsApi
      .exportCsv(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD'))
      .then((blob) => {
        downloadBlob(
          `audit-log-${fromDate.format('YYYY-MM-DD')}-to-${toDate.format('YYYY-MM-DD')}.csv`,
          blob
        );
      })
      .catch(() => {})
      .finally(() => setExporting(false));
  };

  const handlePurge = () => {
    if (!purgeBefore) return;
    setPurging(true);
    auditLogsApi
      .purge(purgeBefore.format('YYYY-MM-DD'))
      .then((res) => {
        enqueueSnackbar(`Purged ${res.deleted} audit row(s)`, { variant: 'success' });
        setPurgeOpen(false);
        load();
      })
      .catch(() => {})
      .finally(() => setPurging(false));
  };

  const columns = [
    {
      field: 'timestamp',
      headerName: 'When',
      width: 180,
      valueGetter: (value) => (value ? dayjs(value).format('DD MMM YYYY HH:mm:ss') : ''),
    },
    { field: 'actor', headerName: 'Actor', width: 130 },
    { field: 'actorType', headerName: 'Type', width: 100 },
    { field: 'action', headerName: 'Action', width: 180 },
    { field: 'resourceType', headerName: 'Resource', width: 130 },
    { field: 'resourceId', headerName: 'Resource ID', width: 120 },
    {
      field: 'outcome',
      headerName: 'Outcome',
      width: 110,
      renderCell: (params) => <StatusChip value={params.value} colorMap={OUTCOME_COLOR} />,
    },
    { field: 'detail', headerName: 'Detail', flex: 1, minWidth: 200 },
  ];

  return (
    <>
      <PageHeader
        title="Audit Log"
        subtitle="Every security-sensitive action - login/logout, password changes, and business writes."
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5, alignItems: { sm: 'center' } }}>
        <DatePicker
          label="From"
          value={fromDate}
          onChange={setFromDate}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="To"
          value={toDate}
          onChange={setToDate}
          slotProps={{ textField: { size: 'small' } }}
        />
        <Button
          variant="outlined"
          startIcon={<DownloadRoundedIcon />}
          onClick={handleExport}
          disabled={exporting}
        >
          Export CSV
        </Button>
        {canPurge && (
          <Button
            color="error"
            startIcon={<DeleteSweepRoundedIcon />}
            onClick={() => setPurgeOpen(true)}
            sx={{ ml: { sm: 'auto' } }}
          >
            Purge old rows
          </Button>
        )}
      </Stack>

      <DataTable rows={rows} columns={columns} loading={loading} height={560} />

      <Dialog open={purgeOpen} onClose={() => setPurgeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Purge audit rows?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Permanently deletes every audit row older than the date below. This cannot be undone.
            </Typography>
            <DatePicker
              label="Delete rows before"
              value={purgeBefore}
              onChange={setPurgeBefore}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setPurgeOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handlePurge} disabled={purging}>
            Purge
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
