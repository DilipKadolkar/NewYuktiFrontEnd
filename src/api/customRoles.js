import client from './client';

// Phase 10: company-scoped custom roles, additive on top of an employee's
// fixed Role. ADMIN-only (ROLE_MANAGE / ROLE_READ) - see CustomRoleController.
const customRoles = {
  list: () => client.get('/roles').then((r) => r.data),
  get: (id) => client.get(`/roles/${id}`).then((r) => r.data),
  create: (payload) => client.post('/roles', payload).then((r) => r.data),
  setPermissions: (id, permissionCodes) =>
    client.put(`/roles/${id}/permissions`, { permissionCodes }).then((r) => r.data),
  remove: (id) => client.delete(`/roles/${id}`).then((r) => r.data),
  assign: (id, userId) => client.post(`/roles/${id}/employees/${userId}`).then((r) => r.data),
  unassign: (id, userId) => client.delete(`/roles/${id}/employees/${userId}`).then((r) => r.data),
  listForEmployee: (userId) => client.get(`/roles/employees/${userId}`).then((r) => r.data),
};

export default customRoles;
