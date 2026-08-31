import ScopedReportPage from './ScopedReportPage';
import MoneyText from '../../components/MoneyText';
import reportsApi from '../../api/reports';

const money = (params) => <MoneyText value={params.value} />;

const columns = [
  { field: 'employeeCode', headerName: 'Code', width: 120 },
  { field: 'employeeName', headerName: 'Employee', width: 180 },
  { field: 'departmentName', headerName: 'Department', width: 150 },
  { field: 'designationName', headerName: 'Designation', width: 150 },
  { field: 'period', headerName: 'Period', width: 130 },
  { field: 'revision', headerName: 'Rev', width: 70 },
  { field: 'payableDays', headerName: 'Payable days', width: 115 },
  { field: 'lopDays', headerName: 'LOP days', width: 100 },
  { field: 'totalEarnings', headerName: 'Earnings', width: 135, renderCell: money },
  { field: 'totalDeductions', headerName: 'Deductions', width: 135, renderCell: money },
  { field: 'netSalary', headerName: 'Net salary', width: 140, renderCell: money },
  { field: 'netSalaryInWords', headerName: 'Net in words', width: 340 },
];

export default function PayslipRegisterReport() {
  return (
    <ScopedReportPage
      title="Payslip Register"
      subtitle="Every employee's payslip totals for the period, in bulk — the same figures each individual slip prints"
      period="monthYear"
      fetchFn={reportsApi.payslipRegister}
      columns={columns}
      getRowId={(row) => row.userId}
      emptyDescription="Payroll has not been generated for this period yet, or no employee matches the filter."
    />
  );
}
