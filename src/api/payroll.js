import client from './client';

const payroll = {
  generate: (payload) => client.post('/payroll/generate', payload).then((r) => r.data),
  regenerate: (payload) => client.post('/payroll/regenerate', payload).then((r) => r.data),
  generateAll: (month, year, generatedBy) =>
    client
      .post('/payroll/generate-all', null, { params: { month, year, generatedBy } })
      .then((r) => r.data),
  get: (id) => client.get(`/payroll/${id}`).then((r) => r.data),
  forEmployee: (employeeId) => client.get(`/payroll/employee/${employeeId}`).then((r) => r.data),
  forEmployeePeriod: (employeeId, month, year) =>
    client
      .get(`/payroll/employee/${employeeId}/period`, { params: { month, year } })
      .then((r) => r.data),
  revisions: (employeeId, month, year) =>
    client
      .get(`/payroll/employee/${employeeId}/revisions`, { params: { month, year } })
      .then((r) => r.data),
  list: (month, year) => client.get('/payroll', { params: { month, year } }).then((r) => r.data),
  // CSV bulk run for a whole company, one row per employee carrying that month's one-off
  // bonus/incentive/deduction amounts - month/year apply to the whole file. A row whose period
  // is already generated is reported as a row error unless regenerate=true. Returns
  // BulkImportResult<Payroll>.
  bulkGenerate: (file, month, year, regenerate = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return client
      .post('/payroll/bulk-generate', formData, {
        params: { month, year, regenerate },
        headers: { 'Content-Type': undefined },
      })
      .then((r) => r.data);
  },
};

export default payroll;
