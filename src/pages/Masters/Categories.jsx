import MasterCrudPage from '../../components/MasterCrudPage';
import categoriesApi from '../../api/categories';

const columns = [
  { field: 'categoryCode', headerName: 'Code', width: 130 },
  { field: 'categoryName', headerName: 'Category', flex: 1, minWidth: 220 },
  { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 260 },
];

const fields = [
  { name: 'categoryCode', label: 'Category Code', required: true, gridSize: 6 },
  { name: 'categoryName', label: 'Category Name', required: true, gridSize: 6 },
  { name: 'description', label: 'Description', gridSize: 12, multiline: true },
];

export default function Categories() {
  return (
    <MasterCrudPage
      title="Categories"
      subtitle="Employee grades — Worker, Supervisor, Manager, Director, and any others the company needs"
      api={categoriesApi}
      columns={columns}
      fields={fields}
      entityLabel="Category"
    />
  );
}
