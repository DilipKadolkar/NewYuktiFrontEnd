import PayrollCostGroupReport from './PayrollCostGroupReport';
import reportsApi from '../../api/reports';

export default function PayrollByDepartmentReport() {
  return (
    <PayrollCostGroupReport
      title="Payroll by Department"
      subtitle="Payroll cost grouped by department"
      fetchFn={reportsApi.payrollByDepartment}
    />
  );
}
