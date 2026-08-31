import Alert from '@mui/material/Alert';
import ScopedReportPage from './ScopedReportPage';
import MoneyText from '../../components/MoneyText';
import reportsApi from '../../api/reports';
import { maskSensitive } from '../../utils/mask';

const money = (params) => <MoneyText value={params.value} />;

const columns = [
  {
    field: 'uanNo',
    headerName: 'UAN',
    width: 170,
    renderCell: (params) => maskSensitive(params.value) || '—',
  },
  { field: 'employeeCode', headerName: 'Code', width: 120 },
  { field: 'employeeName', headerName: 'Member name', width: 190 },
  { field: 'grossWages', headerName: 'Gross wages', width: 140, renderCell: money },
  { field: 'epfWages', headerName: 'EPF wages', width: 135, renderCell: money },
  { field: 'epsWages', headerName: 'EPS wages', width: 135, renderCell: money },
  { field: 'edliWages', headerName: 'EDLI wages', width: 135, renderCell: money },
  { field: 'employeeContribution', headerName: 'EPF (employee)', width: 155, renderCell: money },
  { field: 'epsContribution', headerName: 'EPS remitted', width: 145, renderCell: money },
  { field: 'employerEpfContribution', headerName: 'EPF–EPS difference', width: 175, renderCell: money },
  { field: 'ncpDays', headerName: 'NCP days', width: 110 },
  { field: 'refundOfAdvances', headerName: 'Refund of advances', width: 175, renderCell: money },
];

export default function PfEcrReport() {
  return (
    <ScopedReportPage
      title="PF ECR"
      subtitle="Member-wise contribution lines for the period, in the EPFO ECR column order. Only members with a PF deduction appear — a zero-contribution line is not something the ECR accepts."
      period="monthYear"
      fetchFn={reportsApi.statutoryPfEcr}
      columns={columns}
      getRowId={(row) => row.userId}
      emptyDescription="No PF was deducted in this period, or payroll has not been generated for it yet."
      note={
        <Alert severity="info">
          The employee contribution and EPF wages are exactly what payroll deducted. The EPS split
          uses the statutory 8.33% on wages capped at ₹15,000 — this system's salary rules configure
          only the employee's own PF percentage, so the pension split is not company-configurable yet.
        </Alert>
      }
    />
  );
}
