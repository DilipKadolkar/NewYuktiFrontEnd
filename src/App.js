import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import ChangePassword from './pages/Auth/ChangePassword';
import Dashboard from './pages/Dashboard/Dashboard';
import NotFound from './pages/NotFound';
import MastersLayout from './pages/Masters/MastersLayout';
import Companies from './pages/Masters/Companies';
import Departments from './pages/Masters/Departments';
import Designations from './pages/Masters/Designations';
import Categories from './pages/Masters/Categories';
import SalaryRule from './pages/Masters/SalaryRule';
import AttendanceRule from './pages/Masters/AttendanceRule';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeForm from './pages/Employees/EmployeeForm';
import EmployeeDetail from './pages/Employees/EmployeeDetail';
import MyTeam from './pages/Employees/MyTeam';
import BulkImportEmployees from './pages/Employees/BulkImportEmployees';
import ShiftList from './pages/Shifts/ShiftList';
import RosterLayout from './pages/Roster/RosterLayout';
import Planner from './pages/Roster/Planner';
import BulkAssign from './pages/Roster/BulkAssign';
import BulkImportCsv from './pages/Roster/BulkImportCsv';
import AutoRotate from './pages/Roster/AutoRotate';
import CopyMonth from './pages/Roster/CopyMonth';
import Swap from './pages/Roster/Swap';
import Holidays from './pages/Holidays/Holidays';
import MyAttendance from './pages/Attendance/MyAttendance';
import AttendanceConsoleLayout from './pages/Attendance/AttendanceConsoleLayout';
import AttendanceGenerate from './pages/Attendance/Generate';
import AttendanceRecords from './pages/Attendance/Records';
import LeaveLayout from './pages/Leave/LeaveLayout';
import LeaveApply from './pages/Leave/Apply';
import MyLeaves from './pages/Leave/MyLeaves';
import PendingApprovals from './pages/Leave/PendingApprovals';
import AllLeaves from './pages/Leave/AllLeaves';
import BulkImportLeaves from './pages/Leave/BulkImportLeaves';
import LeaveCalendar from './pages/Leave/Calendar';
import LeaveBalances from './pages/Leave/Balances';
import PayrollLayout from './pages/Payroll/PayrollLayout';
import PayrollGenerate from './pages/Payroll/Generate';
import PayrollGenerateAll from './pages/Payroll/GenerateAll';
import PayrollBulkGenerate from './pages/Payroll/BulkGenerate';
import PayrollList from './pages/Payroll/List';
import PayrollEmployeeHistory from './pages/Payroll/EmployeeHistory';
import SalarySlip from './pages/SalarySlips/SalarySlip';
import MySalarySlip from './pages/SalarySlips/MySalarySlip';
import ReportsHub from './pages/Reports/ReportsHub';
import EmployeesReport from './pages/Reports/EmployeesReport';
import AttendanceMonthlyReport from './pages/Reports/AttendanceMonthlyReport';
import LateComingReport from './pages/Reports/LateComingReport';
import AbsentReport from './pages/Reports/AbsentReport';
import OvertimeReport from './pages/Reports/OvertimeReport';
import LopReport from './pages/Reports/LopReport';
import LeaveBalancesReport from './pages/Reports/LeaveBalancesReport';
import PayrollReport from './pages/Reports/PayrollReport';
import PayrollByDepartmentReport from './pages/Reports/PayrollByDepartmentReport';
import PayrollByCompanyReport from './pages/Reports/PayrollByCompanyReport';
import PfReport from './pages/Reports/PfReport';
import ProfessionalTaxReport from './pages/Reports/ProfessionalTaxReport';
import EsicReport from './pages/Reports/EsicReport';
import RolesList from './pages/Roles/RolesList';
import RoleDetail from './pages/Roles/RoleDetail';
import AuditLog from './pages/AuditLog/AuditLog';
import OnboardCompany from './pages/Platform/OnboardCompany';

