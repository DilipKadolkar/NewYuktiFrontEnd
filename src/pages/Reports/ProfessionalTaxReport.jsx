import StatutoryReport from './StatutoryReport';
import reportsApi from '../../api/reports';

export default function ProfessionalTaxReport() {
  return (
    <StatutoryReport
      title="Professional Tax"
      subtitle="PT slab base and amount per employee"
      fetchFn={reportsApi.statutoryProfessionalTax}
    />
  );
}
