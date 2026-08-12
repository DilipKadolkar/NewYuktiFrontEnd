import client from './client';

const shiftSchedules = {
  assignOne: (payload) => client.post('/shift-schedules', payload).then((r) => r.data),
  bulkAssign: (payload) => client.post('/shift-schedules/bulk', payload).then((r) => r.data),
  autoRotate: (payload) => client.post('/shift-schedules/auto-rotate', payload).then((r) => r.data),
  copyMonth: (payload) => client.post('/shift-schedules/copy-month', payload).then((r) => r.data),
  swap: (payload) => client.post('/shift-schedules/swap', payload).then((r) => r.data),
  holidayOverride: (month) =>
    client
      .post('/shift-schedules/holiday-override', null, { params: { month } })
      .then((r) => r.data),
  forUser: (userId, fromDate, toDate) =>
    client
      .get(`/shift-schedules/${userId}`, { params: { fromDate, toDate } })
      .then((r) => r.data),
  planner: (month, supervisorUserId) =>
    client
      .get('/shift-schedules/planner', { params: { month, supervisorUserId } })
      .then((r) => r.data),
  deleteRange: (userId, fromDate, toDate) =>
    client
      .delete(`/shift-schedules/${userId}`, { params: { fromDate, toDate } })
      .then((r) => r.data),
};

export default shiftSchedules;
