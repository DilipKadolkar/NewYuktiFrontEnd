import ScopedReportPage from './ScopedReportPage';
import StatusChip from '../../components/StatusChip';
import reportsApi from '../../api/reports';
import { LEAVE_STATUS_COLOR, labelize } from '../../constants/enums';

const columns = [
  { field: 'employeeCode', headerName: 'Code', width: 120 },
  { field: 'employeeName', headerName: 'Employee', width: 170 },
  { field: 'departmentName', headerName: 'Department', width: 140 },
  {
    field: 'leaveType',
    headerName: 'Type',
    width: 160,
    valueGetter: (value) => labelize(value),
  },
  {
    field: 'paid',
    headerName: 'Paid',
    width: 90,
    valueGetter: (value) => (value ? 'Yes' : 'No'),
  },
  { field: 'fromDate', headerName: 'From', width: 115 },
  { field: 'toDate', headerName: 'To', width: 115 },
  { field: 'duration', headerName: 'Duration', width: 125, valueGetter: (value) => labelize(value) },
  { field: 'totalDays', headerName: 'Days', width: 80 },
  {
    field: 'status',
    headerName: 'Status',
    width: 140,
    renderCell: (params) => <StatusChip value={params.value} colorMap={LEAVE_STATUS_COLOR} />,
  },
  { field: 'origin', headerName: 'Origin', width: 110, valueGetter: (value) => labelize(value) },
  { field: 'reason', headerName: 'Reason', width: 200 },
  { field: 'approverId', headerName: 'Approver', width: 120 },
  { field: 'approvalComments', headerName: 'Comments', width: 200 },
];

export default function LeaveTransactionReport() {
  return (
    <ScopedReportPage
      title="Leave Transactions"
      subtitle="Every leave request overlapping the window, whatever became of it — rejected and cancelled included, so the movements reconcile against the balances they explain"
      period="dateRange"
      fetchFn={reportsApi.leaveTransactions}
      exportFn={reportsApi.leaveTransactionsCsv}
      columns={columns}
      getRowId={(row) => row.id}
      emptyDescription="No leave request overlaps this window."
    />
  );
}
