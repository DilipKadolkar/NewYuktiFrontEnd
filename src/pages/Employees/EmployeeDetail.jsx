import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import MoneyText from '../../components/MoneyText';
import EmployeePicker from '../../components/EmployeePicker';
import ConfirmDialog from '../../components/ConfirmDialog';
import TempPasswordDialog from '../../components/TempPasswordDialog';
import employeesApi from '../../api/employees';
import customRolesApi from '../../api/customRoles';
import { RECORD_STATUS_COLOR, ROLE_COLOR, labelize } from '../../constants/enums';
import { useActingAs } from '../../context/ActingAsContext';
import { useAuth } from '../../context/AuthContext';

function Field({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value ?? '-'}</Typography>
    </Grid>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { reloadEmployees } = useActingAs();
  const { can } = useAuth();
  const canUpdate = can('EMPLOYEE_UPDATE');
  const canReadRoles = can('ROLE_READ');
  const canManageRoles = can('ROLE_MANAGE');
  const [emp, setEmp] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [newSupervisor, setNewSupervisor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [structureOpen, setStructureOpen] = useState(false);
  const [structureValues, setStructureValues] = useState(null);
  const [savingStructure, setSavingStructure] = useState(false);
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [customRoles, setCustomRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleToAssign, setRoleToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);

  const load = () => {
    setLoading(true);
    employeesApi
      .get(id)
      .then((data) => {
        setEmp(data);
        setNewSupervisor(data.supervisorUserId);
        return employeesApi.team(data.userId).catch(() => []);
      })
      .then(setTeam)
      .catch(() => setEmp(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const loadCustomRoles = (userId) => {
    if (!canReadRoles || !userId) return;
    setRolesLoading(true);
    Promise.all([customRolesApi.listForEmployee(userId), customRolesApi.list()])
      .then(([assigned, all]) => {
        setCustomRoles(assigned);
        setAllRoles(all);
      })
      .catch(() => {})
      .finally(() => setRolesLoading(false));
  };

  useEffect(() => {
    if (emp?.userId) loadCustomRoles(emp.userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emp?.userId]);

  const handleReassign = () => {
    setSaving(true);
    employeesApi
      .reassignSupervisor(emp.userId, newSupervisor)
      .then(() => {
        enqueueSnackbar('Supervisor reassigned', { variant: 'success' });
        setReassignOpen(false);
        reloadEmployees();
        load();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const handleResetPassword = () => {
    setResetting(true);
    employeesApi
      .resetPassword(emp.id)
      .then((res) => {
        setResetConfirmOpen(false);
        setTempPassword(res);
      })
      .catch(() => {})
      .finally(() => setResetting(false));
  };

  const openStructureDialog = () => {
    setStructureValues({
      basicDA: emp.basicDA,
      hra: emp.hra,
      conveyanceAllowance: emp.conveyanceAllowance,
      educationAllowance: emp.educationAllowance,
    });
    setStructureOpen(true);
  };

  const handleStructureChange = (name, value) => {
    setStructureValues((prev) => ({ ...prev, [name]: value.replace(/[^0-9.]/g, '') }));
  };

  const handleSaveStructure = () => {
    setSavingStructure(true);
    employeesApi
      .updateSalaryStructure(emp.id, structureValues)
      .then(() => {
        enqueueSnackbar('Salary structure overridden', { variant: 'success' });
        setStructureOpen(false);
        load();
      })
      .catch(() => {})
      .finally(() => setSavingStructure(false));
  };

  const handleRegenerateStructure = () => {
    setRegenerating(true);
    employeesApi
      .regenerateSalaryStructure(emp.id)
      .then(() => {
        enqueueSnackbar('Salary structure regenerated from the current rule', { variant: 'success' });
        setRegenerateConfirmOpen(false);
        load();
      })
      .catch(() => {})
      .finally(() => setRegenerating(false));
  };

  const handleAssignRole = () => {
    if (!roleToAssign) return;
    setAssigning(true);
    customRolesApi
      .assign(roleToAssign, emp.userId)
      .then(() => {
        enqueueSnackbar('Custom role assigned', { variant: 'success' });
        setRoleToAssign('');
        loadCustomRoles(emp.userId);
      })
      .catch(() => {})
      .finally(() => setAssigning(false));
  };

  const handleUnassignRole = (roleId) => {
    customRolesApi
      .unassign(roleId, emp.userId)
      .then(() => {
        enqueueSnackbar('Custom role removed', { variant: 'success' });
        loadCustomRoles(emp.userId);
      })
      .catch(() => {});
  };

  const assignableRoles = allRoles.filter((r) => !customRoles.some((cr) => cr.id === r.id));

  if (loading) return <Skeleton variant="rounded" height={500} />;
  if (!emp) return <Typography color="text.secondary">Employee not found.</Typography>;

  return (
    <>
      <PageHeader
        title={emp.employeeName}
        subtitle={`${emp.employeeCode} · ${emp.userId}`}
        actions={
          canUpdate && (
            <>
              <Button
                color="inherit"
                startIcon={<LockResetRoundedIcon />}
                onClick={() => setResetConfirmOpen(true)}
              >
                Reset password
              </Button>
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={() => navigate(`/employees/${id}/edit`)}
              >
                Edit
              </Button>
            </>
          )
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 2.5 }}>
            <CardHeader
              title={<Typography variant="subtitle1">Identity & organisation</Typography>}
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  {emp.employeeName?.charAt(0)}
                </Avatar>
              }
              action={
                <Stack direction="row" spacing={1} sx={{ mt: 1, mr: 1 }}>
                  <StatusChip value={emp.role} colorMap={ROLE_COLOR} />
                  <StatusChip value={emp.recordStatus} colorMap={RECORD_STATUS_COLOR} />
                </Stack>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={2}>
                <Field label="Company" value={emp.companyName} />
                <Field label="Department" value={emp.departmentName} />
                <Field label="Designation" value={emp.designationName} />
                <Field
                  label="Supervisor"
                  value={emp.supervisorName ? `${emp.supervisorName} (${emp.supervisorUserId})` : 'None'}
                />
                <Field label="Employment status" value={labelize(emp.status)} />
                <Field
                  label="Joining date"
                  value={emp.joiningDate ? dayjs(emp.joiningDate).format('DD MMM YYYY') : '-'}
                />
                <Field
                  label="Date of birth"
                  value={emp.dateOfBirth ? dayjs(emp.dateOfBirth).format('DD MMM YYYY') : '-'}
                />
                <Field label="Email" value={emp.email} />
                <Field label="Phone" value={emp.phone} />
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Button size="small" onClick={() => setReassignOpen(true)}>
                Reassign supervisor
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={<Typography variant="subtitle1">Salary structure</Typography>}
              action={
                <Stack direction="row" spacing={1} sx={{ mt: 1, mr: 1, alignItems: 'center' }}>
                  <Chip
                    label={emp.salaryStructureOverridden ? 'Manually overridden' : 'Rule-derived'}
                    color={emp.salaryStructureOverridden ? 'warning' : 'default'}
                    size="small"
                  />
                  {canUpdate && (
                    <Button size="small" startIcon={<EditRoundedIcon />} onClick={openStructureDialog}>
                      Override
                    </Button>
                  )}
                  {canUpdate && emp.salaryStructureOverridden && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<RestartAltRoundedIcon />}
                      onClick={() => setRegenerateConfirmOpen(true)}
                    >
                      Regenerate from rule
                    </Button>
                  )}
                </Stack>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={2}>
                <Field label="Gross salary" value={<MoneyText value={emp.grossSalary} />} />
                <Field label="Gross wage (proration base)" value={<MoneyText value={emp.grossSalaryWage} />} />
                <Field label="Overtime eligible" value={emp.overtimeEligible ? 'Yes' : 'No'} />
                <Field label="Basic + DA" value={<MoneyText value={emp.basicDA} />} />
                <Field label="HRA" value={<MoneyText value={emp.hra} />} />
                <Field label="Conveyance" value={<MoneyText value={emp.conveyanceAllowance} />} />
                <Field label="Education" value={<MoneyText value={emp.educationAllowance} />} />
                <Field label="Medical allowance" value={<MoneyText value={emp.medicalAllowance} />} />
                <Field label="Other allowance" value={<MoneyText value={emp.otherAllowance} />} />
                <Field label="PF basic" value={<MoneyText value={emp.pfBasic} />} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title={<Typography variant="subtitle1">Direct reports ({team.length})</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              {team.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No one reports to this employee.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {team.map((t) => (
                    <ListItemButton
                      key={t.id}
                      component={RouterLink}
                      to={`/employees/${t.id}`}
                      sx={{ borderRadius: 1.5 }}
                    >
                      <ListItemText primary={t.employeeName} secondary={`${t.userId} · ${t.designationName || ''}`} />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {canReadRoles && (
            <Card sx={{ mt: 2.5 }}>
              <CardHeader title={<Typography variant="subtitle1">Custom roles</Typography>} />
              <CardContent sx={{ pt: 0 }}>
                {customRoles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    No custom roles assigned.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {customRoles.map((r) => (
                      <Chip
                        key={r.id}
                        label={r.name}
                        onDelete={canManageRoles ? () => handleUnassignRole(r.id) : undefined}
                        deleteIcon={<CloseRoundedIcon />}
                        size="small"
                      />
                    ))}
                  </Stack>
                )}
                {canManageRoles && assignableRoles.length > 0 && (
                  <Stack direction="row" spacing={1}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="assign-role-label">Assign a role</InputLabel>
                      <Select
                        labelId="assign-role-label"
                        label="Assign a role"
                        value={roleToAssign}
                        onChange={(e) => setRoleToAssign(e.target.value)}
                        disabled={rolesLoading}
                      >
                        {assignableRoles.map((r) => (
                          <MenuItem key={r.id} value={r.id}>
                            {r.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={handleAssignRole}
                      disabled={!roleToAssign || assigning}
                    >
                      Assign
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset password?"
        description={`This generates a new one-time temporary password for ${emp.employeeName} (${emp.userId}), clears any lockout, and signs them out everywhere.`}
        confirmLabel="Reset password"
        loading={resetting}
        onConfirm={handleResetPassword}
        onClose={() => setResetConfirmOpen(false)}
      />

      <TempPasswordDialog
        open={!!tempPassword}
        title="Password reset"
        userId={tempPassword?.employee?.userId}
        temporaryPassword={tempPassword?.temporaryPassword}
        onClose={() => setTempPassword(null)}
      />

      <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reassign supervisor</DialogTitle>
        <DialogContent>
          <EmployeePicker label="New supervisor" value={newSupervisor} onChange={setNewSupervisor} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setReassignOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleReassign} disabled={saving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={structureOpen} onClose={() => setStructureOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Override salary structure</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pins these four figures for {emp.employeeName} regardless of the salary rule or a future
            gross salary change, until regenerated.
          </Typography>
          <Grid container spacing={2}>
            {structureValues &&
              [
                { name: 'basicDA', label: 'Basic + DA' },
                { name: 'hra', label: 'HRA' },
                { name: 'conveyanceAllowance', label: 'Conveyance' },
                { name: 'educationAllowance', label: 'Education' },
              ].map((f) => (
                <Grid key={f.name} size={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={f.label}
                    value={structureValues[f.name] ?? ''}
                    onChange={(e) => handleStructureChange(f.name, e.target.value)}
                  />
                </Grid>
              ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setStructureOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveStructure} disabled={savingStructure}>
            Save override
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={regenerateConfirmOpen}
        title="Regenerate from rule?"
        description={`Clears the manual override and recomputes Basic + DA, HRA, conveyance and education for ${emp.employeeName} from their gross salary and the company's current salary rule.`}
        confirmLabel="Regenerate"
        loading={regenerating}
        onConfirm={handleRegenerateStructure}
        onClose={() => setRegenerateConfirmOpen(false)}
      />
    </>
  );
}
