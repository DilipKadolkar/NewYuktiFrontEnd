import client from './client';

const employees = {
  list: () => client.get('/employees').then((r) => r.data),
  get: (id) => client.get(`/employees/${id}`).then((r) => r.data),
  getByUserId: (userId) => client.get(`/employees/by-user-id/${userId}`).then((r) => r.data),
  create: (payload) => client.post('/employees', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/employees/${id}`, payload).then((r) => r.data),
  deactivate: (id) => client.delete(`/employees/${id}`).then((r) => r.data),
  team: (supervisorUserId) =>
    client.get(`/employees/${supervisorUserId}/team`).then((r) => r.data),
  reassignSupervisor: (userId, supervisorUserId) =>
    client
      .patch(`/employees/${userId}/supervisor`, null, { params: { supervisorUserId } })
      .then((r) => r.data),
  // Returns { employee, temporaryPassword } - same one-time-reveal contract as create().
  resetPassword: (id) => client.post(`/employees/${id}/reset-password`).then((r) => r.data),
  // Manually pins basicDA/hra/conveyanceAllowance/educationAllowance, overriding what SalaryRule
  // would otherwise derive - sticky until regenerateSalaryStructure() is called for this employee.
  updateSalaryStructure: (id, payload) =>
    client.put(`/employees/${id}/salary-structure`, payload).then((r) => r.data),
  // Clears the override (if any) and recomputes this employee's structure from the current SalaryRule.
  regenerateSalaryStructure: (id) =>
    client.post(`/employees/${id}/salary-structure/regenerate`).then((r) => r.data),
  // Same regeneration for every non-overridden employee in the company; returns { regenerated: n }.
  regenerateAllSalaryStructures: () =>
    client.post('/employees/salary-structure/regenerate-all').then((r) => r.data),
  // Hike/promotion/correction: updates grossSalary and re-derives basicDA/hra/conveyanceAllowance/
  // educationAllowance from the current SalaryRule - unless the employee is overridden, in which
  // case the payload must also carry those four replacement values (a frozen structure never
  // follows grossSalary on its own). Always logs a SalaryRevision row, unlike a plain update().
  reviseSalary: (id, payload) =>
    client.post(`/employees/${id}/salary-revision`, payload).then((r) => r.data),
  // Full history for one employee, newest effectiveDate first.
  getSalaryRevisions: (id) => client.get(`/employees/${id}/salary-revisions`).then((r) => r.data),
  // CSV bulk onboarding, one row per employee - same create() path per row, so a bad
  // row never blocks the rest of the file. Returns BulkImportResult<{employee, temporaryPassword}>.
  // 'Content-Type': undefined lets the browser set multipart/form-data with its boundary -
  // client.js's default 'application/json' header would otherwise make axios JSON-encode the FormData.
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client
      .post('/employees/bulk-import', formData, { headers: { 'Content-Type': undefined } })
      .then((r) => r.data);
  },
};

export default employees;
