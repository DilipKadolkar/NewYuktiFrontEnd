import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import StatCard from './StatCard';
import DataTable from './DataTable';

const ERROR_COLUMNS = [
  { field: 'rowNumber', headerName: 'Row', width: 90 },
  { field: 'identifier', headerName: 'Identifier', width: 160, valueGetter: (v) => v || '—' },
  { field: 'message', headerName: 'Error', flex: 1, minWidth: 260 },
];

const tableHeight = (count) => Math.min(420, Math.max(160, 90 + count * 52));

/**
 * Renders the uniform `{totalRows, successCount, failureCount, succeeded, errors}`
 * shape every backend bulk/CSV endpoint returns (NewYukti/ARCHITECTURE.md's
 * "Bulk / CSV mutation endpoints") - every row is attempted independently, so a
 * result is normally a mix of both tables, not all-or-nothing.
 */
export default function BulkImportSummary({
  result,
  succeededColumns,
  getSucceededRowId,
  succeededMessage,
}) {
  if (!result) return null;
  const { totalRows, successCount, failureCount, succeeded = [], errors = [] } = result;

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Total rows" value={totalRows} icon={<ChecklistRoundedIcon />} accent="grey.700" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Succeeded" value={successCount} icon={<CheckCircleRoundedIcon />} accent="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Failed" value={failureCount} icon={<ErrorRoundedIcon />} accent="error.main" />
        </Grid>
      </Grid>

      {failureCount > 0 && (
        <Stack spacing={1}>
          <Alert severity="warning">
            {failureCount} row{failureCount === 1 ? '' : 's'} failed and {failureCount === 1 ? 'was' : 'were'}{' '}
            skipped — the rest of the file was still processed.
          </Alert>
          <DataTable
            rows={errors}
            columns={ERROR_COLUMNS}
            getRowId={(r) => r.rowNumber}
            height={tableHeight(errors.length)}
          />
        </Stack>
      )}

      {successCount > 0 && succeededColumns && (
        <Stack spacing={1}>
          <Alert severity="success" variant="outlined">
            {succeededMessage || `${successCount} row${successCount === 1 ? '' : 's'} succeeded.`}
          </Alert>
          <DataTable
            rows={succeeded}
            columns={succeededColumns}
            getRowId={getSucceededRowId}
            height={tableHeight(succeeded.length)}
          />
        </Stack>
      )}
    </Stack>
  );
}
