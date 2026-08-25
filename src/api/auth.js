import client, { setAccessToken } from './client';

// The refresh token never appears in any of these signatures: it is set,
// rotated and cleared by the server as an httpOnly cookie, so there is
// nothing for this module to hold or pass along. See api/client.js.
const auth = {
  login: (username, password) =>
    client.post('/auth/login', { username, password }).then((r) => {
      setAccessToken(r.data.accessToken);
      return r.data;
    }),
  // Sends no body - the browser attaches the refresh cookie automatically.
  logout: () =>
    client.post('/auth/logout').then((r) => {
      setAccessToken(null);
      return r.data;
    }),
  changePassword: (currentPassword, newPassword) =>
    client.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
};

export default auth;
