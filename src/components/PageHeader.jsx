import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        mb: 3,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
