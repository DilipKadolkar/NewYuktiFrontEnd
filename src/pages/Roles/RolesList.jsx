import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import customRolesApi from '../../api/customRoles';
import { useAuth } from '../../context/AuthContext';

export default function RolesList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { can } = useAuth();
  const canManage = can('ROLE_MANAGE');
  const canRead = can('ROLE_READ') || canManage;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    customRolesApi
      .list()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleCreate = () => {
    if (!name.trim()) return;
    setSaving(true);
    customRolesApi
      .create({ name: name.trim(), description: description.trim() || null })
      .then((role) => {
        enqueueSnackbar('Custom role created', { variant: 'success' });
        setFormOpen(false);
        setName('');
        setDescription('');
        navigate(`/roles/${role.id}`);
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    customRolesApi
      .remove(deleteTarget.id)
      .then(() => {
        enqueueSnackbar('Custom role deleted', { variant: 'success' });
        setDeleteTarget(null);
        load();
      })
      .catch(() => {})
      .finally(() => setDeleting(false));
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 220 },
    {
      field: 'permissionCodes',
      headerName: 'Permissions',
      width: 130,
      valueGetter: (value) => value?.length || 0,
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 100,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {canRead && (
            <Tooltip title={canManage ? 'Manage permissions' : 'View permissions'}>
              <IconButton size="small" onClick={() => navigate(`/roles/${params.row.id}`)}>
                <TuneRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canManage && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => setDeleteTarget(params.row)}>
                <DeleteRoundedIcon fontSize="small" color="error" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Custom Roles"
        subtitle="Company-defined roles, additive on top of each employee's fixed role (ADMIN/HR/SUPERVISOR/EMPLOYEE)."
        actions={
          canManage && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setFormOpen(true)}>
              New role
            </Button>
          )
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        height={520}
        emptyState={{
          title: 'No custom roles yet',
          description: canManage
            ? 'Create a custom role to grant a specific set of permissions beyond an employee’s fixed role.'
            : 'No custom roles have been created for this company yet.',
          action: canManage && (
            <Button size="small" variant="contained" onClick={() => setFormOpen(true)}>
              New role
            </Button>
          ),
        }}
      />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New custom role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setFormOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name.trim() || saving}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete custom role?"
        description={`This removes "${deleteTarget?.name}" from every employee it's assigned to. This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
