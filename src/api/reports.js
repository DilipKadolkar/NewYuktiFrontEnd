import client from './client';

const reports = {
  employees: () => client.get('/reports/employees').then((r) => r.data),
  attendanceMonthly: (month) =>
    client.get('/reports/attendance/monthly', { params: { month } }).then((r) => r.data),
  lateComing: (month) =>
    client.get('/reports/attendance/late-coming', { params: { month } }).then((r) => r.data),
  absent: (month) =>
    client.get('/reports/attendance/absent', { params: { month } }).then((r) => r.data),
  overtime: (month) =>
    client.get('/reports/attendance/overtime', { params: { month } }).then((r) => r.data),
  lop: (month) => client.get('/reports/attendance/lop', { params: { month } }).then((r) => r.data),
  leaveBalances: (year) =>
    client.get('/reports/leave-balances', { params: { year } }).then((r) => r.data),
  payroll: (month, year) =>
    client.get('/reports/payroll', { params: { month, year } }).then((r) => r.data),
  payrollByDepartment: (month, year) =>
    client.get('/reports/payroll/by-department', { params: { month, year } }).then((r) => r.data),
  payrollByCompany: (month, year) =>
    client.get('/reports/payroll/by-company', { params: { month, year } }).then((r) => r.data),
  statutoryPf: (month, year) =>
    client.get('/reports/statutory/pf', { params: { month, year } }).then((r) => r.data),
  statutoryProfessionalTax: (month, year) =>
    client
      .get('/reports/statutory/professional-tax', { params: { month, year } })
      .then((r) => r.data),
  statutoryEsic: (month, year) =>
    client.get('/reports/statutory/esic', { params: { month, year } }).then((r) => r.data),
};

export default reports;
