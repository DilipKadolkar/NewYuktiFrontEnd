import { useState } from 'react';
import dayjs from 'dayjs';
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

const NEXT_MONTH = dayjs().add(1, 'month').startOf('month').format('YYYY-MM-DD');

const TEMPLATE = `userId,newGrossSalary,effectiveDate,reason,remarks,medicalAllowance,otherAllowance
SE10012,32500,${NEXT_MONTH},ANNUAL_INCREMENT,FY26 appraisal cycle,2000,1000
SE10098,48000,${NEXT_MONTH},PROMOTION,Promoted to team lead,2000,1400
`;

export default function BulkSalaryRevision() {
  const { enqueueSnackbar } = useSnackbar();
  const { can } = useAuth();
  const canRevise = can('EMPLOYEE_UPDATE');

  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [wasDryRun, setWasDryRun] = useState(false);

  const run = (dryRun) => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    employeesApi
      .bulkSalaryRevision(file, dryRun)
      .then((res) => {
        setResult(res);
        setWasDryRun(dryRun);
        enqueueSnackbar(
          dryRun
            ? `Previewed ${res.totalRows} row(s) — nothing was saved`
            : `Applied ${res.successCount} of ${res.totalRows} revision(s)`,
          { variant: dryRun ? 'info' : res.failureCount > 0 ? 'warning' : 'success' },
        );
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const columns = [
    { field: 'userId', headerName: 'Employee', width: 120 },
    { field: 'employeeName', headerName: 'Name', flex: 1, minWidth: 140 },
    {
      field: 'previousGrossSalary',
      headerName: 'Current gross',
      width: 130,
      renderCell: ({ value }) => <MoneyText value={value} />,
    },
    {
      field: 'newGrossSalary',
      headerName: 'New gross',
      width: 130,
      renderCell: ({ value }) => <MoneyText value={value} />,
    },
    {
      field: 'hikePercent',
      headerName: 'Hike',
      width: 110,
      renderCell: ({ value }) => {
        const pct = Number(value);
        const colour = pct > 0 ? 'success' : pct < 0 ? 'error' : 'default';
        return <Chip size="small" label={`${pct > 0 ? '+' : ''}${pct}%`} color={colour} />;
      },
    },
    {
      field: 'effectiveDate',
      headerName: 'Effective',
      width: 120,
      valueFormatter: (v) => (v ? dayjs(v).format('DD MMM YYYY') : ''),
    },
    { field: 'reason', headerName: 'Reason', width: 170 },
    {
      field: 'medicalAllowance',
      headerName: 'Med. Allow',
      width: 115,
      renderCell: ({ value }) => <MoneyText value={value} />,
    },
    {
      field: 'otherAllowance',
      headerName: 'Other Allow',
      width: 115,
      renderCell: ({ value }) => <MoneyText value={value} />,
    },
  ];

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'salary-revision-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Bulk Salary Revision"
        subtitle="A whole appraisal cycle in one file. Every row is applied independently, so one bad row reports itself and the rest still land."
        actions={
          canRevise && (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => run(true)} disabled={busy || !file}>
                Preview changes
              </Button>
              <Button variant="contained" onClick={() => run(false)} disabled={busy || !file}>
                Apply revisions
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
                <code>userId</code>, <code>newGrossSalary</code>, <code>effectiveDate</code> (yyyy-MM-dd),{' '}
                <code>reason</code> (ANNUAL_INCREMENT, PROMOTION, MARKET_CORRECTION, OTHER),{' '}
                <code>remarks</code>. <code>medicalAllowance</code> and <code>otherAllowance</code> are
                optional for anyone — omit them and they are left as they are. Add{' '}
                <code>basicDA</code>, <code>hra</code>, <code>conveyanceAllowance</code> and{' '}
                <code>educationAllowance</code> only for employees whose salary structure is overridden;
                everyone else has theirs re-derived from the company salary rule.
                <br />
                Report headings work too: <code>Med. Allow</code>, <code>Other Allow</code>,{' '}
                <code>Basic + DA</code>, <code>Con. Allow</code>, <code>Edu. Allow</code>.
              </Typography>
            </Box>

            <Alert severity="info">
              <AlertTitle>Two rules apply to every row</AlertTitle>
              A revision takes effect from the current month onwards — a raise decided this month cannot
              be backdated into a month already worked. And an employee cannot take two revisions on the
              same effective date, so re-uploading a file is refused rather than applied twice.
            </Alert>

            <Typography variant="body2" color="text.secondary">
              Payroll works out which salary applied on which day from these rows, so a wrong effective
              date reprices a period rather than just mis-recording it. Preview first.
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
          <BulkImportSummary
            result={result}
            succeededColumns={columns}
            getSucceededRowId={(row) => `${row.userId}-${row.effectiveDate}`}
            succeededMessage={
              wasDryRun
                ? 'These revisions would be applied.'
                : 'These revisions were applied and recorded in each employee’s salary history.'
            }
          />
        </Stack>
      )}
    </>
  );
}
