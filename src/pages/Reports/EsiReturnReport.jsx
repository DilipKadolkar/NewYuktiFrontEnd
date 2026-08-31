import Alert from '@mui/material/Alert';
import ScopedReportPage from './ScopedReportPage';
import MoneyText from '../../components/MoneyText';
import reportsApi from '../../api/reports';
import { maskSensitive } from '../../utils/mask';

const money = (params) => <MoneyText value={params.value} />;

const columns = [
  {
    field: 'esicIpNo',
    headerName: 'IP number',
    width: 170,
    renderCell: (params) => maskSensitive(params.value) || '—',
  },
  { field: 'employeeCode', headerName: 'Code', width: 120 },
  { field: 'employeeName', headerName: 'Insured person', width: 190 },
  { field: 'daysWorked', headerName: 'Days worked', width: 130 },
  { field: 'totalMonthlyWages', headerName: 'Total monthly wages', width: 180, renderCell: money },
  { field: 'employeeContribution', headerName: 'Employee share', width: 155, renderCell: money },
  { field: 'employerContribution', headerName: 'Employer share', width: 155, renderCell: money },
  { field: 'totalContribution', headerName: 'Total contribution', width: 165, renderCell: money },
];

export default function EsiReturnReport() {
  return (
    <ScopedReportPage
      title="ESI Return"
      subtitle="Insured-person contribution lines for the period — the employees actually inside the wage ceiling, which is exactly those payroll deducted ESIC from"
      period="monthYear"
      fetchFn={reportsApi.statutoryEsiReturn}
      columns={columns}
      getRowId={(row) => row.userId}
      emptyDescription="No ESIC was deducted in this period, or payroll has not been generated for it yet."
      note={
        <Alert severity="info">
          The employee share is what payroll deducted. The employer share applies the statutory 3.25%
          to the same wage base the employee share was taken on, so both sides of the return always
          agree on the wage — but it is a fixed rate here rather than a company setting.
        </Alert>
      }
    />
  );
}
