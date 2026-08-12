import client from './client';

const leaveBalances = {
  forEmployee: (userId, year) =>
    client.get(`/leave-balances/${userId}`, { params: { year } }).then((r) => r.data),
  setQuota: (userId, year, leaveType, quota) =>
    client
      .put(`/leave-balances/${userId}`, null, { params: { year, leaveType, quota } })
      .then((r) => r.data),
};

export default leaveBalances;
