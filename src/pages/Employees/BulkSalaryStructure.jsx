import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import CsvFileField from '../../components/CsvFileField';
import BulkImportSummary from '../../components/BulkImportSummary';
import MoneyText from '../../components/MoneyText';
import employeesApi from '../../api/employees';
import { useAuth } from '../../context/AuthContext';

const TEMPLATE = `userId,basicDA,hra,conveyanceAllowance,educationAllowance,medicalAllowance,otherAllowance,grossSalary
SE10012,15000,6000,1500,1500,2000,1000,26000
SE10098,16000,6400,1600,1600,2000,1400,29000
`;

const money = (value) => <MoneyText value={value} />;

export default function BulkSalaryStructure() {
  const { enqueueSnackbar } = useSnackbar();
  const { can } = useAuth();
  const canEdit = can('EMPLOYEE_UPDATE');

  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [wasDryRun, setWasDryRun] = useState(false);

  const run = (dryRun) => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    employeesApi
      .bulkSalaryStructure(file, dryRun)
      .then((res) => {
        setResult(res);
        setWasDryRun(dryRun);
        enqueueSnackbar(
          dryRun
            ? `Previewed ${res.totalRows} row(s) — nothing was saved`
            : `Overrode ${res.successCount} of ${res.totalRows} structure(s)`,
          { variant: dryRun ? 'info' : res.failureCount > 0 ? 'warning' : 'success' },
        );
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const newlyFrozen = (result?.succeeded || []).filter((r) => !r.alreadyOverridden).length;

  const columns = [
    { field: 'userId', headerName: 'Employee', width: 110 },
    { field: 'employeeName', headerName: 'Name', flex: 1, minWidth: 130 },
    {
      field: 'basicDA',
      headerName: 'Basic + DA',
      width: 120,
      renderCell: ({ value }) => <MoneyText value={value} />,
    },
    { field: 'hra', headerName: 'HRA', width: 110, renderCell: ({ value }) => <MoneyText value={value} /> },
    {
      field: 'conveyanceAllowance',
      headerName: 'Conveyance',
      width: 120,
      renderCell: ({ value }) => <MoneyText value={value} />,
    },
    {
      field: 'educationAllowance',
      headerName: 'Education',
      width: 115,
      renderCell: ({ value }) => <MoneyText value={value} />,
    },
    {
      field: 'medicalAllowance',
      headerName: 'Med. Allow',
      width: 115,
      renderCell: ({ value }) => money(value),
    },
    {
      field: 'otherAllowance',
      headerName: 'Other Allow',
      width: 115,
      renderCell: ({ value }) => money(value),
    },
    {
      field: 'grossSalary',
      headerName: 'Gross Salary',
      width: 170,
      sortable: false,
      renderCell: ({ row }) => {
        const changed = String(row.previousGrossSalary) !== String(row.grossSalary);
        if (!changed) return money(row.grossSalary);
        return (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box component="span" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
              <MoneyText value={row.previousGrossSalary} />
            </Box>
            <Box component="span">
              <MoneyText value={row.grossSalary} />
            </Box>
          </Stack>
        );
      },
    },
    {
      field: 'totalWage',
      headerName: 'Total',
      width: 120,
      renderCell: ({ value }) => money(value),
    },
    {
      field: 'differenceFromGross',
      headerName: 'vs Gross',
      width: 130,
      renderCell: ({ value }) => {
        const diff = Number(value);
        if (diff === 0) return <Chip size="small" label="matches" color="success" />;
        return (
          <Chip
            size="small"
            color="warning"
            label={`${diff > 0 ? '+' : ''}${diff.toLocaleString('en-IN')}`}
          />
        );
      },
    },
    {
      field: 'alreadyOverridden',
      headerName: 'Was frozen',
      width: 120,
      renderCell: ({ value }) =>
        value ? (
          <Chip size="small" label="already" variant="outlined" />
        ) : (
          <Chip size="small" label="newly frozen" color="warning" />
        ),
    },
  ];

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'salary-structure-override-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Bulk Salary Structure Override"
        subtitle="For employees whose component split genuinely differs from the company salary rule. Every row is applied independently."
        actions={
          canEdit && (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => run(true)} disabled={busy || !file}>
                Preview changes
              </Button>
              <Button variant="contained" onClick={() => run(false)} disabled={busy || !file}>
                Override structures
              </Button>
            </Stack>
          )
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Stack spacing={2}>
            <CsvFileField value={file} onChange={setFile} />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Columns
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Required:</strong> <code>userId</code>, <code>basicDA</code>, <code>hra</code>,{' '}
                <code>conveyanceAllowance</code>, <code>educationAllowance</code>. An override replaces
                the whole structure, so a partial row is refused rather than leaving the rest holding
                rule-derived values that no longer follow anything.
                <br />
                <strong>Optional:</strong> <code>medicalAllowance</code>, <code>otherAllowance</code>,{' '}
                <code>grossSalary</code> — omit one and that figure is left as it is.
                <br />
                Report headings work too: <code>Basic + DA</code>, <code>HRA</code>,{' '}
                <code>Con. Allow</code>, <code>Edu. Allow</code>, <code>Med. Allow</code>,{' '}
                <code>Other Allow</code>, <code>Gross Salary</code>.
              </Typography>
            </Box>

            <Alert severity="warning">
              <AlertTitle>An override is a rule change, not just a value change</AlertTitle>
              These employees&rsquo; components stop following gross salary. Every future salary
              revision for them must restate all four, or the row is refused. Use{' '}
              <strong>Regenerate salary structure</strong> on an employee to put them back on the
              company rule.
            </Alert>

            <Alert severity="warning">
              <AlertTitle>Gross salary here is a correction, not a raise</AlertTitle>
              A row carrying <code>grossSalary</code> sets it directly and writes <strong>no salary
              revision history</strong>, so payroll reads the new figure as having applied all along
              rather than prorating it from a date. For an actual increase use{' '}
              <strong>Bulk Salary Revision</strong>, which is dated and audited.
            </Alert>

            <Typography variant="body2" color="text.secondary">
              Nothing requires the components to add up to the employee&rsquo;s gross salary, and an
              override is often exactly where they stop agreeing — so the preview reports the gap
              rather than blocking it. Check the <strong>vs Gross</strong> column before applying.
            </Typography>

            <Box>
              <Button size="small" onClick={downloadTemplate}>
                Download template
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {result && (
        <Stack spacing={2}>
          {wasDryRun && (
            <Alert severity="info">
              <AlertTitle>Nothing was saved</AlertTitle>
              This is what applying the file would do. Rows listed as failed would still fail on a real
              run, for the same reason.
            </Alert>
          )}
          {newlyFrozen > 0 && (
            <Alert severity={wasDryRun ? 'warning' : 'success'}>
              {newlyFrozen} employee{newlyFrozen === 1 ? '' : 's'}{' '}
              {wasDryRun ? 'would have their' : 'had their'} structure frozen for the first time
              {wasDryRun ? '' : ' — their components no longer follow gross salary'}.
            </Alert>
          )}
          <BulkImportSummary
            result={result}
            succeededColumns={columns}
            getSucceededRowId={(row) => row.userId}
            succeededMessage={
              wasDryRun
                ? 'These structures would be overridden.'
                : 'These structures were overridden and are now frozen.'
            }
          />
        </Stack>
      )}
    </>
  );
}
