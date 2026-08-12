import ExceptionReport from './ExceptionReport';
import reportsApi from '../../api/reports';

export default function LopReport() {
  return (
    <ExceptionReport
      title="Loss of Pay"
      subtitle="Days that landed in LOP — expected to work, no approved leave, not attended"
      fetchFn={reportsApi.lop}
    />
  );
}
