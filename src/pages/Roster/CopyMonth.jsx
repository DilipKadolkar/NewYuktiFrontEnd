import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import EmployeeMultiPicker from '../../components/EmployeeMultiPicker';
import shiftSchedulesApi from '../../api/shiftSchedules';
import { useActingAs } from '../../context/ActingAsContext';

export default function CopyMonth() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const navigate = useNavigate();
  const [userIds, setUserIds] = useState([]);
  const [sourceMonth, setSourceMonth] = useState(dayjs().subtract(1, 'month'));
  const [targetMonth, setTargetMonth] = useState(dayjs());
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [saving, setSaving] = useState(false);

  const isValid = userIds.length > 0 && sourceMonth && targetMonth;

  const handleSubmit = () => {
    setSaving(true);
    shiftSchedulesApi
      .copyMonth({
        userIds,
        sourceMonth: sourceMonth.format('YYYY-MM'),
        targetMonth: targetMonth.format('YYYY-MM'),
        overwriteExisting,
        assignedBy: actingAs?.userId,
      })
      .then((res) => {
        enqueueSnackbar(`Copied ${res.length} shift-day(s)`, { variant: 'success' });
        navigate('/roster/planner');
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader
        title="Copy Last Month"
        subtitle="Copies by day-of-month; days that don't exist in a shorter target month are skipped"
        actions={
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid || saving}>
            Copy
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <EmployeeMultiPicker label="Employees" value={userIds} onChange={setUserIds} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Source month"
                views={['year', 'month']}
                value={sourceMonth}
                onChange={setSourceMonth}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Target month"
                views={['year', 'month']}
                value={targetMonth}
                onChange={setTargetMonth}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch checked={overwriteExisting} onChange={(e) => setOverwriteExisting(e.target.checked)} />
                }
                label="Overwrite existing schedule"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
