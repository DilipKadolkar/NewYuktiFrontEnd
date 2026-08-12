import ReportPage from './ReportPage';
import MoneyText from '../../components/MoneyText';
import reportsApi from '../../api/reports';

const columns = [
  { field: 'userId', headerName: 'User ID', width: 100 },
  { field: 'employeeName', headerName: 'Employee', width: 170 },
  { field: 'departmentName', headerName: 'Department', width: 150 },
  { field: 'payableDays', headerName: 'Payable days', width: 110 },
  { field: 'lopDays', headerName: 'LOP days', width: 90 },
  {
    field: 'totalEarnings',
    headerName: 'Earnings',
    width: 130,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'pfDeduction',
    headerName: 'PF',
    width: 110,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'esic',
    headerName: 'ESIC',
    width: 110,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'professionalTax',
    headerName: 'PT',
    width: 100,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'mlwf',
    headerName: 'MLWF',
    width: 100,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'totalDeductions',
    headerName: 'Deductions',
    width: 130,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'netSalary',
    headerName: 'Net salary',
    width: 140,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
];

export default function PayrollReport() {
  return (
    <ReportPage
      title="Payroll"
      subtitle="Payroll figures for every employee in the period"
      filterType="payrollMonthYear"
      fetchFn={reportsApi.payroll}
      columns={columns}
      getRowId={(r) => r.userId}
    />
  );
}
