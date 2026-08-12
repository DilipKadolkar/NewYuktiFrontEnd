import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { useSnackbar } from 'notistack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import EmployeePicker from '../../components/EmployeePicker';
import shiftSchedulesApi from '../../api/shiftSchedules';
import { useActingAs } from '../../context/ActingAsContext';

export default function Planner() {
  const { enqueueSnackbar } = useSnackbar();
  const { isSupervisor, actingAs } = useActingAs();
  const [month, setMonth] = useState(dayjs());
  const [supervisorUserId, setSupervisorUserId] = useState(
    isSupervisor ? actingAs?.userId : null
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overriding, setOverriding] = useState(false);

  const load = () => {
    if (!month) return;
    setLoading(true);
    shiftSchedulesApi
      .planner(month.format('YYYY-MM'), supervisorUserId || undefined)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [month, supervisorUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = useMemo(() => {
    if (!data) return [];
    const dateCols = data.dates.map((d) => ({
      field: d,
      headerName: dayjs(d).format('DD'),
      width: 64,
      sortable: false,
      renderCell: (params) => {
        const value = params.value;
        if (!value) return null;
        if (value === 'WO') return <Chip label="WO" size="small" />;
        return <Chip label={value} size="small" color="primary" variant="outlined" />;
      },
    }));
    return [
      { field: 'employeeName', headerName: 'Employee', width: 170 },
      { field: 'userId', headerName: 'User ID', width: 100 },
      ...dateCols,
    ];
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.rows.map((r) => ({
      id: r.userId,
      userId: r.userId,
      employeeName: r.employeeName,
      ...r.shiftByDate,
    }));
  }, [data]);

  const handleHolidayOverride = () => {
    setOverriding(true);
    shiftSchedulesApi
      .holidayOverride(month.format('YYYY-MM'))
      .then((res) => {
        enqueueSnackbar(`Holiday override applied to ${res.updatedDays ?? 0} day(s)`, {
          variant: 'success',
        });
        load();
      })
      .catch(() => {})
      .finally(() => setOverriding(false));
  };

  return (
    <>
      <PageHeader
        title="Roster Planner"
        subtitle="One row per employee, one column per date — shift code or WO for weekly off"
        actions={
          <>
            <DatePicker
              label="Month"
              views={['year', 'month']}
              value={month}
              onChange={setMonth}
              slotProps={{ textField: { size: 'small' } }}
            />
            <EmployeePicker
              label="Supervisor filter"
              value={supervisorUserId}
              onChange={setSupervisorUserId}
              filterRole="SUPERVISOR"
            />
            <Button variant="outlined" onClick={handleHolidayOverride} disabled={overriding}>
              Apply holiday override
            </Button>
          </>
        }
      />
      {!loading && (!data || rows.length === 0) ? (
        <Alert severity="info">No roster found for this month/filter yet.</Alert>
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          loading={loading}
          height={620}
          pageSize={25}
          density="compact"
        />
      )}
    </>
  );
}
