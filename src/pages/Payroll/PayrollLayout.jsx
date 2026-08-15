import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

const TABS = [
  { label: 'Generate', path: '/payroll/generate' },
  { label: 'Generate All', path: '/payroll/generate-all' },
  { label: 'Bulk Generate (CSV)', path: '/payroll/bulk-generate' },
  { label: 'List', path: '/payroll/list' },
  { label: 'Employee History', path: '/payroll/history' },
];

export default function PayrollLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  // Longest matching prefix wins, not first-in-array - '/payroll/generate-all' would
  // otherwise match '/payroll/generate' first and highlight the wrong tab.
  const current =
    TABS.filter((t) => location.pathname.startsWith(t.path)).sort((a, b) => b.path.length - a.path.length)[0]
      ?.path || TABS[0].path;

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
