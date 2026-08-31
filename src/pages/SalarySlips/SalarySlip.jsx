import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from '../../components/PageHeader';
import EmployeePicker from '../../components/EmployeePicker';
import MoneyText from '../../components/MoneyText';
import salarySlipsApi from '../../api/salarySlips';

export default function SalarySlip({ fixedEmployeeId }) {
  const [employeeId, setEmployeeId] = useState(fixedEmployeeId || null);
  const [period, setPeriod] = useState(dayjs());
  const month = period ? period.month() + 1 : null;
  const year = period ? period.year() : null;
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (fixedEmployeeId) setEmployeeId(fixedEmployeeId);
  }, [fixedEmployeeId]);

  useEffect(() => {
    if (!employeeId || !month || !year) return;
    setLoading(true);
    setError(false);
    salarySlipsApi
      .get(employeeId, Number(month), Number(year))
      .then(setSlip)
      .catch(() => {
        setSlip(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [employeeId, month, year]);

  return (
    <>
      <PageHeader
        title={fixedEmployeeId ? 'My Salary Slip' : 'Salary Slips'}
        subtitle="Read straight from the payroll snapshot — reprinting an old month always gives the same figures"
        actions={
          <>
            {!fixedEmployeeId && (
              <EmployeePicker label="Employee" value={employeeId} onChange={setEmployeeId} />
            )}
            <DatePicker
              label="Month"
              views={['year', 'month']}
              value={period}
              onChange={setPeriod}
              slotProps={{ textField: { size: 'small' } }}
            />
            {employeeId && slip && (
              <Button
                startIcon={<PrintRoundedIcon />}
                onClick={() =>
                  window.open(
                    salarySlipsApi.printUrl(employeeId, month, year),
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
              >
                Print
              </Button>
            )}
            {/* Whole-company export - HR/Admin only view, not shown on the
                employee's own self-service salary-slip screen. */}
            {!fixedEmployeeId && (
              <Button
                startIcon={<DownloadRoundedIcon />}
                onClick={() =>
                  window.open(salarySlipsApi.exportUrl(month, year), '_blank', 'noopener,noreferrer')
                }
              >
                Export month CSV
              </Button>
            )}
          </>
        }
      />

      {!employeeId ? (
        <Alert severity="info">Pick an employee to view their salary slip.</Alert>
      ) : loading ? (
        <Skeleton variant="rounded" height={420} sx={{ maxWidth: 720 }} />
      ) : error ? (
        <Alert severity="warning">
          No salary slip for this period — payroll may not have been generated yet.
        </Alert>
      ) : (
        slip && (
          <Card sx={{ maxWidth: 720 }}>
            <CardContent>
              <Stack sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6">{slip.companyName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Salary Slip — {slip.period}
                </Typography>
              </Stack>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid size={6}>
                  <Typography variant="body2">
                    <strong>{slip.employeeName}</strong> ({slip.employeeCode})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {slip.departmentName} — {slip.designationName}
                  </Typography>
                </Grid>
                <Grid size={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Payable days: {slip.attendance?.payableDays} / {slip.attendance?.workingDays}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    LOP days: {slip.attendance?.lopDays}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Earnings
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {slip.earnings?.map((line) => (
                        <TableRow key={line.label}>
                          <TableCell sx={{ border: 0, pl: 0 }}>{line.label}</TableCell>
                          <TableCell sx={{ border: 0, pr: 0 }} align="right">
                            <MoneyText value={line.amount} />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell sx={{ borderBottom: 0, pl: 0, fontWeight: 700 }}>Total</TableCell>
                        <TableCell sx={{ borderBottom: 0, pr: 0, fontWeight: 700 }} align="right">
                          <MoneyText value={slip.totalEarnings} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Deductions
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {slip.deductions?.map((line) => (
                        <TableRow key={line.label}>
                          <TableCell sx={{ border: 0, pl: 0 }}>{line.label}</TableCell>
                          <TableCell sx={{ border: 0, pr: 0 }} align="right">
                            <MoneyText value={line.amount} />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell sx={{ borderBottom: 0, pl: 0, fontWeight: 700 }}>Total</TableCell>
                        <TableCell sx={{ borderBottom: 0, pr: 0, fontWeight: 700 }} align="right">
                          <MoneyText value={slip.totalDeductions} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Stack sx={{ alignItems: 'flex-end' }}>
                <Typography variant="h6">
                  Net pay: <MoneyText value={slip.netSalary} />
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {slip.netSalaryInWords}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )
      )}
    </>
  );
}
