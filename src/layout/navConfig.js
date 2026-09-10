import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import DonutSmallRoundedIcon from '@mui/icons-material/DonutSmallRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import DomainAddRoundedIcon from '@mui/icons-material/DomainAddRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';

// Exported so RequireRole (route-level guarding, see App.js) reads the exact
// same role lists as the sidebar's own visibility check - one source of truth
// for "who can see this" instead of two lists that could drift apart.
export const HR_ADMIN = ['HR', 'ADMIN'];
export const SUP_HR_ADMIN = ['SUPERVISOR', 'HR', 'ADMIN'];
export const ADMIN_ONLY = ['ADMIN'];
export const PLATFORM_ONLY = ['PLATFORM_OWNER', 'PLATFORM_ADMIN'];

const navConfig = [
  {
    label: 'Overview',
    items: [
      // Plain EMPLOYEE has no DASHBOARD_READ permission - see PermissionSeeder -
      // and is routed to /attendance/me instead (App.js's RootRedirect).
      { label: 'Dashboard', path: '/', icon: DashboardRoundedIcon, visibleFor: SUP_HR_ADMIN },
    ],
  },
  {
    label: 'My Workspace',
    items: [
      { label: 'My Attendance', path: '/attendance/me', icon: EventAvailableRoundedIcon },
      { label: 'Apply Leave', path: '/leave/apply', icon: EditCalendarRoundedIcon },
      { label: 'My Leaves', path: '/leave/my', icon: BeachAccessRoundedIcon },
      { label: 'Leave Calendar', path: '/leave/calendar', icon: DateRangeRoundedIcon },
      { label: 'Leave Balances', path: '/leave/balances', icon: DonutSmallRoundedIcon },
      { label: 'My Salary Slip', path: '/salary-slips/me', icon: ReceiptLongRoundedIcon },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'My Team', path: '/team', icon: GroupsRoundedIcon, visibleFor: SUP_HR_ADMIN },
      {
        label: 'Pending Approvals',
        path: '/leave/approvals',
        icon: PendingActionsRoundedIcon,
        visibleFor: SUP_HR_ADMIN,
      },
      {
        label: 'Roster Planner',
        path: '/roster/planner',
        icon: CalendarMonthRoundedIcon,
        visibleFor: SUP_HR_ADMIN,
      },
    ],
  },
  {
    label: 'HR Admin',
    visibleFor: HR_ADMIN,
    items: [
      { label: 'Employees', path: '/employees', icon: BadgeRoundedIcon, visibleFor: HR_ADMIN },
      { label: 'Shifts', path: '/shifts', icon: ScheduleRoundedIcon, visibleFor: HR_ADMIN },
      { label: 'Holidays', path: '/holidays', icon: EventBusyRoundedIcon, visibleFor: HR_ADMIN },
      {
        label: 'All Leaves',
        path: '/leave/all',
        icon: FactCheckRoundedIcon,
        visibleFor: HR_ADMIN,
      },
      {
        label: 'Attendance Console',
        path: '/attendance/generate',
        icon: EventAvailableRoundedIcon,
        visibleFor: HR_ADMIN,
      },
      { label: 'Payroll', path: '/payroll/list', icon: PaymentsRoundedIcon, visibleFor: HR_ADMIN },
      {
        label: 'Salary Slips',
        path: '/salary-slips',
        icon: ReceiptLongRoundedIcon,
        visibleFor: HR_ADMIN,
      },
      { label: 'Masters', path: '/masters/companies', icon: ApartmentRoundedIcon, visibleFor: HR_ADMIN },
      { label: 'Reports', path: '/reports', icon: AssessmentRoundedIcon, visibleFor: HR_ADMIN },
    ],
  },
  {
    label: 'Contractors',
    visibleFor: SUP_HR_ADMIN,
    items: [
      {
        label: 'Contractors',
        path: '/contractors/list',
        icon: EngineeringRoundedIcon,
        visibleFor: SUP_HR_ADMIN,
      },
      {
        label: 'Contractor Workforce',
        path: '/contractors/workforce',
        icon: GroupsRoundedIcon,
        visibleFor: SUP_HR_ADMIN,
      },
      {
        label: 'Contractor Roster',
        path: '/contractors/roster',
        icon: CalendarMonthRoundedIcon,
        visibleFor: SUP_HR_ADMIN,
      },
      {
        label: 'Contractor Attendance',
        path: '/contractors/attendance',
        icon: EventAvailableRoundedIcon,
        visibleFor: SUP_HR_ADMIN,
      },
      {
        label: 'Contractor Reports',
        path: '/contractors/reports',
        icon: AssessmentRoundedIcon,
        visibleFor: SUP_HR_ADMIN,
      },
    ],
  },
  {
    label: 'Security',
    visibleFor: ADMIN_ONLY,
    items: [
      {
        label: 'Custom Roles',
        path: '/roles',
        icon: AdminPanelSettingsRoundedIcon,
        visibleFor: ADMIN_ONLY,
      },
      { label: 'Audit Log', path: '/audit-logs', icon: HistoryRoundedIcon, visibleFor: ADMIN_ONLY },
    ],
  },
];

// A platform principal (PLATFORM_OWNER/PLATFORM_ADMIN) has no company, so
// none of the sections above apply - it gets its own small nav instead.
export const platformNavConfig = [
  {
    label: 'Platform',
    items: [
      { label: 'Companies', path: '/platform/companies', icon: ApartmentRoundedIcon },
      { label: 'Onboard Company', path: '/platform/onboard', icon: DomainAddRoundedIcon },
      { label: 'Audit Log', path: '/audit-logs', icon: HistoryRoundedIcon },
    ],
  },
];

export default navConfig;
