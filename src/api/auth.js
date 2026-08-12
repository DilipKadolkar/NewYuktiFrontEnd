import client from './client';

const auth = {
  login: (username, password) => client.post('/auth/login', { username, password }).then((r) => r.data),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout: (refreshToken) => client.post('/auth/logout', { refreshToken }).then((r) => r.data),
  changePassword: (currentPassword, newPassword) =>
    client.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
};

export default auth;
