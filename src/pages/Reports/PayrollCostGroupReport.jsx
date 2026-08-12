import ReportPage from './ReportPage';
import MoneyText from '../../components/MoneyText';

const columns = [
  { field: 'groupName', headerName: 'Group', flex: 1, minWidth: 180 },
  { field: 'employeeCount', headerName: 'Employees', width: 110 },
  {
    field: 'totalEarnings',
    headerName: 'Earnings',
    width: 150,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'totalDeductions',
    headerName: 'Deductions',
    width: 150,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'netSalary',
    headerName: 'Net salary',
    width: 160,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
];

export default function PayrollCostGroupReport({ title, subtitle, fetchFn }) {
  return (
    <ReportPage
      title={title}
      subtitle={subtitle}
      filterType="payrollMonthYear"
      fetchFn={fetchFn}
      columns={columns}
      getRowId={(r) => r.groupName}
    />
  );
}
