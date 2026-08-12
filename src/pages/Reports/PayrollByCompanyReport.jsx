import PayrollCostGroupReport from './PayrollCostGroupReport';
import reportsApi from '../../api/reports';

export default function PayrollByCompanyReport() {
  return (
    <PayrollCostGroupReport
      title="Payroll by Company"
      subtitle="Payroll cost grouped by company"
      fetchFn={reportsApi.payrollByCompany}
    />
  );
}
