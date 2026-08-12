import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { labelize } from '../constants/enums';

const emptyFromFields = (fields) =>
  fields.reduce((acc, f) => {
    acc[f.name] = f.type === 'switch' ? false : '';
    return acc;
  }, {});

export default function MasterFormDialog({
  open,
  title,
  fields,
  initialValues,
  saving,
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState(() => emptyFromFields(fields));

  useEffect(() => {
    if (open) {
      setValues({ ...emptyFromFields(fields), ...(initialValues || {}) });
    }
  }, [open, initialValues, fields]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = fields
    .filter((f) => f.required)
    .every((f) => values[f.name] !== '' && values[f.name] !== null && values[f.name] !== undefined);

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {fields.map((f) => (
            <Grid key={f.name} size={{ xs: 12, sm: f.gridSize || 12 }}>
              {f.type === 'select' ? (
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={f.label}
                  required={f.required}
                  value={values[f.name] ?? ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                >
                  {f.options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {labelize(opt)}
                    </MenuItem>
                  ))}
                </TextField>
              ) : f.type === 'switch' ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!values[f.name]}
                      onChange={(e) => handleChange(f.name, e.target.checked)}
                    />
                  }
                  label={f.label}
                />
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  type={f.type === 'email' ? 'email' : f.type === 'number' ? 'number' : 'text'}
                  label={f.label}
                  required={f.required}
                  multiline={f.multiline}
                  minRows={f.multiline ? 2 : undefined}
                  value={values[f.name] ?? ''}
                  onChange={(e) =>
                    handleChange(
                      f.name,
                      f.type === 'number' ? e.target.value.replace(/[^0-9.]/g, '') : e.target.value
                    )
                  }
                />
              )}
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
