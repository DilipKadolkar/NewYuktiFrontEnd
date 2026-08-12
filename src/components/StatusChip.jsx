import Chip from '@mui/material/Chip';
import { labelize } from '../constants/enums';

export default function StatusChip({ value, colorMap, size = 'small' }) {
  if (!value) return null;
  const color = colorMap?.[value] || 'default';
  return <Chip label={labelize(value)} color={color} size={size} variant="filled" />;
}
