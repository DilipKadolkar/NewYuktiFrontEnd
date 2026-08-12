import ReportPage from './ReportPage';
import MoneyText from '../../components/MoneyText';

const columns = [
  { field: 'userId', headerName: 'User ID', width: 100 },
  { field: 'employeeName', headerName: 'Employee', width: 200 },
  {
    field: 'base',
    headerName: 'Base',
    width: 150,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 150,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
];

export default function StatutoryReport({ title, subtitle, fetchFn }) {
  return (
    <ReportPage
      title={title}
      subtitle={subtitle}
      filterType="payrollMonthYear"
      fetchFn={fetchFn}
      columns={columns}
      getRowId={(r) => r.userId}
    />
  );
}
