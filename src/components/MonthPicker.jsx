import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// value/onChange work with dayjs objects. Callers derive the string/int
// shape they need (yyyy-MM for attendance/roster, separate month+year ints
// for payroll/reports) from the dayjs value.
export default function MonthPicker({ label = 'Month', value, onChange, size = 'small', ...rest }) {
  return (
    <DatePicker
      label={label}
      views={['year', 'month']}
      value={value}
      onChange={onChange}
      slotProps={{ textField: { size } }}
      {...rest}
    />
  );
}
