import MasterCrudPage from '../../components/MasterCrudPage';
import designationsApi from '../../api/designations';

const columns = [
  { field: 'designationCode', headerName: 'Code', width: 130 },
  { field: 'designationName', headerName: 'Designation', flex: 1, minWidth: 220 },
  { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 260 },
];

const fields = [
  { name: 'designationCode', label: 'Designation Code', required: true, gridSize: 6 },
  { name: 'designationName', label: 'Designation Name', required: true, gridSize: 6 },
  { name: 'description', label: 'Description', gridSize: 12, multiline: true },
];

export default function Designations() {
  return (
    <MasterCrudPage
      title="Designations"
      subtitle="Job titles employees hold"
      api={designationsApi}
      columns={columns}
      fields={fields}
      entityLabel="Designation"
    />
  );
}
