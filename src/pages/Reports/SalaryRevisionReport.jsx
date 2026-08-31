import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import ScopedReportPage from './ScopedReportPage';
import MoneyText from '../../components/MoneyText';
import reportsApi from '../../api/reports';

const money = (params) => <MoneyText value={params.value} />;

const columns = [
  { field: 'employeeCode', headerName: 'Code', width: 120 },
  { field: 'employeeName', headerName: 'Employee', width: 170 },
  { field: 'departmentName', headerName: 'Department', width: 140 },
  { field: 'effectiveDate', headerName: 'Effective', width: 115 },
  { field: 'previousGrossSalary', headerName: 'Previous gross', width: 150, renderCell: money },
  { field: 'newGrossSalary', headerName: 'New gross', width: 140, renderCell: money },
  { field: 'difference', headerName: 'Difference', width: 135, renderCell: money },
  {
    field: 'hikePercent',
    headerName: 'Hike %',
    width: 100,
    renderCell: (params) => (params.value === null || params.value === undefined ? '—' : `${params.value}%`),
  },
  { field: 'reason', headerName: 'Reason', width: 160 },
  {
    field: 'periodsPaidAtOldRate',
    headerName: 'Periods paid at old rate',
    width: 220,
    valueGetter: (value) => (value || []).join(', '),
    renderCell: (params) => {
      const periods = params.row.periodsPaidAtOldRate || [];
      if (periods.length === 0) return <Chip size="small" label="Up to date" variant="outlined" />;
      return (
        <Tooltip title={periods.join(', ')}>
          <Chip size="small" color="warning" label={`${periods.length} to regenerate`} />
        </Tooltip>
      );
    },
  },
  { field: 'estimatedArrears', headerName: 'Estimated arrears', width: 160, renderCell: money },
  { field: 'revisedBy', headerName: 'Revised by', width: 130 },
  { field: 'remarks', headerName: 'Remarks', width: 220 },
];

export default function SalaryRevisionReport() {
  return (
    <ScopedReportPage
      title="Salary Revisions & Arrears"
      subtitle="Revisions taking effect in the window, and the periods a retrospective one left underpaid. Regenerating those periods is what actually settles the difference — the arrears figure is the exposure, not a second payroll calculation."
      period="dateRange"
      fetchFn={reportsApi.salaryRevisions}
      columns={columns}
      getRowId={(row) => row.id}
      emptyDescription="No salary revision took effect in this window."
    />
  );
}
