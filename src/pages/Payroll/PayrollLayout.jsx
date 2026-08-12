import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

const TABS = [
  { label: 'Generate', path: '/payroll/generate' },
  { label: 'Generate All', path: '/payroll/generate-all' },
  { label: 'List', path: '/payroll/list' },
  { label: 'Employee History', path: '/payroll/history' },
];

export default function PayrollLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = TABS.find((t) => location.pathname.startsWith(t.path))?.path || TABS[0].path;

  return (
    <Box>
      <Tabs
        value={current}
        onChange={(_, value) => navigate(value)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((t) => (
          <Tab key={t.path} value={t.path} label={t.label} />
        ))}
      </Tabs>
      <Outlet />
    </Box>
  );
}
