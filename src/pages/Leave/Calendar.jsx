import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import leavesApi from '../../api/leaves';
import { LEAVE_STATUS_COLOR, labelize } from '../../constants/enums';

export default function Calendar() {
  const [fromDate, setFromDate] = useState(dayjs().startOf('month'));
  const [toDate, setToDate] = useState(dayjs().endOf('month'));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    leavesApi
      .calendar(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD'))
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  const grouped = useMemo(() => {
    const map = new Map();
    rows.forEach((leave) => {
      let d = dayjs(leave.fromDate);
      const end = dayjs(leave.toDate);
      while (d.isBefore(end) || d.isSame(end, 'day')) {
        const key = d.format('YYYY-MM-DD');
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(leave);
        d = d.add(1, 'day');
      }
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  return (
    <>
      <PageHeader
        title="Leave Calendar"
        subtitle="Who is on leave, grouped by date"
        actions={
          <>
            <DatePicker label="From" value={fromDate} onChange={setFromDate} slotProps={{ textField: { size: 'small' } }} />
            <DatePicker label="To" value={toDate} onChange={setToDate} slotProps={{ textField: { size: 'small' } }} />
          </>
        }
      />
      {!loading && grouped.length === 0 ? (
        <Alert severity="info">No leave in this range.</Alert>
      ) : (
        <Stack spacing={2}>
          {grouped.map(([date, leaves]) => (
            <Card key={date}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  {dayjs(date).format('dddd, DD MMM YYYY')}
                </Typography>
                <Stack spacing={1.5}>
                  {leaves.map((l) => (
                    <Stack key={l.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.light' }}>
                        {l.employeeName?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {l.employeeName} — {labelize(l.leaveType)} ({labelize(l.duration)})
                      </Typography>
                      <StatusChip value={l.status} colorMap={LEAVE_STATUS_COLOR} />
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
