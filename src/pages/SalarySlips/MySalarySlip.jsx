import SalarySlip from './SalarySlip';
import { useActingAs } from '../../context/ActingAsContext';

export default function MySalarySlip() {
  const { actingAs } = useActingAs();
  if (!actingAs) return null;
  return <SalarySlip fixedEmployeeId={actingAs.userId} />;
}
