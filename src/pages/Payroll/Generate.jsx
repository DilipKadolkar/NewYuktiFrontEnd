import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import EmployeePicker from '../../components/EmployeePicker';
import MoneyText from '../../components/MoneyText';
import payrollApi from '../../api/payroll';
import { useActingAs } from '../../context/ActingAsContext';

const MONEY_FIELDS = [
  { name: 'advanceDeduction', label: 'Advance deduction' },
  { name: 'loanDeduction', label: 'Loan deduction' },
  { name: 'tds', label: 'TDS' },
  { name: 'canteen', label: 'Canteen' },
  { name: 'bonus', label: 'Bonus' },
  { name: 'incentive', label: 'Incentive' },
];

function Field({ label, value }) {
  return (
    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Grid>
  );
}

export default function Generate() {
  const { enqueueSnackbar } = useSnackbar();
  const { actingAs } = useActingAs();
  const [employeeId, setEmployeeId] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amounts, setAmounts] = useState({
    advanceDeduction: 0,
    loanDeduction: 0,
    tds: 0,
    canteen: 0,
    bonus: 0,
    incentive: 0,
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [conflict, setConflict] = useState(false);

  const isValid = employeeId && month >= 1 && month <= 12 && year;

  const buildPayload = () => ({
    employeeId,
    month: Number(month),
    year: Number(year),
    ...amounts,
    generatedBy: actingAs?.userId,
  });

  const runGenerate = (fn) => {
    setSaving(true);
    setConflict(false);
    fn(buildPayload())
      .then((res) => {
        setResult(res);
        enqueueSnackbar('Payroll generated', { variant: 'success' });
      })
      .catch((err) => {
        if (err.status === 409) setConflict(true);
      })
      .finally(() => setSaving(false));
  };

  return (
    <>
      <PageHeader
        title="Generate Payroll"
        subtitle="One employee, one period. Attendance for the period must already be generated."
        actions={
          <Button variant="contained" onClick={() => runGenerate(payrollApi.generate)} disabled={!isValid || saving}>
            Generate
          </Button>
        }
      />
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <EmployeePicker label="Employee" value={employeeId} onChange={setEmployeeId} />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Year"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Grid>
            {MONEY_FIELDS.map((f) => (
              <Grid key={f.name} size={{ xs: 6, sm: 4, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={f.label}
                  value={amounts[f.name]}
                  onChange={(e) =>
                    setAmounts((prev) => ({ ...prev, [f.name]: e.target.value.replace(/[^0-9.]/g, '') }))
                  }
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {conflict && (
        <Alert
          severity="warning"
          sx={{ mb: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={() => runGenerate(payrollApi.regenerate)}>
              Regenerate
            </Button>
          }
        >
          This period is already generated. Regenerate to create a new revision (the old one is marked
          superseded).
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader
            title={
              <Typography variant="subtitle1">
                {result.employeeName} — {result.month}/{result.year} (revision {result.revision})
              </Typography>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Attendance
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Field label="Working days" value={result.workingDays} />
              <Field label="Present days" value={result.presentDays} />
              <Field label="Paid leave days" value={result.paidLeaveDays} />
              <Field label="LOP days" value={result.lopDays} />
              <Field label="Payable days" value={result.payableDays} />
              <Field label="Overtime hours" value={result.overtimeHours} />
            </Grid>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Earnings
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Field label="Basic + DA" value={<MoneyText value={result.earnBasicDA} />} />
              <Field label="HRA" value={<MoneyText value={result.earnHra} />} />
              <Field label="Conveyance" value={<MoneyText value={result.earnConveyance} />} />
              <Field label="Education" value={<MoneyText value={result.earnEducation} />} />
              <Field label="Medical" value={<MoneyText value={result.earnMedical} />} />
              <Field label="Other" value={<MoneyText value={result.earnOther} />} />
              <Field label="Overtime" value={<MoneyText value={result.otAllowance} />} />
              <Field label="Bonus" value={<MoneyText value={result.bonus} />} />
              <Field label="Incentive" value={<MoneyText value={result.incentive} />} />
              <Field label="Total earnings" value={<MoneyText value={result.totalEarnings} />} />
            </Grid>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Deductions
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Field label="PF" value={<MoneyText value={result.pfDeduction} />} />
              <Field label="ESIC" value={<MoneyText value={result.esic} />} />
              <Field label="Professional tax" value={<MoneyText value={result.professionalTax} />} />
              <Field label="MLWF" value={<MoneyText value={result.mlwf} />} />
              <Field label="TDS" value={<MoneyText value={result.tds} />} />
              <Field label="Advance" value={<MoneyText value={result.advanceDeduction} />} />
              <Field label="Loan" value={<MoneyText value={result.loanDeduction} />} />
              <Field label="Canteen" value={<MoneyText value={result.canteen} />} />
              <Field label="Total deductions" value={<MoneyText value={result.totalDeduction} />} />
            </Grid>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6">
              Net salary: <MoneyText value={result.netSalary} />
            </Typography>
          </CardContent>
        </Card>
      )}
    </>
  );
}
