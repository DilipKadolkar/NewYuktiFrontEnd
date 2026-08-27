import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ScopedReportPage from './ScopedReportPage';
import StatCard from '../../components/StatCard';
import MoneyText, { formatMoney } from '../../components/MoneyText';
import reportsApi from '../../api/reports';
import { maskSensitive } from '../../utils/mask';

const columns = [
  { field: 'employeeCode', headerName: 'Code', width: 120 },
  { field: 'employeeName', headerName: 'Employee', width: 190 },
  { field: 'departmentName', headerName: 'Department', width: 150 },
  {
    // Masked on screen, full value in the export - the export is the file that
    // goes to the bank, the screen is not.
    field: 'bankAccountNo',
    headerName: 'Bank account',
    width: 190,
    renderCell: (params) => maskSensitive(params.value) || '—',
  },
  {
    field: 'bankIfscNo',
    headerName: 'IFSC',
    width: 150,
    renderCell: (params) => maskSensitive(params.value) || '—',
  },
  { field: 'period', headerName: 'Period', width: 130 },
  {
    field: 'netSalary',
    headerName: 'Amount',
    width: 150,
    renderCell: (params) => <MoneyText value={params.value} />,
  },
  { field: 'remarks', headerName: 'Remarks', width: 240 },
];

function Summary(advice) {
  return (
    <>
      <Grid container spacing={2} sx={{ mb: advice.missingBankDetailsCount > 0 ? 2 : 0 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Employees" value={advice.employeeCount} icon={<GroupsRoundedIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="With an amount to pay" value={advice.payableCount} icon={<PaymentsRoundedIcon />} accent="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total to disburse" value={formatMoney(advice.totalAmount)} icon={<AccountBalanceRoundedIcon />} accent="primary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Missing bank details" value={advice.missingBankDetailsCount} icon={<WarningAmberRoundedIcon />} accent="error.main" />
        </Grid>
      </Grid>
      {advice.missingBankDetailsCount > 0 && (
        <Alert severity="warning">
          {advice.missingBankDetailsCount} employee(s) cannot be paid by transfer until their bank
          account and IFSC are on record. They are listed below rather than dropped, so the total
          above is the full payroll liability — not just the part the bank can settle.
        </Alert>
      )}
    </>
  );
}

export default function BankTransferReport() {
  return (
    <ScopedReportPage
      title="Bank Transfer Advice"
      subtitle="The salary disbursement instruction for the period, with the control totals a bank file is reconciled against"
      period="monthYear"
      fetchFn={reportsApi.bankTransfer}
      exportFn={reportsApi.bankTransferCsv}
      renderSummary={Summary}
      columns={columns}
      getRowId={(row) => row.userId}
      emptyDescription="Payroll has not been generated for this period yet, or no employee matches the filter."
    />
  );
}
