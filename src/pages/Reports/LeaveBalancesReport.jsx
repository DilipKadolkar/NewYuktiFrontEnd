import ReportPage from './ReportPage';
import reportsApi from '../../api/reports';
import { labelize } from '../../constants/enums';

const columns = [
  { field: 'userId', headerName: 'User ID', width: 100 },
  { field: 'employeeName', headerName: 'Employee', width: 180 },
  { field: 'leaveType', headerName: 'Leave type', width: 150, valueFormatter: (v) => labelize(v) },
  { field: 'quota', headerName: 'Quota', width: 90 },
  { field: 'used', headerName: 'Used', width: 90 },
  { field: 'available', headerName: 'Available', width: 100 },
];

const fetchFlattened = (year) =>
  reportsApi.leaveBalances(year).then((rows) =>
    rows.flatMap((row) =>
      Object.keys(row.quota || {}).map((leaveType) => ({
        userId: row.userId,
        employeeName: row.employeeName,
        leaveType,
        quota: row.quota[leaveType],
        used: row.used[leaveType],
        available: row.available[leaveType],
      }))
    )
  );

export default function LeaveBalancesReport() {
  return (
    <ReportPage
      title="Leave Balances"
      subtitle="Quota, used and available leave per employee per type"
      filterType="year"
      fetchFn={fetchFlattened}
      columns={columns}
      getRowId={(r) => `${r.userId}-${r.leaveType}`}
    />
  );
}
