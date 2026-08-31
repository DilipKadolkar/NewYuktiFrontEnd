import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import ScopedReportPage from './ScopedReportPage';
import MoneyText from '../../components/MoneyText';
import reportsApi from '../../api/reports';

const columns = [
  { field: 'employeeCode', headerName: 'Code', width: 130 },
  { field: 'employeeName', headerName: 'Employee', width: 190 },
  { field: 'departmentName', headerName: 'Department', width: 160 },
  { field: 'designationName', headerName: 'Designation', width: 160 },
  { field: 'joiningDate', headerName: 'Joined', width: 120 },
  { field: 'asOf', headerName: 'As at', width: 120 },
  { field: 'yearsOfService', headerName: 'Service (yrs)', width: 125 },
  { field: 'completedYears', headerName: 'Completed yrs', width: 135 },
  {
    field: 'eligible',
    headerName: 'Eligible',
    width: 130,
    renderCell: (params) =>
      params.value ? (
        <Chip size="small" color="success" label="Eligible" />
      ) : (
        <Chip size="small" variant="outlined" label="Under 5 yrs" />
      ),
  },
  {
    field: 'lastDrawnBasicDA',
    headerName: 'Last drawn Basic + DA',
    width: 190,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'accruedAmount',
    headerName: 'Accrued liability',
    width: 165,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
];

export default function GratuityAccrualReport() {
  return (
    <ScopedReportPage
      title="Gratuity Accrual"
      subtitle="Liability accrued per employee as at a date. Employees under five years are listed with a zero accrual so the schedule shows who is approaching eligibility."
      period="asOf"
      fetchFn={reportsApi.statutoryGratuity}
      columns={columns}
      getRowId={(row) => row.userId}
      emptyDescription="No employee has a joining date on record."
      note={
        <Alert severity="info">
          Nothing in this system defines a gratuity policy, so this uses the Payment of Gratuity Act
          default — last drawn Basic + DA × 15 ÷ 26 × completed years, payable from five years of
          continuous service. Move those constants into the salary rules if your policy differs.
        </Alert>
      }
    />
  );
}
