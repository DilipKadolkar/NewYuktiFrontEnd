import client from './client';

const leaves = {
  apply: (payload) => client.post('/leaves', payload).then((r) => r.data),
  hrDirectCreate: (payload) => client.post('/leaves/hr-create', payload).then((r) => r.data),
  // CSV bulk backfill of already-approved leaves - see employees.js's bulkImport for why
  // 'Content-Type': undefined (lets the browser set multipart/form-data with its boundary).
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client
      .post('/leaves/bulk-import', formData, { headers: { 'Content-Type': undefined } })
      .then((r) => r.data);
  },
  supervisorApprove: (id, payload) =>
    client.post(`/leaves/${id}/supervisor-approve`, payload).then((r) => r.data),
  approve: (id, payload) => client.post(`/leaves/${id}/approve`, payload).then((r) => r.data),
  reject: (id, payload) => client.post(`/leaves/${id}/reject`, payload).then((r) => r.data),
  cancel: (id, payload) => client.post(`/leaves/${id}/cancel`, payload).then((r) => r.data),
  get: (id) => client.get(`/leaves/${id}`).then((r) => r.data),
  forEmployee: (userId) => client.get(`/leaves/employee/${userId}`).then((r) => r.data),
  pendingFor: (supervisorUserId) =>
    client.get(`/leaves/pending/${supervisorUserId}`).then((r) => r.data),
  byStatus: (status) => client.get('/leaves', { params: { status } }).then((r) => r.data),
  calendar: (fromDate, toDate) =>
    client.get('/leaves/calendar', { params: { fromDate, toDate } }).then((r) => r.data),
};

export default leaves;
