import client from './client';

const auditLogs = {
  recent: (limit = 50) => client.get('/audit-logs', { params: { limit } }).then((r) => r.data),
  // Unbounded CSV export for a date range - AUDIT_READ, same permission as recent().
  exportCsv: (fromDate, toDate) =>
    client
      .get('/audit-logs/export', { params: { fromDate, toDate }, responseType: 'blob' })
      .then((r) => r.data),
  // Purges rows older than beforeDate - AUDIT_MANAGE, platform-only.
  purge: (beforeDate) => client.delete('/audit-logs', { params: { beforeDate } }).then((r) => r.data),
};

export default auditLogs;
