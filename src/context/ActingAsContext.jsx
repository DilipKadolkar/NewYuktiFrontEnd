import { useAuth } from './AuthContext';

// Compatibility shim. This used to be a real context backing a client-side
// "acting as" employee picker with no real auth behind it (see HANDOFF.md).
// Real auth now lives in AuthContext; this just reshapes it into the old
// contract so the many pages that only ever read `employees`, the `is*` role
// booleans, and `actingAs` (now: the logged-in user's own record, not a
// picked one) don't need to change at all.
export function useActingAs() {
  const auth = useAuth();
  return {
    employees: auth.employees,
    loading: auth.initializing,
    actingAs: auth.me,
    actingAsUserId: auth.username,
    reloadEmployees: auth.reloadEmployees,
    role: auth.role,
    isAdmin: auth.isAdmin,
    isHr: auth.isHr,
    isHrOrAdmin: auth.isHrOrAdmin,
    isSupervisor: auth.isSupervisor,
    isSupervisorOrAbove: auth.isSupervisorOrAbove,
  };
}
