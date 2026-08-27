import ScopedReportPage from './ScopedReportPage';
import MoneyText from '../../components/MoneyText';
import reportsApi from '../../api/reports';

const money = (params) => <MoneyText value={params.value} />;

const columns = [
  { field: 'employeeCode', headerName: 'Code', width: 130 },
  { field: 'employeeName', headerName: 'Employee', width: 200 },
  { field: 'departmentName', headerName: 'Department', width: 170 },
  { field: 'grossSalary', headerName: 'Gross salary (slab base)', width: 200, renderCell: money },
  { field: 'earnedGross', headerName: 'Earned gross', width: 155, renderCell: money },
  { field: 'professionalTax', headerName: 'Professional tax', width: 165, renderCell: money },
];

export default function ProfessionalTaxRegisterReport() {
  return (
    <ScopedReportPage
      title="Professional Tax Register"
      subtitle="Who was taxed this period, on what, and how much. The slab is applied to the full gross salary, not the attendance-prorated earned gross — the earned figure is shown alongside for context."
      period="monthYear"
      fetchFn={reportsApi.statutoryPtRegister}
      columns={columns}
      getRowId={(row) => row.userId}
      emptyDescription="No professional tax was deducted in this period, or payroll has not been generated for it yet."
    />
  );
}
