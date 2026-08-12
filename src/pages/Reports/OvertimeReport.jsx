import ExceptionReport from './ExceptionReport';
import reportsApi from '../../api/reports';

export default function OvertimeReport() {
  return (
    <ExceptionReport
      title="Overtime"
      subtitle="Days with measured overtime hours, whether paid or not"
      fetchFn={reportsApi.overtime}
    />
  );
}
