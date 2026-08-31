import ReportPage from './ReportPage';
import reportsApi from '../../api/reports';
import { formatHours } from '../../utils/hours';

const columns = [
  { field: 'userId', headerName: 'User ID', width: 100 },
  { field: 'employeeName', headerName: 'Employee', width: 170 },
  { field: 'departmentName', headerName: 'Department', width: 150 },
  { field: 'workingDays', headerName: 'Working days', width: 110 },
  { field: 'presentDays', headerName: 'Present', width: 90 },
  { field: 'absentDays', headerName: 'Absent', width: 90 },
  { field: 'leaveDays', headerName: 'Leave', width: 90 },
  { field: 'lopDays', headerName: 'LOP', width: 80 },
  { field: 'lateCount', headerName: 'Late', width: 80 },
  { field: 'earlyExitCount', headerName: 'Early exits', width: 100 },
  { field: 'invalidPunches', headerName: 'Invalid punches', width: 130 },
  { field: 'totalHours', headerName: 'Total hrs', width: 100, valueFormatter: formatHours },
  { field: 'overtimeHours', headerName: 'OT hrs', width: 90, valueFormatter: formatHours },
];

export default function AttendanceMonthlyReport() {
  return (
    <ReportPage
      title="Monthly Attendance"
      subtitle="Attendance totals for every employee in the month"
      filterType="attendanceMonth"
      fetchFn={reportsApi.attendanceMonthly}
      columns={columns}
      getRowId={(r) => r.userId}
    />
  );
}
