import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import EmployeeMultiPicker from '../../components/EmployeeMultiPicker';
import shiftSchedulesApi from '../../api/shiftSchedules';
import shiftsApi from '../../api/shifts';
import { DAYS_OF_WEEK, labelize } from '../../constants/enums';
import { useActingAs } from '../../context/ActingAsContext';

export default function BulkAssign() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs().endOf('month'));
  const [shiftCode, setShiftCode] = useState('');
  const [weekOffDays, setWeekOffDays] = useState(['SUNDAY']);
  const [skipHolidays, setSkipHolidays] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    shiftsApi.list().then(setShifts);
  }, []);

  const isValid = userIds.length > 0 && fromDate && toDate && shiftCode;

  const handleSubmit = () => {
    setSaving(true);
    shiftSchedulesApi
      .bulkAssign({
        userIds,
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: toDate.format('YYYY-MM-DD'),
        shiftCode,
        weekOffDays,
        skipHolidays,
        overwriteExisting,
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
        title="Bulk Assign Roster"
        subtitle="Assign one shift to many employees across a date range"
        actions={
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid || saving}>
            Assign
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <EmployeeMultiPicker label="Employees" value={userIds} onChange={setUserIds} />
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
                select
                fullWidth
                size="small"
                label="Shift"
                value={shiftCode}
                onChange={(e) => setShiftCode(e.target.value)}
              >
                {shifts.map((s) => (
                  <MenuItem key={s.id} value={s.shiftCode}>
                    {s.shiftName} ({s.shiftCode})
                  </MenuItem>
                ))}
              </TextField>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Switch checked={skipHolidays} onChange={(e) => setSkipHolidays(e.target.checked)} />}
                label="Skip mandatory holidays"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
