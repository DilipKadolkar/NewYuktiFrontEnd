import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useTheme, alpha } from '@mui/material/styles';

function resolveColor(theme, path) {
  if (!path) return theme.palette.primary.main;
  if (path.startsWith('#')) return path;
  const [group, key = 'main'] = path.split('.');
  return theme.palette[group]?.[key] || theme.palette.primary.main;
}

export default function StatCard({ label, value, icon, accent = 'primary.main', loading = false }) {
  const theme = useTheme();
  const color = resolveColor(theme, accent);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {icon && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(color, 0.12),
                color,
                flexShrink: 0,
              }}
            >
              {loading ? <Skeleton variant="circular" width={20} height={20} /> : icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0, width: '100%' }}>
            {loading ? (
              <Skeleton variant="text" width="60%" height={32} />
            ) : (
              <Typography variant="h5" className="tabular-nums" sx={{ lineHeight: 1.2 }}>
                {value}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
