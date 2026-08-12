import StatutoryReport from './StatutoryReport';
import reportsApi from '../../api/reports';

export default function PfReport() {
  return (
    <StatutoryReport
      title="Provident Fund"
      subtitle="PF base and deducted amount per employee"
      fetchFn={reportsApi.statutoryPf}
    />
  );
}
