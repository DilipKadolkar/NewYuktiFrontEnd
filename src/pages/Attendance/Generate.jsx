import { useState } from 'react';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import EmployeeMultiPicker from '../../components/EmployeeMultiPicker';
import attendanceApi from '../../api/attendance';
import { useActingAs } from '../../context/ActingAsContext';
import { useAuth } from '../../context/AuthContext';

export default function Generate() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const { can } = useAuth();
  const canGenerate = can('ATTENDANCE_GENERATE');
  const [month, setMonth] = useState(dayjs());
  const [userIds, setUserIds] = useState([]);
  const [overwriteManual, setOverwriteManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = () => {
    setSaving(true);
    setResult(null);
    attendanceApi
      .generate({
        month: month.format('YYYY-MM'),
        userIds: userIds.length > 0 ? userIds : undefined,
        generatedBy: actingAs?.userId,
        overwriteManual,
      })
      .then((res) => {
        setResult(res);
        enqueueSnackbar(`Generated attendance for ${res.employeesProcessed} employee(s)`, {
          variant: 'success',
        });
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader
        title="Generate Attendance"
        subtitle="Turns punches into the attendance record payroll pays from. Rerun freely — manual corrections survive unless you choose to overwrite them."
        actions={
          canGenerate && (
            <Button variant="contained" onClick={handleGenerate} disabled={saving || !month}>
              Generate
            </Button>
          )
        }
      />
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="Month"
                views={['year', 'month']}
                value={month}
                onChange={setMonth}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <EmployeeMultiPicker
                label="Employees (leave empty for the whole company)"
                value={userIds}
                onChange={setUserIds}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch checked={overwriteManual} onChange={(e) => setOverwriteManual(e.target.checked)} />
                }
                label="Overwrite manual corrections (only when you deliberately want to discard them)"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Result — {result.month}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
              <Chip label={`${result.employeesProcessed} employees processed`} color="primary" />
              <Chip label={`${result.daysGenerated} days generated`} color="success" />
              <Chip label={`${result.manualPreserved} manual corrections preserved`} color="info" />
              <Chip label={`${result.lockedSkipped} locked (skipped)`} />
            </Stack>
            {result.employeesWithoutRoster?.length > 0 && (
              <Alert severity="warning">
                No roster for: {result.employeesWithoutRoster.join(', ')} — they will read as fully
                absent until scheduled.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
