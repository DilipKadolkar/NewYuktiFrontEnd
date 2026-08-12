import client from './client';

const dashboard = {
  get: (asOf) => client.get('/dashboard', { params: { asOf } }).then((r) => r.data),
};

export default dashboard;
