import client from './client';

const holidays = {
  list: (fromDate, toDate) =>
    client.get('/holidays', { params: { fromDate, toDate } }).then((r) => r.data),
  create: (payload) => client.post('/holidays', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/holidays/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/holidays/${id}`).then((r) => r.data),
};

export default holidays;
