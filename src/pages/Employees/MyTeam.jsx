import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import employeesApi from '../../api/employees';
import { RECORD_STATUS_COLOR, labelize } from '../../constants/enums';
import { useActingAs } from '../../context/ActingAsContext';

const columns = (navigate) => [
  { field: 'employeeCode', headerName: 'Code', width: 110 },
  { field: 'employeeName', headerName: 'Name', flex: 1, minWidth: 180 },
  { field: 'userId', headerName: 'User ID', width: 110 },
  { field: 'departmentName', headerName: 'Department', width: 160 },
  { field: 'designationName', headerName: 'Designation', width: 170 },
  { field: 'categoryName', headerName: 'Category', width: 130 },
  { field: 'status', headerName: 'Employment', width: 130, valueFormatter: (v) => labelize(v) },
  {
    field: 'recordStatus',
    headerName: 'Status',
    width: 110,
    renderCell: (params) => <StatusChip value={params.value} colorMap={RECORD_STATUS_COLOR} />,
  },
];

export default function MyTeam() {
  const { actingAs } = useActingAs();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actingAs) return;
    setLoading(true);
    employeesApi
      .team(actingAs.userId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [actingAs]);

  if (!actingAs) return null;

  return (
    <>
      <PageHeader
        title="My Team"
        subtitle={`Employees reporting to ${actingAs.employeeName} (${actingAs.userId})`}
      />
      {rows.length === 0 && !loading ? (
        <Alert severity="info">No one reports to you.</Alert>
      ) : (
        <DataTable
          rows={rows}
          columns={columns(navigate)}
          loading={loading}
          onRowClick={(params) => navigate(`/employees/${params.row.id}`)}
        />
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Click a row to open the employee's full profile.
      </Typography>
    </>
  );
}
