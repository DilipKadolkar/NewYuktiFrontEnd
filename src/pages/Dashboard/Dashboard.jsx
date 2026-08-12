import { useEffect, useMemo, useState } from 'react';
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

const PIE_COLORS = ['#0F9D8B', '#2F6FED', '#E2A400', '#E0483F', '#8A6FED', '#3FBCAC'];

function ChartCard({ title, height = 300, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={<Typography variant="subtitle1">{title}</Typography>} />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

function PersonList({ items, emptyText, dateSuffix }) {
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

  useEffect(() => {
    setLoading(true);
    dashboardApi
      .get(asOf ? asOf.format('YYYY-MM-DD') : undefined)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [asOf]);

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

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total employees" value={cards?.totalEmployees ?? '-'} icon={<PeopleAltRoundedIcon />} accent="primary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Present today" value={cards?.presentToday ?? '-'} icon={<EventAvailableRoundedIcon />} accent="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Absent today" value={cards?.absentToday ?? '-'} icon={<EventBusyRoundedIcon />} accent="error.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="On leave" value={cards?.employeesOnLeave ?? '-'} icon={<BeachAccessRoundedIcon />} accent="info.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Pending leave requests" value={cards?.pendingLeaveRequests ?? '-'} icon={<HourglassTopRoundedIcon />} accent="warning.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Unscheduled tomorrow" value={cards?.unscheduledTomorrow ?? '-'} icon={<EventRepeatRoundedIcon />} accent="secondary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Payroll generated this month" value={cards?.payrollGeneratedThisMonth ?? '-'} icon={<PaymentsRoundedIcon />} accent="primary.dark" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Upcoming birthdays" value={cards?.upcomingBirthdays?.length ?? 0} icon={<CakeRoundedIcon />} accent="#8A6FED" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard title="14-day attendance trend">
            <LineChart data={charts?.attendanceTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E9EE" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" name="Present" stroke="#0F9D8B" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard title="Department strength">
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
          <ChartCard title="Payroll cost (last 6 months)">
            <BarChart data={charts?.payrollCost || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E9EE" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Bar dataKey="value" name="Net payroll" fill="#2F6FED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard title="Leave usage by type">
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
              <PersonList items={cards?.upcomingBirthdays} emptyText="No birthdays in the coming days." dateSuffix="s old" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title={<Typography variant="subtitle1">Upcoming work anniversaries</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              <PersonList items={cards?.upcomingWorkAnniversaries} emptyText="No anniversaries in the coming days." dateSuffix=" with us" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!loading && !data && (
        <Stack sx={{ mt: 4, alignItems: 'center' }}>
          <Typography color="text.secondary">Could not load dashboard data.</Typography>
        </Stack>
      )}
    </Box>
  );
}
