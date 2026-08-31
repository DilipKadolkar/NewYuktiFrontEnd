import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import MoneyText from '../../components/MoneyText';
import payrollApi from '../../api/payroll';
import { PAYROLL_STATUS_COLOR } from '../../constants/enums';

const columns = [
  { field: 'employeeId', headerName: 'User ID', width: 100 },
  { field: 'employeeName', headerName: 'Employee', width: 170 },
  { field: 'departmentName', headerName: 'Department', width: 150 },
  { field: 'revision', headerName: 'Rev', width: 70 },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => <StatusChip value={params.value} colorMap={PAYROLL_STATUS_COLOR} />,
  },
  { field: 'payableDays', headerName: 'Payable days', width: 110 },
  {
    field: 'totalEarnings',
    headerName: 'Earnings',
    width: 130,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'totalDeduction',
    headerName: 'Deductions',
    width: 130,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  {
    field: 'netSalary',
    headerName: 'Net salary',
    width: 140,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
];

export default function List() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!month || !year) return;
    setLoading(true);
    payrollApi
      .list(Number(month), Number(year))
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [month, year]);

  return (
    <>
      <PageHeader
        title="Payroll"
        subtitle="All payroll records for a period"
        actions={
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <TextField
                size="small"
                label="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/[^0-9]/g, ''))}
                sx={{ width: 90 }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                size="small"
                label="Year"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ''))}
                sx={{ width: 100 }}
              />
            </Grid>
          </Grid>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        height={600}
        emptyState={{
          title: 'No payroll for this period',
          description: 'No payroll has been generated for this month and year yet.',
        }}
      />
    </>
  );
}
