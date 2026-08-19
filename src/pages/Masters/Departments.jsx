import MasterCrudPage from '../../components/MasterCrudPage';
import departmentsApi from '../../api/departments';
import { useAuth } from '../../context/AuthContext';

const columns = [
  { field: 'departmentCode', headerName: 'Code', width: 130 },
  { field: 'departmentName', headerName: 'Department', flex: 1, minWidth: 220 },
  { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 260 },
];

const fields = [
  { name: 'departmentCode', label: 'Department Code', required: true, gridSize: 6 },
  { name: 'departmentName', label: 'Department Name', required: true, gridSize: 6 },
  { name: 'description', label: 'Description', gridSize: 12, multiline: true },
];

export default function Departments() {
  const { can } = useAuth();
  return (
    <MasterCrudPage
      title="Departments"
      subtitle="Organisational units employees belong to"
      api={departmentsApi}
      columns={columns}
      fields={fields}
      entityLabel="Department"
      readOnly={!can('DEPARTMENT_MANAGE')}
    />
  );
}
