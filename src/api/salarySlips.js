import client from './client';

const salarySlips = {
  get: (employeeId, month, year) =>
    client.get(`/salary-slips/${employeeId}`, { params: { month, year } }).then((r) => r.data),
  list: (month, year) =>
    client.get('/salary-slips', { params: { month, year } }).then((r) => r.data),
  printUrl: (employeeId, month, year) =>
    `/api/salary-slips/${employeeId}/print?month=${month}&year=${year}`,
  exportUrl: (month, year) => `/api/salary-slips/export?month=${month}&year=${year}`,
};

export default salarySlips;
