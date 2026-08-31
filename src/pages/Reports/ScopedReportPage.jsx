import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import MonthPicker from '../../components/MonthPicker';
import departmentsApi from '../../api/departments';
import designationsApi from '../../api/designations';
import categoriesApi from '../../api/categories';
import { downloadCsv } from '../../utils/csv';
import { downloadBlob } from '../../utils/download';

/**
 * The page shell the reports added for greytHR parity share.
 *
 * <p>Deliberately separate from {@link ReportPage} rather than an extension of
 * it: the thirteen reports already built pass their period as positional
 * arguments and have no scope filters, and widening that component's contract
 * to cover date ranges, quarters, server-rendered exports and a summary panel
 * would have meant touching every one of them. This one takes a single params
 * object instead, which is what the new endpoints accept.
 *
 * `period` picks the filter row: 'monthYear' (month + year ints), 'month'
 * (yyyy-MM), 'dateRange' (from/to dates), 'quarter' (financial year + quarter)
 * or 'asOf' (a single date).
 *
 * `onRowClick` is handed the grid event and the current params, because a
 * drill-down needs the selected period and the report rows themselves don't
 * carry it - it is the same for every row, so repeating it on each would be
 * payload for nothing.
 */
export default function ScopedReportPage({
  title,
  subtitle,
  period = 'monthYear',
  fetchFn,
  exportFn,
  columns,
  getRowId,
  scoped = true,
  summaryFn,
  renderSummary,
  note,
  onRowClick,
  height = 600,
  emptyDescription,
}) {
  const today = dayjs();
  const [monthValue, setMonthValue] = useState(today);
  const [fromDate, setFromDate] = useState(today.startOf('year'));
  const [toDate, setToDate] = useState(today.endOf('year'));
  const [asOf, setAsOf] = useState(today);
  // April-March: before April the current financial year is still the previous one.
  const [financialYear, setFinancialYear] = useState(
    today.month() >= 3 ? today.year() : today.year() - 1
  );
  const [quarter, setQuarter] = useState(1);

  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [masters, setMasters] = useState({ departments: [], designations: [], categories: [] });

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!scoped) return;
    Promise.all([
      departmentsApi.list().catch(() => []),
      designationsApi.list().catch(() => []),
      categoriesApi.list().catch(() => []),
    ]).then(([departments, designations, categories]) =>
      setMasters({ departments, designations, categories })
    );
  }, [scoped]);

  const params = useMemo(() => {
    const scope = scoped
      ? { departmentId: departmentId || undefined, designationId: designationId || undefined, categoryId: categoryId || undefined }
      : {};
    if (period === 'monthYear') {
      return { month: monthValue?.month() + 1, year: monthValue?.year(), ...scope };
    }
    if (period === 'month') {
      return { month: monthValue?.format('YYYY-MM'), ...scope };
    }
    if (period === 'dateRange') {
      return { from: fromDate?.format('YYYY-MM-DD'), to: toDate?.format('YYYY-MM-DD'), ...scope };
    }
    if (period === 'quarter') {
      return { financialYear: Number(financialYear), quarter: Number(quarter), ...scope };
    }
    return { asOf: asOf?.format('YYYY-MM-DD'), ...scope };
  }, [
    period, monthValue, fromDate, toDate, asOf, financialYear, quarter,
    departmentId, designationId, categoryId, scoped,
  ]);

  // Guards the fetch against a half-cleared picker: DatePicker hands back null
  // while the user is retyping, and firing the request then just 400s.
  const paramsReady = useMemo(() => {
    if (period === 'monthYear' || period === 'month') return Boolean(monthValue?.isValid());
    if (period === 'dateRange') return Boolean(fromDate?.isValid() && toDate?.isValid());
    if (period === 'quarter') return Boolean(financialYear && quarter);
    return Boolean(asOf?.isValid());
  }, [period, monthValue, fromDate, toDate, asOf, financialYear, quarter]);

  useEffect(() => {
    if (!paramsReady) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchFn(params).catch(() => []),
      summaryFn ? summaryFn(params).catch(() => null) : Promise.resolve(null),
    ]).then(([fetchedRows, fetchedSummary]) => {
      if (cancelled) return;
      // A report whose payload is an object with its own rows (the bank advice,
      // which carries control totals alongside them) still renders in the grid.
      setRows(Array.isArray(fetchedRows) ? fetchedRows : fetchedRows?.rows || []);
      setSummary(summaryFn ? fetchedSummary : (Array.isArray(fetchedRows) ? null : fetchedRows));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, paramsReady]);

  const fileStem = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleExport = useCallback(() => {
    if (!exportFn) {
      downloadCsv(`${fileStem}.csv`, columns, rows);
      return;
    }
    // The server export is the richer one where it exists - it appends the
    // control totals the grid cannot show - so prefer it and fall back to the
    // on-screen columns only if it fails.
    setExporting(true);
    exportFn(params)
      .then((blob) => downloadBlob(`${fileStem}.csv`, blob))
      .catch(() => downloadCsv(`${fileStem}.csv`, columns, rows))
      .finally(() => setExporting(false));
  }, [exportFn, fileStem, columns, rows, params]);

  const masterSelect = (label, value, onChange, options, idKey, nameKey) => (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: 150 }}
    >
      <MenuItem value="">All</MenuItem>
      {options.map((option) => (
        <MenuItem key={option[idKey]} value={option[idKey]}>
          {option[nameKey]}
        </MenuItem>
      ))}
    </TextField>
  );

  const filters = (
    <>
      {(period === 'monthYear' || period === 'month') && (
        <MonthPicker value={monthValue} onChange={setMonthValue} />
      )}
      {period === 'dateRange' && (
        <>
          <DatePicker
            label="From"
            value={fromDate}
            onChange={setFromDate}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="To"
            value={toDate}
            onChange={setToDate}
            slotProps={{ textField: { size: 'small' } }}
          />
        </>
      )}
      {period === 'quarter' && (
        <>
          <TextField
            size="small"
            label="Financial year"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value.replace(/[^0-9]/g, ''))}
            helperText="Year the April falls in"
            sx={{ width: 140 }}
          />
          <TextField
            select
            size="small"
            label="Quarter"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value={1}>Q1 Apr–Jun</MenuItem>
            <MenuItem value={2}>Q2 Jul–Sep</MenuItem>
            <MenuItem value={3}>Q3 Oct–Dec</MenuItem>
            <MenuItem value={4}>Q4 Jan–Mar</MenuItem>
          </TextField>
        </>
      )}
      {period === 'asOf' && (
        <DatePicker
          label="As at"
          value={asOf}
          onChange={setAsOf}
          slotProps={{ textField: { size: 'small' } }}
        />
      )}

      {scoped && (
        <>
          {masterSelect('Department', departmentId, setDepartmentId, masters.departments, 'id', 'departmentName')}
          {masterSelect('Designation', designationId, setDesignationId, masters.designations, 'id', 'designationName')}
          {masterSelect('Category', categoryId, setCategoryId, masters.categories, 'id', 'categoryName')}
        </>
      )}

      <Button
        startIcon={<DownloadRoundedIcon />}
        onClick={handleExport}
        disabled={rows.length === 0 || exporting}
      >
        Export CSV
      </Button>
    </>
  );

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={filters} />
      {/* Standing caveat about the data itself - shown whether or not there are
          rows, unlike the summary panel, which describes a result set. */}
      {note && <Box sx={{ mb: 3 }}>{note}</Box>}
      {renderSummary && summary && <Box sx={{ mb: 3 }}>{renderSummary(summary, loading)}</Box>}
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={getRowId}
        height={height}
        onRowClick={onRowClick ? (event) => onRowClick(event, params) : undefined}
        sx={onRowClick ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : undefined}
        emptyState={{
          title: 'No data for this report',
          description: emptyDescription || 'Try a different period or filter.',
        }}
      />
    </>
  );
}
