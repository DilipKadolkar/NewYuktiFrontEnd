import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useActingAs } from '../context/ActingAsContext';

export default function EmployeePicker({
  label = 'Employee',
  value,
  onChange,
  filterRole,
  size = 'small',
  required = false,
  disabled = false,
  helperText,
}) {
  const { employees } = useActingAs();
  const options = filterRole ? employees.filter((e) => e.role === filterRole) : employees;
  const selected = options.find((e) => e.userId === value) || null;

  return (
    <Autocomplete
      size={size}
      options={options}
      value={selected}
      disabled={disabled}
      getOptionLabel={(opt) => (opt ? `${opt.employeeName} (${opt.userId})` : '')}
      isOptionEqualToValue={(opt, val) => opt.userId === val?.userId}
      onChange={(_, newValue) => onChange(newValue ? newValue.userId : null)}
      renderInput={(params) => (
        <TextField {...params} label={label} required={required} helperText={helperText} />
      )}
    />
  );
}
