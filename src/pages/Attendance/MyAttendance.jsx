import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
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

// A single, larger-touch-target row for the consumer-style day list, used
// only on the plain-employee view (see below) - a DataGrid forces horizontal
// scrolling on a phone, which the redesign brief explicitly asks to avoid
// for shop-floor / employee-facing screens.
function DayRow({ day }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        py: 1.5,
        px: { xs: 2, sm: 1.5 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ minWidth: 64 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {dayjs(day.attendanceDate).format('DD MMM')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {dayjs(day.attendanceDate).format('ddd')}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body2" className="tabular-nums" noWrap>
          {day.firstIn ? dayjs(day.firstIn).format('HH:mm') : '—'} – {day.lastOut ? dayjs(day.lastOut).format('HH:mm') : '—'}
        </Typography>
        {day.workingHours != null && (
          <Typography variant="caption" color="text.secondary">
            {day.workingHours} hrs{day.overtimeHours > 0 ? ` · ${day.overtimeHours} OT` : ''}
          </Typography>
        )}
      </Box>
      <StatusChip value={day.status} colorMap={ATTENDANCE_STATUS_COLOR} />
    </Stack>
  );
}

export default function MyAttendance() {
  const { actingAs, isSupervisorOrAbove } = useActingAs();
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

  const monthLabel = month.format('MMMM YYYY');
  const presentPct = useMemo(() => {
    if (!data?.workingDays) return 0;
    return Math.min(100, Math.round(((data.presentDays || 0) / data.workingDays) * 100));
  }, [data]);

  const monthPicker = (
    <DatePicker
      label="Month"
      views={['year', 'month']}
      value={month}
      onChange={setMonth}
      slotProps={{ textField: { size: 'small' } }}
    />
  );

  // Plain employees viewing their own record get a friendly, consumer-style
  // summary; supervisors/HR/admin (viewing themselves or a picked employee)
  // keep the dense, information-rich table view HR workflows need.
  if (!isSupervisorOrAbove) {
    return (
      <Box>
        <PageHeader title="My Attendance" subtitle={monthLabel} actions={monthPicker} />

        {loading ? (
          <Card sx={{ mb: 2.5 }} data-testid="attendance-summary">
            <CardContent>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" height={48} />
              <Skeleton variant="rounded" height={8} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        ) : !data ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              No attendance yet for {monthLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your attendance will appear here once it has been recorded.
            </Typography>
          </Card>
        ) : (
          <>
            <Card sx={{ mb: 2.5 }} data-testid="attendance-summary">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Present this month
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 1.5 }}>
                  <Typography variant="h2" className="tabular-nums">
                    {data.presentDays ?? 0}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    of {data.workingDays ?? 0} working days
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={presentPct}
                  sx={{ height: 8, borderRadius: 999 }}
                />
              </CardContent>
            </Card>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 6 }}>
                <StatCard label="On leave" value={data.leaveDays ?? 0} accent="info.main" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <StatCard label="Late arrivals" value={data.lateCount ?? 0} accent="warning.main" />
              </Grid>
            </Grid>

            {data.invalidPunches > 0 && (
              <Alert severity="warning" sx={{ mb: 2.5 }} data-testid="attendance-needs-attention">
                {data.invalidPunches} day{data.invalidPunches > 1 ? 's' : ''} {data.invalidPunches > 1 ? 'need' : 'needs'} attention —
                contact HR to fix a missed punch before payroll runs.
              </Alert>
            )}

            <Card>
              <CardContent sx={{ p: { xs: 0, sm: 1 } }}>
                <Typography variant="subtitle1" sx={{ px: { xs: 2, sm: 1.5 }, pt: { xs: 2, sm: 1.5 }, pb: 1 }}>
                  Day by day
                </Typography>
                {(data.days || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ px: { xs: 2, sm: 1.5 }, pb: 2.5 }}>
                    No days recorded yet.
                  </Typography>
                ) : (
                  data.days.map((d) => <DayRow key={d.attendanceDate} day={d} />)
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="My Attendance"
        subtitle={data ? `${data.employeeName} — ${monthLabel}` : 'Monthly attendance summary'}
        actions={
          <>
            <EmployeePicker label="Employee" value={userId} onChange={setUserId} />
            {monthPicker}
          </>
        }
      />

      {!loading && !data ? (
        <Alert severity="info">No attendance data for this period yet.</Alert>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard loading={loading} label="Working days" value={data?.workingDays} accent="primary.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard loading={loading} label="Present days" value={data?.presentDays} accent="success.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard loading={loading} label="Leave days" value={data?.leaveDays} accent="info.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard loading={loading} label="LOP days" value={data?.lopDays} accent="error.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard loading={loading} label="Late count" value={data?.lateCount} accent="warning.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard loading={loading} label="Early exits" value={data?.earlyExitCount} accent="warning.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard loading={loading} label="Invalid punches" value={data?.invalidPunches} accent="error.main" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard loading={loading} label="Overtime hours" value={data?.overtimeHours} accent="secondary.main" />
            </Grid>
          </Grid>
          {data?.invalidPunches > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }} data-testid="attendance-needs-attention">
              {data.invalidPunches} day(s) have a single punch only — review and correct them in the
              Attendance Console before payroll is generated.
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
    </Box>
  );
}
