import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import ScopedReportPage from './ScopedReportPage';
import MoneyText, { formatMoney } from '../../components/MoneyText';
import reportsApi from '../../api/reports';

const money = (params) => <MoneyText value={params.value} />;

const columns = [
  { field: 'employeeCode', headerName: 'Code', width: 130 },
  { field: 'employeeName', headerName: 'Deductee', width: 200 },
  { field: 'departmentName', headerName: 'Department', width: 160 },
  { field: 'financialYear', headerName: 'Financial year', width: 140 },
  { field: 'quarterLabel', headerName: 'Quarter', width: 140 },
  { field: 'grossEarnings', headerName: 'Gross earnings', width: 160, renderCell: money },
  { field: 'tdsDeducted', headerName: 'TDS deducted', width: 150, renderCell: money },
  {
    field: 'monthly',
    headerName: 'Month-wise',
    width: 320,
    valueGetter: (value) =>
      (value || []).map((month) => `${month.period}: ${month.tds}`).join(' | '),
    renderCell: (params) => {
      const months = params.row.monthly || [];
      if (months.length === 0) return '—';
      return (
        <Tooltip
          title={months
            .map((month) => `${month.period} — earnings ${formatMoney(month.earnings)}, TDS ${formatMoney(month.tds)}`)
            .join('\n')}
        >
          <span>{months.map((month) => `${month.period.split(' ')[0]} ${month.tds}`).join(' · ')}</span>
        </Tooltip>
      );
    },
  },
];

export default function Tds24qReport() {
  return (
    <ScopedReportPage
      title="TDS / Form 24Q"
      subtitle="Quarterly TDS position per employee, with the month-wise split each quarter is made of. Quarters run April–March."
      period="quarter"
      fetchFn={reportsApi.statutoryTds24q}
      columns={columns}
      getRowId={(row) => row.userId}
      emptyDescription="No payroll was generated in this quarter."
      note={
        <Alert severity="warning">
          Form 24Q also needs each deductee's PAN, which this system does not hold anywhere — the
          employee master carries UAN, ESIC IP and bank details, but no PAN. The figures below are
          complete; the PAN column has to come from elsewhere until the master carries one.
        </Alert>
      }
    />
  );
}
