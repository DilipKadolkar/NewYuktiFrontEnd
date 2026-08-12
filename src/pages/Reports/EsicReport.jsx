import StatutoryReport from './StatutoryReport';
import reportsApi from '../../api/reports';

export default function EsicReport() {
  return (
    <StatutoryReport
      title="ESIC"
      subtitle="ESIC wage base and amount per employee"
      fetchFn={reportsApi.statutoryEsic}
    />
  );
}
