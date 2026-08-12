import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        404
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This page does not exist.
      </Typography>
      <Button component={Link} to="/" variant="contained">
        Back to dashboard
      </Button>
    </Box>
  );
}
