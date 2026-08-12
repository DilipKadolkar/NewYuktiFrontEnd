import client from './client';

const salaryRules = {
  get: () => client.get('/salary-rules').then((r) => r.data),
  update: (payload) => client.put('/salary-rules', payload).then((r) => r.data),
};

export default salaryRules;
