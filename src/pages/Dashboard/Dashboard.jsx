import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import dashboardApi from '../../api/dashboard';
import { formatMoney } from '../../components/MoneyText';
import { tokens } from '../../theme/theme';

const PIE_COLORS = [
  tokens.color.accent.main,
  tokens.color.secondary.main,
  tokens.color.warning.main,
  tokens.color.error.main,
  '#8A6FED',
  tokens.color.accent.light,
];

function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ display: 'block', mb: 1.25, mt: 0.5 }}
    >
      {children}
    </Typography>
  );
}

function ChartCard({ title, height = 300, loading, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={<Typography variant="subtitle1">{title}</Typography>} />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ height }}>
          {loading ? (
            <Skeleton variant="rounded" width="100%" height="100%" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function PersonList({ items, emptyText, dateSuffix, loading }) {
  if (loading) {
    return (
      <Stack spacing={1.5} sx={{ py: 0.5 }}>
        {[0, 1, 2].map((i) => (
          <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width="70%" />
          </Stack>
        ))}
      </Stack>
    );
  }
  if (!items || items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {emptyText}
      </Typography>
    );
  }
  return (
    <List dense disablePadding>
      {items.map((p) => (
        <ListItem key={`${p.userId}-${p.date}`} disableGutters>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: 13 }}>
              {p.employeeName?.charAt(0) || '?'}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={p.employeeName}
            secondary={`${dayjs(p.date).format('DD MMM')}${
              p.years ? ` • ${p.years} yr${dateSuffix}` : ''
            }`}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default function Dashboard() {
  const [asOf, setAsOf] = useState(dayjs());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setLoadFailed(false);
    dashboardApi
      .get(asOf ? asOf.format('YYYY-MM-DD') : undefined)
      .then((res) => setData(res))
      .catch(() => {
        setData(null);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, [asOf]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = data?.cards;
  const charts = data?.charts;

  const departmentPie = useMemo(
    () => (charts?.departmentStrength || []).map((p) => ({ name: p.label, value: p.value })),
    [charts]
  );
  const leaveUsagePie = useMemo(
    () => (charts?.leaveUsage || []).map((p) => ({ name: p.label, value: Number(p.value) })),
    [charts]
  );

  if (loadFailed) {
    return (
      <Box>
        <PageHeader title="Dashboard" subtitle="Company-wide snapshot of attendance, leave and payroll" />
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
            Couldn&apos;t load the dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Check your connection and try again.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={load}
            data-testid="dashboard-retry-button"
          >
            Try again
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Company-wide snapshot of attendance, leave and payroll"
        actions={
          <DatePicker
            label="As of"
            value={asOf}
            onChange={setAsOf}
            slotProps={{ textField: { size: 'small' } }}
          />
        }
      />

      <SectionLabel>Workforce &amp; attendance</SectionLabel>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard loading={loading} label="Total employees" value={cards?.totalEmployees} icon={<PeopleAltRoundedIcon fontSize="small" />} accent="primary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard loading={loading} label="Present today" value={cards?.presentToday} icon={<EventAvailableRoundedIcon fontSize="small" />} accent="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard loading={loading} label="Absent today" value={cards?.absentToday} icon={<EventBusyRoundedIcon fontSize="small" />} accent="error.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard loading={loading} label="Unscheduled tomorrow" value={cards?.unscheduledTomorrow} icon={<EventRepeatRoundedIcon fontSize="small" />} accent="secondary.main" />
        </Grid>
      </Grid>

      <SectionLabel>Leave</SectionLabel>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard loading={loading} label="On leave today" value={cards?.employeesOnLeave} icon={<BeachAccessRoundedIcon fontSize="small" />} accent="info.main" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard loading={loading} label="Pending leave requests" value={cards?.pendingLeaveRequests} icon={<HourglassTopRoundedIcon fontSize="small" />} accent="warning.main" />
        </Grid>
      </Grid>

      <SectionLabel>Payroll &amp; people</SectionLabel>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard loading={loading} label="Payroll generated this month" value={cards?.payrollGeneratedThisMonth} icon={<PaymentsRoundedIcon fontSize="small" />} accent="primary.dark" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard loading={loading} label="Upcoming birthdays" value={cards?.upcomingBirthdays?.length ?? (loading ? undefined : 0)} icon={<CakeRoundedIcon fontSize="small" />} accent="#8A6FED" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard title="14-day attendance trend" loading={loading}>
            <LineChart data={charts?.attendanceTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokens.color.neutral.border} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                name="Present"
                stroke={tokens.color.accent.main}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard title="Department strength" loading={loading}>
            <PieChart>
              <Pie data={departmentPie} dataKey="value" nameKey="name" outerRadius={90} label>
                {departmentPie.map((entry, idx) => (
                  <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard title="Payroll cost (last 6 months)" loading={loading}>
            <BarChart data={charts?.payrollCost || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokens.color.neutral.border} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Bar dataKey="value" name="Net payroll" fill={tokens.color.secondary.main} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard title="Leave usage by type" loading={loading}>
            <PieChart>
              <Pie data={leaveUsagePie} dataKey="value" nameKey="name" outerRadius={90} label>
                {leaveUsagePie.map((entry, idx) => (
                  <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title={<Typography variant="subtitle1">Upcoming birthdays</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              <PersonList
                loading={loading}
                items={cards?.upcomingBirthdays}
                emptyText="No birthdays in the coming days."
                dateSuffix="s old"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title={<Typography variant="subtitle1">Upcoming work anniversaries</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              <PersonList
                loading={loading}
                items={cards?.upcomingWorkAnniversaries}
                emptyText="No anniversaries in the coming days."
                dateSuffix=" with us"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
