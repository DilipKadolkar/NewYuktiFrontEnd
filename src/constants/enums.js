export const EMPLOYEE_STATUS = ['PERMANENT', 'DAY_WISE', 'CONTRACT', 'INTERN'];

export const ROLE = ['ADMIN', 'HR', 'SUPERVISOR', 'EMPLOYEE'];

export const RECORD_STATUS = ['ACTIVE', 'INACTIVE'];

export const LEAVE_TYPE = ['CASUAL_LEAVE', 'SICK_LEAVE', 'LEAVE_WITHOUT_PAY'];

export const LEAVE_DURATION = ['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF'];

export const LEAVE_STATUS = ['PENDING', 'SUPERVISOR_APPROVED', 'APPROVED', 'REJECTED', 'CANCELLED'];

export const ATTENDANCE_STATUS = [
  'PRESENT',
  'HALF_DAY',
  'ABSENT',
  'ON_LEAVE',
  'WEEKLY_OFF',
  'HOLIDAY',
  'INVALID_PUNCH',
];

export const PAYROLL_STATUS = ['GENERATED', 'SUPERSEDED'];

export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const labelize = (value) => {
  if (!value && value !== 0) return '';
  return String(value)
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
};

export const LEAVE_STATUS_COLOR = {
  PENDING: 'warning',
  SUPERVISOR_APPROVED: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

export const ATTENDANCE_STATUS_COLOR = {
  PRESENT: 'success',
  HALF_DAY: 'warning',
  ABSENT: 'error',
  ON_LEAVE: 'info',
  WEEKLY_OFF: 'default',
  HOLIDAY: 'default',
  INVALID_PUNCH: 'error',
};

export const RECORD_STATUS_COLOR = {
  ACTIVE: 'success',
  INACTIVE: 'default',
};

export const PAYROLL_STATUS_COLOR = {
  GENERATED: 'success',
  SUPERSEDED: 'default',
};

export const ROLE_COLOR = {
  ADMIN: 'error',
  HR: 'secondary',
  SUPERVISOR: 'info',
  EMPLOYEE: 'default',
};
