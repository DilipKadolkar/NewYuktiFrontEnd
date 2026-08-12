import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import leavesApi from '../../api/leaves';
import { LEAVE_STATUS_COLOR, labelize } from '../../constants/enums';
import { useActingAs } from '../../context/ActingAsContext';

export default function MyLeaves() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!actingAs) return;
    setLoading(true);
    leavesApi
      .forEmployee(actingAs.userId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [actingAs]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = () => {
    setBusy(true);
    leavesApi
      .cancel(cancelTarget.id, { approverId: actingAs.userId, comments })
      .then(() => {
        enqueueSnackbar('Leave cancelled', { variant: 'success' });
        setCancelTarget(null);
        setComments('');
        load();
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const columns = [
    { field: 'leaveType', headerName: 'Type', width: 140, valueFormatter: (v) => labelize(v) },
    {
      field: 'fromDate',
      headerName: 'From',
      width: 120,
      valueFormatter: (v) => (v ? dayjs(v).format('DD MMM YYYY') : ''),
    },
    {
      field: 'toDate',
      headerName: 'To',
      width: 120,
      valueFormatter: (v) => (v ? dayjs(v).format('DD MMM YYYY') : ''),
    },
    { field: 'duration', headerName: 'Duration', width: 110, valueFormatter: (v) => labelize(v) },
    { field: 'totalDays', headerName: 'Days', width: 80 },
    { field: 'reason', headerName: 'Reason', flex: 1, minWidth: 180 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => <StatusChip value={params.value} colorMap={LEAVE_STATUS_COLOR} />,
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 70,
      renderCell: (params) =>
        ['PENDING', 'SUPERVISOR_APPROVED', 'APPROVED'].includes(params.row.status) ? (
          <Tooltip title="Cancel">
            <IconButton size="small" onClick={() => setCancelTarget(params.row)}>
              <CancelRoundedIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader title="My Leaves" subtitle={actingAs ? `${actingAs.employeeName}'s leave history` : ''} />
      <DataTable rows={rows} columns={columns} loading={loading} height={520} />

      <Dialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel leave?</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setCancelTarget(null)}>
            Back
          </Button>
          <Button color="error" variant="contained" onClick={handleCancel} disabled={busy}>
            Cancel leave
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
