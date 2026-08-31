import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/auth';
import employeesApi from '../api/employees';
import { setAccessToken, refreshSession, registerAuthExpiredHandler } from '../api/client';
import { hasPermission } from '../constants/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  // Nothing is seeded from storage any more. Identity used to be read
  // synchronously out of localStorage alongside the tokens; now the tokens are
  // an httpOnly cookie plus an in-memory access token, so the session is
  // re-established by asking the server on boot (see the hydrate effect below).
  // That also means role and company can never be a stale copy the browser
  // kept after they changed server-side.
  const [principalType, setPrincipalType] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [me, setMe] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback((session) => {
    setPrincipalType(session.principalType);
    setUsername(session.username);
    setRole(session.role);
    setMustChangePassword(!!session.mustChangePassword);
  }, []);

  const loadProfile = useCallback((uname, ptype) => {
    if (ptype !== 'EMPLOYEE') {
      setMe(null);
      setEmployees([]);
      return Promise.resolve();
    }
    return Promise.all([
      employeesApi.getByUserId(uname).catch(() => null),
      employeesApi.list().catch(() => []),
    ]).then(([profile, list]) => {
      setMe(profile);
      setEmployees(list);
    });
  }, []);

  const reloadEmployees = useCallback(() => {
    if (principalType !== 'EMPLOYEE') return Promise.resolve();
    return employeesApi
      .list()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, [principalType]);

  const clearState = useCallback(() => {
    setAccessToken(null);
    setPrincipalType(null);
    setUsername(null);
    setRole(null);
    setMustChangePassword(false);
    setMe(null);
    setEmployees([]);
  }, []);

  // Restore the session on mount (first visit, page refresh, reopened tab).
  // The refresh cookie is the only thing that survives a reload, so this is
  // what turns it back into an access token. A visitor with no cookie - or a
  // revoked or expired one - simply gets a 401 here and stays signed out; the
  // call goes through bare axios, so that expected rejection never surfaces as
  // an error toast.
  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((session) => {
        if (cancelled) return undefined;
        applySession(session);
        return loadProfile(session.username, session.principalType);
      })
      .catch(() => {
        // No usable session. Not an error worth showing anyone.
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // client.js calls this when a 401 survives a refresh attempt.
  useEffect(() => {
    registerAuthExpiredHandler(() => {
      clearState();
      navigate('/login', { replace: true });
    });
    return () => registerAuthExpiredHandler(null);
  }, [clearState, navigate]);

  const login = useCallback(
    (usernameInput, password) =>
      // authApi.login puts the access token in memory itself; the refresh token
      // arrives as a Set-Cookie this code never sees.
      authApi.login(usernameInput, password).then((res) => {
        applySession(res);
        return loadProfile(res.username, res.principalType).then(() => res);
      }),
    [applySession, loadProfile]
  );

  const logout = useCallback(
    () =>
      // Always clear locally, even if the server call fails - a network error
      // must not leave the UI believing it is still signed in.
      authApi
        .logout()
        .catch(() => {})
        .finally(() => clearState()),
    [clearState]
  );

  const isPlatform = principalType === 'PLATFORM';
  const isAuthenticated = !!principalType && !!username;
  const isAdmin = role === 'ADMIN';
  const isHr = role === 'HR';
  const isHrOrAdmin = isAdmin || isHr;
  const isSupervisor = role === 'SUPERVISOR';
  const isSupervisorOrAbove = isHrOrAdmin || isSupervisor;
  const isEmployee = role === 'EMPLOYEE';

  const can = useCallback((code) => hasPermission(role, code), [role]);

  const value = useMemo(
    () => ({
      principalType,
      username,
      role,
      mustChangePassword,
      me,
      employees,
      initializing,
      isAuthenticated,
      isPlatform,
      isAdmin,
      isHr,
      isHrOrAdmin,
      isSupervisor,
      isSupervisorOrAbove,
      isEmployee,
      can,
      login,
      logout,
      reloadEmployees,
    }),
    [
      principalType,
      username,
      role,
      mustChangePassword,
      me,
      employees,
      initializing,
      isAuthenticated,
      isPlatform,
      isAdmin,
      isHr,
      isHrOrAdmin,
      isSupervisor,
      isSupervisorOrAbove,
      isEmployee,
      can,
      login,
      logout,
      reloadEmployees,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
