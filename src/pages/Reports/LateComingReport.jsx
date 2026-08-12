import ExceptionReport from './ExceptionReport';
import reportsApi from '../../api/reports';

export default function LateComingReport() {
  return (
    <ExceptionReport
      title="Late Coming"
      subtitle="Days an employee arrived past the shift's grace window"
      fetchFn={reportsApi.lateComing}
    />
  );
}
