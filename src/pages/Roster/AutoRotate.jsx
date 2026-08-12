import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import EmployeeMultiPicker from '../../components/EmployeeMultiPicker';
import shiftSchedulesApi from '../../api/shiftSchedules';
import shiftsApi from '../../api/shifts';
import { DAYS_OF_WEEK, labelize } from '../../constants/enums';
import { useActingAs } from '../../context/ActingAsContext';

export default function AutoRotate() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [shiftCycle, setShiftCycle] = useState([]);
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs().endOf('month'));
  const [rotationDays, setRotationDays] = useState(7);
  const [weekOffDays, setWeekOffDays] = useState(['SUNDAY']);
  const [skipHolidays, setSkipHolidays] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    shiftsApi.list().then(setShifts);
  }, []);

  const isValid = userIds.length > 0 && shiftCycle.length > 0 && fromDate && toDate && rotationDays > 0;

  const handleSubmit = () => {
    setSaving(true);
    shiftSchedulesApi
      .autoRotate({
        userIds,
        shiftCycle,
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: toDate.format('YYYY-MM-DD'),
        rotationDays: Number(rotationDays),
        weekOffDays,
        skipHolidays,
        assignedBy: actingAs?.userId,
      })
      .then((res) => {
        enqueueSnackbar(`Assigned ${res.length} shift-day(s)`, { variant: 'success' });
        navigate('/roster/planner');
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader
        title="Auto-Rotate Roster"
        subtitle="Each employee starts on a different shift and rotates through the cycle"
        actions={
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid || saving}>
            Assign
          </Button>
        }
      />
      <Alert severity="info" sx={{ mb: 2.5 }}>
        Everyone advances one position in the cycle every "rotation days", so the team stays
        spread across shifts instead of moving together.
      </Alert>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <EmployeeMultiPicker label="Employees" value={userIds} onChange={setUserIds} />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                multiple
                size="small"
                options={shifts.map((s) => s.shiftCode)}
                value={shiftCycle}
                onChange={(_, v) => setShiftCycle(v)}
                renderInput={(params) => (
                  <TextField {...params} label="Shift cycle (in order)" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="From date"
                value={fromDate}
                onChange={setFromDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="To date"
                value={toDate}
                onChange={setToDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Rotation days"
                value={rotationDays}
                onChange={(e) => setRotationDays(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                multiple
                size="small"
                options={DAYS_OF_WEEK}
                value={weekOffDays}
                getOptionLabel={labelize}
                onChange={(_, v) => setWeekOffDays(v)}
                renderInput={(params) => <TextField {...params} label="Week off days" />}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={<Switch checked={skipHolidays} onChange={(e) => setSkipHolidays(e.target.checked)} />}
                label="Skip mandatory holidays"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