// Plain EMPLOYEE lacks DASHBOARD_READ (see PermissionSeeder) and would 403 on
// the dashboard's data calls; PLATFORM principals have no company dashboard
// at all. Route each principal to a landing page it actually has access to.
function RootRedirect() {
  const { isPlatform, isEmployee } = useAuth();
  if (isPlatform) return <Navigate to="/platform/companies" replace />;
  if (isEmployee) return <Navigate to="/attendance/me" replace />;
  return <Dashboard />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route path="/masters" element={<MastersLayout />}>
            <Route path="companies" element={<Companies />} />
            <Route path="departments" element={<Departments />} />
            <Route path="designations" element={<Designations />} />
            <Route path="categories" element={<Categories />} />
            <Route path="salary-rule" element={<SalaryRule />} />
            <Route path="attendance-rule" element={<AttendanceRule />} />
          </Route>

          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/new" element={<EmployeeForm />} />
          <Route path="/employees/bulk-import" element={<BulkImportEmployees />} />
          <Route path="/employees/:id/edit" element={<EmployeeForm />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/team" element={<MyTeam />} />

          <Route path="/shifts" element={<ShiftList />} />

          <Route path="/roster" element={<RosterLayout />}>
            <Route index element={<Planner />} />
            <Route path="planner" element={<Planner />} />
            <Route path="bulk" element={<BulkAssign />} />
            <Route path="csv-upload" element={<BulkImportCsv />} />
            <Route path="auto-rotate" element={<AutoRotate />} />
            <Route path="copy-month" element={<CopyMonth />} />
            <Route path="swap" element={<Swap />} />
          </Route>

          <Route path="/holidays" element={<Holidays />} />

          <Route path="/attendance/me" element={<MyAttendance />} />
          <Route path="/attendance" element={<AttendanceConsoleLayout />}>
            <Route index element={<AttendanceGenerate />} />
            <Route path="generate" element={<AttendanceGenerate />} />
            <Route path="records" element={<AttendanceRecords />} />
          </Route>

          <Route path="/leave" element={<LeaveLayout />}>
            <Route index element={<LeaveApply />} />
            <Route path="apply" element={<LeaveApply />} />
            <Route path="my" element={<MyLeaves />} />
            <Route path="approvals" element={<PendingApprovals />} />
            <Route path="all" element={<AllLeaves />} />
            <Route path="calendar" element={<LeaveCalendar />} />
            <Route path="balances" element={<LeaveBalances />} />
          </Route>
          <Route path="/leave/bulk-import" element={<BulkImportLeaves />} />

          <Route path="/payroll" element={<PayrollLayout />}>
            <Route index element={<PayrollGenerate />} />
            <Route path="generate" element={<PayrollGenerate />} />
            <Route path="generate-all" element={<PayrollGenerateAll />} />
            <Route path="bulk-generate" element={<PayrollBulkGenerate />} />
            <Route path="list" element={<PayrollList />} />
            <Route path="history" element={<PayrollEmployeeHistory />} />
          </Route>

          <Route path="/salary-slips/me" element={<MySalarySlip />} />
          <Route path="/salary-slips" element={<SalarySlip />} />

          <Route path="/reports" element={<ReportsHub />} />
          <Route path="/reports/employees" element={<EmployeesReport />} />
          <Route path="/reports/attendance/monthly" element={<AttendanceMonthlyReport />} />
          <Route path="/reports/attendance/late-coming" element={<LateComingReport />} />
          <Route path="/reports/attendance/absent" element={<AbsentReport />} />
          <Route path="/reports/attendance/overtime" element={<OvertimeReport />} />
          <Route path="/reports/attendance/lop" element={<LopReport />} />
          <Route path="/reports/leave-balances" element={<LeaveBalancesReport />} />
          <Route path="/reports/payroll" element={<PayrollReport />} />
          <Route path="/reports/payroll/by-department" element={<PayrollByDepartmentReport />} />
          <Route path="/reports/payroll/by-company" element={<PayrollByCompanyReport />} />
          <Route path="/reports/statutory/pf" element={<PfReport />} />
          <Route path="/reports/statutory/professional-tax" element={<ProfessionalTaxReport />} />
          <Route path="/reports/statutory/esic" element={<EsicReport />} />

          <Route path="/roles" element={<RolesList />} />
          <Route path="/roles/:id" element={<RoleDetail />} />
          <Route path="/audit-logs" element={<AuditLog />} />

          <Route path="/platform/companies" element={<Companies />} />
          <Route path="/platform/onboard" element={<OnboardCompany />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
