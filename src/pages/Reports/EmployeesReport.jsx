import ReportPage from './ReportPage';
import StatusChip from '../../components/StatusChip';
import reportsApi from '../../api/reports';
import { RECORD_STATUS_COLOR, ROLE_COLOR, labelize } from '../../constants/enums';
import { maskSensitive } from '../../utils/mask';

// Masked on-screen and in the exported CSV alike, same as the Employee
// Detail page - this report's fetchFn feeds both the table and the export.
const fetchMasked = () =>
  reportsApi.employees().then((rows) =>
    rows.map((r) => ({
      ...r,
      uanNo: maskSensitive(r.uanNo),
      esicIpNo: maskSensitive(r.esicIpNo),
      bankAccountNo: maskSensitive(r.bankAccountNo),
      bankIfscNo: maskSensitive(r.bankIfscNo),
    }))
  );

// Same field set (and order) as the bulk-import template (utils/employeeTemplate.js) /
// EmployeeCsvParser.java's CSV header, but with master IDs shown as names - readable
// for a report, unlike the import sheet which needs raw IDs. "Export CSV" (built into
// ReportPage) downloads exactly what's in this table.
const columns = [
  { field: 'userId', headerName: 'User ID', width: 100 },
  { field: 'employeeCode', headerName: 'Code', width: 110 },
  { field: 'employeeName', headerName: 'Name', width: 170 },
  { field: 'companyName', headerName: 'Company', width: 160 },
  { field: 'departmentName', headerName: 'Department', width: 150 },
  { field: 'designationName', headerName: 'Designation', width: 160 },
  { field: 'categoryName', headerName: 'Category', width: 130 },
  { field: 'supervisorUserId', headerName: 'Supervisor ID', width: 130 },
  { field: 'supervisorName', headerName: 'Supervisor', width: 160 },
  { field: 'joiningDate', headerName: 'Joining Date', width: 130 },
  { field: 'dateOfBirth', headerName: 'Date of Birth', width: 130 },
  { field: 'gender', headerName: 'Gender', width: 100, valueFormatter: (v) => labelize(v) },
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
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'phone', headerName: 'Phone', width: 130 },
  { field: 'uanNo', headerName: 'UAN No', width: 140 },
  { field: 'esicIpNo', headerName: 'ESIC IP No', width: 140 },
  { field: 'bankAccountNo', headerName: 'Bank Account No', width: 160 },
  { field: 'bankIfscNo', headerName: 'Bank IFSC No', width: 130 },
  { field: 'grossSalary', headerName: 'Gross Salary', width: 130 },
  { field: 'pfBasic', headerName: 'PF Basic', width: 120 },
  { field: 'medicalAllowance', headerName: 'Medical Allowance', width: 150 },
  { field: 'otherAllowance', headerName: 'Other Allowance', width: 140 },
  { field: 'overtimeEligible', headerName: 'Overtime Eligible', width: 140 },
  { field: 'basicDA', headerName: 'Basic + DA', width: 120 },
  { field: 'hra', headerName: 'HRA', width: 110 },
  { field: 'conveyanceAllowance', headerName: 'Conveyance', width: 130 },
  { field: 'educationAllowance', headerName: 'Education', width: 130 },
];

export default function EmployeesReport() {
  return (
    <ReportPage
      title="Employee Master"
      subtitle="Full employee directory, every field the bulk-import template accepts - export to CSV from here"
      filterType="none"
      fetchFn={fetchMasked}
      columns={columns}
    />
  );
}
