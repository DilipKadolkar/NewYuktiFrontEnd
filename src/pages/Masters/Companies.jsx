import MasterCrudPage from '../../components/MasterCrudPage';
import StatusChip from '../../components/StatusChip';
import companiesApi from '../../api/companies';
import { RECORD_STATUS, RECORD_STATUS_COLOR } from '../../constants/enums';
import { useAuth } from '../../context/AuthContext';

const columns = [
  { field: 'companyCode', headerName: 'Code', width: 110 },
  { field: 'companyName', headerName: 'Company', flex: 1, minWidth: 200 },
  { field: 'address', headerName: 'Address', flex: 1, minWidth: 200 },
  { field: 'phone', headerName: 'Phone', width: 140 },
  { field: 'email', headerName: 'Email', width: 200 },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => <StatusChip value={params.value} colorMap={RECORD_STATUS_COLOR} />,
  },
];

const fields = [
  { name: 'companyCode', label: 'Company Code', required: true, gridSize: 6 },
  { name: 'companyName', label: 'Company Name', required: true, gridSize: 6 },
  { name: 'address', label: 'Address', gridSize: 12, multiline: true },
  { name: 'phone', label: 'Phone', gridSize: 6 },
  { name: 'email', label: 'Email', type: 'email', gridSize: 6 },
  { name: 'status', label: 'Status', type: 'select', options: RECORD_STATUS, required: true, gridSize: 6 },
];

export default function Companies() {
  // COMPANY_CREATE/UPDATE/DELETE are platform-only (see PermissionSeeder) -
  // a company ADMIN/HR only holds COMPANY_READ, so this page is read-only for
  // them and full CRUD only for a platform principal (reused at /platform/companies).
  const { isPlatform } = useAuth();
  return (
    <MasterCrudPage
      title="Companies"
      subtitle={
        isPlatform
          ? 'Legal entities employees are attached to'
          : 'Legal entities employees are attached to - managed by the platform operator'
      }
      api={companiesApi}
      columns={columns}
      fields={fields}
      entityLabel="Company"
      readOnly={!isPlatform}
    />
  );
}
