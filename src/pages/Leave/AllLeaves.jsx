import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import AddLeaveDialog from '../../components/AddLeaveDialog';
import leavesApi from '../../api/leaves';
import { LEAVE_STATUS, LEAVE_STATUS_COLOR, labelize } from '../../constants/enums';
import { useAuth } from '../../context/AuthContext';

const columns = [
  { field: 'userId', headerName: 'User ID', width: 100 },
  { field: 'employeeName', headerName: 'Employee', width: 160 },
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
  { field: 'totalDays', headerName: 'Days', width: 80 },
  { field: 'reason', headerName: 'Reason', flex: 1, minWidth: 160 },
  { field: 'supervisorId', headerName: 'Supervisor', width: 110 },
  { field: 'approverId', headerName: 'Approver', width: 110 },
  {
    field: 'status',
    headerName: 'Status',
    width: 160,
    renderCell: (params) => <StatusChip value={params.value} colorMap={LEAVE_STATUS_COLOR} />,
  },
  {
    field: 'origin',
    headerName: 'Origin',
    width: 120,
    valueFormatter: (v) => (v === 'HR_DIRECT' ? 'HR entered' : 'Self-service'),
  },
];

export default function AllLeaves() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('LEAVE_APPROVE');
  const [status, setStatus] = useState('PENDING');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const reload = () => {
    setLoading(true);
    leavesApi
      .byStatus(status)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(reload, [status]);

  const handleCreated = () => {
    // A direct entry is created APPROVED - switch the filter so it's visible immediately
    // instead of landing silently in a status the current filter excludes.
    if (status === 'APPROVED') {
      reload();
    } else {
      setStatus('APPROVED');
    }
  };

  return (
    <>
      <PageHeader
        title="All Leaves"
        subtitle="Filter by status — the API reads one status at a time"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {LEAVE_STATUS.map((s) => (
                <MenuItem key={s} value={s}>
                  {labelize(s)}
                </MenuItem>
              ))}
            </TextField>
            {canManage && (
              <Button
                variant="outlined"
                startIcon={<UploadFileRoundedIcon />}
                onClick={() => navigate('/leave/bulk-import')}
              >
                Bulk Import
              </Button>
            )}
            {canManage && (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>
                Add Leave
              </Button>
            )}
          </Stack>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        height={560}
        emptyState={{
          title: 'No leave requests',
          description: `No requests with status "${labelize(status)}" right now.`,
        }}
      />
      <AddLeaveDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={handleCreated} />
    </>
  );
}
