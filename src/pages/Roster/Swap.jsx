import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import EmployeePicker from '../../components/EmployeePicker';
import shiftSchedulesApi from '../../api/shiftSchedules';
import { useActingAs } from '../../context/ActingAsContext';

export default function Swap() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const navigate = useNavigate();
  const [firstUserId, setFirstUserId] = useState(null);
  const [secondUserId, setSecondUserId] = useState(null);
  const [shiftDate, setShiftDate] = useState(dayjs());
  const [saving, setSaving] = useState(false);

  const isValid = firstUserId && secondUserId && firstUserId !== secondUserId && shiftDate;

  const handleSubmit = () => {
    setSaving(true);
    shiftSchedulesApi
      .swap({
        firstUserId,
        secondUserId,
        shiftDate: shiftDate.format('YYYY-MM-DD'),
        assignedBy: actingAs?.userId,
      })
      .then(() => {
        enqueueSnackbar('Shifts swapped', { variant: 'success' });
        navigate('/roster/planner');
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader
        title="Swap Shifts"
        subtitle="Swap two people's scheduled shift on a single date"
        actions={
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid || saving}>
            Swap
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EmployeePicker label="First employee" value={firstUserId} onChange={setFirstUserId} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EmployeePicker label="Second employee" value={secondUserId} onChange={setSecondUserId} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Shift date"
                value={shiftDate}
                onChange={setShiftDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
