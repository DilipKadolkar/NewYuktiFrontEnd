import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import EmployeePicker from '../../components/EmployeePicker';
import TempPasswordDialog from '../../components/TempPasswordDialog';
import { EMPLOYEE_STATUS, ROLE, RECORD_STATUS, GENDER, labelize } from '../../constants/enums';
import employeesApi from '../../api/employees';
import companiesApi from '../../api/companies';
import departmentsApi from '../../api/departments';
import designationsApi from '../../api/designations';
import categoriesApi from '../../api/categories';
import { useActingAs } from '../../context/ActingAsContext';

const emptyForm = {
  userId: '',
  employeeCode: '',
  employeeName: '',
  companyId: '',
  departmentId: '',
  designationId: '',
  categoryId: '',
  supervisorUserId: null,
  joiningDate: null,
  dateOfBirth: null,
  gender: '',
  status: 'PERMANENT',
  recordStatus: 'ACTIVE',
  role: 'EMPLOYEE',
  email: '',
  phone: '',
  uanNo: '',
  esicIpNo: '',
  bankAccountNo: '',
  bankIfscNo: '',
  grossSalary: '',
  pfBasic: '',
  medicalAllowance: '',
  otherAllowance: '',
  overtimeEligible: false,
  // Create-time-only escape hatch: skip rule-derivation and pin these four directly
  // (e.g. migrating from an existing payroll system that already has exact figures).
  structureOverride: false,
  basicDA: '',
  hra: '',
  conveyanceAllowance: '',
  educationAllowance: '',
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { reloadEmployees, isAdmin } = useActingAs();

  const [form, setForm] = useState(emptyForm);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  useEffect(() => {
    Promise.all([
      companiesApi.list(),
      departmentsApi.list(),
      designationsApi.list(),
      categoriesApi.list(),
    ]).then(([c, d, des, cat]) => {
      setCompanies(c);
      setDepartments(d);
      setDesignations(des);
      setCategories(cat);
    });
  }, []);

  useEffect(() => {
    if (!isEdit || companies.length === 0 || departments.length === 0 || designations.length === 0)
      return;
    employeesApi.get(id).then((emp) => {
      const company = companies.find((c) => c.companyName === emp.companyName);
      const department = departments.find((d) => d.departmentName === emp.departmentName);
      const designation = designations.find((d) => d.designationName === emp.designationName);
      const category = categories.find((c) => c.categoryName === emp.categoryName);
      setForm({
        userId: emp.userId,
        employeeCode: emp.employeeCode,
        employeeName: emp.employeeName,
        companyId: company?.id ?? '',
        departmentId: department?.id ?? '',
        designationId: designation?.id ?? '',
        categoryId: category?.id ?? '',
        supervisorUserId: emp.supervisorUserId,
        joiningDate: emp.joiningDate ? dayjs(emp.joiningDate) : null,
        dateOfBirth: emp.dateOfBirth ? dayjs(emp.dateOfBirth) : null,
        gender: emp.gender || '',
        status: emp.status,
        recordStatus: emp.recordStatus,
        role: emp.role,
        email: emp.email || '',
        phone: emp.phone || '',
        uanNo: emp.uanNo || '',
        esicIpNo: emp.esicIpNo || '',
        bankAccountNo: emp.bankAccountNo || '',
        bankIfscNo: emp.bankIfscNo || '',
        grossSalary: emp.grossSalary ?? '',
        pfBasic: emp.pfBasic ?? '',
        medicalAllowance: emp.medicalAllowance ?? '',
        otherAllowance: emp.otherAllowance ?? '',
        overtimeEligible: !!emp.overtimeEligible,
      });
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, companies, departments, designations, categories]);

  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const requiredOk = useMemo(
    () =>
      form.userId &&
      form.employeeCode &&
      form.employeeName &&
      form.companyId &&
      form.departmentId &&
      form.designationId &&
      form.status &&
      form.role &&
      form.grossSalary !== '' &&
      form.pfBasic !== '' &&
      form.medicalAllowance !== '' &&
      form.otherAllowance !== '' &&
      (!form.structureOverride ||
        (form.basicDA !== '' && form.hra !== '' && form.conveyanceAllowance !== '' && form.educationAllowance !== '')),
    [form]
  );

  const handleSubmit = () => {
    setSaving(true);
    const payload = {
      userId: form.userId,
      employeeCode: form.employeeCode,
      employeeName: form.employeeName,
      companyId: Number(form.companyId),
      departmentId: Number(form.departmentId),
      designationId: Number(form.designationId),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      supervisorUserId: form.supervisorUserId || null,
      joiningDate: form.joiningDate ? form.joiningDate.format('YYYY-MM-DD') : null,
      dateOfBirth: form.dateOfBirth ? form.dateOfBirth.format('YYYY-MM-DD') : null,
      gender: form.gender || null,
      status: form.status,
      recordStatus: form.recordStatus,
      role: form.role,
      email: form.email || null,
      phone: form.phone || null,
      uanNo: form.uanNo || null,
      esicIpNo: form.esicIpNo || null,
      bankAccountNo: form.bankAccountNo || null,
      bankIfscNo: form.bankIfscNo || null,
      grossSalary: form.grossSalary,
      pfBasic: form.pfBasic,
      medicalAllowance: form.medicalAllowance,
      otherAllowance: form.otherAllowance,
      overtimeEligible: form.overtimeEligible,
      // Omitted entirely (not sent as null/empty) when the toggle is off, so the server
      // still derives the structure from the salary rule exactly as before this existed.
      ...(!isEdit && form.structureOverride
        ? {
            basicDA: form.basicDA,
            hra: form.hra,
            conveyanceAllowance: form.conveyanceAllowance,
            educationAllowance: form.educationAllowance,
          }
        : {}),
    };
    if (isEdit) {
      employeesApi
        .update(id, payload)
        .then((res) => {
          enqueueSnackbar('Employee updated successfully', { variant: 'success' });
          reloadEmployees();
          navigate(`/employees/${res.id}`);
        })
        .catch(() => {})
        .finally(() => setSaving(false));
      return;
    }
    // create() now returns { employee, temporaryPassword } (Phase 9) - the
    // temp password is shown exactly once, then we navigate on dialog close.
    employeesApi
      .create(payload)
      .then((res) => {
        enqueueSnackbar('Employee created successfully', { variant: 'success' });
        reloadEmployees();
        setTempPassword(res);
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  if (loading) return <Skeleton variant="rounded" height={500} />;

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit Employee' : 'Add Employee'}
        subtitle={
          isEdit
            ? `Editing ${form.employeeName} (${form.userId})`
            : 'userId must equal the biometric device user id — get it wrong and attendance never shows'
        }
        actions={
          <>
            <Button color="inherit" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!requiredOk || saving}>
              {isEdit ? 'Save changes' : 'Create employee'}
            </Button>
          </>
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <CardHeader title={<Typography variant="subtitle1">Identity</Typography>} />
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="User ID (biometric device id)"
                required
                disabled={isEdit}
                value={form.userId}
                onChange={(e) => set('userId', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Employee Code"
                required
                value={form.employeeCode}
                onChange={(e) => set('employeeCode', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Employee Name"
                required
                value={form.employeeName}
                onChange={(e) => set('employeeName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="Date of birth"
                value={form.dateOfBirth}
                onChange={(v) => set('dateOfBirth', v)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="Joining date"
                value={form.joiningDate}
                onChange={(v) => set('joiningDate', v)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Gender"
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
              >
                <MenuItem value="">
                  <em>Not specified</em>
                </MenuItem>
                {GENDER.map((g) => (
                  <MenuItem key={g} value={g}>
                    {labelize(g)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="email"
                label="Email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Phone"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2.5 }}>
        <CardHeader title={<Typography variant="subtitle1">Organisation</Typography>} />
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Company"
                required
                value={form.companyId}
                onChange={(e) => set('companyId', e.target.value)}
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.companyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Department"
                required
                value={form.departmentId}
                onChange={(e) => set('departmentId', e.target.value)}
              >
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.departmentName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Designation"
                required
                value={form.designationId}
                onChange={(e) => set('designationId', e.target.value)}
              >
                {designations.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.designationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Category"
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.categoryName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <EmployeePicker
                label="Supervisor"
                value={form.supervisorUserId}
                onChange={(v) => set('supervisorUserId', v)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Employment status"
                required
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {EMPLOYEE_STATUS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {labelize(s)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Role"
                required
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                helperText={!isAdmin ? 'Only an ADMIN can grant the ADMIN role' : ' '}
              >
                {ROLE.filter((r) => r !== 'ADMIN' || isAdmin).map((r) => (
                  <MenuItem key={r} value={r}>
                    {labelize(r)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Record status"
                required
                value={form.recordStatus}
                onChange={(e) => set('recordStatus', e.target.value)}
              >
                {RECORD_STATUS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {labelize(s)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2.5 }}>
        <CardHeader title={<Typography variant="subtitle1">Statutory & bank details</Typography>} />
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="UAN No"
                value={form.uanNo}
                onChange={(e) => set('uanNo', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="ESIC IP No"
                value={form.esicIpNo}
                onChange={(e) => set('esicIpNo', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Bank Account No"
                value={form.bankAccountNo}
                onChange={(e) => set('bankAccountNo', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Bank IFSC No"
                value={form.bankIfscNo}
                onChange={(e) => set('bankIfscNo', e.target.value.toUpperCase())}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2.5 }}>
        <CardHeader title={<Typography variant="subtitle1">Salary inputs</Typography>} />
        <CardContent sx={{ pt: 0 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {isEdit ? (
              <>
                Basic+DA, HRA, Conveyance, Education and Gross Wage are derived by the server from
                the current salary rule — they cannot be entered directly here. Use the salary
                structure &quot;Override&quot; action on the employee&apos;s detail page to pin them
                by hand, or &quot;Revise salary&quot; to change gross salary with a recorded reason.
              </>
            ) : (
              <>
                Basic+DA, HRA, Conveyance, Education and Gross Wage are normally derived by the
                server from the current salary rule. If this employee&apos;s exact breakup is
                already known — migrating from an existing payroll system, say — turn on
                &quot;I already know the exact structure&quot; below to enter all four directly
                instead of having them recalculated.
              </>
            )}
          </Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Gross salary"
                required
                value={form.grossSalary}
                onChange={(e) => set('grossSalary', e.target.value.replace(/[^0-9.]/g, ''))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="PF basic"
                required
                value={form.pfBasic}
                onChange={(e) => set('pfBasic', e.target.value.replace(/[^0-9.]/g, ''))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Medical allowance"
                required
                value={form.medicalAllowance}
                onChange={(e) => set('medicalAllowance', e.target.value.replace(/[^0-9.]/g, ''))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Other allowance"
                required
                value={form.otherAllowance}
                onChange={(e) => set('otherAllowance', e.target.value.replace(/[^0-9.]/g, ''))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.overtimeEligible}
                    onChange={(e) => set('overtimeEligible', e.target.checked)}
                  />
                }
                label="Overtime eligible"
              />
            </Grid>

            {!isEdit && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.structureOverride}
                      onChange={(e) => set('structureOverride', e.target.checked)}
                    />
                  }
                  label="I already know the exact salary structure"
                />
              </Grid>
            )}
            {!isEdit && form.structureOverride && (
              <>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Basic + DA"
                    required
                    value={form.basicDA}
                    onChange={(e) => set('basicDA', e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="HRA"
                    required
                    value={form.hra}
                    onChange={(e) => set('hra', e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Conveyance"
                    required
                    value={form.conveyanceAllowance}
                    onChange={(e) => set('conveyanceAllowance', e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Education"
                    required
                    value={form.educationAllowance}
                    onChange={(e) => set('educationAllowance', e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      <TempPasswordDialog
        open={!!tempPassword}
        title="Employee created"
        userId={tempPassword?.employee?.userId}
        temporaryPassword={tempPassword?.temporaryPassword}
        onClose={() => {
          const employeeId = tempPassword?.employee?.id;
          setTempPassword(null);
          if (employeeId) navigate(`/employees/${employeeId}`);
        }}
      />
    </>
  );
}
