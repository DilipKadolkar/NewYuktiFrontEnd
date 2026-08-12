import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PageHeader from '../../components/PageHeader';

const GROUPS = [
  {
    label: 'People',
    items: [{ label: 'Employee Master', path: '/reports/employees', icon: PeopleAltRoundedIcon }],
  },
  {
    label: 'Attendance',
    items: [
      { label: 'Monthly Attendance', path: '/reports/attendance/monthly', icon: EventAvailableRoundedIcon },
      { label: 'Late Coming', path: '/reports/attendance/late-coming', icon: EventAvailableRoundedIcon },
      { label: 'Absent', path: '/reports/attendance/absent', icon: EventAvailableRoundedIcon },
      { label: 'Overtime', path: '/reports/attendance/overtime', icon: EventAvailableRoundedIcon },
      { label: 'Loss of Pay', path: '/reports/attendance/lop', icon: EventAvailableRoundedIcon },
    ],
  },
  {
    label: 'Leave',
    items: [{ label: 'Leave Balances', path: '/reports/leave-balances', icon: BeachAccessRoundedIcon }],
  },
  {
    label: 'Payroll & Statutory',
    items: [
      { label: 'Payroll', path: '/reports/payroll', icon: PaymentsRoundedIcon },
      { label: 'Payroll by Department', path: '/reports/payroll/by-department', icon: PaymentsRoundedIcon },
      { label: 'Payroll by Company', path: '/reports/payroll/by-company', icon: PaymentsRoundedIcon },
      { label: 'Provident Fund', path: '/reports/statutory/pf', icon: PaymentsRoundedIcon },
      { label: 'Professional Tax', path: '/reports/statutory/professional-tax', icon: PaymentsRoundedIcon },
      { label: 'ESIC', path: '/reports/statutory/esic', icon: PaymentsRoundedIcon },
    ],
  },
];

export default function ReportsHub() {
  return (
    <>
      <PageHeader title="Reports" subtitle="Aggregated views over attendance, leave and payroll — never recalculated, so a report can never disagree with a salary slip" />
      {GROUPS.map((group) => (
        <Box key={group.label} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
            {group.label}
          </Typography>
          <Grid container spacing={2}>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Grid key={item.path} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardActionArea component={RouterLink} to={item.path}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Icon color="primary" />
                          <Typography variant="body1">{item.label}</Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </>
  );
}
