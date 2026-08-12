import dayjs from 'dayjs';
import ReportPage from './ReportPage';

const columns = [
  { field: 'userId', headerName: 'User ID', width: 100 },
  { field: 'employeeName', headerName: 'Employee', width: 200 },
  {
    field: 'date',
    headerName: 'Date',
    width: 140,
    valueFormatter: (v) => (v ? dayjs(v).format('DD MMM YYYY') : ''),
  },
  { field: 'detail', headerName: 'Detail', flex: 1, minWidth: 240 },
];

export default function ExceptionReport({ title, subtitle, fetchFn }) {
  return (
    <ReportPage
      title={title}
      subtitle={subtitle}
      filterType="attendanceMonth"
      fetchFn={fetchFn}
      columns={columns}
      getRowId={(r) => `${r.userId}-${r.date}`}
    />
  );
}
