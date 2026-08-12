import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import EmployeePicker from '../../components/EmployeePicker';
import attendanceApi from '../../api/attendance';
import { ATTENDANCE_STATUS_COLOR } from '../../constants/enums';
import { useActingAs } from '../../context/ActingAsContext';

const columns = [
  {
    field: 'attendanceDate',
    headerName: 'Date',
    width: 130,
    valueFormatter: (v) => (v ? dayjs(v).format('DD MMM YYYY (ddd)') : ''),
  },
  { field: 'shiftCode', headerName: 'Shift', width: 100 },
  {
    field: 'firstIn',
    headerName: 'In',
    width: 130,
    valueFormatter: (v) => (v ? dayjs(v).format('HH:mm') : '-'),
  },
  {
    field: 'lastOut',
    headerName: 'Out',
    width: 130,
    valueFormatter: (v) => (v ? dayjs(v).format('HH:mm') : '-'),
  },
  { field: 'workingHours', headerName: 'Hours', width: 90 },
  { field: 'overtimeHours', headerName: 'OT hrs', width: 90 },
  { field: 'lateMinutes', headerName: 'Late (min)', width: 100 },
  {
    field: 'status',
    headerName: 'Status',
    width: 140,
    renderCell: (params) => <StatusChip value={params.value} colorMap={ATTENDANCE_STATUS_COLOR} />,
  },
];

export default function MyAttendance() {
  const { actingAs, isHrOrAdmin, isSupervisor } = useActingAs();
  const [userId, setUserId] = useState(actingAs?.userId || null);
  const [month, setMonth] = useState(dayjs());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserId(actingAs?.userId || null);
  }, [actingAs]);

  useEffect(() => {
    if (!userId || !month) return;
    setLoading(true);
    attendanceApi
      .monthly(userId, month.format('YYYY-MM'))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId, month]);

  return (
    <>
      <PageHeader
        title="My Attendance"
        subtitle={data ? `${data.employeeName} — ${month.format('MMMM YYYY')}` : 'Monthly attendance summary'}
        actions={
          <>
            {(isHrOrAdmin || isSupervisor) && (
              <EmployeePicker label="Employee" value={userId} onChange={setUserId} />
            )}
            <DatePicker
              label="Month"
              views={['year', 'month']}
              value={month}
              onChange={setMonth}
              slotProps={{ textField: { size: 'small' } }}
            />
          </>
        }
      />

      {!loading && !data ? (
        <Alert severity="info">No attendance data for this period yet.</Alert>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Working days" value={data?.workingDays ?? '-'} accent="primary.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Present days" value={data?.presentDays ?? '-'} accent="success.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Leave days" value={data?.leaveDays ?? '-'} accent="info.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="LOP days" value={data?.lopDays ?? '-'} accent="error.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Late count" value={data?.lateCount ?? '-'} accent="warning.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Early exits" value={data?.earlyExitCount ?? '-'} accent="warning.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Invalid punches" value={data?.invalidPunches ?? '-'} accent="error.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Overtime hours" value={data?.overtimeHours ?? '-'} accent="secondary.main" />
            </Grid>
          </Grid>
          {data?.invalidPunches > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {data.invalidPunches} day(s) have a single punch only — these need a correction before
              payroll.
            </Alert>
          )}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Day-by-day
              </Typography>
              <DataTable
                rows={(data?.days || []).map((d, i) => ({ id: i, ...d }))}
                columns={columns}
                loading={loading}
                height={480}
                density="compact"
              />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
