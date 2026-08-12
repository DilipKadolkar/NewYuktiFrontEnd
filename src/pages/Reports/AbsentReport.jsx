import ExceptionReport from './ExceptionReport';
import reportsApi from '../../api/reports';

export default function AbsentReport() {
  return (
    <ExceptionReport
      title="Absent"
      subtitle="Days an employee was expected to work, had no leave, and did not attend"
      fetchFn={reportsApi.absent}
    />
  );
}
