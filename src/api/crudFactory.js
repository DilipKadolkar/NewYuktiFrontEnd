import client from './client';

export const createCrudApi = (basePath) => ({
  list: () => client.get(basePath).then((r) => r.data),
  get: (id) => client.get(`${basePath}/${id}`).then((r) => r.data),
  create: (payload) => client.post(basePath, payload).then((r) => r.data),
  update: (id, payload) => client.put(`${basePath}/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`${basePath}/${id}`).then((r) => r.data),
});
