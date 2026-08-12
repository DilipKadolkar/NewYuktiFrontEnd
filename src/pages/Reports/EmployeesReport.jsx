import ReportPage from './ReportPage';
import StatusChip from '../../components/StatusChip';
import reportsApi from '../../api/reports';
import { RECORD_STATUS_COLOR, ROLE_COLOR, labelize } from '../../constants/enums';

const columns = [
  { field: 'userId', headerName: 'User ID', width: 100 },
  { field: 'employeeCode', headerName: 'Code', width: 110 },
  { field: 'employeeName', headerName: 'Name', width: 170 },
  { field: 'companyName', headerName: 'Company', width: 160 },
  { field: 'departmentName', headerName: 'Department', width: 150 },
  { field: 'designationName', headerName: 'Designation', width: 160 },
  { field: 'status', headerName: 'Employment', width: 120, valueFormatter: (v) => labelize(v) },
  {
    field: 'role',
    headerName: 'Role',
    width: 110,
    renderCell: (params) => <StatusChip value={params.value} colorMap={ROLE_COLOR} />,
  },
  {
    field: 'recordStatus',
    headerName: 'Status',
    width: 100,
    renderCell: (params) => <StatusChip value={params.value} colorMap={RECORD_STATUS_COLOR} />,
  },
];

export default function EmployeesReport() {
  return (
    <ReportPage
      title="Employee Master"
      subtitle="Full employee directory"
      filterType="none"
      fetchFn={reportsApi.employees}
      columns={columns}
    />
  );
}
