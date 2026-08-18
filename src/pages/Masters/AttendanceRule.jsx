import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import InputAdornment from '@mui/material/InputAdornment';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import attendanceRulesApi from '../../api/attendanceRules';

const FIELDS = [
  { name: 'entryWindowBufferMinutes', label: 'Entry window buffer', suffix: 'min' },
  { name: 'fullDayThresholdPercent', label: 'Full-day threshold', suffix: '%' },
  { name: 'halfDayThresholdPercent', label: 'Half-day threshold', suffix: '%' },
];

export default function AttendanceRule() {
  const { enqueueSnackbar } = useSnackbar();
  const [values, setValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    attendanceRulesApi
      .get()
      .then(setValues)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value.replace(/[^0-9.]/g, '') }));
  };

  const handleSave = () => {
    setSaving(true);
    const { entryWindowBufferMinutes, fullDayThresholdPercent, halfDayThresholdPercent } = values;
    attendanceRulesApi
      .update({
        entryWindowBufferMinutes: Number(entryWindowBufferMinutes),
        fullDayThresholdPercent,
        halfDayThresholdPercent,
      })
      .then((updated) => {
        setValues(updated);
        enqueueSnackbar('Attendance rule updated', { variant: 'success' });
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <Skeleton variant="rounded" height={300} />;
  }

  if (!values) {
    return <Alert severity="error">Could not load the attendance rule.</Alert>;
  }

  return (
    <>
      <PageHeader
        title="Attendance Rule"
        subtitle="How punches are turned into full days, half days and absences for this company"
        actions={
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            Save changes
          </Button>
        }
      />
      <Alert severity="info" sx={{ mb: 2.5 }}>
        Changes apply the next time attendance is generated or regenerated for a day — from{' '}
        <strong>Attendance → Generate</strong>. Days already generated keep what was computed at
        the time until regenerated.
      </Alert>
      <Card sx={{ mb: 2.5 }}>
        <CardHeader title={<Typography variant="subtitle1">Thresholds</Typography>} />
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            {FIELDS.map((f) => (
              <Grid key={f.name} size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={f.label}
                  value={values[f.name] ?? ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  slotProps={{
                    input: { endAdornment: <InputAdornment position="end">{f.suffix}</InputAdornment> },
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            A punch is accepted into a shift's window starting this many minutes before the shift
            begins. Worked time at or above the full-day threshold (as a percent of the shift's
            length) counts as a full day; at or above the half-day threshold but below full, a half
            day; below the half-day threshold, absent. The half-day threshold must be lower than the
            full-day one.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
