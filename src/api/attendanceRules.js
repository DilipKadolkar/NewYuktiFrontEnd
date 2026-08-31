import client from './client';

const attendanceRules = {
  get: () => client.get('/attendance-rules').then((r) => r.data),
  update: (payload) => client.put('/attendance-rules', payload).then((r) => r.data),
};

export default attendanceRules;
