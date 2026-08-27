import Typography from '@mui/material/Typography';
import ScopedReportPage from './ScopedReportPage';
import MoneyText from '../../components/MoneyText';
import reportsApi from '../../api/reports';
import { formatHours } from '../../utils/hours';

const time = (value) => (value ? String(value).slice(11, 16) : '—');

const columns = [
  { field: 'employeeCode', headerName: 'Code', width: 120 },
  { field: 'employeeName', headerName: 'Employee', width: 170 },
  { field: 'departmentName', headerName: 'Department', width: 140 },
  { field: 'date', headerName: 'Date', width: 115 },
  { field: 'dayOfWeek', headerName: 'Day', width: 80 },
  { field: 'shiftCode', headerName: 'Shift', width: 120 },
  { field: 'firstIn', headerName: 'First in', width: 100, valueGetter: (value) => time(value) },
  { field: 'lastOut', headerName: 'Last out', width: 100, valueGetter: (value) => time(value) },
  { field: 'workingHours', headerName: 'Hours', width: 100, valueFormatter: formatHours },
  { field: 'overtimeHours', headerName: 'OT hours', width: 110, valueFormatter: formatHours },
  {
    field: 'perHour',
    headerName: 'Per hour',
    width: 120,
    renderCell: (params) => (params.value == null ? '—' : <MoneyText value={params.value} />),
  },
  {
    field: 'overtimeRateMultiplier',
    headerName: 'Multiplier',
    width: 110,
    renderCell: (params) => (params.value == null ? '—' : `x${params.value}`),
  },
  {
    field: 'overtimeAmount',
    headerName: 'OT amount',
    width: 140,
    renderCell: (params) =>
      params.value == null ? (
        <Typography variant="caption" color="text.secondary">
          Not priced
        </Typography>
      ) : (
        <MoneyText value={params.value} />
      ),
  },
];

export default function OvertimeRegisterReport() {
  return (
    <ScopedReportPage
      title="Overtime Register"
      subtitle="Day-by-day overtime, priced at the rate the period's payroll actually used. Days show as unpriced before payroll runs, and for day-wise employees, whose overtime is a monthly figure rather than a sum of daily shift overtime."
      period="month"
      fetchFn={reportsApi.overtimeRegister}
      exportFn={reportsApi.overtimeRegisterCsv}
      columns={columns}
      getRowId={(row) => `${row.userId}-${row.date}`}
      emptyDescription="No overtime recorded in this month — or attendance has not been generated for it yet."
    />
  );
}
