import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import leavesApi from '../../api/leaves';
import { LEAVE_STATUS, LEAVE_STATUS_COLOR, labelize } from '../../constants/enums';

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
];

export default function AllLeaves() {
  const [status, setStatus] = useState('PENDING');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    leavesApi
      .byStatus(status)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <>
      <PageHeader
        title="All Leaves"
        subtitle="Filter by status — the API reads one status at a time"
        actions={
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
        }
      />
      <DataTable rows={rows} columns={columns} loading={loading} height={560} />
    </>
  );
}
