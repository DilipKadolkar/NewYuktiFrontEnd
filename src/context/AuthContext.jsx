import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/auth';
import employeesApi from '../api/employees';
import { getStoredAuth, setStoredAuth, registerAuthExpiredHandler } from '../api/client';
import { hasPermission } from '../constants/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [principalType, setPrincipalType] = useState(() => getStoredAuth()?.principalType || null);
  const [username, setUsername] = useState(() => getStoredAuth()?.username || null);
  const [role, setRole] = useState(() => getStoredAuth()?.role || null);
  const [me, setMe] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [initializing, setInitializing] = useState(() => !!getStoredAuth()?.accessToken);

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
    setStoredAuth(null);
    setPrincipalType(null);
    setUsername(null);
    setRole(null);
    setMe(null);
    setEmployees([]);
  }, []);

  // Hydrate from localStorage once on mount (e.g. a page refresh).
  useEffect(() => {
    const initial = getStoredAuth();
    if (!initial?.accessToken) {
      setInitializing(false);
      return;
    }
    loadProfile(initial.username, initial.principalType).finally(() => setInitializing(false));
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
      authApi.login(usernameInput, password).then((res) => {
        setStoredAuth(res);
        setPrincipalType(res.principalType);
        setUsername(res.username);
        setRole(res.role);
        return loadProfile(res.username, res.principalType).then(() => res);
      }),
    [loadProfile]
  );

  const logout = useCallback(() => {
    const stored = getStoredAuth();
    const done = stored?.refreshToken ? authApi.logout(stored.refreshToken).catch(() => {}) : Promise.resolve();
    return done.finally(() => clearState());
  }, [clearState]);

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
