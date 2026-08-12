import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { downloadCsv } from '../../utils/csv';

// filterType: 'attendanceMonth' (yyyy-MM), 'payrollMonthYear' (separate ints), 'year' (int), 'none'
export default function ReportPage({ title, subtitle, filterType = 'none', fetchFn, columns, getRowId }) {
  const [month, setMonth] = useState(dayjs());
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let call;
    if (filterType === 'attendanceMonth') {
      if (!month) return;
      call = fetchFn(month.format('YYYY-MM'));
    } else if (filterType === 'payrollMonthYear') {
      if (!payrollMonth || !payrollYear) return;
      call = fetchFn(Number(payrollMonth), Number(payrollYear));
    } else if (filterType === 'year') {
      if (!year) return;
      call = fetchFn(Number(year));
    } else {
      call = fetchFn();
    }
    setLoading(true);
    call
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, month, payrollMonth, payrollYear, year]);

  const filters = (
    <>
      {filterType === 'attendanceMonth' && (
        <DatePicker
          label="Month"
          views={['year', 'month']}
          value={month}
          onChange={setMonth}
          slotProps={{ textField: { size: 'small' } }}
        />
      )}
      {filterType === 'payrollMonthYear' && (
        <>
          <TextField
            size="small"
            label="Month"
            value={payrollMonth}
            onChange={(e) => setPayrollMonth(e.target.value.replace(/[^0-9]/g, ''))}
            sx={{ width: 90 }}
          />
          <TextField
            size="small"
            label="Year"
            value={payrollYear}
            onChange={(e) => setPayrollYear(e.target.value.replace(/[^0-9]/g, ''))}
            sx={{ width: 100 }}
          />
        </>
      )}
      {filterType === 'year' && (
        <TextField
          size="small"
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ''))}
          sx={{ width: 100 }}
        />
      )}
      <Button
        startIcon={<DownloadRoundedIcon />}
        onClick={() => downloadCsv(`${title.toLowerCase().replace(/\s+/g, '-')}.csv`, columns, rows)}
        disabled={rows.length === 0}
      >
        Export CSV
      </Button>
    </>
  );

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={filters} />
      <DataTable rows={rows} columns={columns} loading={loading} getRowId={getRowId} height={600} />
    </>
  );
}
